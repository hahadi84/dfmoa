import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdSenseHost,isAdContentPath,hasInlineTopAd,canRequestAd,markAdRequested } from '../src/lib/adsense-policy.mjs';
import { isVerifiedProductOffer,filterVerifiedSnapshot } from '../src/lib/product-offer-validation.mjs';
test('AdSense requires exact production hostname',()=>{
 for(const host of ['dfmoa.com','www.dfmoa.com'])assert.equal(isAdSenseHost(host),true);
 for(const host of ['localhost','127.0.0.1','dfmoa.netlify.app','deploy--dfmoa.netlify.app','dfmoa.com.evil.test','www.dfmoa.com.netlify.app',''])assert.equal(isAdSenseHost(host),false);
});
test('benefits has an eligible inline banner without a duplicate global top banner',()=>{
 assert.equal(isAdContentPath('/benefits'),true);
 assert.equal(isAdContentPath('/benefits/'),true);
 assert.equal(isAdContentPath('/privacy/'),false);
 assert.equal(isAdContentPath('/en/privacy/'),false);
 assert.equal(hasInlineTopAd('/benefits'),true);
 assert.equal(hasInlineTopAd('/benefits/'),true);
 for(const path of ['/','/deals','/product/example'])assert.equal(hasInlineTopAd(path),false);
 assert.equal(isAdContentPath('/benefits-admin'),false);
});
test('one submission per visible DOM slot, never on preview or zero-width slots',()=>{
 const element={getAttribute:()=>null,getBoundingClientRect:()=>({width:320,height:100})};
 assert.equal(canRequestAd('localhost',element),false);
 assert.equal(canRequestAd('dfmoa.com',{...element,getBoundingClientRect:()=>({width:0,height:100})}),false);
 assert.equal(canRequestAd('dfmoa.com',{...element,getAttribute:()=> 'done'}),false);
 assert.equal(canRequestAd('dfmoa.com',element),true);markAdRequested(element);assert.equal(canRequestAd('dfmoa.com',element),false);
});
test('content-only ad placement excludes account and policy pages in all languages',()=>{
 for(const path of ['/admin','/privacy','/favorites','/en/privacy','/ja/privacy','/zh/privacy'])assert.equal(isAdContentPath(path),false);
 for(const path of ['/','/product/creed-aventus-50ml','/en/compare','/ja','/zh/guide/incheon-duty-free-pickup'])assert.equal(isAdContentPath(path),true);
});
test('rejects a different model, size, edition, concentration and refill despite high collector match scores',()=>{
 const item=title=>({title,priceKrw:1,matchScore:999});
 for(const [id,volume,title] of [['p4','230ml','맨 페이셜 트리트먼트 에센스 230ml'],['p5','700ml','글렌피딕 15년 셰리 캐스크 700ml'],['p9','75ml','오 드 뚜왈렛 디스커버리 세트 5종'],['p19','15g','블랙 쿠션 파운데이션 15g 리필'],['p20','125ml','울트라 훼이셜 크림'],['p31','700ml','헤네시 파라디 700ml'],['p10','100ml','Blanche EDT 100ml'],['p61','Bracelet','MATRIX BRACELET']])assert.equal(isVerifiedProductOffer({id,volume},item(title)),false,title);
 assert.equal(isVerifiedProductOffer({id:'p25',volume:'700ml'},item('발렌타인 21년 700ml')),true);
});
test('filtering a transient-failure snapshot does not reintroduce an old bad match or mutate the source',()=>{
 const raw={sources:{shilla:{status:'error',items:[{title:'AVENTUS 150ml',priceKrw:50000}]}}};
 const clean=filterVerifiedSnapshot({id:'p1',volume:'50ml'},raw);
 assert.equal(clean.sources.shilla.items.length,0);assert.equal(raw.sources.shilla.items.length,1);
 assert.equal(clean.sources.shilla.error,'product_match_failed');
});
