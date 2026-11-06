import {createServer} from 'node:http';import {readFile,writeFile} from 'node:fs/promises';import path from 'node:path';import {chromium} from 'playwright';import assert from 'node:assert/strict';
const root=process.env.DFMOA_AUDIT_OUT;if(!root)throw Error('DFMOA_AUDIT_OUT required');
const server=createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!path.extname(p))p+='/index.html';const data=await readFile(path.join(root,p));res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(p)]||'text/html');res.end(data)}catch{res.statusCode=404;res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:360,height:800}});const rows=[];
try{for(const [l,market] of [['en','US'],['ja','JP'],['zh','CN']]){
 const route=`/${l}/guide/korea-duty-free-shopping-list`;await page.goto(base+route);await page.waitForTimeout(1000);
 assert.equal(await page.locator('.country-shopping-item').count(),10);
 assert.equal(await page.locator('.country-shop').count(),3);
 const ids=await page.locator('.country-shopping-item').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,10);
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.dfmoa.com'+route);
 assert.equal(await page.locator('.country-shopping-item figure img').count()>=8,true);
 for(const img of await page.locator('.country-shopping-item figure img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>new Promise((r,j)=>{if(e.complete)return e.naturalWidth?r():j('image failed');e.onload=r;e.onerror=j}));}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.evaluate(()=>{window.events=[];window.gtag=(...args)=>window.events.push(args)});
 const link=page.locator('.country-shopping-item a[href*="/product/"]').first();await link.evaluate(e=>e.addEventListener('click',ev=>ev.preventDefault()));await link.click();const events=await page.evaluate(()=>window.events.filter(e=>e[1]==='shopping_product_open'));assert.equal(events.length,1);assert.equal(events[0][2].content_market,market);
 if(l==='en'){await page.locator('.country-shopping-item').first().scrollIntoViewIfNeeded();await page.screenshot({path:'docs/country-shopping-mobile-20261106.png'});}
 rows.push({locale:l,contentMarket:market,items:10,stops:3,ids,photos:'loaded',overflow:false,eventCount:1});
}
assert.notDeepEqual(rows[0].ids,rows[1].ids);assert.notDeepEqual(rows[1].ids,rows[2].ids);await writeFile('docs/country-shopping-audit-20261106.json',JSON.stringify(rows,null,2));console.log(rows);
}finally{await browser.close();server.close()}
