import { load } from 'cheerio';
import sources from '../src/lib/benefit-sources.json' with { type: 'json' };
export { sources as benefitSources };
const clean = value => load(`<div>${String(value ?? '')}</div>`)('div').text().replace(/\s+/g, ' ').trim();
export function validDay(value) { const time=Date.parse(`${value}T00:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && Number.isFinite(time) && new Date(time).toISOString().slice(0,10) === value; }
export function benefitKind(title) {
  if (/보험/.test(title)) return '여행·제휴';
  if (/카드|페이|결제|할부/.test(title)) return '결제';
  if (/항공|여행|투어|트립|로밍|환전|보험/.test(title)) return '여행·제휴';
  if (/쿠폰|출석|포인트|적립|등업|회원|멤버십/.test(title)) return '쿠폰·회원';
  return '행사·기타';
}
export function makeBenefit(storeId, row, day) {
  const source = sources.find(s => s.storeId === storeId);
  const title = clean(row.title);
  if (!source || !title || !validDay(row.startDate) || !validDay(row.endDate) || row.startDate > day || row.endDate < day || row.startDate > row.endDate) return null;
  // 2099/9999 dates are used by lists for evergreen landing pages. Do not
  // advertise them as promotions with a meaningfully verified end date.
  if (Number(row.endDate.slice(0,4)) >= 2099) return null;
  // Public list facts are sufficient for discovery, not for guaranteeing eligibility.
  if (/캐시백|임직원/.test(title)) return null;
  let url; try { url = new URL(row.url, source.url); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== new URL(source.url).hostname) return null;
  const allowed = { lotte: /^\/kr\/event\/eventDetail$/, shilla: /^\/estore\/kr\/ko\/(?:event\/|ex$)/, shinsegae: /^\/kr\/event\/(?:initEventMain|initEventDetail)$/, hyundai: /^\/event\/op\/evnt\/evntDetail\.do$/ };
  if (!allowed[storeId].test(url.pathname)) return null;
  return { id: `${storeId}:${row.id ?? url.href}`, storeId, title, category: benefitKind(title), url: url.href,
    startDate: row.startDate, endDate: row.endDate, checkedAt: day,
    linkType: row.linkType ?? 'detail',
    description: '공식 목록에서 행사명과 기간을 확인했습니다. 대상 회원·최소 결제액·한도·제외 브랜드·중복 적용은 원본 상세 조건을 확인하세요.' };
}
export function parseHyundai(html, day) {
  const $ = load(html); const result = [];
  $('a[href*="evntDetail.do"]').each((_, e) => {
    const a = $(e), dates = a.find('.txt_date').text().match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    const item = makeBenefit('hyundai', {title:a.find('.tit').text(),url:a.attr('href'),startDate:dates[0],endDate:dates[1]},day);
    if (item) result.push(item);
  }); return dedupeBenefits(result);
}
export function parseLotte(html, day) {
  const $ = load(html); const result = [];
  $('[name="bnfEvtDtl"]').each((_, e) => {
    const a=$(e), card=a.closest('li'), id=a.attr('data-evtdispno');
    const dates=card.find('.date').text().match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    // Only the detail route used by ordinary on-site events is resolved here.
    if (!/^\d+$/.test(id ?? '') || a.attr('evtconnsctcd') !== '01') return;
    const item=makeBenefit('lotte',{id,title:card.find('.txt_area strong').text(),url:`https://kor.lottedfs.com/kr/event/eventDetail?evtDispNo=${id}`,startDate:dates[0],endDate:dates[1]},day);
    if(item)result.push(item);
  }); return dedupeBenefits(result);
}
export function parseShilla(data, day) {
  if (!Array.isArray(data.eventData)) throw new Error('신라 행사 목록 형식 변경');
  return dedupeBenefits(data.eventData.map(row => {
    const start = typeof row.startDate === 'number' && Number.isFinite(row.startDate) ? koreanDay(row.startDate) : null;
    const end = typeof row.endDate === 'number' && Number.isFinite(row.endDate) ? koreanDay(row.endDate) : null;
    const relative = String(row.url ?? '');
    const url = relative.startsWith('/event/') ? `https://www.shilladfs.com/estore/kr/ko${relative}` : relative;
    return makeBenefit('shilla',{id:row.code,title:row.title,url,startDate:start,endDate:end},day);
  }).filter(Boolean));
}
export function koreanDay(value) { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value)); }
export function dedupeBenefits(items) { return [...new Map(items.map(x=>[x.id,x])).values()].sort((a,b)=>a.storeId.localeCompare(b.storeId)||a.endDate.localeCompare(b.endDate)||a.id.localeCompare(b.id)); }
export function reviewedBenefits(record, storeId, day) {
  const age = (Date.parse(day)-Date.parse(record?.checkedAt))/86400000;
  if (record?.storeId !== storeId || !validDay(record.checkedAt) || !Number.isFinite(age) || age<0 || age>7 || !Array.isArray(record.benefits)) return [];
  return dedupeBenefits(record.benefits.map(row=>makeBenefit(storeId,row,day)).filter(Boolean).map(row=>({...row,checkedAt:record.checkedAt})));
}
export async function fetchPublic(url, options={}) {
  const r=await fetch(url,{signal:AbortSignal.timeout(30000),...options,headers:{'User-Agent':'DFMOA-public-content-check/1.0 (+https://www.dfmoa.com/about)',...options.headers}});
  if(!r.ok)throw new Error(`HTTP ${r.status}`); return r;
}
export async function collectLotte(day) {
  const result=[];let total=0;const seen=new Set(), ids=new Set();
  for(let page=1;page<=40;page++){
    const html=await(await fetchPublic('https://kor.lottedfs.com/kr/eventmain/getBnfEvtList',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sortTrn:'',pagingInfo:{curPageNo:String(page)}})})).text();
    const $=load(html), count=Number($('#bnfEvtTotCnt').val()), rows=$('[name="bnfEvtDtl"]');
    if(!Number.isInteger(count)||count<0||!$('#bnfEvtTotCnt').length)throw new Error('롯데 목록 총계 확인 실패');
    if(page===1)total=count; else if(count!==total)throw new Error('롯데 목록 변경 중: 다음 점검에서 재확인');
    const signature=rows.map((_,e)=>$(e).attr('data-evtdispno')).get().join('|');
    if(seen.has(signature)&&rows.length)throw new Error('롯데 페이지 반복 응답');seen.add(signature);
    rows.each((_,e)=>ids.add($(e).attr('data-evtdispno')));
    result.push(...parseLotte(html,day));
    if(page*30>=total){if(ids.size!==total)throw new Error('롯데 목록 항목 누락 또는 중복');return {benefits:dedupeBenefits(result),scannedCount:total};}
    if(!rows.length)throw new Error('롯데 페이지 누락');
  } throw new Error('롯데 페이지 상한 초과: 일부만 전체로 공개하지 않음');
}
export async function collectShilla(day) {
  const page=await fetchPublic(sources.find(s=>s.storeId==='shilla').url), html=await page.text();
  // Follow the public anonymous form's CSRF/session flow, without login or saved user cookies.
  const token=html.match(/CSRFToken\s*[:=]\s*['"]([^'"]+)/)?.[1];
  if(!token)throw new Error('신라 공개 목록 폼 확인 실패');
  const cookie=page.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');
  const result=[];const seen=new Set(), ids=new Set();let total=0;
  for(let index=0;index<40;index++){
    const data=await(await fetchPublic('https://www.shilladfs.com/estore/kr/ko/benefit/getBenefitList',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Cookie:cookie},body:new URLSearchParams({divCode:'0',page:String(index),CSRFToken:token})})).json();
    const count=Number(data.totCnt);
    if(!Number.isInteger(count)||count<0||!Array.isArray(data.eventData))throw new Error('신라 목록 총계 확인 실패');
    if(index===0)total=count;else if(count!==total)throw new Error('신라 목록 변경 중');
    const signature=data.eventData.map(x=>x.code).join('|');
    if(seen.has(signature)&&data.eventData.length)throw new Error('신라 페이지 반복 응답');seen.add(signature);
    data.eventData.forEach(x=>ids.add(x.code));
    result.push(...parseShilla(data,day));
    if((index+1)*30>=total){if(ids.size!==total)throw new Error('신라 목록 항목 누락 또는 중복');return {benefits:dedupeBenefits(result),scannedCount:total};}
    if(!data.eventData.length)throw new Error('신라 페이지 누락');
  }throw new Error('신라 페이지 상한 초과');
}
