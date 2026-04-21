import type { Metadata } from "next";
import Link from "@/components/app-link";
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
import { getLowestPriceSummaries, getLowestPriceSummary, hasSnapshotPrice } from "@/lib/snapshot-summaries";
import { buildSeoMetadata, HOME_OG_IMAGE } from "@/lib/seo-metadata";
import { categories, guides, products, stores } from "@/lib/site-data";

const brandProofs = ["공개가 기준", "국내가 비교", "혜택 조건 분리"];

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "한국 면세점 최저가 비교 · 롯데·신라·신세계 공개가 한눈에",
    description: "면세모아에서 신라·롯데·신세계·현대 면세점 공개가와 국내가 참고 정보를 비교하고, 출국 전 원본 링크로 최종 가격을 확인하세요.",
    path: "/",
    image: {
      path: HOME_OG_IMAGE,
      alt: "한국 면세점 최저가 비교 DFMOA",
    },
  }),
};

export default function Home() {
  const featuredGuides = guides.slice(0, 3);
  const supportedStoreNames = stores.map((store) => store.name).join(", ");
  const priceSnapshotsByProductId = readPriceSnapshotsByProductId(products);
  const latestSnapshotTimestamp = Object.values(priceSnapshotsByProductId)
    .flatMap((snapshot) => Object.values(snapshot?.sources ?? {}).map((source) => source.fetchedAt).filter(Boolean))
    .sort()
    .at(-1);
  const latestSnapshotLabel = latestSnapshotTimestamp?.replace("T", " ").slice(0, 16) || "최근 확인 시각 없음";
  const pricedProducts = products.filter((product) => hasSnapshotPrice(priceSnapshotsByProductId[product.id]));
  const lowestPriceItems = getLowestPriceSummaries(products, priceSnapshotsByProductId, 6);
  const heroLowestPriceItems = lowestPriceItems.slice(0, 3);
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
  const popularSearchItems = popularSearchProducts.length ? popularSearchProducts : pricedProducts.slice(0, 4);
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
    <>
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
            <span className="eyebrow">DFMOA Price Radar</span>
            <h1 className="hero-title">면세가·국내가 비교</h1>
            <p className="hero-description">
              상품명과 용량만 넣으면 면세점 공개가, 국내 판매가, 혜택 링크를 한 화면에 정리합니다.
            </p>

            <SearchForm />

            <div className="brand-proof-strip" aria-label="DFMOA 비교 기준">
              {brandProofs.map((proof) => (
                <span key={proof}>{proof}</span>
              ))}
            </div>

            <div className="hero-actions">
              <Link className="chip is-demo" href="/benefits">
                할인·적립금
              </Link>
              <Link className="chip is-soft" href="/benefit-reports">
                주간 리포트
              </Link>
              <Link className="chip is-soft" href="/search">
                전체 최저가
              </Link>
            </div>

            {popularSearchItems.length ? (
              <div className="hero-search-terms" aria-label="지금 인기 검색어">
                <span>지금 인기 검색어</span>
                <div className="chip-row">
                  {popularSearchItems.map((product) => (
                    <Link key={product.id} className="chip" href={`/search?q=${encodeURIComponent(product.query)}`}>
                      {product.displayName}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {heroLowestPriceItems.length ? (
              <div className="hero-lowest-preview" aria-label="지금 최저가 3선">
                <div className="hero-lowest-preview-head">
                  <span>지금 최저가 3선</span>
                  <Link className="text-link" href="/search">
                    전체 보기
                  </Link>
                </div>
                <div className="hero-lowest-preview-list">
                  {heroLowestPriceItems.map((item) => (
                    <Link key={item.product.id} className="hero-lowest-preview-card" href={`/product/${item.product.slug}`}>
                      <SafeProductImage
                        src={item.imageUrl}
                        alt={`${item.product.brand} ${item.product.name} ${item.product.volume}`}
                        categorySlug={item.product.categorySlug}
                      />
                      <span>
                        <strong>{item.product.displayName}</strong>
                        <small>
                          {item.storeName} {item.priceLabel} · {item.timestamp || latestSnapshotLabel}
                        </small>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="hero-note">
              {supportedStoreNames}의 최근 확인 가능한 공개가와 공식 링크를 함께 제공합니다.
            </p>
            <p className="hero-note">가격 기준 시각: {latestSnapshotLabel} 자동 수집</p>
          </div>

          <div className="hero-panel panel home-usage-panel">
            <span className="eyebrow">How It Works</span>

            <div className="home-usage-steps">
              <div className="home-usage-step">
                <span>01</span>
                <strong>검색</strong>
                <small>브랜드 + 상품명 + 용량</small>
              </div>
              <div className="home-usage-step">
                <span>02</span>
                <strong>비교</strong>
                <small>면세가 · 국내가 · 이벤트</small>
              </div>
              <div className="home-usage-step">
                <span>03</span>
                <strong>확인</strong>
                <small>원본 링크에서 최종 결제</small>
              </div>
            </div>

            <Link className="ghost-button home-usage-link" href="/search">
              검색 시작
            </Link>
          </div>
        </div>
      </section>

      {lowestPriceItems.length ? (
        <section className="page-section is-tight today-lowest-section">
          <div className="container">
            <div className="section-head today-lowest-head">
              <div>
                <span className="eyebrow">기준: {latestSnapshotLabel} 자동 수집</span>
                <h2 className="section-title">오늘의 최저가 TOP 6</h2>
              </div>
              <Link className="ghost-button" href="/search">
                전체 가격 비교
              </Link>
            </div>

            <div className="today-lowest-grid">
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
                    <h3 className="card-title">{item.product.displayName}</h3>
                    <p className="today-lowest-price">
                      {item.storeName} · {item.priceLabel}
                    </p>
                    <p className="today-lowest-time">{item.timestamp || latestSnapshotLabel} 기준</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SavedProductsPanel products={products} />

      <section className="page-section is-compact">
        <div className="container">
          <Link className="weekly-benefit-banner" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            <strong>이번 주 면세 혜택</strong>
            <span>
              {latestBenefitReport.storeCount}사 {latestBenefitReport.sourceCount}개 링크 정리 ({latestBenefitReport.periodLabel} 기준)
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
              <p className="section-copy">가격 데이터가 충분한 카테고리는 크게 보여주고, 준비 중 카테고리는 별도 목록으로 분리했습니다.</p>
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
                <span className="text-link">가격 확인 상품 {pricedCount}개 보기</span>
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
              <h2 className="section-title">구매 전 가이드</h2>
              <p className="section-copy">면세 구매 전에 확인할 핵심 기준만 짧게 정리했습니다.</p>
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
    </>
  );
}
