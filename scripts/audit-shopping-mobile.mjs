import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const root=process.env.DFMOA_AUDIT_OUT;
if(!root) throw Error('DFMOA_AUDIT_OUT required');
const server=createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!path.extname(p))p+='/index.html';const data=await readFile(path.join(root,p));res.setHeader('Content-Type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(data)}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true, channel:"chrome"});
const context=await browser.newContext({viewport:{width:360,height:800},hasTouch:true,permissions:['clipboard-read','clipboard-write']});
await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
await context.addInitScript(()=>{window.auditEvents=[];window.gtag=(...args)=>window.auditEvents.push(args)});
const page=await context.newPage();const rows=[];
try{
for(const lang of ['en','ja','zh']){
for(const slug of ['korea-duty-free-shopping-list','busan-station-souvenirs','gimhae-duty-free-pickup','incheon-duty-free-pickup','myeongdong-gifts','sulwhasoo-first-care-90ml']){
 const route=`/${lang}/guide/${slug}`;await page.goto(base+route);await page.waitForTimeout(1000); await page.evaluate(()=>{window.auditEvents=[];window.gtag=(...args)=>window.auditEvents.push(args)});
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.dfmoa.com'+route);
 assert.ok(await page.locator('link[rel=alternate][hreflang]').count()>=3);
 assert.ok(await page.locator('h1').innerText());
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 rows.push({route,overflow});
 if(slug==='busan-station-souvenirs'){
 const directions=page.locator('article details');
 const operator=page.locator('article a[href="https://busansouvenir2.cafe24.com/sub/about.html"]');
 assert.equal(await directions.getAttribute('open'),null);
 assert.ok(await operator.isVisible());
 await operator.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));
 await operator.click();
 const storeClicks=await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_branch_open').map(e=>e[2]));
 assert.equal(storeClicks.length,1);
 assert.equal(storeClicks[0].store,'dongbaek-busan-station');
 assert.equal(storeClicks[0].language,lang);
 await directions.locator('summary').click();
 await directions.getByRole('button').first().click();
 assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('210'));
 assert.equal(await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_address_copy').length),1);
 const map=directions.locator('a[href*="google.com/maps"]');
 await map.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));
 await map.click();
 assert.equal(await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_map_open' && e[2].interaction==='external_map').length),1);
 }
 if(slug==='korea-duty-free-shopping-list'){
 if (lang === 'ja') {
   const choices = page.getByRole('navigation', {name: '買い方を選ぶ'}).getByRole('link');
   const links = await choices.evaluateAll(anchors => anchors.map(anchor => {
     const box = anchor.getBoundingClientRect();
     const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
     return {
       href: anchor.getAttribute('href'),
       reachable: box.height >= 44 && box.top >= 0 && box.bottom <= innerHeight &&
         box.left >= 0 && box.right <= innerWidth && anchor.contains(hit),
     };
   }));
   assert.deepEqual(links.map(link => link.href), [
     '#shopping-stops', '/ja/compare', '/ja/guide/incheon-duty-free-pickup', '/ja/guide/gimhae-duty-free-pickup',
   ]);
   for (const link of links) assert.ok(link.reachable, `First-screen action is clipped or covered: ${link.href}`);
 }
 const stationLink=page.locator('a[href="#shop-dongbaek-busan-station"]');
 await stationLink.tap();
 assert.equal(new URL(page.url()).hash,'#shop-dongbaek-busan-station');
 const stop=page.locator('#shop-dongbaek-busan-station');
 assert.ok(await stop.locator('a[href="https://busansouvenir2.cafe24.com/sub/about.html"]').isVisible());
 assert.equal(await stop.locator('details').getAttribute('open'),null);
 const jumps=await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_store_guide_open').map(e=>e[2]));
 assert.equal(jumps.length,1);
 assert.equal(jumps[0].language,lang);
 assert.equal(jumps[0].product_slug,'busan');
 assert.equal(jumps[0].destination,'shop-dongbaek-busan-station');
 const guideHtml = await readFile(path.join(root, lang, 'guide', 'myeongdong-gifts', 'index.html'), 'utf8');
 const guide = load(guideHtml);
 for (const [product, store] of [['mask', 'oliveyoung'], ['tea', 'osulloc']]) {
   const anchor = `shop-${store}`;
   const firstEvent = await page.evaluate(() => window.auditEvents.length);
   await page.locator(`.mobile-purchase-actions a[href="#${anchor}"]`).tap();
   await page.waitForURL(`${base}${route}#${anchor}`);
   const stop = page.locator(`#${anchor}`);
   const heading = stop.locator(':scope > h3');
   assert.equal(await stop.getAttribute('lang'), lang === 'zh' ? 'zh-Hans' : lang);
   assert.equal(await heading.innerText(), guide(`#${store} > h2`).text());
   await page.waitForFunction(id => {
     const element = document.getElementById(id).querySelector('h3');
     const box = element.getBoundingClientRect();
     return box.top >= 0 && box.bottom <= innerHeight &&
       element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
   }, anchor);
   const korean = stop.locator(':scope > p[lang="ko"]');
   assert.equal(await korean.locator('strong').innerText(), guide(`#${store} > p[lang="ko"] strong`).text());
   const address = (await korean.innerText()).split(/\s+/).join(' ').trim();
   const map = new URL(await stop.locator('a[href*="google.com/maps"]').getAttribute('href'));
   assert.equal(map.searchParams.get('query'), address);
   await stop.locator(':scope > nav button').tap();
   await page.waitForFunction(cursor => window.auditEvents.slice(cursor).some(e => e[1] === 'shopping_address_copy'), firstEvent);
   assert.equal(await page.evaluate(() => navigator.clipboard.readText()), address);
   const actions = await page.evaluate(cursor => window.auditEvents.slice(cursor).filter(e =>
     ['shopping_store_guide_open', 'shopping_address_copy'].includes(e[1])
   ), firstEvent);
   assert.deepEqual(actions.map(e => e[1]), ['shopping_store_guide_open', 'shopping_address_copy']);
   assert.ok(actions.every(e => e[2].language === lang && e[2].source_page === 'country_shopping'));
   assert.equal(actions[0][2].product_slug, product);
   assert.equal(actions[0][2].destination, anchor);
   assert.equal(actions[1][2].store, store);
 }
 const catalog=page.locator('article details').filter({has:page.locator('.intl-product-row')});
 await catalog.locator('summary').tap();
 assert.equal(await catalog.locator('.intl-product-row').count(),10);
 const link=catalog.locator(`a[href^="/${lang}/product/"]`).first();
 await link.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));
 await link.tap();
 assert.equal(await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_product_open').length),1);
 for(const [selector,event] of [['article a[href$="/compare"]','shopping_compare_open'],['article a[href$="/guide/incheon-duty-free-pickup"]','shopping_pickup_open']]){
 const action=page.locator(selector).first();await action.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await action.click();assert.equal(await page.evaluate(name=>window.auditEvents.filter(e=>e[1]===name).length,event),1);
 }

 }
}
}
await writeFile('docs/international-seo-mobile-audit.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
}finally{await browser.close();server.close()}

