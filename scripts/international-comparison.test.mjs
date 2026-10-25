import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const sandbox = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/international-comparison.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, sandbox);
const compare = sandbox.exports.compareShoppingCosts;
test('compares a quoted net refund and different card fees without assuming a tax rate', () => {
  const result = compare(100000, 110000, 8000, 2, 1);
  assert.equal(result.dutyTotal, 102000);
  assert.equal(result.storeTotal, 103100);
  assert.equal(result.difference, 1100);
  assert.equal(compare(100000, 100000, 0, 0, 0).difference, 0);
});
test('rejects impossible refunds, invalid amounts and invalid fee percentages', () => {
  for (const args of [[0,100,0,0,0],[100,100,101,0,0],[100,100,-1,0,0],[100,100,0,101,0],[100,100,0,0,NaN]]) assert.equal(compare(...args), null);
});
