import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { collectBenefits, parseBenefits, updateReports, koreaDate, weekStart } from './content-refresh.mjs';
test('site data remains loadable by the standalone price collector', () => {
  const js = ts.transpileModule(fs.readFileSync('src/lib/site-data.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const sandbox = { exports: {}, require: name => { throw new Error(`Unexpected runtime dependency: ${name}`); } };
  vm.runInNewContext(js, sandbox);
  assert.ok(sandbox.exports.products.length >= 100);
  assert.ok(sandbox.exports.guides.some(guide => guide.slug === 'yen-rate-duty-free-comparison'));
});
const card = (start, end, url = 'https://www.hddfs.com/event/op/evnt/evntDetail.do?evntId=1') => `<a href="${url}"><p class="tit">결제 혜택</p><p class="txt_date">${start} ~ ${end}</p></a>`;
test('only dated active official events are published; expiry is inclusive', () => {
  assert.equal(parseBenefits(card('2026-10-01','2026-10-23'), '2026-10-23').length, 1);
  assert.equal(parseBenefits(card('2026-10-01','2026-10-22') + card('2026-11-01','2026-11-30') + card('2026-10-01','2026-10-31','https://example.com/evntDetail.do'), '2026-10-23').length, 0);
  assert.equal(parseBenefits('<a href="/event/op/evnt/evntDetail.do">로그인</a>', '2026-10-23').length, 0);
});
test('KST month boundary and week boundary', () => {
  assert.equal(koreaDate(new Date('2026-10-31T15:00:00Z')), '2026-11-01');
  assert.equal(weekStart('2026-11-01'), '2026-10-26');
  assert.equal(weekStart('2026-11-02'), '2026-11-02');
});
test('immutable weekly issues, monthly changes, rollover and failure preservation', () => {
  const benefits = parseBenefits(card('2026-10-01','2026-12-31'), '2026-10-23');
  const first = updateReports({monthly:[],weekly:[]}, benefits, '2026-10-23');
  assert.deepEqual(updateReports(first, benefits, '2026-10-24'), first);
  const next = updateReports(first, [{...benefits[0], title:'새 혜택'}], '2026-10-26');
  assert.equal(next.weekly.length, 2);
  assert.deepEqual(next.weekly[1], first.weekly[0]);
  assert.equal(next.monthly[0].publishedAt, '2026-10-23');
  assert.equal(updateReports(next, benefits, '2026-11-01').monthly.length, 2);
  assert.throws(() => updateReports(first, [], '2026-10-26'));
});
test('refresh routes Hyundai pagination and retains the real Shinsegae review expiry', async t => {
  const reviewed=JSON.parse(fs.readFileSync('data/content/benefit-reviewed/shinsegae.json','utf8'));
  const day=reviewed.checkedAt;
  const later=new Date(Date.parse(day)+8*86400000).toISOString().slice(0,10);
  const hyundai={prmoId:'1',prmoTitl:'결제 혜택',prmoStDttm:Date.parse(`${day}T00:00:00+09:00`),prmoEndDttm:Date.parse(`${later}T23:59:59+09:00`),totCnt:1};
  t.mock.method(globalThis,'fetch',async url=>{
    if(String(url).includes('lottedfs'))return new Response('<input id="bnfEvtTotCnt" value="0">');
    if(String(url).includes('getBenefitList'))return Response.json({totCnt:0,eventData:[]});
    if(String(url).includes('shilladfs'))return new Response('CSRFToken: "fixture"');
    if(String(url).includes('ssgdfs'))return new Response('Blocked',{status:406});
    if(String(url).endsWith('evntShop.do'))return new Response('<li name="sndTab" class="is-active"><button data-totalcnt="1"></button></li>');
    if(String(url).endsWith('getEvntList.json'))return Response.json({totCnt:1,totalPage:1,evntSpex:{page:1,listSize:20},evntList:[hyundai]});
    throw new Error(`Unexpected public URL: ${url}`);
  });
  const fresh=await collectBenefits(day);
  assert.equal(fresh.coverage.find(x=>x.storeId==='hyundai').status,'ok');
  assert.equal(fresh.coverage.find(x=>x.storeId==='hyundai').count,1);
  const shinsegae=fresh.coverage.find(x=>x.storeId==='shinsegae');
  assert.equal(shinsegae.status,'manual_verified');assert.equal(shinsegae.lastVerifiedAt,day);
  assert.ok(shinsegae.count>0);
  for(const row of fresh.benefits.filter(x=>x.storeId==='shinsegae'))assert.equal(row.checkedAt,day);
  const expired=await collectBenefits(later);
  const stale=expired.coverage.find(x=>x.storeId==='shinsegae');
  assert.equal(stale.status,'error');assert.equal(stale.count,0);assert.equal(stale.error,'HTTP 406');
  assert.equal(stale.lastVerifiedAt,undefined);
  assert.equal(expired.coverage.find(x=>x.storeId==='hyundai').status,'ok');
});
