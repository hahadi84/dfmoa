import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { CategoryFilterGrid } from "@/components/category-filter-grid";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildCategoryMetadata } from "@/lib/seo-metadata";
import { hasSnapshotPrice } from "@/lib/snapshot-summaries";
import { categories, getCategoryBySlug, getGuideBySlug, getProductsByCategory } from "@/lib/site-data";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";

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

  const categoryProducts = getProductsByCategory(category.slug);
  const priceSnapshotsByProductId = readPriceSnapshotsByProductId(categoryProducts);
  const pricedCount = categoryProducts.filter((product) => hasSnapshotPrice(priceSnapshotsByProductId[product.id])).length;
  const metadata = buildCategoryMetadata(category);

  if (pricedCount < 3) {
    return {
      ...metadata,
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      },
    };
  }

  return metadata;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.slug);
  const priceSnapshotsByProductId = readPriceSnapshotsByProductId(categoryProducts);
  const pricedCount = categoryProducts.filter((product) => hasSnapshotPrice(priceSnapshotsByProductId[product.id])).length;
  const guide = getGuideBySlug(category.guideSlug);
  const categoryReviewNotes = [
    {
      title: "이 카테고리를 어떻게 봐야 하나요",
      body: `${category.intro} 현재 DFMOA에서는 ${categoryProducts.length}개 대표 상품을 묶어 보고 있으며, 최근 스냅샷 가격이 잡힌 상품은 ${pricedCount}개입니다.`,
    },
    {
      title: "최저가보다 먼저 확인할 기준",
      body: `${category.name} 카테고리는 브랜드명, 제품명, 용량 또는 모델명 일치 여부에 따라 같은 상품인지 판단이 달라질 수 있습니다. 가격 숫자만 보지 말고 검색어 정합성과 수령 가능 공항, 세트 구성 차이를 함께 봐야 합니다.`,
    },
    {
      title: "실구매 판단은 이렇게 보세요",
      body: "표에 보이는 가격은 출발점입니다. 먼저 가격 기준 시각과 소스 상태를 확인하고, 마지막에는 면세점 원문 페이지에서 혜택 적용 여부와 주문 마감 조건을 다시 확인해야 실제 결제 금액과 가까워집니다.",
    },
  ];
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
          카테고리 비교
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

        <article className="surface-card" style={{ marginTop: 14 }}>
          <span className="eyebrow">비교 가이드</span>
          <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
            가격표 전에 먼저 읽을 카테고리 해설
          </h2>
          <div className="guide-body" style={{ marginTop: 10 }}>
            {categoryReviewNotes.map((note) => (
              <section key={note.title} className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  {note.title}
                </h3>
                <p className="section-copy">{note.body}</p>
              </section>
            ))}
          </div>
        </article>

        <div className="section-head" style={{ marginTop: 15 }}>
          <div>
            <span className="eyebrow">대표 상품</span>
            <h2 className="section-title">대표 상품 {categoryProducts.length}가지</h2>
            <p className="section-copy">
              필터 URL은 공유 가능하지만 canonical은 카테고리 기본 페이지로 유지합니다.
            </p>
          </div>
        </div>

        <Suspense fallback={<p className="section-copy">카테고리 상품을 정리하는 중입니다.</p>}>
          <CategoryFilterGrid products={categoryProducts} priceSnapshotsByProductId={priceSnapshotsByProductId} />
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
