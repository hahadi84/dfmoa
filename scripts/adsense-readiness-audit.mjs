import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { SITE_SERVICE_URL } from "./site-operator-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sitemapUrl = process.env.ADSENSE_AUDIT_SITEMAP_URL ?? `${SITE_SERVICE_URL}/sitemap.xml`;
const reportDate =
  process.env.ADSENSE_AUDIT_DATE ??
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const outputPath = path.join(repoRoot, "data", "audit", `adsense-readiness-${reportDate}.md`);

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'");
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1]));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "DFMOA-AdSense-Readiness-Audit/1.0",
    },
    redirect: "follow",
  });
  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    text,
    url: response.url,
  };
}

function isAffiliateHref(href) {
  return /coupang|link\.coupang|coupa\.ng|partners/i.test(href);
}

function hasSponsoredNofollow(rel) {
  const tokens = new Set(
    rel
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
  );

  return tokens.has("sponsored") && tokens.has("nofollow");
}

function flattenJsonLd(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenJsonLd(item));
  }

  if (typeof value !== "object") {
    return [];
  }

  const graph = value["@graph"];
  return [value, ...(Array.isArray(graph) ? graph.flatMap((item) => flattenJsonLd(item)) : [])];
}

function parseJsonLdBlocks($) {
  const blocks = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const rawJson = $(element).contents().text().trim();

    if (!rawJson) {
      return;
    }

    try {
      blocks.push(...flattenJsonLd(JSON.parse(rawJson)));
    } catch {
      blocks.push({
        "@type": "InvalidJsonLd",
      });
    }
  });

  return blocks;
}

function hasProductType(type) {
  return Array.isArray(type) ? type.includes("Product") : type === "Product";
}

