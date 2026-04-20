import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import { buildBreadcrumbJsonLd, buildCompareItemListJsonLd } from "@/lib/json-ld";
import { comparePages, getComparePageBySlug, getRelatedGuides } from "@/lib/seo-content";
import { getCategoryBySlug, products } from "@/lib/site-data";

type ComparePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return comparePages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparePage = getComparePageBySlug(slug);

  if (!comparePage) {
    return {
      title: "비교 페이지를 찾을 수 없습니다",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: comparePage.title,
    description: comparePage.comparisonSummary,
    alternates: {
      canonical: `/compare/${comparePage.slug}`,
    },
    robots: comparePage.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const comparePage = getComparePageBySlug(slug);

  if (!comparePage || comparePage.productIds.length < 2) {
    notFound();
  }

  const compareProducts = comparePage.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const category = getCategoryBySlug(comparePage.categoryId);
  const relatedGuides = getRelatedGuides(comparePage.relatedGuideSlugs);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "상품 비교", path: `/compare/${comparePage.slug}` },
    { name: comparePage.title, path: `/compare/${comparePage.slug}` },
  ]);
  const itemListJsonLd = buildCompareItemListJsonLd(comparePage);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>상품 비교</span>
        </div>

        <article className="surface-card content-hero-card">
          <span className="eyebrow">Curated Compare</span>
          <h1 className="page-title">{comparePage.title}</h1>
          <p className="page-description">{comparePage.comparisonSummary}</p>
          <div className="report-meta-row">
            <span>{category?.name ?? comparePage.categoryId}</span>
            <span>생성 기준: {comparePage.createdReason}</span>
            <span>업데이트: {comparePage.updatedAt}</span>
          </div>
        </article>

        <ContentProductGrid products={compareProducts} title="비교 대상 상품" />

        <div className="split-grid" style={{ marginTop: 12 }}>
          <article className="surface-card">
            <h2 className="card-title">비교 기준</h2>
            <ul className="report-check-list">
              <li>동일 카테고리 안에서 실제 비교 가치가 있는 curated 조합만 생성합니다.</li>
              <li>최근 확인 공개가와 source status는 상품 상세에서 확인합니다.</li>
              <li>예상 실결제가는 각 상품 상세의 계산기에서 내 조건을 입력해 비교합니다.</li>
              <li>가격 추이는 유효 가격 포인트가 충분할 때만 표시합니다.</li>
              <li>최종 결제가는 원본 면세점에서 확인해야 합니다.</li>
            </ul>
          </article>

          <article className="surface-card">
            <h2 className="card-title">관련 링크</h2>
            <div className="chip-row" style={{ marginTop: 10 }}>
              {compareProducts.map((product) => (
                <Link key={product.slug} className="chip is-soft" href={`/brand/${product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>
                  {product.brand} 브랜드 보기
                </Link>
              ))}
              {category ? (
                <Link className="chip is-soft" href={`/category/${category.slug}`}>
                  {category.name} 카테고리
                </Link>
              ) : null}
              {relatedGuides.map((guide) => (
                <Link key={guide.slug} className="chip is-soft" href={`/guide/${guide.slug}`}>
                  {guide.title}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
