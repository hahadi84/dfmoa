import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function readTs(file) { const sandbox = { exports: {} }; vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, sandbox); return sandbox.exports; }
import { isVerifiedProductOffer as matches } from '../src/lib/product-offer-validation.mjs';
const { products } = readTs('src/lib/site-data.ts');
test('exact volume and identity are required; cheaper wrong products and bundles are rejected', () => {
 const item = title => ({ title, priceKrw: 10000 });
 assert.equal(matches({ id:'p1',volume:'50ml' },item('AVENTUS 50ml')),true);
 assert.equal(matches({ id:'p1',volume:'50ml' },item('AVENTUS 150ml')),false);
 assert.equal(matches({ id:'p1',volume:'50ml' },item('AVENTUS 50ml DUO')),false);
 assert.equal(matches({ id:'p3',volume:'90ml' },item('윤조에센스 90ML*2')),false);
 assert.equal(matches({ id:'p3',volume:'90ml' },item('윤조에센스 90ml')),true);
 assert.equal(matches({ id:'p1',volume:'50ml' },item('OTHER FRAGRANCE 50ml')),false);
 assert.equal(matches({ id:'p1',volume:'50ml' },item('AVENTUS')),false);
});
test('launch snapshots preserve product identity and report collection failures instead of requiring fabricated prices', () => {
 const { internationalProductIds: ids } = readTs('src/lib/international.ts');
 assert.equal(ids.length,10);
 for (const id of ids) {
   const product = products.find(product => product.id === id);
   const snapshot = JSON.parse(fs.readFileSync(`data/prices/${id}.json`,'utf8'));
   const offers = Object.values(snapshot.sources).flatMap(source => source.items).filter(item => matches(product,item));
   assert.equal(snapshot.productId, id);
   assert.equal(snapshot.productSlug, product.slug);
   if (!offers.length) {
     assert.ok(Object.values(snapshot.sources).every(source => source.status && source.searchUrl), `${id} must retain source status and official lookup`);
   }
 }
});

test('exported English pages with no verified offers explain that prices are unconfirmed', () => {
 const { internationalProductIds: ids } = readTs('src/lib/international.ts');
 for (const id of ids) {
   const product = products.find(product => product.id === id);
   const snapshot = JSON.parse(fs.readFileSync(`data/prices/${id}.json`, 'utf8'));
   const offers = Object.values(snapshot.sources).flatMap(source => source.items).filter(item => matches(product,item));
   if (!offers.length) {
     const html = fs.readFileSync(`out/en/product/${product.slug}.html`, 'utf8');
     assert.ok(html.includes('No price has been confirmed. Use the official websites below.'), product.slug);
     assert.ok(!html.includes('&quot;@type&quot;:&quot;Offer&quot;'));
     assert.ok(!html.includes('"@type":"Offer"'));
   }
 }
});
