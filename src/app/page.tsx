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
  const homeEditorialNotes = [
    {
      title: "DFMOA를 어떻게 봐야 하나요",
      body: `DFMOA는 ${supportedStoreNames} 공개가와 국내가 비교 흐름을 한 화면에서 정리하지만, 숫자만 빠르게 나열하는 대신 실제 구매 판단에 필요한 기준 시각과 원문 확인 동선을 함께 보여주는 것을 목표로 합니다.`,
    },
    {
      title: "최저가보다 먼저 확인할 기준",
      body: `현재 가격 스냅샷이 잡힌 상품은 ${pricedProducts.length}개이며, 카테고리마다 비교 가능한 상품 수가 다릅니다. 따라서 headline 최저가보다 기준 시각, 검색어 일치, 공항 수령 가능 여부를 먼저 보는 편이 안전합니다.`,
    },
    {
      title: "실구매 판단은 이렇게 하세요",
      body: "홈에서는 비교 출발점만 빠르게 좁히고, 실제 결제 전에는 상품 상세에서 가격 범위, 혜택 조건, 국내가 비교를 함께 확인한 뒤 면세점 원문 페이지에서 최종 조건을 다시 확인하는 순서가 적절합니다.",
    },
  ];

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

            <div className="hero-chip-strip">
              <div className="brand-proof-strip" aria-label="DFMOA 비교 기준">
                {brandProofs.map((proof) => (
                  <span key={proof}>{proof}</span>
                ))}
              </div>

              <div className="hero-actions">
                <Link className="chip is-demo" href="/price-compare">
                  면세점 가격 비교
                </Link>
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
            </div>

            <article className="surface-card" style={{ marginTop: 16 }}>
              <span className="eyebrow">홈 비교 요약</span>
              <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
                검색 전에 먼저 읽을 핵심 해설
              </h2>
              <div className="guide-body" style={{ marginTop: 10 }}>
                {homeEditorialNotes.map((note) => (
                  <section key={note.title} className="guide-section">
                    <h3 className="card-title" style={{ fontSize: "1rem" }}>
                      {note.title}
                    </h3>
                    <p className="section-copy">{note.body}</p>
                  </section>
                ))}
              </div>
            </article>

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

            <div className="hero-meta-line">
              <span className="hero-note">
                {supportedStoreNames}의 최근 확인 가능한 공개가와 공식 링크를 함께 제공합니다.
              </span>
              <span className="hero-note">가격 기준 시각: {latestSnapshotLabel} 자동 수집</span>
            </div>
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
          <Link className="weekly-benefit-banner" href="/deals/2026-06">
            <strong>2026년 6월 면세점 쿠폰·적립금 혜택</strong>
            <span>
              신세계·신라·롯데·현대면세점 6월 1주차 쿠폰, 적립금, 카드 할인 확인
            </span>
            <span className="text-link">월간 혜택 보기 →</span>
          </Link>
        </div>
      </section>

      <section className="page-section is-compact">
        <div className="container">
          <Link className="weekly-benefit-banner" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            <strong>이번 주 면세 혜택 리포트</strong>
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
              <span className="eyebrow">카테고리 비교</span>
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

          {false && readyCategorySummaries.length ? (
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
              <span className="eyebrow">구매 가이드</span>
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
