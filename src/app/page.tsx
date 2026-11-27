import type { Metadata } from "next";
import "./airport-home.css";
import Link from "@/components/app-link";
import { PriceCompareProductLinks } from "@/components/price-compare-product-links";
import { SavedProductsPanel } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { SearchForm } from "@/components/search-form";
import { latestBenefitReport } from "@/lib/benefit-report-generator";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from "@/lib/json-ld";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";
import { getLowestPriceSummary, hasSnapshotPrice } from "@/lib/snapshot-summaries";
import { buildSeoMetadata, HOME_OG_IMAGE } from "@/lib/seo-metadata";
import { categories, guides, products, type Product } from "@/lib/site-data";
import { getHomePriceList } from "@/lib/home-price-list";

function homePriceLinkLabel(product: Product) {
  return product.slug === "royal-salute-21-700ml"
    ? `${product.query} 면세 가격`
    : product.displayName;
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "면세점 가격 비교 | 위스키·향수·화장품 상품 검색",
    description: "위스키·향수·화장품을 상품명과 용량으로 검색하세요. 면세모아에서 면세점별 공개 가격과 확인 시각을 비교하고, 판매처에서 할인 조건과 최종 결제액을 확인할 수 있습니다.",
    path: "/",
    image: {
      path: HOME_OG_IMAGE,
      alt: "면세점 가격비교 면세모아",
    },
  }),
  alternates: { canonical: "/", languages: { ko: "/", en: "/en", ja: "/ja", "zh-Hans": "/zh" } },
};

