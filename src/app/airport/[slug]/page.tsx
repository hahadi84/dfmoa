import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/json-ld";
import { airportGuides, getAirportGuideBySlug, getRelatedGuides } from "@/lib/seo-content";
import { categories, products } from "@/lib/site-data";

type AirportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return airportGuides.map((airport) => ({
    slug: airport.slug,
  }));
}

export async function generateMetadata({ params }: AirportPageProps): Promise<Metadata> {
  const { slug } = await params;
  const airport = getAirportGuideBySlug(slug);

  if (!airport) {
    return {
      title: "공항 가이드를 찾을 수 없습니다",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: airport.title,
    description: `${airport.title}와 면세품 수령, 반입 주의사항, 공식 확인 링크를 정리했습니다.`,
    alternates: {
      canonical: `/airport/${airport.slug}`,
    },
  };
}

export default async function AirportPage({ params }: AirportPageProps) {
  const { slug } = await params;
  const airport = getAirportGuideBySlug(slug);

  if (!airport) {
    notFound();
  }

  const relatedProducts = (airport.relatedProductIds ?? [])
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const relatedGuides = getRelatedGuides(airport.relatedGuideSlugs);
  const articleJsonLd = buildArticleJsonLd({
    title: airport.title,
    description: airport.description,
    path: `/airport/${airport.slug}`,
    publishedAt: airport.updatedAt,
    updatedAt: airport.updatedAt,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "공항 가이드", path: "/airport/icn-t1" },
    { name: airport.title, path: `/airport/${airport.slug}` },
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
          <span>공항 가이드</span>
          <span>/</span>
          <span>{airport.title}</span>
        </div>

        <article className="surface-card content-hero-card">
          <span className="eyebrow">Airport Guide</span>
          <h1 className="page-title">{airport.title}</h1>
          <p className="page-description">{airport.description}</p>
          <div className="report-meta-row">
            <span>{airport.airportName}</span>
            {airport.terminal ? <span>{airport.terminal}</span> : null}
            <span>업데이트: {airport.updatedAt}</span>
          </div>
        </article>

        <div className="split-grid" style={{ marginTop: 12 }}>
          <article className="surface-card">
            <h2 className="card-title">수령·인도장 주의사항</h2>
            <ul className="report-check-list">
              {airport.pickupNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>

          <article className="surface-card">
            <h2 className="card-title">공식 확인 링크</h2>
            <div className="official-link-row" style={{ marginTop: 10 }}>
              {airport.officialLinks.map((link) => (
                <a key={link.url} className="official-link-button" href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
            <p className="form-fine-print">
              실제 재고·수령 가능 여부는 원본 면세점에서 출국정보 입력 후 확인해야 합니다.
            </p>
          </article>
        </div>

        <article className="surface-card" style={{ marginTop: 12 }}>
          <h2 className="card-title">카테고리별 주의사항</h2>
          <div className="airport-warning-grid">
            {airport.categoryWarnings.map((warning) => (
              <div key={warning.category} className="airport-warning-card">
                <strong>{warning.category}</strong>
                <ul>
                  {warning.warnings.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <ContentProductGrid products={relatedProducts} title="공항 이용 전 함께 보는 상품" />

        <article className="surface-card" style={{ marginTop: 12 }}>
          <h2 className="card-title">관련 링크</h2>
          <div className="chip-row" style={{ marginTop: 10 }}>
            {categories.slice(0, 5).map((category) => (
              <Link key={category.slug} className="chip is-soft" href={`/category/${category.slug}`}>
                {category.name}
              </Link>
            ))}
            {relatedGuides.map((guide) => (
              <Link key={guide.slug} className="chip is-soft" href={`/guide/${guide.slug}`}>
                {guide.title}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
