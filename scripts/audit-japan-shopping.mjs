import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.DFMOA_AUDIT_BASE ?? 'http://127.0.0.1:4318';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 800 }, hasTouch: true });
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
  const quickEvents = () => page.evaluate(() => window.auditEvents.filter(row => row[1] === 'yen_conversion_complete').length);
  const fill = (index, value) => page.locator(`#yen-field-${index}`).fill(value);
  const button = page.getByRole('button', { name: '입력한 가격 비교하기' });
  const quick = page.getByRole('textbox', { name: '원화로 환산할 금액 (엔)', exact: true });
  const reference = page.locator('.yen-reference summary');
  await page.evaluate(() => document.fonts.ready);
  for (const control of [quick, page.locator('#quick-yen-result'), reference]) {
    const box = await control.boundingBox();
    assert.ok(box && box.y >= 0 && box.y + box.height <= 800, '360px: input, result and reference rate are in the initial viewport');
  }
  assert.equal(await quick.inputValue(), '');
  assert.equal(await quickEvents(), 0);
  await quick.tap();
  await page.keyboard.insertText('10000');
  const defaultRate = Number(await page.locator('#yen-field-1').inputValue());
  const expectedWon = Math.round(10000 * defaultRate / 100).toLocaleString('ko-KR') + '원';
  assert.ok((await page.locator('#quick-yen-result').innerText()).includes(expectedWon));
  await quick.press('Enter');
  await reference.tap();
  assert.equal(await quickEvents(), 1, 'Done followed by blur is one conversion');
  assert.match(await reference.innerText(), /100엔 = [\d,.]+원.*\d{4}-\d{2}-\d{2}/);
  assert.equal(await page.getByRole('link', { name: '환율 출처' }).getAttribute('href'), 'https://frankfurter.dev/');
  await reference.tap();
  assert.equal(await page.locator('#yen-field-0').inputValue(), '10000');
  report.checks.push('first-screen 360px direct yen entry, immediate won amount, dated rate and source, one completed conversion');
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
        const whiskyRow = page.getByRole('row').filter({ hasText: '히비키 JAPANESE HARMONY' });
        assert.match(await whiskyRow.innerText(), /12,800엔.*세금 포함/s);
        assert.match(await whiskyRow.innerText(), /US\$93.*124,954원.*가격 우열 보류/s);
        assert.doesNotMatch(await whiskyRow.innerText(), /8,000엔/);
        assert.match(await page.locator('#example-p13').innerText(), /180,225원/);
        assert.match(await page.locator('#example-p13').innerText(), /5,238원/);
        const essence = page.locator('#example-p4');
        const essenceText = await essence.innerText();
        assert.match(essenceText, /가격 우열 보류/);
        assert.match(essenceText, /29,150엔.*2026-11-18/s);
        assert.match(essenceText, /지하 1층에서 SK-II 화장품 매장/);
        assert.match(essenceText, /온라인 회원 본인.*지하 1층 서비스 카운터.*주문 확인 메일/);
        assert.match(essenceText, /14시.*17시.*다음 날.*수령 가능일을 포함해 3영업일/);
        assert.equal(await essence.locator('[lang="ja"]').innerText(), '東京都新宿区西新宿1-5-1');
        assert.equal(await essence.locator('time').getAttribute('datetime'), '2026-11-26');
        const whiskyText = await page.locator('#example-p6').innerText();
        assert.match(whiskyText, /2026-11-26 14:35 JST/);
        assert.match(whiskyText, /2026-11-26 14:35 KST/);
        assert.match(whiskyText, /8,000엔은 세금 별도 제조사 권장가격/);
        assert.match(whiskyText, /상자 포함 여부.*출국편별 최종 결제액/);
        assert.equal(await page.locator('a[href*="prdNo=20000501205"]').count(), 1);
        if (width === 360) {
          const table = page.getByRole('region', { name: /대표 상품 가격 비교표/ });
          assert.ok(await table.evaluate(el => el.scrollWidth > el.clientWidth));
        }
      }
      await page.screenshot({ path: `docs/japan-${route.includes('checklist') ? 'products' : 'calculator'}-${width}-2026-11-23.png`, fullPage: true });
    }
  }
  await page.evaluate(() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); });
  for (const [selector, event] of [['a[href="/product/dior-sauvage-edp-100ml"]', 'shopping_product_open'], ['a[href^="https://depaco."]', 'shopping_branch_open']]) {
    const link = page.locator('#example-p13').locator(selector);
    await link.evaluate(el => el.addEventListener('click', e => e.preventDefault(), { once: true }));
    await link.click();
    assert.equal(await page.evaluate(name => window.auditEvents.filter(e => e[1] === name).length, event), 1);
  }
  for (const slug of ['dior-sauvage-edp-100ml', 'sk2-pitera-essence-230ml', 'hibiki-harmony-700ml']) {
    const response = await context.request.get(`${base}/product/${slug}`);
    assert.equal(response.status(), 200);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(base + '/japan');
  await page.evaluate(() => {
    window.gtag = (command, name, params) => {
      if (command === 'event' && name === 'shopping_product_open') {
        const clicks = JSON.parse(sessionStorage.getItem('audit-hibiki-open') || '[]');
        sessionStorage.setItem('audit-hibiki-open', JSON.stringify([...clicks, params]));
      }
    };
  });
  await page.getByRole('link', { name: '히비키 700ml의 일본·한국 표시가 확인' }).tap();
  await page.waitForURL('**/guide/japan-shopping-price-checklist#example-p6');
  const whiskyClicks = await page.evaluate(() => JSON.parse(sessionStorage.getItem('audit-hibiki-open') || '[]'));
  assert.equal(whiskyClicks.length, 1);
  assert.equal(whiskyClicks[0].product_slug, 'hibiki-harmony-700ml');
  assert.equal(whiskyClicks[0].source_page, 'japan');
  assert.equal(whiskyClicks[0].send_to, 'G-VXFLYV6T34');
  const whisky = page.locator('#example-p6');
  await page.waitForFunction(() => {
    const prices = document.querySelectorAll('#example-p6 dd');
    return [prices[0], prices[1]].every(element => {
      const box = element?.getBoundingClientRect();
      return box && box.height > 0 && box.top >= 0 && box.bottom <= window.innerHeight;
    });
  });
  await page.evaluate(() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); });
  const whiskySources = ['https://www.liquor-depot.jp/c/09/111222', 'https://www.busandf.com/goods/catalog?code=0014'];
  for (const [index, url] of whiskySources.entries()) {
    await context.route(url, route => route.fulfill({ contentType: 'text/plain', body: 'Official seller link test' }), { times: 1 });
    const link = whisky.locator(`a[href="${url}"]`);
    const [tab] = await Promise.all([context.waitForEvent('page'), link.tap()]);
    await tab.waitForURL(url);
    await tab.close();
    const sellerClicks = await page.evaluate(() => window.auditEvents.filter(row => row[1] === 'shopping_branch_open'));
    assert.equal(sellerClicks.length, index + 1);
    assert.equal(sellerClicks[index][2].product_slug, 'hibiki-harmony-700ml');
    assert.equal(sellerClicks[index][2].source_page, 'japan_shopping_checklist');
    assert.equal(sellerClicks[index][2].send_to, 'G-VXFLYV6T34');
  }
  report.checks.push('360px Hibiki shortcut and both dated seller prices, official source links with one event per tap');
  await page.getByRole('navigation', { name: '대표 상품 바로가기' }).getByRole('link', { name: /SK-II/ }).tap();
  await page.waitForURL('**/guide/japan-shopping-price-checklist#example-p4');
  const storeActions = [
    { label: '오다큐 지하 1층 매장 지도 열기', url: 'https://www.odakyu-dept.co.jp/shinjuku/floorguide/b01/index.html', event: 'shopping_map_open', interaction: 'external_map' },
    { label: '오다큐 공식 수령 창구 안내', url: 'https://www.odakyu-dept.co.jp/shinjuku/services/index.html', event: 'shopping_branch_open', interaction: 'official_branch' },
  ];
  for (const action of storeActions) {
    const link = page.locator('#example-p4').getByRole('link', { name: action.label });
    await link.scrollIntoViewIfNeeded();
    const box = await link.boundingBox();
    assert.ok(box && box.height >= 44 && box.x >= 0 && box.x + box.width <= 360);
    await page.evaluate(() => { window.auditEvents = []; });
    await context.route(action.url, route => route.fulfill({ contentType: 'text/plain', body: 'Official location link test' }), { times: 1 });
    const [tab] = await Promise.all([context.waitForEvent('page'), link.tap()]);
    await tab.waitForURL(action.url);
    await tab.close();
    const clicks = await page.evaluate(() => window.auditEvents.filter(row => ['shopping_map_open', 'shopping_branch_open'].includes(row[1])));
    assert.equal(clicks.length, 1);
    assert.equal(clicks[0][1], action.event);
    assert.equal(clicks[0][2].interaction, action.interaction);
    assert.equal(clicks[0][2].store, 'odakyu_shinjuku');
    assert.equal(clicks[0][2].product_slug, 'sk2-pitera-essence-230ml');
    assert.equal(clicks[0][2].source_page, 'japan_shopping_checklist');
    assert.equal(clicks[0][2].send_to, 'G-VXFLYV6T34');
  }
  report.checks.push('360px SK-II Shinjuku counter and member pickup, official floor map and service page, one distinct event per tap');
  for (const product of ['#example-p4', '#example-p6']) {
    const manualLink = page.locator(product).getByRole('link', { name: '내 엔화 가격과 면세 결제액으로 비교' });
    await manualLink.tap();
    await page.waitForURL('**/japan#yen-calculator-title');
    assert.equal(await page.locator('#quick-yen').inputValue(), '');
    assert.equal(await page.locator('#yen-field-4').inputValue(), '');
    assert.ok(await button.isDisabled());
    await page.goBack();
    if (product === '#example-p4') await page.waitForURL('**/guide/japan-shopping-price-checklist#example-p4');
    await manualLink.waitFor();
  }
  // Persist the source click across a full page navigation as well as client-side routing.
  await page.evaluate(() => {
    sessionStorage.removeItem('audit-example-clicks');
    window.gtag = (...args) => {
      if (args[0] === 'event' && args[1] === 'shopping_compare_open') {
        const records = JSON.parse(sessionStorage.getItem('audit-example-clicks') || '[]');
        sessionStorage.setItem('audit-example-clicks', JSON.stringify([...records, args[2]]));
      }
    };
  });
  await page.locator('#example-p13').getByRole('link', { name: '계산기에서 소바쥬 11월 18일 가격 예시 보기' }).tap();
  await page.waitForURL('**/japan#yen-sauvage-example');
  const example = page.getByRole('region', { name: '디올 소바쥬 오 드 퍼퓸 100ml 가격 비교 예시' });
  const applyExample = example.getByRole('button', { name: '이 두 가격을 계산기에 입력' });
  await page.waitForFunction(() => {
    const top = document.querySelector('#yen-sauvage-example')?.getBoundingClientRect().top;
    return top >= 0 && top < innerHeight;
  });
  const bounds = await applyExample.boundingBox();
  assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 800, 'historical amounts and action visible after tapping the guide link');
  assert.match(await example.innerText(), /21,485엔 이하/);
  assert.ok(21485 * 838.82 / 100 <= 180225 && 21486 * 838.82 / 100 > 180225);
  assert.equal(await page.locator('#quick-yen').inputValue(), '');
  assert.ok(await button.isDisabled());
  const sourceClicks = await page.evaluate(() => JSON.parse(sessionStorage.getItem('audit-example-clicks') || '[]'));
  assert.equal(sourceClicks.length, 1);
  assert.equal(sourceClicks[0].product_slug, 'dior-sauvage-edp-100ml');
  assert.equal(sourceClicks[0].source_page, 'japan_shopping_checklist');
  assert.equal(sourceClicks[0].send_to, 'G-VXFLYV6T34');
  await page.evaluate(() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); });
  await applyExample.tap();
  assert.equal(await page.locator(':focus').innerText(), '한국 면세점 가격과 비교하기');
  assert.equal(await page.locator('#yen-field-0').inputValue(), '22110');
  assert.equal(await page.locator('#yen-field-1').inputValue(), '838.82');
  assert.equal(await page.locator('#yen-field-4').inputValue(), '180225');
  assert.doesNotMatch(await page.locator('.yen-result').innerText(), /낮습니다/);
  assert.equal(await count(), 0);
  await page.getByRole('button', {name:'입력한 가격 비교하기'}).click();
  await button.click();
  assert.equal(await count(), 1, 'one historical comparison for two identical submissions');
  const historicalEvents = await page.evaluate(() => window.auditEvents.filter(e => e[1] === 'effective_price_calculate' || e[1] === 'yen_conversion_complete'));
  assert.equal(historicalEvents.length, 1);
  assert.equal(historicalEvents[0][2].price_basis, 'historical_example');
  assert.match(await page.locator('.yen-result').innerText(), /과거 관찰가/);
  assert.match(await page.locator('.yen-result').innerText(), /5,238원/);
  await page.locator('#yen-field-0').fill('22000');
  assert.doesNotMatch(await page.locator('.yen-result').innerText(), /5,238원/);
  report.checks.push('360px touch from Dior to dated prices and whole-yen threshold, one source click, explicit example and submit, other products start blank');
  report.checks.push('three product routes HTTP 200', 'product/calculator/official links each emit one distinct event', 'mobile table scroll and no page overflow');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('button', { name: '예시 지우고 내 가격 입력' }).click();
  assert.equal(await page.locator(':focus').getAttribute('id'), 'quick-yen');
  assert.equal(await page.locator('#quick-yen').inputValue(), '');
  assert.equal(await page.locator('#yen-field-4').inputValue(), '');
  await fill(1, '850');
  await fill(4, '100000');
  await page.evaluate(() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); });
  await quick.focus();
  await page.keyboard.insertText('1,100円～2,200円');
  await quick.press('Enter');
  await quick.press('Tab');
  assert.equal(await quick.getAttribute('aria-invalid'), 'true');
  assert.match(await page.locator('#quick-yen-result').innerText(), /가격 하나만/);
  assert.equal(await button.isDisabled(), true);
  assert.equal(await quickEvents(), 0);
  await quick.fill('￥１１，０００');
  assert.match(await page.locator('#quick-yen-result').innerText(), /93,500원/);
  await quick.press('Enter');
  await quick.press('Tab');
  assert.equal(await quickEvents(), 1);
  await button.click();
  assert.match(await page.locator('.yen-result').innerText(), /6,500원/);
  await fill(0, '세전 10,000円 / 세금 포함 11,000円');
  assert.equal(await page.locator('#yen-field-0').getAttribute('aria-invalid'), 'true');
  assert.equal(await button.isDisabled(), true);
  assert.doesNotMatch(await page.locator('.yen-result').innerText(), /6,500원/);
  await fill(0, '11,000円');
  for (const [index, range, single] of [[1, '840~850원', '850원'], [2, '2~3%', '3%'], [3, '400~500円', '500円'], [4, '90,000~100,000원', '₩100,000']]) {
    await fill(index, range);
    assert.equal(await button.isDisabled(), true);
    await fill(index, single);
  }
  await button.click();
  assert.match(await page.locator('.yen-result').innerText(), /92,055원/);
  assert.match(await page.locator('.yen-result').innerText(), /7,945원/);
  assert.equal(await quickEvents(), 1);
  report.checks.push('a single formatted yen price converts, pasted ranges clear the comparison and create no conversion event');
  await page.getByRole('link', { name: '가격표 읽는 예시' }).click();
  await page.waitForURL('**/guide/yen-rate-duty-free-comparison#japan-price-tag');
  assert.match(await page.locator('#japan-price-tag').innerText(), /93,500원/);
  await page.goto(`${base}/japan`);
  await page.getByRole('link', { name: '향수·화장품·위스키 짐 싸는 법' }).click();
  await page.waitForURL('**/guide/japan-shopping-price-checklist#japan-liquid-baggage');
  const packing = page.getByRole('region', { name: '시내에서 산 향수·에센스·위스키, 어느 짐에 넣을까요?' });
  for (const [width, height] of [[360, 800], [1280, 900]]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('link', { name: '기내·위탁 수하물 확인' }).click();
    assert.equal(await packing.locator('dt').count(), 3);
    const [perfume, essence, whisky] = await packing.locator('dd').allTextContents();
    assert.match(perfume, /100ml.*기내/);
    assert.match(essence, /230ml.*위탁/);
    assert.match(whisky, /700ml.*위탁/);
    assert.match(await packing.innerText(), /2L 이하이면서 미화 400달러 이하/);
    assert.ok(await packing.evaluate(el => el.scrollWidth <= el.clientWidth));
    for (const link of await packing.locator('dt a').all()) {
      const target = await link.getAttribute('href');
      await link.click();
      await page.waitForURL(url => url.pathname === '/guide/japan-shopping-price-checklist' && url.hash === target);
      assert.equal(await page.locator(target).locator('h3').innerText(), await link.innerText());
    }
  }
  const imageHref = await page.locator('meta[property="og:image"]').getAttribute('content');
  const shareImage = await context.request.get(base + new URL(imageHref).pathname);
  assert.ok(shareImage.ok() && shareImage.headers()['content-type'].startsWith('image/png'));
  await packing.getByRole('link', { name: '내 출국 터미널의 세관 지도 찾기' }).click();
  await page.waitForURL('**/guide/japan-tax-refund-2026#refund-airports');
  assert.ok(await page.locator('#refund-airports').isVisible());
  report.checks.push('hub and guide shortcuts to packing advice for all three products, working share image and onward terminal map link');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${base}/guide/japan-tax-refund-2026`);
  const mapShortcut = page.getByRole('link', { name: '나리타·하네다·간사이 세관 지도' });
  const shortcutBounds = await mapShortcut.boundingBox();
  assert.ok(shortcutBounds && shortcutBounds.y >= 0 && shortcutBounds.y + shortcutBounds.height <= 800, '360px: map shortcut fully visible on arrival');
  await mapShortcut.click();
  await page.waitForURL('**/guide/japan-tax-refund-2026#refund-airports');
  const mapNav = page.getByRole('navigation', { name: '일본 세관 공식 지도' });
  const mapRoot = 'https://www.customs.go.jp/kaigairyoko/taxrefund/';
  const terminals = [
    ['나리타 1터미널 · 중앙빌딩 4층', 'NRT', 'T1', 'AIR_01_01_01'],
    ['나리타 2터미널 · 본관 3층', 'NRT', 'T2', 'AIR_01_01_02'],
    ['나리타 3터미널 · 본관 2층', 'NRT', 'T3', 'AIR_01_01_03'],
    ['하네다 3터미널 · 3층', 'HND', 'T3', 'AIR_01_02_02'],
    ['간사이 1터미널 · 4층', 'KIX', 'T1', 'AIR_04_03_01'],
    ['간사이 2터미널 · 1층', 'KIX', 'T2', 'AIR_04_03_02'],
  ];
  assert.equal(await mapNav.getByRole('link').count(), terminals.length + 1);
  assert.equal(await mapNav.getByRole('link', { name: '다른 공항·터미널의 세관 지도 찾기' }).getAttribute('href'), mapRoot + 'map.htm');
  await context.route(mapRoot + 'map/*.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }));
  await page.evaluate(() => { window.auditEvents = []; window.gtag = (...args) => window.auditEvents.push(args); });
  for (const [index, [label, airport, terminal, mapId]] of terminals.entries()) {
    const map = mapNav.getByRole('link', { name: label });
    const box = await map.boundingBox();
    assert.ok(box && box.height >= 44 && box.x >= 0 && box.x + box.width <= 360, label);
    const [tab] = await Promise.all([context.waitForEvent('page'), map.tap()]);
    await tab.waitForURL(mapRoot + 'map/' + mapId + '.svg');
    await tab.close();
    const events = await page.evaluate(() => window.auditEvents.filter(row => row[1] === 'shopping_map_open'));
    assert.equal(events.length, index + 1);
    assert.equal(events[index][2].airport, airport);
    assert.equal(events[index][2].terminal, terminal);
    assert.equal(events[index][2].interaction, 'external_map');
    assert.equal(events[index][2].source_page, 'japan-tax-refund-2026');
    assert.equal(events[index][2].language, 'ko');
    assert.equal(events[index][2].send_to, 'G-VXFLYV6T34');
  }
  report.checks.push('six terminal map taps open their respective official URLs in new tabs, with one map event per tap');
  await writeFile('docs/japan-shopping-audit-2026-11-23.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
