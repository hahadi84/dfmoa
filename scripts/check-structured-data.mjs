import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';

export function inspectStructuredData(html) {
  const $ = load(html), errors = [];
  const present = value => value !== undefined && value !== null && value !== '';
  const positive = value => present(value) && Number.isFinite(Number(value)) && Number(value) > 0;
  function visit(node) {
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (!node || typeof node !== 'object') return;
    const types = [].concat(node['@type'] ?? []);
    if (types.includes('Product')) {
      if (!node.name) errors.push('Product.name missing');
      if (!node.offers && !node.review && !node.aggregateRating) errors.push('Product requires offers, review or aggregateRating');
    }
    if (types.includes('Offer')) {
      if (!positive(node.price ?? node.priceSpecification?.price)) errors.push('Offer requires a positive verified price');
      if (!/^[A-Z]{3}$/.test(node.priceCurrency ?? node.priceSpecification?.priceCurrency ?? '')) errors.push('Offer currency missing');
      if (node.priceValidUntil && Date.parse(node.priceValidUntil + 'T23:59:59Z') < Date.now()) errors.push('Offer price expired');
    }
    if (types.includes('AggregateOffer')) {
      if (!positive(node.lowPrice) || !/^[A-Z]{3}$/.test(node.priceCurrency ?? '')) errors.push('AggregateOffer price/currency invalid');
      if (present(node.highPrice) && Number(node.highPrice) < Number(node.lowPrice)) errors.push('AggregateOffer range invalid');
    }
    if (types.includes('AggregateRating') && (!positive(node.ratingValue) || !positive(node.ratingCount ?? node.reviewCount))) errors.push('AggregateRating value/count invalid');
    if (types.includes('Review') && (!node.author || !node.reviewRating)) errors.push('Review author/rating missing');
    if (types.includes('BreadcrumbList') && (!node.itemListElement?.length || node.itemListElement.some((item, i) => item.position !== i + 1 || !item.name || !item.item))) errors.push('BreadcrumbList invalid');
    Object.values(node).forEach(visit);
  }
  $('script[type="application/ld+json"]').each((_, element) => {
    try { visit(JSON.parse($(element).text())); } catch { errors.push('Invalid JSON-LD'); }
  });
  return errors;
}
export function auditDirectory(directory) {
  let checked = 0; const errors = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith('.html')) {
        checked++;
        for (const error of inspectStructuredData(fs.readFileSync(file, 'utf8'))) errors.push(`${file}: ${error}`);
      }
    }
  }
  walk(directory);
  if (!checked) errors.push('No HTML files checked');
  return { checked, errors };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = auditDirectory(path.resolve(process.argv[2] || 'out'));
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
