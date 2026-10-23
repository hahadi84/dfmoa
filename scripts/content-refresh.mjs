import { load } from 'cheerio';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

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
  const $ = load(html);
  const entries = new Map();
  $('a[href*="evntDetail.do"]').each((_, element) => {
    const node = $(element);
    const title = node.find('.tit').text().replace(/\s+/g, ' ').trim();
    const dates = node.find('.txt_date').text().match(/\d{4}-\d{2}-\d{2}/g);
    if (!title || !dates || dates.length !== 2 || dates[0] > day || dates[1] < day) return;
    // Card acquisition offers require eligibility verification beyond the public list.
    if (/캐시백|임직원|웨딩/.test(title)) return;
    const url = new URL(node.attr('href'), BENEFIT_URL);
    if (url.hostname !== 'www.hddfs.com' || url.pathname !== '/event/op/evnt/evntDetail.do') return;
    entries.set(url.href, { title, url: url.href, storeId: 'hyundai', startDate: dates[0], endDate: dates[1], checkedAt: day,
      description: '공식 목록에서 행사명과 기간을 확인했습니다. 적용 대상·최소 결제액·할인 한도·제외 브랜드는 상세 페이지에서 확인하세요.' });
  });
  return [...entries.values()].sort((a, b) => a.endDate.localeCompare(b.endDate) || a.url.localeCompare(b.url)).slice(0, 6);
}
export function updateReports(previous, benefits, day) {
  if (!benefits.length) throw new Error('No dated active events found; previous reports preserved.');
  const monthly = [...previous.monthly];
  const weekly = [...previous.weekly];
  const month = day.slice(0, 7);
  const snapshot = { publishedAt: day, updatedAt: day, benefits };
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
export async function refresh() {
  await mkdir('data/content', { recursive: true });
  const day = koreaDate();
  const errors = [];
  try {
    const file = 'data/content/benefit-publications.json';
    const previous = JSON.parse(await readFile(file, 'utf8').catch(error => { if (error.code === 'ENOENT') return '{"monthly":[],"weekly":[]}'; throw error; }));
    const benefits = parseBenefits(await (await fetchOk(BENEFIT_URL)).text(), day);
    await save(file, updateReports(previous, benefits, day));
    console.log(`Benefits: ${benefits.length} dated active events; publication archives updated.`);
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
