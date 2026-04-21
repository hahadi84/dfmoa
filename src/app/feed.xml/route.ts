import { benefitReports } from "@/lib/benefit-report-generator";
import { monthlyDealReports } from "@/lib/seo-content";
import { SITE_OPERATOR } from "@/lib/site-operator";

const SITE_URL = SITE_OPERATOR.serviceUrl;

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const weeklyItems = benefitReports.map((report) => ({
    title: report.title,
    link: `${SITE_URL}/benefit-reports/${report.slug}`,
    description: report.description,
    pubDate: new Date(`${report.publishedAt}T00:00:00+09:00`).toUTCString(),
    guid: `${SITE_URL}/benefit-reports/${report.slug}`,
  }));
  const monthlyItems = monthlyDealReports.map((report) => ({
    title: report.title,
    link: `${SITE_URL}/deals/${report.slug}`,
    description: report.summary,
    pubDate: new Date(`${report.publishedAt}T00:00:00+09:00`).toUTCString(),
    guid: `${SITE_URL}/deals/${report.slug}`,
  }));
  const items = [...weeklyItems, ...monthlyItems]
    .sort((left, right) => Date.parse(right.pubDate) - Date.parse(left.pubDate))
    .map(
      (item) => `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(item.link)}</link>
  <description>${escapeXml(item.description)} 광고/제휴 링크가 포함될 수 있으며 수신거부 링크를 제공합니다.</description>
  <pubDate>${item.pubDate}</pubDate>
  <guid>${escapeXml(item.guid)}</guid>
</item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>DFMOA 면세 혜택 리포트</title>
  <link>${SITE_URL}</link>
  <description>주간 리포트와 월간 면세 혜택 총정리 피드입니다.</description>
  <language>ko-KR</language>
  <lastBuildDate>${new Date("2026-04-19T00:00:00+09:00").toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
