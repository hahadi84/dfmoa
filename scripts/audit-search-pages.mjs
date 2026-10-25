import { load } from 'cheerio';
import { readFile, writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'https://www.dfmoa.com';
const output = process.argv[3] || '../seo-live-audit.json';
const local = base === '--local';
const sitemap = local ? await readFile('out/sitemap.xml', 'utf8') : await fetch(`${base}/sitemap.xml`).then(r => { if (!r.ok) throw new Error(`Sitemap HTTP ${r.status}`); return r.text(); });
const xml = load(sitemap, { xmlMode: true });
const urls = xml('url loc').map((_, e) => xml(e).text()).get();
const results = [];
let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < urls.length) {
    const url = urls[next++];
    try {
      const response = local ? { status: 200, url, headers: new Headers(), text: () => readFile(`out${new URL(url).pathname.replace(/\/$/, '')}/index.html`, 'utf8') } : await fetch(url, { signal: AbortSignal.timeout(20000) });
      const $ = load(await response.text());
      results.push({ url, status: response.status, finalUrl: response.url,
        title: $('title').text(), description: $('meta[name="description"]').attr('content'),
        canonical: $('link[rel="canonical"]').attr('href'),
        robots: $('meta[name="robots"]').attr('content'),
        headerRobots: response.headers.get('x-robots-tag'),
        h1: $('h1').map((_, e) => $(e).text()).get(),
        lastmod: xml('url').filter((_, e) => xml(e).find('loc').text() === url).find('lastmod').text(),
      });
    } catch (error) { results.push({ url, error: error.message }); }
  }
}));
await writeFile(output, JSON.stringify(results, null, 2));
const normalize = url => url?.replace(/\/$/, '');
const issues = results.filter(r => r.status !== 200 || normalize(r.canonical) !== normalize(r.url) || normalize(r.finalUrl) !== normalize(r.url) || !r.title || !r.description || /noindex/.test(`${r.robots} ${r.headerRobots}`) || r.h1?.length !== 1);
console.log(JSON.stringify({ total: results.length, issues, duplicateTitles: results.filter((r, i) => results.findIndex(x => x.title === r.title) !== i).map(r => ({ url: r.url, title: r.title })) }, null, 2));

if (issues.length || results.some((r, i) => results.findIndex(x => x.title === r.title) !== i)) process.exitCode = 1;
