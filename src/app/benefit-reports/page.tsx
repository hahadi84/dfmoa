import type { Metadata } from "next";
import Link from "@/components/app-link";
import { benefitReports, latestBenefitReport } from "@/lib/benefit-report-generator";

export const metadata: Metadata = {
  title: "면세점 혜택 리포트",
  description: "면세점 쿠폰, 적립금, 카드 할인, 브랜드 이벤트를 주간 단위로 정리한 리포트입니다.",
  alternates: {
    canonical: "/benefit-reports",
  },
};

export default function BenefitReportsPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>혜택 리포트</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Benefit Reports
        </span>
        <h1 className="page-title">면세점 혜택 리포트</h1>
        <p className="page-description">
          쿠폰, 적립금, 카드 할인, 브랜드 이벤트를 예상 실결제가 계산 관점에서 정리합니다. 모든 조건은 원본
          면세점에서 최종 확인해야 합니다.
        </p>

        <article className="surface-card report-feature-card">
          <div>
            <span className="chip is-soft">{latestBenefitReport.periodLabel}</span>
            <h2 className="card-title">{latestBenefitReport.title}</h2>
            <p className="section-copy">{latestBenefitReport.description}</p>
          </div>
          <div className="report-metric-strip">
            <span>{latestBenefitReport.storeCount}개 면세점</span>
            <span>{latestBenefitReport.sourceCount}개 혜택 링크</span>
            <span>발행일 기준 기록</span>
          </div>
          <Link className="button" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            최신 리포트 보기
          </Link>
        </article>

        <p className="section-copy"><Link href="/japan">일본 여행·엔화 계산기</Link> · <Link href="/deals">월간 혜택 모아보기</Link></p>

        <div style={{ marginTop: 12 }}>
          <div className="report-grid">
            {benefitReports.map((report) => (
              <Link key={report.slug} className="report-card" href={`/benefit-reports/${report.slug}`}>
                <span className="eyebrow">Weekly Brief</span>
                <h2 className="card-title">{report.title}</h2>
                <p className="section-copy">{report.description}</p>
                <div className="report-meta-row">
                  <span>{report.periodLabel}</span>
                  <span>{report.sourceCount}개 출처</span>
                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
