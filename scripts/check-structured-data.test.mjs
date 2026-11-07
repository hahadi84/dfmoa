import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectStructuredData } from './check-structured-data.mjs';
const html = value => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
test('rejects incomplete product markup including nested graphs', () => {
 assert.ok(inspectStructuredData(html({'@graph':[{'@type':'Product',name:'Historical price'}]})).length);
 assert.ok(inspectStructuredData(html({'@type':'Product',name:'Item',offers:{'@type':'Offer',price:0}})).length);
});
test('accepts informational pages and complete offer structure', () => {
 assert.deepEqual(inspectStructuredData(html({'@type':'WebPage',name:'Price observations'})),[]);
 assert.deepEqual(inspectStructuredData(html({'@type':'Product',name:'Item',offers:{'@type':'AggregateOffer',lowPrice:100,highPrice:200,priceCurrency:'KRW'}})),[]);
});
test('rejects malformed JSON, expired prices and invalid breadcrumbs', () => {
 assert.ok(inspectStructuredData('<script type="application/ld+json">{</script>').length);
 assert.ok(inspectStructuredData(html({'@type':'Offer',price:100,priceCurrency:'KRW',priceValidUntil:'2020-01-01'})).length);
 assert.ok(inspectStructuredData(html({'@type':'BreadcrumbList',itemListElement:[{position:2,name:'Home'}]})).length);
});
