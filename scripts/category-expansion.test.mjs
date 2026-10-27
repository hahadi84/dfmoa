import test from 'node:test';
import assert from 'node:assert/strict';
import { isVerifiedProductOffer } from '../src/lib/product-offer-validation.mjs';
import { CATEGORY_QUOTAS, CATEGORY_POOLS, REQUIRED_TOTAL } from './category-watchlist.mjs';

test('all ten categories are collected, with a forty-product budget and explicit pools', () => {
  const categories = ['perfume','beauty','liquor','electronics','fashion','health','eyewear','watch','jewelry','food'];
  assert.deepEqual(Object.keys(CATEGORY_QUOTAS).sort(), categories.sort());
  assert.equal(Object.values(CATEGORY_QUOTAS).reduce((a, b) => a + b, 0), REQUIRED_TOTAL);
  for (const category of categories) assert.ok(CATEGORY_POOLS[category].length >= CATEGORY_QUOTAS[category]);
  assert.ok(CATEGORY_POOLS.electronics.includes('sony-wf-1000xm5'));
  assert.ok(CATEGORY_POOLS.health.includes('gnc-mega-men-sport-180-tablets'));
});

const accepts = (id, title) => isVerifiedProductOffer({ id, volume: '' }, { title, priceKrw: 1 });
test('health matches exact count and variant, never related results or bundles', () => {
  assert.equal(accepts('p71', '에브리타임로얄(30포)'), true);
  assert.equal(accepts('p74', '솔가 비타민D3 1000 90정'), true);
  assert.equal(accepts('p103', '메가맨 스포츠 남성 멀티비타민180정(비타민,종합,BCAA)'), true);
  for (const title of ['에브리타임 로얄 면세 에디션 (100포)', '에브리타임로얄(30포) 2박스']) assert.equal(accepts('p71', title), false);
  for (const title of ['솔가 구연산 칼슘 위드 비타민D3 90정', '솔가 비타민D3 10000 90정', '솔가 비타민D3 1000 180정']) assert.equal(accepts('p74', title), false);
  for (const title of ['메가맨 180정', '메가맨 임팩트', '메가맨 스포츠 남성 멀티비타민90정']) assert.equal(accepts('p103', title), false);
});
test('electronics rejects another model, accessories and multipacks', () => {
  assert.equal(accepts('p101', 'WF-1000XM5/B 노이즈캔슬링 무선이어폰 5세대'), true);
  assert.equal(accepts('p102', 'WH-CH720N/W'), true);
  for (const title of ['WH-1000XM5/B', 'WF-1000XM4/B', 'WF-1000XM5/B 교체 케이스', 'WF-1000XM5/B 2개 세트']) assert.equal(accepts('p101', title), false);
  assert.equal(accepts('p102', 'WH-CH520/B'), false);
});
