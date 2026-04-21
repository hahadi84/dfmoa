import { getDealsBuildDate, getLatestMonthlyDealReportForDate } from "../../src/lib/monthly-deals";
import { monthlyDealReports } from "../../src/lib/seo-content";

const handler = async () => {
  const latestReport = getLatestMonthlyDealReportForDate(monthlyDealReports, getDealsBuildDate());
  const location = latestReport ? `/deals/${latestReport.slug}` : "/deals/2026-04";

  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
};

export default handler;
