import { benefitReports } from "@/lib/benefit-report-generator";
import { monthlyDealReports } from "@/lib/seo-content";
import { SITE_OPERATOR } from "@/lib/site-operator";
import { japanGuides } from '@/lib/japan-guides';

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
  const guideItems = japanGuides.map(guide => ({ title: guide.title, description: guide.excerpt,
    link: `${SITE_URL}/guide/${guide.slug}`, guid: `${SITE_URL}/guide/${guide.slug}`,
    pubDate: new Date(`${guide.updatedAt}T00:00:00+09:00`).toUTCString(),
  }));
  const allItems = [...weeklyItems, ...monthlyItems, ...guideItems];
  const latestDate = new Date(Math.max(...allItems.map(item => Date.parse(item.pubDate)))).toUTCString();
  const items = allItems
    .sort((left, right) => Date.parse(right.pubDate) - Date.parse(left.pubDate))
    .map(
      (item) => `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(item.link)}</link>
  <description>${escapeXml(item.description)}</description>
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
  <lastBuildDate>${latestDate}</lastBuildDate>
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
