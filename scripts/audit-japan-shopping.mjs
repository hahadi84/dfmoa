import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.DFMOA_AUDIT_BASE ?? 'http://127.0.0.1:4318';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
const transport = [];
// Inspect generated requests without adding local QA to production analytics.
await context.route('**/*', async route => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.hostname.endsWith('google-analytics.com') && url.pathname.endsWith('/collect')) {
    transport.push({ query: url.search, body: request.postData() ?? '' });
    return route.fulfill({ status: 204 });
  }
  if (/doubleclick.net|googlesyndication.com|googleadservices.com/.test(url.hostname)) return route.abort();
  return route.continue();
});
const page = await context.newPage();
const scriptDiagnostics = [];
page.on('requestfailed', request => {
  if (request.url().includes('googletagmanager.com')) scriptDiagnostics.push({ url: request.url(), error: request.failure()?.errorText });
});
page.on('response', response => {
  if (response.url().includes('googletagmanager.com')) scriptDiagnostics.push({ url: response.url(), status: response.status() });
});
const report = { base, viewports: [], checks: [], transport: null };
try {
  await page.goto(`${base}/japan?debug_mode=1`);
  await page.waitForFunction(() => typeof window.gtag === 'function');
  await page.evaluate(() => {
    window.auditEvents = [];
    const original = window.gtag;
    window.gtag = (...args) => { window.auditEvents.push(args); return original(...args); };
  });
  const count = () => page.evaluate(() => window.auditEvents.filter(e => e[1] === 'effective_price_calculate').length);
  const fill = (index, value) => page.locator(`#yen-field-${index}`).fill(value);
  const button = page.getByRole('button', { name: '입력한 가격 비교하기' });
  assert.equal(await count(), 0);
  assert.equal(await button.isDisabled(), true);
  for (const [i, value] of ['10000', '900', '3', '1000', '100000'].entries()) await fill(i, value);
  assert.equal(await count(), 0, 'typing alone must not count');
  await button.click();
  assert.equal(await count(), 1);
  assert.match(await page.locator('.yen-result').innerText(), /92,700원/);
  assert.match(await page.locator('.yen-result').innerText(), /83,700원/);
  assert.match(await page.locator('.yen-result').innerText(), /16,300원/);
  await button.click();
  assert.equal(await count(), 1, 'same submission must not duplicate');
  await fill(0, '10000.0');
  await button.click();
  assert.equal(await count(), 1, 'equivalent numeric values must not duplicate');
  for (const [i, bad, good] of [[4, '0', '100000'], [3, '10001', '1000'], [2, '101', '3'], [0, '-1', '10000'], [1, '0', '900'], [4, '', '100000']]) {
    await fill(i, bad);
    assert.equal(await button.isDisabled(), true);
    assert.doesNotMatch(await page.locator('.yen-result').innerText(), /낮습니다/);
    assert.equal(await count(), 1);
    await fill(i, good);
  }
  await fill(0, '11000');
  await button.click();
  assert.equal(await count(), 2);
  const events = await page.evaluate(() => window.auditEvents.filter(e => e[1] === 'effective_price_calculate'));
  for (const [, , params] of events) {
    assert.equal(params.send_to, 'G-VXFLYV6T34');
    assert.equal(params.debug_mode, true);
    assert.equal(params.language, 'ko');
    assert.equal(params.calculator_type, 'yen_comparison');
    assert.equal(params.source_page, 'japan');
    assert.ok(!('yen' in params) && !('domestic' in params));
  }
  report.checks.push('no event on load/typing/invalid input', 'correct fee/refund arithmetic', 'deduplicated numeric submissions', 'measurement destination/debug/locale/context');
  await page.waitForTimeout(10000);
  const calculationRequests = transport.flatMap(row => row.body.split('\n').map(line => new URLSearchParams(`${row.query.slice(1)}&${line}`))).filter(row => row.get('en') === 'effective_price_calculate');
  report.transport = { generatedCalculationRequests: calculationRequests.length, receiver: 'not tested: collector interception enabled to exclude local QA traffic', destinations: [...new Set(calculationRequests.map(row => row.get('tid')))], scriptDiagnostics: [...scriptDiagnostics] };
  if (calculationRequests.length) {
    assert.equal(calculationRequests.length, 2);
    assert.ok(calculationRequests.every(row => row.get('tid') === 'G-VXFLYV6T34'));
  }
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/japan', '/guide/japan-shopping-price-checklist']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://www.dfmoa.com' + route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `page overflow ${width} ${route}`);
      report.viewports.push({ width, route, overflow });
      if (route.includes('checklist')) {
        assert.equal(await page.locator('section[id^="example-p"]').count(), 3);
        assert.match(await page.locator('table').innerText(), /22,110엔/);
        assert.match(await page.locator('table').innerText(), /29,150엔/);
        assert.match(await page.locator('table').innerText(), /실판매가 아님/);
        assert.match(await page.locator('#example-p13').innerText(), /180,225원/);
        assert.match(await page.locator('#example-p13').innerText(), /5,238원/);
        assert.match(await page.locator('#example-p4').innerText(), /가격 우열 보류/);
        assert.match(await page.locator('#example-p6').innerText(), /가격 우열 보류/);
        assert.equal(await page.locator('a[href*="prdNo=20000501205"]').count(), 1);
        if (width === 360) {
          const table = page.getByRole('region', { name: /대표 상품 가격 비교표/ });
          assert.ok(await table.evaluate(el => el.scrollWidth > el.clientWidth));
        }
      }
      await page.screenshot({ path: `docs/japan-${route.includes('checklist') ? 'products' : 'calculator'}-${width}-2026-11-18.png`, fullPage: true });
    }
  }
  await page.evaluate(() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); });
  for (const [selector, event] of [['a[href="/product/dior-sauvage-edp-100ml"]', 'shopping_product_open'], ['a[href="/japan#yen-calculator-title"]', 'shopping_compare_open'], ['a[href^="https://depaco."]', 'shopping_branch_open']]) {
    const link = page.locator(selector).filter({ hasNotText: '엔화 금액을 원화로 계산' }).first();
    await link.evaluate(el => el.addEventListener('click', e => e.preventDefault()));
    await link.click();
    assert.equal(await page.evaluate(name => window.auditEvents.filter(e => e[1] === name).length, event), 1);
  }
  for (const slug of ['dior-sauvage-edp-100ml', 'sk2-pitera-essence-230ml', 'hibiki-harmony-700ml']) {
    const response = await context.request.get(`${base}/product/${slug}`);
    assert.equal(response.status(), 200);
  }
  report.checks.push('three product routes HTTP 200', 'product/calculator/official links each emit one distinct event', 'mobile table scroll and no page overflow');
  await writeFile('docs/japan-shopping-audit-2026-11-18.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
