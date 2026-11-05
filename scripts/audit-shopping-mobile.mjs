import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const root=process.env.DFMOA_AUDIT_OUT;
if(!root) throw Error('DFMOA_AUDIT_OUT required');
const server=createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!path.extname(p))p+='/index.html';const data=await readFile(path.join(root,p));res.setHeader('Content-Type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html');res.end(data)}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true, channel:"chrome"});
const context=await browser.newContext({viewport:{width:360,height:800},permissions:['clipboard-read','clipboard-write']});
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
 await page.locator('article button').first().click();
 assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('210'));
 assert.equal(await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_address_copy').length),1);
 for(const event of ['shopping_map_open','shopping_branch_open']){
 const selector=event==='shopping_map_open'?'article a[href*="google.com/maps"]':'article a[href*="visitkorea.or.kr"]';
 await page.locator(selector).first().evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await page.locator(selector).first().click();
 assert.equal(await page.evaluate(name=>window.auditEvents.filter(e=>e[1]===name).length,event),1);
 }
 }
 if(slug==='korea-duty-free-shopping-list'){
 assert.equal(await page.locator('.intl-product-row').count(),10);
 const link=page.locator('article a[href*="/product/"]').first();await link.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await link.click();assert.equal(await page.evaluate(()=>window.auditEvents.filter(e=>e[1]==='shopping_product_open').length),1);
 for(const [selector,event] of [['article a[href$="/compare"]','shopping_compare_open'],['article a[href$="/guide/incheon-duty-free-pickup"]','shopping_pickup_open']]){
 const action=page.locator(selector).first();await action.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await action.click();assert.equal(await page.evaluate(name=>window.auditEvents.filter(e=>e[1]===name).length,event),1);
 }

 }
}
}
await writeFile('docs/international-seo-mobile-audit.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
}finally{await browser.close();server.close()}

