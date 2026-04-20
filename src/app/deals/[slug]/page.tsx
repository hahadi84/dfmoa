import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
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
