import {chromium} from 'playwright';import {readFile,writeFile} from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const root=process.env.DFMOA_AUDIT_OUT;if(!root)throw Error('DFMOA_AUDIT_OUT required');const browser=await chromium.launch({headless:true,channel:'chrome'});const rows=[];
async function setup(state='filled'){
 const page=await browser.newPage({viewport:{width:360,height:800}});
 await page.addInitScript(status=>{window.mockAdPushes=0;window.mockAdLoads=0;window.adsbygoogle={push(){window.mockAdPushes++;const ins=Array.from(document.querySelectorAll('ins.adsbygoogle')).find(e=>!e.hasAttribute('data-adsbygoogle-status'));if(ins){ins.setAttribute('data-adsbygoogle-status','done');ins.setAttribute('data-ad-status',status);}}};},state);
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname==='www.dfmoa.com'){try{let p=decodeURIComponent(u.pathname);if(!path.extname(p))p+='/index.html';const bytes=await readFile(path.join(root,p));return route.fulfill({body:bytes,contentType:({'.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain'})[path.extname(p)]||'text/html'});}catch{return route.fulfill({status:404,body:''})}}if(u.pathname.includes('/pagead/js/adsbygoogle.js'))return route.fulfill({contentType:'application/javascript',body:'window.mockAdLoads++;'});return route.abort();});return page;
}
try{
for(const locale of ['en','ja','zh']){
for(const suffix of ['','/guide/korea-duty-free-shopping-list','/guide/incheon-duty-free-pickup','/guide/myeongdong-gifts','/guide/sulwhasoo-first-care-90ml','/guide/busan-station-souvenirs','/guide/gimhae-duty-free-pickup']){
 const page=await setup();const route='/'+locale+suffix;await page.goto('https://www.dfmoa.com'+route);await page.waitForTimeout(300);assert.equal(await page.locator('.ad-banner').count(),2,route);
 assert.equal(await page.locator('.ad-banner--results').count(),1);
 assert.ok(await page.locator('header a[href="/'+locale+'/guide/korea-duty-free-shopping-list"]').count());
 await page.locator('.ad-banner--results').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.mockAdPushes===2);assert.equal(await page.evaluate(()=>window.mockAdLoads),1);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.mockAdPushes),2);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 rows.push({route,placements:2,scriptLoads:1,pushes:2,overflow:false});
 if(locale==='ja'&&suffix===''){await page.locator('header button').click();assert.equal(await page.locator('header button').getAttribute('aria-expanded'),'true');assert.ok(await page.locator('header a[href="/ja/guide/korea-duty-free-shopping-list"]').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('header button').getAttribute('aria-expanded'),'false');}
 await page.close();
}}
for(const [state,visible] of [['unfilled',false],['unfill-optimized',true],['filled',true]]){const page=await setup(state);await page.goto('https://www.dfmoa.com/en');await page.waitForTimeout(300);await page.waitForSelector('.ad-banner--top',{state:visible?'visible':'hidden'});assert.equal(await page.evaluate(()=>window.mockAdPushes),1);await page.close();}
const privacy=await setup();await privacy.goto('https://www.dfmoa.com/ja/privacy');await privacy.waitForTimeout(200);assert.equal(await privacy.locator('.ad-banner').count(),0);assert.equal(await privacy.evaluate(()=>window.mockAdLoads),0);await privacy.close();
await writeFile('docs/international-ads-local-audit-20261106.json',JSON.stringify(rows,null,2));console.log('21 pages passed: two slots, one script, no duplicate pushes; status visibility, privacy and mobile navigation passed.');
}finally{await browser.close()}
