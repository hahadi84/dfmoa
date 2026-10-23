import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { parseBenefits, updateReports, koreaDate, weekStart } from './content-refresh.mjs';
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
