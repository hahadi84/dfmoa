import test from 'node:test';
import assert from 'node:assert/strict';
import { isVerifiedProductOffer } from '../src/lib/product-offer-validation.mjs';
import identities from '../src/lib/verified-offer-identities.json' with { type: 'json' };
import { buildVerifiedHistoryRecord } from './verified-price-history.mjs';
import { observationState, formatObservationTime } from '../src/lib/observation-policy.mjs';

test('reject model names used for accessories, body products and numeric multipacks', () => {
  for (const [id, volume, title] of [
    ['p92','Headphones','WH-1000XM5/B 교체용 이어패드'],
    ['p1','50ml','AVENTUS Shower Gel 50ml'],
    ['p1','50ml','AVENTUS 50ml 2개입'],
    ['p1','50ml','AVENTUS 50ml 2병'],
    ['p1','50ml','AVENTUS 50ml pack of 2'],
  ]) assert.equal(isVerifiedProductOffer({id, volume}, {title, priceKrw: 1}), false, title);
  assert.equal(isVerifiedProductOffer({id:'p1',volume:'50ml'}, {title:'AVENTUS 50ml',priceKrw:1}), true);
  assert.equal(isVerifiedProductOffer({id:'p1',volume:'50ml'}, {title:'AVENTUS 50ml 2개입기획',priceKrw:1}), false);
  assert.equal(isVerifiedProductOffer({id:'p21',volume:'60ml',brand:'La Mer'}, {title:'Moisturizing Cream 60ml',brand:'Nivea',priceKrw:1}), false);
});
test('official product identity requires the exact retailer ID, brand and full title', () => {
  for (const [id, identity] of Object.entries(identities)) {
    assert.ok(identity.sourceUrl.startsWith('https://www.shilladfs.com/'));
    assert.ok(Number.isFinite(Date.parse(identity.verifiedAt)));
    for (const offer of identity.offers) {
      const product = {id,volume:''};
      assert.equal(isVerifiedProductOffer(product, offer), true);
      assert.equal(isVerifiedProductOffer(product, {...offer, id:'shilla-wrong-sku'}), false);
      assert.equal(isVerifiedProductOffer(product, {...offer, brand:'다른 브랜드'}), false);
      assert.equal(isVerifiedProductOffer(product, {...offer, title:offer.title+' 2개입'}), false);
    }
  }
});
test('history uses verified KRW observations and their actual source time; USD is never guessed', () => {
  const product={id:'p1',volume:'50ml'};
  const source={fetchedAt:'2026-10-28T09:00:00Z',searchUrl:'https://www.shilladfs.com/',items:[{id:'a',title:'AVENTUS 50ml',priceUsd:100}]};
  assert.equal(buildVerifiedHistoryRecord(product,{sources:{shilla:source}}),null);
  const raw={sources:{shilla:{...source,items:[{...source.items[0],priceKrw:123456}]}}};
  const row=buildVerifiedHistoryRecord(product,raw);
  assert.equal(row.shilla,123456);assert.equal(row.ts,source.fetchedAt);
  assert.equal(row.observations.shilla.title,'AVENTUS 50ml');
  assert.equal(row.observations.shilla.priceUsd,100);assert.equal(row.validationVersion,'exact-product-v2');
  assert.equal(buildVerifiedHistoryRecord(product,{sources:{shilla:{...source,items:[{title:'AVENTUS Shower Gel 50ml',priceKrw:1}]}}}),null);
});
test('observation age distinguishes historical, invalid and future timestamps and formats KST', () => {
  const now=Date.parse('2026-10-28T09:00:00Z');
  assert.equal(observationState('2026-10-28T08:00:00Z',now),'recent');
  assert.equal(observationState('2026-10-24T09:00:00Z',now),'historical');
  assert.equal(observationState(null,now),'unknown');
  assert.equal(observationState('2026-10-29T09:00:00Z',now),'unknown');
  assert.equal(formatObservationTime('2026-10-28T09:00:00Z'),'2026-10-28 18:00');
});
