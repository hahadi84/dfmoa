import type { Metadata } from "next";
import Link from "@/components/app-link";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import {
  formatYearMonthSlug,
  getDealsBuildDate,
  getLatestMonthlyDealReportForDate,
  sortMonthlyDealReports,
} from "@/lib/monthly-deals";
import { monthlyDealReports } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "월간 면세 혜택",
  description: "월별 면세점 혜택 리포트를 최신 월부터 아카이브까지 모아봅니다.",
  alternates: {
    canonical: "/deals",
  },
};

export default function DealsIndexPage() {
  const buildDate = getDealsBuildDate();
  const currentMonthSlug = formatYearMonthSlug(buildDate);
  const latestReport = getLatestMonthlyDealReportForDate(monthlyDealReports, buildDate);
  const archiveReports = sortMonthlyDealReports(monthlyDealReports).filter((report) => report.slug !== latestReport?.slug);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "월간 혜택", path: "/deals" },
  ]);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>월간 혜택</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Monthly Deals
        </span>
        <h1 className="page-title">월간 면세 혜택</h1>
        <p className="page-description">
          빌드 시점의 현재 월을 기준으로 최신 리포트를 먼저 보여주고, 이전 월은 아카이브로 분리합니다.
        </p>

        {latestReport ? (
          <Link className="deal-latest-card" href={`/deals/${latestReport.slug}`}>
            <span className="chip is-demo">최신 월</span>
            <h2 className="section-title">{latestReport.title}</h2>
            <p className="section-copy">{latestReport.summary}</p>
            <div className="report-meta-row">
              <span>현재 월 기준: {currentMonthSlug}</span>
              <span>발행: {latestReport.publishedAt}</span>
              <span>업데이트: {latestReport.updatedAt}</span>
            </div>
            <span className="text-link">최신 혜택 리포트 보기</span>
          </Link>
        ) : null}

        <div className="section-head" style={{ marginTop: 18 }}>
          <div>
            <span className="eyebrow">Archive</span>
            <h2 className="section-title">이전 월 아카이브</h2>
            <p className="section-copy">월별 리포트는 최신 월 카드와 분리해 목록으로 제공합니다.</p>
          </div>
        </div>

        <div className="deal-archive-list">
          {archiveReports.map((report) => (
            <Link key={report.slug} className="deal-archive-item" href={`/deals/${report.slug}`}>
              <span className="chip is-soft">
                {report.year}.{String(report.month).padStart(2, "0")}
              </span>
              <span>
                <strong>{report.title}</strong>
                <small>{report.summary}</small>
              </span>
              <span className="text-link">보기</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
