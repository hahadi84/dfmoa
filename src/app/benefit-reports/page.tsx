import type { Metadata } from "next";
import Link from "@/components/app-link";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { indexableBenefitReports, latestBenefitReport } from "@/lib/benefit-report-generator";

export const metadata: Metadata = {
  title: "면세점 혜택 리포트",
  description:
    "신세계·신라·롯데·현대면세점 쿠폰, 적립금, 카드 할인, 브랜드 이벤트 변경사항을 주간 단위로 정리하고 월간 혜택 허브로 연결합니다.",
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
          쿠폰, 적립금, 카드 할인, 브랜드 이벤트를 주차별 변경사항과 월간 허브 연결 관점에서 정리합니다. 모든 조건은
          원본 면세점에서 최종 확인해야 합니다.
        </p>

        <div className="chip-row" style={{ marginTop: 16 }}>
          <Link className="chip is-demo" href="/deals/2026-06">
            2026년 6월 면세점 쿠폰·적립금
          </Link>
          <Link className="chip is-soft" href="/price-compare">
            면세점 가격 비교
          </Link>
          <Link className="chip is-soft" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            최신 주간 리포트
          </Link>
        </div>

        <article className="surface-card report-feature-card">
          <div>
            <span className="chip is-soft">{latestBenefitReport.periodLabel}</span>
            <h2 className="card-title">{latestBenefitReport.title}</h2>
            <p className="section-copy">{latestBenefitReport.description}</p>
          </div>
          <div className="report-metric-strip">
            <span>{latestBenefitReport.storeCount}개 면세점</span>
            <span>{latestBenefitReport.sourceCount}개 혜택 링크</span>
            <span>{latestBenefitReport.weekLabel}</span>
          </div>
          <Link className="button" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            최신 리포트 보기
          </Link>
        </article>

        <div className="split-grid" style={{ marginTop: 12 }}>
          <div className="report-grid">
            {indexableBenefitReports.map((report) => (
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

          <NewsletterSignupForm source="benefit_reports" />
        </div>

        <article className="surface-card report-callout">
          <h2 className="card-title">메일 구독 운영 원칙</h2>
          <p className="section-copy">
            주간 리포트 구독 동의와 가격 알림 동의는 분리해 저장합니다. 광고/제휴 링크가 포함될 수 있는 메일은
            광고성 정보 수신동의를 별도로 받으며, 모든 이메일에는 로그인 없는 수신거부 링크를 포함합니다.
          </p>
        </article>
      </div>
    </section>
  );
}
