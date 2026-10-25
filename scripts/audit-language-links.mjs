import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
const xml=load(fs.readFileSync('out/sitemap.xml','utf8'),{xmlMode:true});
const urls=xml('loc').map((_,e)=>xml(e).text()).get();
const problems=[];
const file=url=>path.join('out',new URL(url,'https://www.dfmoa.com').pathname,'index.html');
let alternates=0;
for(const url of urls){
 const $=load(fs.readFileSync(file(url),'utf8'));
 for(const e of $('a[href^="/en"],a[href^="/ja"],a[href^="/zh"]').toArray()){
  const href=$(e).attr('href').split('#')[0];
  if(!fs.existsSync(file(href)))problems.push(`${url}: missing link ${href}`);
 }
 for(const e of $('link[hreflang]').toArray()){
  const target=$(e).attr('href');alternates++;
  if(!fs.existsSync(file(target))){problems.push(`${url}: missing alternate ${target}`);continue;}
  const other=load(fs.readFileSync(file(target),'utf8'));
  if(!other('link[hreflang]').toArray().some(e=>other(e).attr('href')?.replace(/\/$/,'')===url.replace(/\/$/,'')))problems.push(`${url}: nonreciprocal alternate ${target}`);
 }
}
console.log(JSON.stringify({pages:urls.length,languageAlternates:alternates,problems},null,2));
if(problems.length)process.exitCode=1;