function auditHtml(url, status, html) {
  const $ = load(html);
  const pageUrl = new URL(url);
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const internalLinks = new Set();
  const affiliateRelIssues = [];
  const missingAltImages = [];
  const jsonLdBlocks = parseJsonLdBlocks($);
  const productJsonLdBlocks = jsonLdBlocks.filter((block) => hasProductType(block["@type"]));
  const productJsonLdWithoutOffers = productJsonLdBlocks.filter((block) => !block.offers).length;

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();

    if (!href || /^(mailto|tel|javascript):/i.test(href) || href.startsWith("#")) {
      return;
    }

    let resolved;
    try {
      resolved = new URL(href, pageUrl);
    } catch {
      return;
    }

    if (resolved.hostname === pageUrl.hostname) {
      internalLinks.add(`${resolved.pathname}${resolved.search}`);
    }

    if (isAffiliateHref(resolved.href)) {
      const rel = $(element).attr("rel") ?? "";
      if (!hasSponsoredNofollow(rel)) {
        affiliateRelIssues.push({
          href: resolved.href,
          rel,
          text: $(element).text().replace(/\s+/g, " ").trim().slice(0, 80),
        });
      }
    }
  });

  $("img").each((_, element) => {
    if (!Object.prototype.hasOwnProperty.call(element.attribs ?? {}, "alt")) {
      missingAltImages.push($(element).attr("src") ?? "(inline image)");
    }
  });

  $("script, style, noscript").remove();
  const bodyTextLength = $("body").text().replace(/\s+/g, " ").trim().length;
  const notes = [];

  if (status !== 200) {
    notes.push(`HTTP ${status}`);
  }
  if (!title) {
    notes.push("title 없음");
  }
  if (!description) {
    notes.push("description 없음");
  }
  if (bodyTextLength < 300) {
    notes.push("본문 300자 미만");
  }
  if (internalLinks.size < 3) {
    notes.push("내부 링크 3개 미만");
  }
  if (affiliateRelIssues.length) {
    notes.push(`제휴 rel 누락 ${affiliateRelIssues.length}건`);
  }
  if (missingAltImages.length) {
    notes.push(`이미지 alt 누락 ${missingAltImages.length}건`);
  }

  return {
    url,
    status,
    title: Boolean(title),
    description: Boolean(description),
    bodyTextLength,
    internalLinkCount: internalLinks.size,
    affiliateRelIssues,
    missingAltImages,
    productJsonLdCount: productJsonLdBlocks.length,
    productJsonLdWithoutOffers,
    notes,
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function markdownTable(headers, rows) {
  if (!rows.length) {
    return "_없음_";
  }

  const headerLine = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")} |`);

  return [headerLine, divider, ...body].join("\n");
}

function createReport(results) {
  const non200 = results.filter((result) => result.status !== 200);
  const missingMetadata = results.filter((result) => !result.title || !result.description);
  const shortBody = results.filter((result) => result.bodyTextLength < 300);
  const lowInternalLinks = results.filter((result) => result.internalLinkCount < 3);
  const affiliateRelIssues = results.flatMap((result) =>
    result.affiliateRelIssues.map((issue) => ({
      page: result.url,
      ...issue,
    }))
  );
  const missingAltImages = results.flatMap((result) =>
    result.missingAltImages.map((src) => ({
      page: result.url,
      src,
    }))
  );
  const productJsonLdPages = results.filter((result) => result.productJsonLdCount > 0);
  const productJsonLdWithoutOffers = results.filter((result) => result.productJsonLdWithoutOffers > 0);
  const attentionRows = results
    .filter((result) => result.notes.length)
    .map((result) => [
      result.url,
      result.status,
      result.bodyTextLength,
      result.internalLinkCount,
      result.notes.join(", "),
    ]);

  const summaryRows = [
    ["Audited URLs", results.length],
    ["HTTP 200 아닌 URL 수", non200.length],
    ["title/description 누락 페이지 수", missingMetadata.length],
    ["본문 300자 미만 페이지 수", shortBody.length],
    ["내부 링크 3개 미만 페이지 수", lowInternalLinks.length],
    ["제휴 rel 누락 링크 수", affiliateRelIssues.length],
    ["이미지 alt 누락 수", missingAltImages.length],
    ["Product JSON-LD 페이지 수", productJsonLdPages.length],
    ["Product JSON-LD offers 없는 페이지 수", productJsonLdWithoutOffers.length],
  ];

  return {
    counts: {
      total: results.length,
      non200: non200.length,
      missingMetadata: missingMetadata.length,
      shortBody: shortBody.length,
      lowInternalLinks: lowInternalLinks.length,
      affiliateRelIssues: affiliateRelIssues.length,
      missingAltImages: missingAltImages.length,
      productJsonLdPages: productJsonLdPages.length,
      productJsonLdWithoutOffers: productJsonLdWithoutOffers.length,
    },
    markdown: `# AdSense Readiness Audit - ${reportDate}

- Sitemap: ${sitemapUrl}
- Generated at: ${new Date().toISOString()}
- Note: empty decorative alt="" is not counted as missing; only images without an alt attribute are counted.

## Summary

${markdownTable(["Check", "Count"], summaryRows)}

## Pages Needing Attention

${markdownTable(["URL", "Status", "Text chars", "Internal links", "Notes"], attentionRows)}

## Affiliate rel Issues

${markdownTable(
  ["Page", "Link text", "Href", "rel"],
  affiliateRelIssues.map((issue) => [issue.page, issue.text || "(no text)", issue.href, issue.rel || "(empty)"])
)}

## Image alt Issues

${markdownTable(
  ["Page", "Image"],
  missingAltImages.map((issue) => [issue.page, issue.src])
)}

## Product JSON-LD Offer Coverage

${markdownTable(
  ["Page", "Product JSON-LD blocks without offers"],
  productJsonLdWithoutOffers.map((result) => [result.url, result.productJsonLdWithoutOffers])
)}
`,
  };
}

async function main() {
  const sitemapResponse = await fetchText(sitemapUrl);

  if (!sitemapResponse.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${sitemapResponse.status}`);
  }

  const urls = extractSitemapUrls(sitemapResponse.text);

  if (!urls.length) {
    throw new Error("No URLs found in sitemap");
  }

  const results = await mapWithConcurrency(urls, 6, async (url) => {
    try {
      const response = await fetchText(url);
      return auditHtml(url, response.status, response.text);
    } catch (error) {
      return {
        url,
        status: 0,
        title: false,
        description: false,
        bodyTextLength: 0,
        internalLinkCount: 0,
        affiliateRelIssues: [],
        missingAltImages: [],
        productJsonLdCount: 0,
        productJsonLdWithoutOffers: 0,
        notes: [`fetch 실패: ${error instanceof Error ? error.message : String(error)}`],
      };
    }
  });
  const report = createReport(results);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report.markdown, "utf8");

  console.log(`AdSense readiness audit saved: ${path.relative(repoRoot, outputPath)}`);
  console.log(`Audited URLs: ${report.counts.total}`);
  console.log(`HTTP non-200: ${report.counts.non200}`);
  console.log(`Missing title/description: ${report.counts.missingMetadata}`);
  console.log(`Body text under 300 chars: ${report.counts.shortBody}`);
  console.log(`Internal links under 3: ${report.counts.lowInternalLinks}`);
  console.log(`Affiliate rel issues: ${report.counts.affiliateRelIssues}`);
  console.log(`Images missing alt: ${report.counts.missingAltImages}`);
  console.log(`Product JSON-LD pages: ${report.counts.productJsonLdPages}`);
  console.log(`Product JSON-LD without offers: ${report.counts.productJsonLdWithoutOffers}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
