import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import {
  benefitReports,
  formatKoreanDate,
  getBenefitReportBySlug,
} from "@/lib/benefit-report-generator";

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
    };
  }

  return {
    title: report.title,
    description: report.description,
    alternates: {
      canonical: `/benefit-reports/${report.slug}`,
    },
  };
}

export default async function BenefitReportPage({ params }: BenefitReportPageProps) {
  const { slug } = await params;
  const report = getBenefitReportBySlug(slug);

  if (!report) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: report.title,
    description: report.description,
    datePublished: report.publishedAt,
    dateModified: report.updatedAt,
    author: {
      "@type": "Organization",
      name: "면세모아 DFMOA",
    },
    publisher: {
      "@type": "Organization",
      name: "면세모아 DFMOA",
    },
    mainEntityOfPage: `https://dfmoa.netlify.app/benefit-reports/${report.slug}`,
  };

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/benefit-reports">혜택 리포트</Link>
          <span>/</span>
          <span>{formatKoreanDate(report.publishedAt)}</span>
        </div>

        <article className="surface-card report-article">
          <header className="report-article-head">
            <span className="eyebrow">Weekly Benefit Brief</span>
            <h1 className="page-title">{report.title}</h1>
            <p className="page-description">{report.description}</p>
            <div className="report-meta-row">
              <span>{report.periodLabel}</span>
              <span>{report.storeCount}개 면세점</span>
              <span>{report.sourceCount}개 혜택 링크</span>
            </div>
          </header>

          <section className="report-section">
            <h2>핵심 요약</h2>
            <ul className="report-check-list">
              {report.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>

          <section className="report-section">
            <h2>면세점별 혜택 정리</h2>
            <div className="report-store-grid">
              {report.sections.map((section) => (
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

                  <div className="benefit-link-list">
                    {section.benefits.map((benefit) => (
                      <a
                        key={`${section.storeId}-${benefit.title}`}
                        className="benefit-link-item"
                        href={benefit.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="benefit-link-copy">
                          <span className="benefit-link-title-line">
                            <strong>{benefit.title}</strong>
                            <span className="benefit-action-button is-benefit">{benefit.type}</span>
                          </span>
                          <small>{benefit.description}</small>
                        </span>
                        <span className="text-link">원본</span>
                      </a>
                    ))}
                  </div>

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
          </section>
        </article>
      </div>
    </section>
  );
}
