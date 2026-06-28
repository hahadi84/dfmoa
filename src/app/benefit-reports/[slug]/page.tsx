import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import {
  benefitReports,
  formatKoreanDate,
  getAdjacentBenefitReports,
  getBenefitReportBySlug,
  isBenefitReportIndexable,
} from "@/lib/benefit-report-generator";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { SITE_OPERATOR } from "@/lib/site-operator";
import { products } from "@/lib/site-data";

type BenefitReportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return benefitReports.map((report) => ({
    slug: report.slug,
  }));
}

export async function generateMetadata({ params }: BenefitReportPageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = getBenefitReportBySlug(slug);

  if (!report) {
    return {
      title: "혜택 리포트",
      robots: { index: false, follow: true },
    };
  }

  const canonicalSlug = report.canonicalSlug ?? report.slug;

  return {
    title: report.title,
    description: report.description,
    alternates: {
      canonical: `/benefit-reports/${canonicalSlug}`,
    },
    robots: isBenefitReportIndexable(report) ? undefined : { index: false, follow: true },
  };
}

export default async function BenefitReportPage({ params }: BenefitReportPageProps) {
  const { slug } = await params;
  const report = getBenefitReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const canonicalPath = `/benefit-reports/${report.canonicalSlug ?? report.slug}`;
  const monthPath = `/deals/${report.monthSlug}`;
  const { previousReport, nextReport } = getAdjacentBenefitReports(report.slug);
  const relatedProducts = report.relatedProductSlugs
    .map((productSlug) => products.find((product) => product.slug === productSlug))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const benefitGroups = [
    { title: "쿠폰", items: report.coupons },
    { title: "적립금", items: report.rewards },
    { title: "카드 할인", items: report.cardDiscounts },
    { title: "브랜드 이벤트", items: report.brandEvents },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "혜택 리포트", path: "/benefit-reports" },
    { name: report.weekLabel, path: canonicalPath },
  ]);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: report.title,
    description: report.description,
    datePublished: report.publishedAt,
    dateModified: report.updatedAt,
    author: {
      "@type": "Organization",
      name: SITE_OPERATOR.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_OPERATOR.siteName,
    },
    mainEntityOfPage: `${SITE_OPERATOR.serviceUrl}${canonicalPath}`,
  };

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, articleJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/benefit-reports">혜택 리포트</Link>
          <span>/</span>
          <span>{report.weekLabel}</span>
        </div>

        <article className="surface-card report-article">
          <header className="report-article-head">
            <span className="eyebrow">Weekly Benefit Archive</span>
            <h1 className="page-title">{report.title}</h1>
            <p className="page-description">{report.description}</p>
            <div className="report-meta-row">
              <span>{report.periodLabel}</span>
              <span>최종 업데이트: {report.updatedAt}</span>
              <span>{report.storeCount}개 면세점</span>
              <span>{report.sourceCount}개 원본 링크</span>
            </div>
            <div className="chip-row" style={{ marginTop: 16 }}>
              <Link className="chip is-demo" href={monthPath}>
                월간 혜택 전체 보기
              </Link>
              <Link className="chip is-soft" href="/price-compare">
                면세점 가격 비교 시작
              </Link>
              {report.canonicalSlug ? (
                <Link className="chip is-soft" href={canonicalPath}>
                  표준 주간 리포트 보기
                </Link>
              ) : null}
            </div>
          </header>

          {!isBenefitReportIndexable(report) ? (
            <section className="report-section report-callout">
              <h2>레거시 URL 안내</h2>
              <p>
                이 URL은 기존 접근 경로 보존을 위해 200 응답을 유지합니다. 검색 색인은 표준 주차 리포트로 모으도록
                canonical과 robots를 분리했습니다.
              </p>
            </section>
          ) : null}

          <section className="report-section">
            <h2>이번 주 핵심 변경</h2>
            <ul className="report-check-list">
              {report.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h2>지난주 대비 변경점</h2>
            <ul className="report-check-list">
              {report.changesFromPreviousWeek.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h2>면세점별 혜택 요약</h2>
            <div className="report-store-grid">
              {report.stores.map((section) => (
                <article key={section.storeId} className="report-store-section">
                  <div className="benefit-store-head">
                    <span className="benefit-logo-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={section.logoUrl} alt={`${section.storeName} 로고`} loading="lazy" />
                    </span>
                    <div>
                      <h3>{section.storeName}</h3>
                      <p>{section.summary}</p>
                    </div>
                  </div>

                  <div className="chip-row benefit-chip-row">
                    {section.benefitTypes.map((type) => (
                      <span key={type} className="chip is-soft">
                        {type}
                      </span>
                    ))}
                  </div>

                  <p className="report-editorial-note">{section.editorialNote}</p>

                  <div className="benefit-check-card">
                    <p className="panel-title">확인할 점</p>
                    <ul>
                      {section.checkPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2>쿠폰·적립금·카드 할인·브랜드 이벤트</h2>
            <div className="report-store-grid">
              {benefitGroups.map((group) => (
                <article key={group.title} className="benefit-check-card">
                  <p className="panel-title">{group.title}</p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="report-section">
            <h2>종료·주의 사항</h2>
            <ul className="report-check-list">
              {report.expiredNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h2>원본 확인 링크</h2>
            <div className="benefit-link-list">
              {report.sourceLinks.map((sourceLink) => (
                <a
                  key={`${sourceLink.storeName}-${sourceLink.url}`}
                  className="benefit-link-item"
                  href={sourceLink.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="benefit-link-copy">
                    <strong>{sourceLink.label}</strong>
                    <small>{sourceLink.storeName}</small>
                  </span>
                  <span className="text-link">원본</span>
                </a>
              ))}
            </div>
          </section>

          <ContentProductGrid products={relatedProducts} title="이번 주 혜택 확인용 대표 상품" />

          <section className="report-section">
            <h2>이전·다음 주 리포트</h2>
            <div className="deal-archive-list">
              {previousReport ? (
                <Link className="deal-archive-item" href={`/benefit-reports/${previousReport.slug}`}>
                  <span className="chip is-soft">이전</span>
                  <span>
                    <strong>{previousReport.title}</strong>
                    <small>{previousReport.periodLabel}</small>
                  </span>
                  <span className="text-link">보기</span>
                </Link>
              ) : null}
              {nextReport ? (
                <Link className="deal-archive-item" href={`/benefit-reports/${nextReport.slug}`}>
                  <span className="chip is-soft">다음</span>
                  <span>
                    <strong>{nextReport.title}</strong>
                    <small>{nextReport.periodLabel}</small>
                  </span>
                  <span className="text-link">보기</span>
                </Link>
              ) : null}
              {!previousReport && !nextReport ? <p className="section-copy">연결된 주차 리포트가 아직 없습니다.</p> : null}
            </div>
          </section>

          <section className="report-section">
            <h2>정리 기준</h2>
            <ul className="report-check-list">
              {report.methodology.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="report-section report-callout">
            <h2>이용 안내</h2>
            <p>{report.disclaimer}</p>
            <small>발행일: {formatKoreanDate(report.publishedAt)}</small>
          </section>
        </article>
      </div>
    </section>
  );
}
