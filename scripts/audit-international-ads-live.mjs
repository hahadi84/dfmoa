import {chromium} from 'playwright';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});const results=[];
try{for(const route of ['/','/en','/ja','/zh','/en/guide/korea-duty-free-shopping-list']){
 const page=await browser.newPage({viewport:{width:1360,height:900}});const errors=[];const failures=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,240))});page.on('requestfailed',r=>{if(/googlesyndication|doubleclick/.test(r.url()))failures.push({url:r.url().split('?')[0],error:r.failure()?.errorText})});
 await page.goto('https://www.dfmoa.com'+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(6000);
 results.push({route,ads:await page.locator('.ad-banner').evaluateAll(es=>es.map(e=>({state:e.dataset.adState,label:e.getAttribute('aria-label'),rect:{w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height},ins:e.querySelector('ins')?.outerHTML.slice(0,700)}))),script:await page.locator('script[src*="pagead/js/adsbygoogle.js"]').count(),iframe:await page.locator('iframe[id^="aswift"]').count(),errors,failures});await page.close();
}console.log(JSON.stringify(results));await writeFile('docs/international-ads-live-before-20261106.json',JSON.stringify(results,null,2));}finally{await browser.close()}
