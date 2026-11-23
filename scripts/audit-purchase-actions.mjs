import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base='http://127.0.0.1:4318';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:360,height:800},permissions:['clipboard-read','clipboard-write']});
await context.route('**/*', route => /google-analytics.com|googlesyndication.com|doubleclick.net|googleadservices.com/.test(new URL(route.request().url()).hostname) ? route.abort() : route.continue());
const page=await context.newPage(); const rows=[];
try {
for(const locale of ['en','ja','zh']) {
 const path=`/${locale}/guide/korea-duty-free-shopping-list`;
 assert.equal((await page.goto(base+path)).status(),200);
 await page.waitForFunction(()=>typeof window.gtag==='function');
 await page.evaluate(()=>{window.auditEvents=[];window.gtag=(...args)=>window.auditEvents.push(args)});
 assert.equal(await page.locator('.country-shopping-item').count(),10);
 assert.equal(await page.locator('.country-purchase-table tbody tr').count(),locale==='zh'?4:3);
 assert.match(await page.locator('#pick-tea').innerText(),/8,800/);
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.dfmoa.com'+path);
 for(const [lang,prefix] of [['en','en'],['ja','ja'],['zh-Hans','zh']]) assert.equal(await page.locator(`link[hreflang="${lang}"]`).getAttribute('href'),`https://www.dfmoa.com/${prefix}/guide/korea-duty-free-shopping-list`);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 const official=page.locator('.shopping-purchase-facts a').first();
 await official.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await official.click();
 const nav=page.locator('.country-shop').first();
 await nav.locator('button').first().click();
 assert.ok((await context.pages()[0].evaluate(()=>navigator.clipboard.readText())).length>10);
 const map=nav.locator('a[href*="google.com/maps"]');await map.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await map.click();
 await nav.locator('.shopping-map button').click();
 for(const [kind,href] of [['shopping_compare_open',`/${locale}/compare`],['shopping_pickup_open',`/${locale}/guide/incheon-duty-free-pickup`]]) {
 const link=page.locator(`.country-shopping a[href="${href}"]`).first();await link.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await link.click();
 assert.equal(await page.evaluate(name=>window.auditEvents.filter(e=>e[1]===name).length,kind),1);
 }
 const branch=nav.locator('nav a').last();await branch.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await branch.click();
 for(const image of await page.locator('.country-shopping-item figure img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());assert.ok(await image.getAttribute('alt'));}
 const events=await page.evaluate(()=>window.auditEvents.filter(e=>e[0]==='event'));
 assert.equal(events.filter(e=>e[1]==='shopping_branch_open').length,2);
 assert.equal(events.filter(e=>e[1]==='shopping_address_copy').length,1);
 assert.deepEqual(events.filter(e=>e[1]==='shopping_map_open').map(e=>e[2].interaction),['external_map','embed_load']);
 for(const [, ,params] of events){assert.equal(params.send_to,'G-VXFLYV6T34');assert.equal(params.source_page,'country_shopping');assert.equal(params.language,locale);}
 await page.locator('#purchase-start-title').scrollIntoViewIfNeeded();
 await page.screenshot({path:`docs/shopping-${locale}-360-2026-11-23.png`});
 rows.push({locale,items:10,facts:locale==='zh'?4:3,overflow:false,events:events.map(e=>({name:e[1],...e[2]})),receipt:'not tested: local collector blocked'});
}
await writeFile('docs/shopping-action-audit-2026-11-23.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));
} finally {await browser.close();}
