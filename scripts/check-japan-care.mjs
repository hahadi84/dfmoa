import assert from "node:assert/strict";
import { chromium } from "playwright";
import { load } from "cheerio";

const origin = process.argv[2] || "http://127.0.0.1:41876";
if (!["localhost","127.0.0.1"].includes(new URL(origin).hostname)) throw Error("Use a local export preview");
const root = origin+"/japan/clinics";
const xml = await (await fetch(origin+"/sitemap.xml")).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>p.startsWith("/japan/clinics"));
assert.equal(new Set(urls).size,36);
for (const path of urls){
  const res=await fetch(origin+path);
  assert.equal(res.status,200,path);
  const $=load(await res.text());
  assert.equal(new URL($('link[rel="canonical"]').attr('href')).pathname,path);
  assert.equal($('link[hreflang]').length,3);
  assert.equal($('.care-shell h1').length,1);
}
const browser = await chromium.launch({channel:"chrome"});
try {
  for(const width of [360,1280]){
    const page=await browser.newPage({viewport:{width,height:850}});
    await page.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(root+"/");
    const search=page.locator("#directory input[type=search]");
    await page.waitForSelector(".care-record");
    assert.equal(await page.locator(".care-record").count(),10);
    await page.getByRole("button",{name:"다음 10곳 보기"}).click();
    assert.equal(await page.locator(".care-record").count(),20);
    await search.fill("삿포로");
    assert.ok(await page.locator(".care-record").count()>0);
    await search.fill("does-not-exist-000");
    assert.equal(await page.locator(".care-record").count(),0);
    await page.getByRole("button",{name:"조건 초기화"}).click();
    const selectors=page.locator(".care-controls select");
    await selectors.nth(0).selectOption("13");
    await selectors.nth(1).selectOption("歯科");
    await selectors.nth(2).selectOption("EN");
    await page.locator(".care-record summary").first().click();
    assert.ok((await page.locator("details[open] a").first().getAttribute("href")).includes("maps/search"));
    await page.locator("#care-topics input").fill("마운자로");
    assert.equal(await page.locator(".care-topic-list a").count(),1);
    await page.locator(".care-topic-list a").click();
    await page.getByRole("heading",{level:1,name:"마운자로 처방 상담"}).waitFor();
    await page.locator(".care-estimate select").selectOption("1");
    await page.locator(".care-estimate input").nth(1).check();
    assert.ok((await page.locator(".care-estimate output").innerText()).includes("81,191"));
    await page.locator("#visit input").first().check();
    assert.ok((await page.locator("#visit [aria-live]").innerText()).includes("1 / 3"));
    for(const [label,lang] of [["English","en"],["简体中文","zh-Hans"]]){
      await page.locator(".care-top nav").getByText(label,{exact:true}).click();
      await page.locator('.care-shell[lang="'+lang+'"]').waitFor();
      assert.ok(page.url().includes("/mounjaro"));
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    await page.goto(root+"/");
    await page.locator("#feedback summary").click();
    const form=page.locator("form[name=japan-care]");
    assert.equal(await form.getAttribute("method"),"POST");
    assert.equal(await form.evaluate(f=>f.checkValidity()),false);
    await form.locator("[name=facility]").fill("Local QA");
    await form.locator("[name=email]").fill("qa@example.invalid");
    await form.locator("[name=message]").fill("Local form validation only");
    assert.equal(await form.evaluate(f=>f.checkValidity()),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    console.log(width+"px search, filters, detail, topic navigation, language, calculator, checklist and form passed");
    await page.close();
  }
} finally { await browser.close(); }
console.log(urls.length+" public routes, canonical links and language alternates passed");

