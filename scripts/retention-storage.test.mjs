import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const js = ts.transpileModule(fs.readFileSync('src/lib/retention-storage.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const saved = JSON.stringify([{ productId: 'p1', slug: 'creed-aventus-50ml', brand: 'Creed', name: 'Aventus', addedAt: '2026-10-25', viewedAt: '2026-10-25' }]);
const sandbox = { exports: {}, window: { localStorage: { getItem: () => saved } } };
vm.runInNewContext(js, sandbox);
const { readFavoriteProducts, readRecentProducts } = sandbox.exports;
test('hydration uses the server snapshot even when this browser has saved products', () => {
  assert.equal(readFavoriteProducts('[]').length, 0);
  assert.equal(readRecentProducts('[]').length, 0);
  assert.equal(readFavoriteProducts().length, 1);
  assert.equal(readRecentProducts(saved)[0].productId, 'p1');
});
test('invalid storage snapshots cannot break initial rendering', () => {
  for (const input of ['invalid', '{}', '[null, 4, {}]']) {
    assert.equal(readFavoriteProducts(input).length, 0);
    assert.equal(readRecentProducts(input).length, 0);
  }
});
