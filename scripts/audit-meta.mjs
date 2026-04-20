import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const REPORT_DIR = path.join(ROOT, "data", "audit");
const today = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

function getUrlsFromSitemap() {
  const xml = readText(path.join(OUT_DIR, "sitemap.xml"));
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1]));
}

function getHtmlPath(url) {
  const parsed = new URL(url);
  const pathname = parsed.pathname;

  if (pathname === "/") {
    return path.join(OUT_DIR, "index.html");
  }

  return path.join(OUT_DIR, pathname.slice(1), "index.html");
}

function getMeta(html, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return decodeXml(match[1]);
    }
  }

  return "";
}

function getTitle(html) {
  return decodeXml(html.match(/<title>(.*?)<\/title>/i)?.[1] ?? "");
}

const urls = getUrlsFromSitemap();
const rows = urls.map((url) => {
  const filePath = getHtmlPath(url);
  const html = fs.existsSync(filePath) ? readText(filePath) : "";
  const title = getTitle(html);
  const description = getMeta(html, "description");
  const ogTitle = getMeta(html, "og:title");
  const ogDescription = getMeta(html, "og:description");
  const ogImage = getMeta(html, "og:image");
  const twitterImage = getMeta(html, "twitter:image");
  const isProduct = new URL(url).pathname.startsWith("/product/");

  return {
    url,
    exists: Boolean(html),
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    twitterImage,
    titleLength: title.length,
    descriptionLength: description.length,
    productHasPriceKeyword: !isProduct || description.includes("₩") || description.includes("가격"),
  };
});

const descriptionMap = new Map();
for (const row of rows) {
  if (!row.description) {
    continue;
  }

  descriptionMap.set(row.description, [...(descriptionMap.get(row.description) ?? []), row.url]);
}

const duplicateDescriptions = [...descriptionMap.entries()].filter(([, items]) => items.length > 1);
const duplicatePairs = duplicateDescriptions.reduce((sum, [, items]) => sum + (items.length * (items.length - 1)) / 2, 0);
const badTitles = rows.filter((row) => row.titleLength < 10 || row.titleLength > 60);
const badDescriptions = rows.filter((row) => row.descriptionLength < 70 || row.descriptionLength > 160);
const missingOg = rows.filter((row) => !row.ogTitle || !row.ogDescription || !row.ogImage || !row.twitterImage);
const svgOg = rows.filter((row) => row.ogImage.toLowerCase().includes(".svg"));
const productMissingPriceKeyword = rows.filter((row) => !row.productHasPriceKeyword);

const report = [
  `# Meta Audit ${today}`,
  "",
  `- URLs checked: ${rows.length}`,
  `- Duplicate description pairs: ${duplicatePairs}`,
  `- Missing OG/Twitter image rows: ${missingOg.length}`,
  `- SVG og:image rows: ${svgOg.length}`,
  `- Title length outside 10-60: ${badTitles.length}`,
  `- Description length outside 70-160: ${badDescriptions.length}`,
  `- Product descriptions without price/가격 keyword: ${productMissingPriceKeyword.length}`,
  "",
  "## Duplicate Descriptions",
  duplicateDescriptions.length
    ? duplicateDescriptions.map(([description, items]) => `- ${description}\n  - ${items.join("\n  - ")}`).join("\n")
    : "- None",
  "",
  "## Missing OG/Twitter",
  missingOg.length ? missingOg.map((row) => `- ${row.url}`).join("\n") : "- None",
  "",
  "## SVG OG Images",
  svgOg.length ? svgOg.map((row) => `- ${row.url} -> ${row.ogImage}`).join("\n") : "- None",
  "",
  "## Title Length Issues",
  badTitles.slice(0, 50).map((row) => `- ${row.url} (${row.titleLength}) ${row.title}`).join("\n") || "- None",
  "",
  "## Description Length Issues",
  badDescriptions.slice(0, 50).map((row) => `- ${row.url} (${row.descriptionLength}) ${row.description}`).join("\n") || "- None",
  "",
].join("\n");

fs.mkdirSync(REPORT_DIR, { recursive: true });
const reportPath = path.join(REPORT_DIR, `meta-${today}.md`);
fs.writeFileSync(reportPath, report, "utf8");

console.log(report);
console.log(`\nSaved ${path.relative(ROOT, reportPath)}`);