export default function Home() {
  const featuredGuides = guides.slice(0, 3);
  const priceSnapshotsByProductId = readPriceSnapshotsByProductId(products);
  const latestSnapshotTimestamp = Object.values(priceSnapshotsByProductId)
    .flatMap((snapshot) => Object.values(snapshot?.sources ?? {})
      .filter((source) => source.items?.some((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0))
      .map((source) => source.fetchedAt).filter(Boolean))
    .sort()
    .at(-1);
  const latestSnapshotLabel = latestSnapshotTimestamp?.replace("T", " ").slice(0, 16) || "최근 확인 시각 없음";
  const pricedProducts = products.filter((product) => hasSnapshotPrice(priceSnapshotsByProductId[product.id]));
  const { lowestPriceItems, hasSearchDemand, demandRows, hasRankedPrices } = getHomePriceList(priceSnapshotsByProductId);
  const royalSalute = products.find((product) => product.slug === "royal-salute-21-700ml");
  const preferredSearchSlugs = [
    "creed-aventus-50ml",
    "sulwhasoo-first-care-serum-90ml",
    "glenfiddich-15-700ml",
    "jo-malone-english-pear-100ml",
  ];
  const popularSearchProducts = preferredSearchSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is (typeof products)[number] =>
      Boolean(product && hasSnapshotPrice(priceSnapshotsByProductId[product.id]))
    );
  const rankedSearchProducts = hasSearchDemand ? demandRows
    .map((row) => products.find((product) => product.slug === row.productSlug))
    .filter((product): product is (typeof products)[number] => Boolean(product)).slice(0, 4) : [];
  const popularSearchItems = rankedSearchProducts.length ? rankedSearchProducts :
    popularSearchProducts.length ? popularSearchProducts : pricedProducts.slice(0, 4);
  const searchHeading = rankedSearchProducts.length ? "최근 7일 인기 검색어" : "추천 검색어";
  const categorySummaries = categories.map((category) => {
    const categoryProducts = products.filter((product) => product.categorySlug === category.slug);
    const lowestItem = categoryProducts
      .flatMap((product) => {
        const item = getLowestPriceSummary(product, priceSnapshotsByProductId[product.id]);
        return item ? [item] : [];
      })
      .sort((left, right) => left.priceKrw - right.priceKrw)[0];
    const pricedCount = categoryProducts.filter((product) => hasSnapshotPrice(priceSnapshotsByProductId[product.id])).length;

    return {
      category,
      lowestItem,
      pricedCount,
    };
  });
  const activeCategorySummaries = categorySummaries.filter((item) => item.pricedCount >= 3);
  const readyCategorySummaries = categorySummaries.filter((item) => item.pricedCount < 3);

  return (
    <div className="airport-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            buildOrganizationJsonLd(),
            buildWebsiteJsonLd(),
            buildBreadcrumbJsonLd([{ name: "홈", path: "/" }]),
          ]),
        }}
      />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">면세점 가격 비교</h1>
            <p className="hero-description">위스키·향수·화장품을 검색하고 같은 용량의 면세 가격을 비교하세요.</p>
            <SearchForm />
            {royalSalute && (
              <PriceCompareProductLinks homePlacement="search">
                <Link className="text-link home-product-shortcut" href={`/product/${royalSalute.slug}`}>
                  {homePriceLinkLabel(royalSalute)}
                </Link>
              </PriceCompareProductLinks>
            )}

            {!lowestPriceItems.length && popularSearchItems.length ? (
              <div className="hero-search-terms" aria-label={searchHeading}>
                <span>{searchHeading}</span>
                <div className="chip-row">
                  {popularSearchItems.map((product) => (
                    <Link key={product.id} className="chip" href={`/search?q=${encodeURIComponent(product.query)}`}>
                      {product.displayName}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </section>

      {lowestPriceItems.length ? (
        <section className="page-section is-tight today-lowest-section">
          <div className="container">
            <div className="section-head today-lowest-head">
              <div>
                <span className="eyebrow">기준: {latestSnapshotLabel} 자동 수집</span>
                <h2 className="section-title">{hasRankedPrices ? "인기검색 상품 최근 가격" : "최근 확인한 면세 가격"}</h2>
              </div>
              <Link className="ghost-button" href="/search">
                전체 상품 검색
              </Link>
            </div>

            <PriceCompareProductLinks className="today-lowest-grid" homePlacement="recent_prices">
              {lowestPriceItems.map((item) => (
                <Link key={item.product.id} className="today-lowest-card" href={`/product/${item.product.slug}`}>
                  <div className="today-lowest-image">
                    <SafeProductImage
                      src={item.imageUrl}
                      alt={`${item.product.brand} ${item.product.name} ${item.product.volume}`}
                      categorySlug={item.product.categorySlug}
                    />
                  </div>
                  <div className="today-lowest-copy">
                    <h3 className="card-title">{homePriceLinkLabel(item.product)}</h3>
                    <p className="today-lowest-price">
                      {item.priceLabel}
                    </p>
                    <p className="today-lowest-time">{item.storeName} · {item.timestamp || latestSnapshotLabel} 기준</p>
                  </div>
                </Link>
              ))}
            </PriceCompareProductLinks>
          </div>
        </section>
      ) : null}

      <SavedProductsPanel products={products} />

      <section className="page-section is-compact">
        <div className="container">
          <Link className="weekly-benefit-banner" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            <strong>이번 주 면세 혜택</strong>
            <span>
              {latestBenefitReport.storeCount}사 {latestBenefitReport.sourceCount}개 기간 확인 행사 ({latestBenefitReport.periodLabel})
            </span>
            <span className="text-link">리포트 보기 →</span>
          </Link>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Popular Categories</span>
              <h2 className="section-title">인기 카테고리</h2>
              <p className="section-copy">관측 가격이 있는 카테고리를 안내합니다. 매주 공개되는 과거 관측값으로, 실제 결제 가격은 판매처에서 확인하세요.</p>
            </div>
          </div>

          <div className="category-active-grid">
            {activeCategorySummaries.map(({ category, lowestItem, pricedCount }) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="category-active-card">
                <span className="chip is-soft">{category.name}</span>
                <h3 className="card-title">{category.headline}</h3>
                <p className="section-copy">{category.intro}</p>
                <div className="category-lowest-line">
                  {lowestItem ? (
                    <span className="category-lowest-product-card">
                      <span className="category-lowest-product-image">
                        <SafeProductImage
                          src={lowestItem.imageUrl}
                          alt={`${lowestItem.product.brand} ${lowestItem.product.name} ${lowestItem.product.volume}`}
                          categorySlug={lowestItem.product.categorySlug}
                        />
                      </span>
                      <span className="category-lowest-product-copy">
                        <strong>{lowestItem.product.displayName}</strong>
                        <span>
                          {lowestItem.storeName} · {lowestItem.priceLabel}
                        </span>
                        <small>{lowestItem.timestamp || latestSnapshotLabel} 기준</small>
                      </span>
                    </span>
                  ) : null}
                </div>
                <span className="text-link">관측 가격 상품 {pricedCount}개 보기</span>
              </Link>
            ))}
          </div>

          {readyCategorySummaries.length ? (
            <div className="category-ready-row">
              <strong>준비 중 카테고리</strong>
              <div className="chip-row">
                {readyCategorySummaries.map(({ category, pricedCount }) => (
                  <Link key={category.slug} className="chip is-soft" href={`/category/${category.slug}`}>
                    {category.name} · 준비 중 {pricedCount}/3
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Guides</span>
              <h2 className="section-title">일본 여행, 쇼핑 전에 비교하세요</h2>
              <p className="section-copy">엔화 환산 비용부터 면세 환급까지 확인하세요. <Link href="/japan">엔화 계산기 열기</Link></p>
            </div>
          </div>

          <div className="three-grid">
            {featuredGuides.map((guide) => (
              <Link key={guide.slug} href={`/guide/${guide.slug}`} className="guide-card">
                <span className="chip is-soft">Guide</span>
                <h3 className="card-title">{guide.title}</h3>
                <p className="section-copy">{guide.excerpt}</p>
                <span className="text-link">보기</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
