import type { Metadata } from "next";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import { SearchForm } from "@/components/search-form";
import { latestBenefitReport } from "@/lib/benefit-report-generator";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildSeoMetadata, DEFAULT_OG_IMAGE } from "@/lib/seo-metadata";
import { categories, products } from "@/lib/site-data";

const focusProductSlugs = [
  "bleu-de-chanel-edp-100ml",
  "sk2-pitera-essence-230ml",
  "hera-black-cushion-15g",
  "glenfiddich-15-700ml",
  "jo-malone-english-pear-100ml",
  "sulwhasoo-first-care-serum-90ml",
];

const targetKeywords = ["면세점 가격비교", "면세점 가격 비교", "면세점 가격 확인", "면세가격비교"];

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "면세점 가격 비교｜롯데·신라·신세계·현대 공개가 확인",
    description:
      "면세모아에서 향수, 뷰티, 위스키, 선물 상품의 면세점 공개가와 국내가 참고 정보를 비교하고 원본 면세점 링크로 최종 가격을 확인하세요.",
    path: "/price-compare",
    image: {
      path: DEFAULT_OG_IMAGE,
      alt: "면세점 가격 비교 DFMOA",
    },
  }),
};

export default function PriceComparePage() {
  const focusProducts = focusProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "면세점 가격 비교", path: "/price-compare" },
  ]);
  const itemListJsonLd = buildItemListJsonLd(
    focusProducts.map((product) => ({
      name: product.displayName,
      path: `/product/${product.slug}`,
    })),
    "면세점 가격 비교 대표 상품"
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
          <span>면세점 가격 비교</span>
        </div>

        <article className="surface-card content-hero-card">
          <span className="eyebrow">Duty Free Price Compare</span>
          <h1 className="page-title">면세점 가격 비교</h1>
          <p className="page-description">
            롯데·신라·신세계·현대면세점 공개가와 국내가 참고 정보를 비교하고, 원본 면세점 링크에서 최종 가격과
            수령 조건을 확인하세요.
          </p>
          <SearchForm />
          <div className="chip-row" style={{ marginTop: 16 }}>
            {targetKeywords.map((keyword) => (
              <Link key={keyword} className="chip is-soft" href={`/search?q=${encodeURIComponent(keyword)}`}>
                {keyword}
              </Link>
            ))}
          </div>
        </article>

        <div className="split-grid" style={{ marginTop: 12 }}>
          <article className="surface-card">
            <h2 className="card-title">가격 비교 시작 순서</h2>
            <div className="guide-body" style={{ marginTop: 9 }}>
              <section className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  1. 상품명과 용량을 맞춥니다
                </h3>
                <p className="section-copy">
                  향수, 뷰티, 위스키는 용량과 세트 구성이 다르면 다른 상품입니다. 브랜드명, 상품명, 용량을 함께
                  검색하세요.
                </p>
              </section>
              <section className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  2. 공개가와 혜택을 분리합니다
                </h3>
                <p className="section-copy">
                  공개 할인, 쿠폰, 적립금, 카드 할인은 적용 조건이 다릅니다. 가격 비교 후 원본 혜택 페이지에서
                  최종 조건을 확인하세요.
                </p>
              </section>
              <section className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1.05rem" }}>
                  3. 수령 공항과 출국 정보를 확인합니다
                </h3>
                <p className="section-copy">
                  같은 상품도 공항, 출국일, 재고 상태에 따라 구매 가능 여부가 달라집니다.
                </p>
              </section>
            </div>
          </article>

          <article className="surface-card">
            <h2 className="card-title">혜택과 함께 확인</h2>
            <p className="section-copy">
              GSC에서 클릭이 발생한 쿠폰 검색어는 혜택 콘텐츠와 가격 비교를 함께 보여줄 때 전환 가능성이 큽니다.
            </p>
            <div className="chip-row" style={{ marginTop: 12 }}>
              <Link className="chip is-demo" href="/deals/2026-04">
                2026년 4월 면세점 쿠폰·적립금
              </Link>
              <Link className="chip is-soft" href={`/benefit-reports/${latestBenefitReport.slug}`}>
                주간 혜택 리포트
              </Link>
              <Link className="chip is-soft" href="/best-seller-examples">
                인기 상품 추천 TOP 10
              </Link>
            </div>
          </article>
        </div>

        <section className="page-section is-compact">
          <div className="section-head">
            <div>
              <span className="eyebrow">Categories</span>
              <h2 className="section-title">카테고리별 면세점 가격 확인</h2>
              <p className="section-copy">
                향수, 뷰티, 주류, 선물 상품처럼 검색 수요가 있는 카테고리부터 가격 비교를 시작하세요.
              </p>
            </div>
          </div>
          <div className="chip-row">
            {categories.slice(0, 10).map((category) => (
              <Link key={category.slug} className="chip is-soft" href={`/category/${category.slug}`}>
                {category.name} 가격 비교
              </Link>
            ))}
          </div>
        </section>

        <ContentProductGrid products={focusProducts} title="가격 비교 우선 확인 상품" />
      </div>
    </section>
  );
}
