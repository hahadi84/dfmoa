import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { CategoryFilterGrid } from "@/components/category-filter-grid";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildCategoryMetadata } from "@/lib/seo-metadata";
import { categories, getCategoryBySlug, getGuideBySlug, getProductsByCategory } from "@/lib/site-data";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "카테고리를 찾을 수 없습니다",
      robots: { index: false, follow: true },
    };
  }

  return buildCategoryMetadata(category);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.slug);
  const guide = getGuideBySlug(category.guideSlug);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "카테고리", path: "/category" },
    { name: category.name, path: `/category/${category.slug}` },
  ]);
  const itemListJsonLd = buildItemListJsonLd(
    categoryProducts.slice(0, 12).map((product) => ({
      name: product.displayName,
      path: `/product/${product.slug}`,
    })),
    `${category.name} 대표 상품`
  );

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/category">카테고리</Link>
          <span>/</span>
          <span>{category.name}</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Category Landing
        </span>
        <h1 className="page-title">{category.headline}</h1>
        <p className="page-description">{category.intro}</p>

        <div className="chip-row" style={{ marginTop: 22 }}>
          {category.keywords.map((keyword) => (
            <Link key={keyword} className="chip is-soft" href={`/search?q=${encodeURIComponent(keyword)}`}>
              {keyword}
            </Link>
          ))}
        </div>

        <div className="section-head" style={{ marginTop: 15 }}>
          <div>
            <span className="eyebrow">Representative Products</span>
            <h2 className="section-title">대표 상품 {categoryProducts.length}가지</h2>
            <p className="section-copy">
              필터 URL은 공유 가능하지만 canonical은 카테고리 기본 페이지로 유지합니다.
            </p>
          </div>
        </div>

        <Suspense fallback={<p className="section-copy">카테고리 상품을 정리하는 중입니다.</p>}>
          <CategoryFilterGrid products={categoryProducts} />
        </Suspense>

        <div className="split-grid" style={{ marginTop: 12 }}>
          <div className="surface-card">
            <p className="panel-title">카테고리 비교 기준</p>
            <div className="guide-body" style={{ marginTop: 9 }}>
              <div className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  검색어 구조
                </h3>
                <p className="section-copy">
                  브랜드명, 상품명, 용량을 함께 입력하면 같은 상품 후보를 더 보수적으로 찾을 수 있습니다.
                </p>
              </div>
              <div className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  가격 상태 확인
                </h3>
                <p className="section-copy">
                  가격이 없거나 일부 source만 확인되는 경우에도 공식 검색과 원본 확인 링크를 제공합니다.
                </p>
              </div>
              <div className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  예상 실결제가
                </h3>
                <p className="section-copy">
                  회원 등급, 쿠폰, 카드 혜택, 적립금, 환율은 상품 상세의 계산기에서 참고값으로 계산하세요.
                </p>
              </div>
            </div>
          </div>
          <aside className="feature-panel">
            {guide ? (
              <Link href={`/guide/${guide.slug}`} className="guide-card">
                <span className="chip is-soft">관련 가이드</span>
                <h3 className="card-title">{guide.title}</h3>
                <p className="section-copy">{guide.excerpt}</p>
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
