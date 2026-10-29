import { load } from 'cheerio';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { benefitSources, parseHyundai, collectLotte, collectShilla, reviewedBenefits, dedupeBenefits, fetchPublic } from './benefit-collectors.mjs';

export const BENEFIT_URL = 'https://www.hddfs.com/event/op/evnt/evntShop.do';
export const FX_URL = 'https://api.frankfurter.dev/v2/rate/JPY/KRW?providers=ECB';
export function koreaDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function weekStart(day) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
export function parseBenefits(html, day) {
  return parseHyundai(html, day);
}
export function updateReports(previous, benefits, day, coverage) {
  if (!benefits.length) throw new Error('No dated active events found; previous reports preserved.');
  const monthly = [...previous.monthly];
  const weekly = [...previous.weekly];
  const month = day.slice(0, 7);
  const snapshot = { publishedAt: day, updatedAt: day, benefits, ...(coverage ? {coverage} : {}) };
  const index = monthly.findIndex(item => item.slug === month);
  const current = { ...snapshot, slug: month };
  if (index < 0) monthly.push(current);
  else if (JSON.stringify(monthly[index].benefits.map(item => ({ ...item, checkedAt: undefined }))) !== JSON.stringify(benefits.map(item => ({ ...item, checkedAt: undefined })))) {
    monthly[index] = { ...current, publishedAt: monthly[index].publishedAt };
  }
  const period = weekStart(day);
  // Catch up after a missed Monday, without changing any previously published issue.
  if (!weekly.some(item => item.period === period)) weekly.push({ ...snapshot, period, slug: `${day}-duty-free-benefit-weekly` });
  return { monthly: monthly.sort((a,b) => b.slug.localeCompare(a.slug)), weekly: weekly.sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)) };
}
async function fetchOk(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'DFMOA-public-content-check/1.0 (+https://www.dfmoa.com/about)' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}
async function save(file, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  const old = await readFile(file, 'utf8').catch(() => '');
  if (old !== text) await writeFile(file, text);
}
export async function collectBenefits(day) {
  const results=await Promise.all(benefitSources.map(async source=>{
    const base={storeId:source.storeId,sourceUrl:source.url,checkedAt:day};
    try {
      let result;
      if(source.storeId==='lotte')result=await collectLotte(day);
      else if(source.storeId==='shilla')result=await collectShilla(day);
      else {
        const html=await(await fetchPublic(source.url)).text();
        if(source.storeId==='hyundai'){
          const $=load(html); const total=html.match(/var totalPage\s*=\s*"(\d+)"/);
          if(total && Number(total[1])>1)throw new Error('현대 목록 페이지 추가 확인 필요');
          if(!$('a[href*="evntDetail.do"]').length)throw new Error('현대 행사 목록 형식 변경');
          result={benefits:parseHyundai(html,day),scannedCount:$('a[href*="evntDetail.do"]').length};
        } else throw new Error('동적 행사 목록: 브라우저 검증 자료 필요');
      }
      return {benefits:result.benefits,coverage:{...base,status:result.benefits.length?'ok':'no_verified_events',count:result.benefits.length,scannedCount:result.scannedCount,lastVerifiedAt:day,note:'공개 행사 목록 확인. 기간과 대상 조건이 없는 항목은 수록하지 않습니다.'}};
    }catch(error){
      let record=null;
      try { record=JSON.parse(await readFile(`data/content/benefit-reviewed/${source.storeId}.json`,'utf8')); } catch { /* Missing or malformed reviewed files cannot masquerade as verified data. */ }
      const benefits=reviewedBenefits(record,source.storeId,day);
      return {benefits,coverage:{...base,status:benefits.length?'manual_verified':'error',count:benefits.length,
        ...(benefits.length?{lastVerifiedAt:record.checkedAt,scannedCount:record.scannedCount}:{}),
        note:benefits.length?'자동 수집 제한. 별도로 브라우저에서 확인한 행사 목록이며 확인일과 종료일을 유지합니다.':'자동 수집 또는 행사 기간 확인 실패. 공식 목록에서 확인하세요.',error:error.message}};
    }
  }));
  return {checkedAt:day,benefits:dedupeBenefits(results.flatMap(x=>x.benefits)),coverage:results.map(x=>x.coverage)};
}
export async function refresh() {
  await mkdir('data/content', { recursive: true });
  const day = koreaDate();
  const errors = [];
  try {
    const file = 'data/content/benefit-publications.json';
    const previous = JSON.parse(await readFile(file, 'utf8').catch(error => { if (error.code === 'ENOENT') return '{"monthly":[],"weekly":[]}'; throw error; }));
    const latest = await collectBenefits(day);
    await save('data/content/benefit-latest.json',latest);
    await save(file, updateReports(previous, latest.benefits, day,latest.coverage));
    console.log(`Benefits: ${latest.benefits.length} dated active events across ${new Set(latest.benefits.map(x=>x.storeId)).size} stores.`);
    for(const source of latest.coverage)console.log(`${source.storeId}: ${source.status}, ${source.count} events`);
    for(const source of latest.coverage.filter(x=>x.status==='error'))errors.push(`Benefits ${source.storeId}: ${source.error}`);
  } catch (error) { errors.push(`Benefits: ${error.message}`); }
  try {
    const rate = await (await fetchOk(FX_URL)).json();
    const age = (Date.parse(day) - Date.parse(rate.date)) / 86400000;
    if (rate.base !== 'JPY' || rate.quote !== 'KRW' || !Number.isFinite(rate.rate) || rate.rate <= 0 || !Number.isFinite(age) || age < 0 || age > 7) throw new Error('Invalid or stale exchange rate; last snapshot preserved.');
    await save('data/content/yen-rate.json', { ...rate, provider: 'ECB via Frankfurter', sourceUrl: FX_URL });
    console.log(`JPY/KRW reference rate as of ${rate.date} refreshed.`);
  } catch (error) { errors.push(`FX: ${error.message}`); }
  if (errors.length) throw new Error(errors.join('\n'));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) refresh().catch(error => { console.error(error.message); process.exitCode = 1; });
