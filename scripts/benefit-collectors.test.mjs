import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHyundai,parseHyundaiData,parseLotte,parseShilla,reviewedBenefits,makeBenefit,validDay,collectHyundai,collectLotte,collectShilla} from './benefit-collectors.mjs';
const day='2026-10-29';
const lotteCard = (id,date='2026-10-01 ~ 2026-10-31',code='01')=>`<li><a name="bnfEvtDtl" data-evtdispno="${id}" evtconnsctcd="${code}"></a><div class="txt_area"><strong>행사 ${id}</strong><span class="date">${date}</span></div></li>`;
test('no arbitrary six-event cap; active dates and official detail paths are required',()=>{
  const html=Array.from({length:12},(_,i)=>`<a href="/event/op/evnt/evntDetail.do?evntId=${i}"><p class="tit">행사 ${i}</p><p class="txt_date">2026-10-01 ~ 2026-10-31</p></a>`).join('');
  assert.equal(parseHyundai(html,day).length,12);
  assert.equal(validDay('2026-13-01'),false);
  assert.equal(validDay('2026-02-30'),false);
  assert.equal(makeBenefit('hyundai',{title:'상시 안내',url:'https://www.hddfs.com/event/op/evnt/evntDetail.do?evntId=1',startDate:'2026-01-01',endDate:'2099-12-31'},day),null);
  assert.equal(parseLotte(lotteCard(1)+lotteCard(2,'기간 미정')+lotteCard(3,'2026-11-01 ~ 2026-11-30')+lotteCard(4,'2026-10-01 ~ 2026-10-28')+lotteCard(5,undefined,'02'),day).length,1);
  assert.equal(makeBenefit('shilla',{title:'행사',url:'https://evil.example/event',startDate:'2026-10-01',endDate:'2026-10-31'},day),null);
});
test('Shilla list uses source epoch dates in Korea and excludes undated and unsafe links',()=>{
  const row={code:'E1',title:'카드 혜택',startDate:Date.parse('2026-10-28T15:00:00Z'),endDate:Date.parse('2026-10-29T14:59:59Z'),url:'/event/eventView?eventId=E1'};
  const items=parseShilla({eventData:[row,{...row,code:'E2',startDate:null},{...row,code:'E3',url:'javascript:alert(1)'}]},day);
  assert.equal(items.length,1);assert.equal(items[0].startDate,day);assert.equal(items[0].endDate,day);
  assert.equal(items[0].url,'https://www.shilladfs.com/estore/kr/ko/event/eventView?eventId=E1');
});
test('reviewed fallback preserves its real check date and expires or removes ended events',()=>{
  const record={storeId:'shinsegae',checkedAt:day,benefits:[{id:'E1',title:'회원 혜택',url:'https://www.ssgdfs.com/kr/event/initEventDetail?event_no=E1',startDate:'2026-10-01',endDate:'2026-11-30'}]};
  assert.equal(reviewedBenefits(record,'shinsegae','2026-11-02')[0].checkedAt,day);
  assert.equal(reviewedBenefits(record,'shinsegae','2026-11-06').length,0);
  assert.equal(reviewedBenefits(record,'shinsegae','2026-10-28').length,0);
  assert.equal(reviewedBenefits({...record,benefits:[{...record.benefits[0],endDate:'2026-10-31'}]},'shinsegae','2026-11-02').length,0);
  assert.equal(reviewedBenefits(record,'lotte',day).length,0);
});
test('Lotte collector reads every page and refuses partial lists on failure or repeated pages',async t=>{
  const requests=[];
  const mock=t.mock.method(globalThis,'fetch',async (url,options)=>{
    const page=Number(JSON.parse(options.body).pagingInfo.curPageNo);requests.push(page);
    const cards=Array.from({length:page===3?1:30},(_,i)=>lotteCard((page-1)*30+i+1)).join('');
    return new Response(`<input id="bnfEvtTotCnt" value="61">${cards}`);
  });
  const result=await collectLotte(day);assert.equal(result.benefits.length,61);assert.deepEqual(requests,[1,2,3]);
  mock.mock.mockImplementation(async()=>new Response(`<input id="bnfEvtTotCnt" value="61">${Array.from({length:30},(_,i)=>lotteCard(i+1)).join('')}`));
  await assert.rejects(()=>collectLotte(day),/반복/);
  mock.mock.mockImplementation(async()=>new Response('blocked',{status:406}));
  await assert.rejects(()=>collectLotte(day),/HTTP 406/);
});
test('Shilla collector follows anonymous form flow and exhausts pagination',async t=>{
  const requests=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(!String(url).includes('getBenefitList'))return new Response('CSRFToken: "fixture-token"',{headers:{'set-cookie':'anonymous=fixture; Path=/'}});
    const page=Number(options.body.get('page'));requests.push(page);
    assert.equal(options.body.get('CSRFToken'),'fixture-token');
    assert.match(options.headers.Cookie,/anonymous=fixture/);
    const rows=Array.from({length:page?1:30},(_,i)=>({code:'E'+(page*30+i),title:'결제 행사',url:'/event/eventView?eventId=E'+(page*30+i),startDate:Date.parse('2026-10-01T00:00:00+09:00'),endDate:Date.parse('2026-10-31T23:59:59+09:00')}));
    return Response.json({totCnt:31,eventData:rows});
  });
  assert.equal((await collectShilla(day)).benefits.length,31);assert.deepEqual(requests,[0,1]);
});
const hyundaiRow = id=>({prmoId:String(id),prmoTitl:`행사 ${id}`,prmoStDttm:Date.parse('2026-10-01T00:00:00+09:00'),prmoEndDttm:Date.parse('2026-10-31T23:59:59+09:00'),totCnt:26});
function hyundaiPage(page,total=26){
  return {...(page===1?{totCnt:total,totalPage:Math.ceil(total/20)}:{}),evntSpex:{page,listSize:20},evntList:Array.from({length:Math.min(20,total-(page-1)*20)},(_,i)=>({...hyundaiRow((page-1)*20+i+1),totCnt:total}))};
}
function mockHyundai(t, transform=data=>data, total=26){
  const requests=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(String(url).endsWith('evntShop.do'))return new Response(`<li name="sndTab" class="is-active"><button data-totalcnt="${total}"></button></li>`,{headers:{'set-cookie':'anonymous=fixture; Path=/'}});
    const page=Number(options.body.get('page'));requests.push(page);
    assert.equal(String(url),`https://www.hddfs.com/event/op/evnt/${page===1?'getEvntList':'getEvntMoreList'}.json`);
    assert.equal(options.method,'POST');
    assert.equal(options.headers['X-Requested-With'],'XMLHttpRequest');
    assert.equal(options.headers.Referer,'https://www.hddfs.com/event/op/evnt/evntShop.do');
    assert.match(options.headers.Cookie,/anonymous=fixture/);
    assert.equal(options.body.get('prmoType'),'0');
    assert.equal(options.body.get('prmoCtgTypeCd'),'2');
    assert.equal(options.body.get('totalCount'),String(total));
    const data=transform(hyundaiPage(page,total),page);
    return data instanceof Response ? data : Response.json(data);
  });
  return requests;
}
test('Hyundai public AJAX pagination reads all rows, including the second page',async t=>{
  const requests=mockHyundai(t);
  const result=await collectHyundai(day);
  assert.deepEqual(requests,[1,2]);assert.equal(result.scannedCount,26);assert.equal(result.benefits.length,26);
  assert.ok(result.benefits.some(row=>row.url.endsWith('evntId=26')));
  // Keep IDs compatible with the previous HTML parser's saved publications.
  assert.equal(result.benefits[0].id,`hyundai:${result.benefits[0].url}`);
});
test('Hyundai requires explicit dates in Korea and respects public link restrictions',()=>{
  const row=hyundaiRow(1);
  const result=parseHyundaiData({evntList:[row,
    {...row,prmoId:'2',adultAucaNeedYn:'Y'}, {...row,prmoId:'3',otsdPrmoDevYn:'Y'},
    {...row,prmoId:'4',stocRostUseYn:'Y'}, {...row,prmoId:'5',prmoEndDttm:null},
    {...row,prmoId:'6',prmoStDttm:Date.parse('2026-11-01T00:00:00+09:00')},
    {...row,prmoId:'7',prmoEndDttm:Date.parse('2026-10-28T23:59:59+09:00')},
    {...row,prmoId:'8',prmoEndDttm:Date.parse('2099-12-31T23:59:59+09:00')},
    {...row,prmoId:'9',prmoTitl:'카드 캐시백'}, {...row,prmoId:'10',prmoTitl:'임직원 혜택'}]},day);
  assert.equal(result.length,1);assert.equal(result[0].startDate,'2026-10-01');assert.equal(result[0].endDate,'2026-10-31');
});
for(const [name,transform,error] of [
  ['repeated rows', (data,page)=>page===2?{...data,evntList:data.evntList.map((row,i)=>({...row,prmoId:String(i+1)}))}:data,/반복|중복/],
  ['missing last row', (data,page)=>page===2?{...data,evntList:data.evntList.slice(1)}:data,/누락/],
  ['changed total', (data,page)=>page===2?{...data,evntList:data.evntList.map(row=>({...row,totCnt:27}))}:data,/변경/],
  ['wrong response page', (data,page)=>page===2?{...data,evntSpex:{...data.evntSpex,page:1}}:data,/응답 불일치/],
  ['invalid identifier', (data,page)=>page===2?{...data,evntList:data.evntList.map(row=>({...row,prmoId:null}))}:data,/식별자/],
  ['malformed response', (_data,page)=>page===1?{exception:'BadRequestException'}:null,/형식/],
  ['missing totals', data=>({...data,totCnt:null}),/총계/],
  ['inconsistent page count', data=>({...data,totalPage:1}),/총계/],
])test(`Hyundai refuses partial success for ${name}`,async t=>{
  mockHyundai(t,transform);await assert.rejects(()=>collectHyundai(day),error);
});
test('Hyundai supports a verified empty list and bounds excessive pagination',async t=>{
  mockHyundai(t,data=>data,0);
  assert.deepEqual(await collectHyundai(day),{benefits:[],scannedCount:0});
  t.mock.restoreAll();
  const requests=mockHyundai(t,data=>data,801);
  await assert.rejects(()=>collectHyundai(day),/상한/);assert.deepEqual(requests,[1]);
});
test('Hyundai HTTP failure on a later page discards partial data',async t=>{
  mockHyundai(t,(data,page)=>page===2?new Response('Unavailable',{status:503}):data);
  await assert.rejects(()=>collectHyundai(day),/HTTP 503/);
});
test('saved coverage and counts reconcile across all four companies without rewriting weekly archives',()=>{
  const latest=JSON.parse(fs.readFileSync('data/content/benefit-latest.json','utf8'));
  assert.equal(latest.coverage.length,4);
  assert.equal(latest.coverage.reduce((n,s)=>n+s.count,0),latest.benefits.length);
  assert.equal(new Set(latest.benefits.map(b=>b.storeId)).size,latest.coverage.filter(s=>s.count>0).length);
  for(const source of latest.coverage)assert.equal(latest.benefits.filter(b=>b.storeId===source.storeId).length,source.count);
  const old=JSON.parse(fs.readFileSync('data/content/benefit-publications.json','utf8')).weekly.find(x=>x.period==='2026-10-26');
  assert.equal(old.benefits.length,6);assert.equal(old.updatedAt,'2026-10-26');
});
