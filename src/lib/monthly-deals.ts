import type { MonthlyDealReport } from "@/lib/content-models";

export function formatYearMonthSlug(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit' }).format(date).slice(0, 7);
}

export function getDealsBuildDate() {
  const override = process.env.DFMOA_DEALS_TODAY;
  const parsed = override ? new Date(override) : new Date();

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function monthNumber(report: Pick<MonthlyDealReport, "year" | "month">) {
  return report.year * 100 + report.month;
}

export function sortMonthlyDealReports(reports: MonthlyDealReport[]) {
  return [...reports].sort((left, right) => monthNumber(right) - monthNumber(left));
}

export function getLatestMonthlyDealReportForDate(reports: MonthlyDealReport[], date: Date) {
  const currentMonth = Number(formatYearMonthSlug(date).replace('-', ''));
  const sortedReports = sortMonthlyDealReports(reports);

  return sortedReports.find((report) => monthNumber(report) <= currentMonth) ?? sortedReports[0] ?? null;
}
