import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { getBenefitReportsByMonth } from "@/lib/benefit-report-generator";
import { benefitRules } from "@/lib/effective-price";
import { buildBreadcrumbJsonLd, buildMonthlyDealArticleJsonLd } from "@/lib/json-ld";
import { getMonthlyDealReportBySlug, monthlyDealReports } from "@/lib/seo-content";
import { getStoreById, products } from "@/lib/site-data";

type DealsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return monthlyDealReports.map((report) => ({
    slug: report.slug,
  }));
}

export async function generateMetadata({ params }: DealsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = getMonthlyDealReportBySlug(slug);

  if (!report) {
    return {
      title: "혜택 리포트를 찾을 수 없습니다",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: report.title,
    description: report.summary,
    alternates: {
      canonical: `/deals/${report.slug}`,
    },
  };
}

export default async function DealsPage({ params }: DealsPageProps) {
  const { slug } = await params;
  const report = getMonthlyDealReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const rules = report.benefitRuleIds
    .map((id) => benefitRules.find((rule) => rule.id === id))
    .filter((rule): rule is (typeof benefitRules)[number] => Boolean(rule));
  const relatedProducts = (report.relatedProductIds ?? [])
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const articleJsonLd = buildMonthlyDealArticleJsonLd(report);
  const isFeaturedCouponReport = report.slug === "2026-04" || report.slug === "2026-05" || report.slug === "2026-06";
  const weeklyReports = getBenefitReportsByMonth(report.slug);
  const latestWeeklyReport = weeklyReports[0] ?? null;
  const monthLabel = `${report.year}년 ${report.month}월`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "월간 혜택", path: "/deals" },
    { name: report.title, path: `/deals/${report.slug}` },
  ]);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/deals">월간 혜택</Link>
          <span>/</span>
          <span>{report.year}.{String(report.month).padStart(2, "0")}</span>
        </div>

        <article className="surface-card content-hero-card">
          <span className="eyebrow">Monthly Deals</span>
          <h1 className="page-title">{report.title}</h1>
          <p className="page-description">{report.summary}</p>
          <div className="report-meta-row">
            <span>발행: {report.publishedAt}</span>
            <span>업데이트: {report.updatedAt}</span>
            <span>제휴/광고 링크 포함 가능</span>
          </div>
        </article>

        {isFeaturedCouponReport ? (
          <article className="surface-card" style={{ marginTop: 12 }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">2026 Coupon Check</span>
                <h2 className="section-title">{monthLabel} 면세점 쿠폰·적립금 확인</h2>
                <p className="section-copy">
                  신세계·신라·롯데·현대면세점의 {monthLabel} 쿠폰, 적립금, 카드 할인, 브랜드 이벤트를 한 화면에서
                  비교하고 원본 혜택 페이지에서 최종 조건을 확인하세요.
                </p>
              </div>
            </div>
            <div className="chip-row">
              {latestWeeklyReport ? (
                <Link className="chip is-demo" href={`/benefit-reports/${latestWeeklyReport.slug}`}>
                  최신 주간 업데이트
                </Link>
              ) : null}
              {latestWeeklyReport ? (
                <Link className="chip is-soft" href={`/benefit-reports/${latestWeeklyReport.slug}`}>
                  {latestWeeklyReport.weekLabel} 쿠폰·적립금
                </Link>
              ) : null}
              <Link className="chip is-soft" href="/price-compare">
                면세점 가격 비교
              </Link>
              <Link className="chip is-soft" href="/product/sk2-pitera-essence-230ml">
                SK-II 피테라 가격
              </Link>
              <Link className="chip is-soft" href="/product/bleu-de-chanel-edp-100ml">
                블루 드 샤넬 가격
              </Link>
            </div>
          </article>
        ) : null}

        {weeklyReports.length > 0 ? (
          <article className="surface-card" style={{ marginTop: 12 }}>
            <div className="section-head">
              <div>
                <span className="eyebrow">Weekly Archive</span>
                <h2 className="section-title">{monthLabel} 주간 혜택 업데이트</h2>
                <p className="section-copy">
                  {monthLabel} 쿠폰·적립금·카드 할인 변경사항을 주차별로 쌓아 두고, 월간 혜택 총정리 페이지에서
                  한 번에 비교할 수 있게 정리했습니다.
                </p>
              </div>
              {latestWeeklyReport ? (
                <span className="chip is-soft">최신 업데이트: {latestWeeklyReport.updatedAt}</span>
              ) : null}
            </div>

            <div className="report-grid">
              {weeklyReports.map((weeklyReport) => (
                <Link
                  key={weeklyReport.slug}
                  className="report-card"
                  href={`/benefit-reports/${weeklyReport.slug}`}
                >
                  <span className="eyebrow">{weeklyReport.weekLabel}</span>
                  <h3 className="card-title">{weeklyReport.title}</h3>
                  <p className="section-copy">{weeklyReport.description}</p>
                  <ul className="report-check-list">
                    {weeklyReport.changesFromPreviousWeek.slice(0, 2).map((change) => (
                      <li key={change}>{change}</li>
                    ))}
                  </ul>
                  <div className="report-meta-row">
                    <span>{weeklyReport.periodLabel}</span>
                    <span>업데이트: {weeklyReport.updatedAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        ) : null}

        <article className="surface-card" style={{ marginTop: 12 }}>
          <div className="section-head">
            <div>
              <span className="eyebrow">Benefit Rules</span>
              <h2 className="section-title">면세점별 할인·적립금 이벤트</h2>
              <p className="section-copy">
                혜택은 공개 원본 링크 기준으로 정리하며, 실제 적용 여부는 회원 등급·출국 정보·결제수단에 따라 달라질 수
                있습니다.
              </p>
            </div>
          </div>

          <div className="deal-rule-grid">
            {rules.map((rule) => {
              const store = getStoreById(rule.sourceId);

              return (
                <article key={rule.id} className="deal-rule-card">
                  <span className="chip is-soft">{store?.name ?? rule.sourceId}</span>
                  <h3 className="card-title">{rule.title}</h3>
                  <p className="section-copy">{rule.note ?? "원본 링크에서 상세 조건을 확인해 주세요."}</p>
                  <div className="report-meta-row">
                    <span>유형: {rule.type}</span>
                    <span>신뢰도: {rule.confidence}</span>
                    <span>마지막 확인: {rule.lastVerifiedAt}</span>
                  </div>
                  {rule.sourceUrl ? (
                    <a className="text-link" href={rule.sourceUrl} target="_blank" rel="noreferrer">
                      원본 혜택 확인
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        </article>

        <ContentProductGrid products={relatedProducts} title="혜택 적용을 확인할 대표 상품" />

        <div className="split-grid" style={{ marginTop: 12 }}>
          <article className="surface-card">
            <h2 className="card-title">원본 링크와 마지막 확인일</h2>
            <div className="benefit-link-list">
              {report.sourceLinks.map((link) => (
                <a key={link.url} className="benefit-link-item" href={link.url} target="_blank" rel="noreferrer">
                  <span className="benefit-link-copy">
                    <strong>{link.sourceName}</strong>
                    <small>마지막 확인: {link.lastVerifiedAt}</small>
                  </span>
                  <span className="text-link">원본</span>
                </a>
              ))}
            </div>
          </article>

          <NewsletterSignupForm source="benefit_reports" />
        </div>
      </div>
    </section>
  );
}
