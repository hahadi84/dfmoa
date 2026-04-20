import type { Metadata } from "next";
import Link from "@/components/app-link";
import { FeaturedProductGrid } from "@/components/featured-product-grid";
import { SavedProductsPanel } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { SearchForm } from "@/components/search-form";
import { bestSellerExampleNotice, storeBestSellerExamples } from "@/lib/best-seller-examples";
import { latestBenefitReport } from "@/lib/benefit-report-generator";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  serializeJsonLd,
} from "@/lib/json-ld";
import { formatSnapshotTimestamp, getSnapshotBestItem } from "@/lib/price-snapshot-view";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";
import { buildSeoMetadata, HOME_OG_IMAGE } from "@/lib/seo-metadata";
import {
  categories,
  featureSearches,
  formatKrw,
  guides,
  getStoreById,
  products,
  stores,
} from "@/lib/site-data";

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
  const latestSnapshotLabel = formatSnapshotTimestamp(latestSnapshotTimestamp) || "최근 확인 시각 없음";
  const lowestPriceItems = products
    .flatMap((product) => {
      const snapshot = priceSnapshotsByProductId[product.id];
      const bestItem = getSnapshotBestItem(snapshot);
      const priceKrw = Number(bestItem?.item.priceKrw ?? 0);

      if (!bestItem || !priceKrw) {
        return [];
      }

      const store = getStoreById(bestItem.sourceId);

      return [
        {
          product,
          storeName: store?.shortName ?? bestItem.sourceId,
          priceKrw,
          imageUrl: bestItem.item.imageUrl ?? null,
          timestamp: formatSnapshotTimestamp(bestItem.source.fetchedAt ?? bestItem.item.fetchedAt),
        },
      ];
    })
    .sort((left, right) => left.priceKrw - right.priceKrw)
    .slice(0, 6);

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
                할인·적립금 이벤트
              </Link>
              <Link className="chip is-soft" href="/benefit-reports">
                주간 혜택 리포트
              </Link>
              <Link className="chip is-soft" href="/best-seller-examples">
                베스트10 추천 예시
              </Link>
              {featureSearches.map((searchText) => (
                <Link
                  key={searchText}
                  className="chip"
                  href={`/search?q=${encodeURIComponent(searchText)}`}
                >
                  {searchText}
                </Link>
              ))}
            </div>

            <p className="hero-note">
              {supportedStoreNames}의 최근 확인 가능한 공개가와 공식 링크를 함께 제공합니다.
            </p>
            <p className="hero-note">가격 기준 시각: {latestSnapshotLabel} 자동 수집</p>
          </div>

          <div className="hero-panel panel home-usage-panel">
            <span className="eyebrow">How It Works</span>
            <h2 className="card-title">3단계로 비교</h2>
            <p className="section-copy">검색어 하나로 가격, 국내가, 혜택 조건을 순서대로 확인합니다.</p>

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
            <Link className="ghost-button home-usage-link" href="/benefits">
              혜택 모아보기
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
                      {item.storeName} · {formatKrw(item.priceKrw)}
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

      <section className="page-section">
        <div className="container">
          <article className="surface-card report-feature-card">
            <div>
              <span className="eyebrow">Weekly Benefit Brief</span>
              <h2 className="section-title" style={{ fontSize: "2rem", marginTop: 10 }}>
                이번 주 면세점 혜택 정리
              </h2>
              <p className="section-copy">
                쿠폰, 적립금, 카드 할인, 브랜드 행사를 공식 링크와 확인할 점 중심으로 정리했습니다.
              </p>
            </div>
            <div className="report-metric-strip">
              <span>{latestBenefitReport.storeCount}개 면세점</span>
              <span>{latestBenefitReport.sourceCount}개 혜택 링크</span>
              <span>{latestBenefitReport.periodLabel}</span>
            </div>
            <Link className="button" href={`/benefit-reports/${latestBenefitReport.slug}`}>
              리포트 보기
            </Link>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Recommendation Example</span>
              <h2 className="section-title">면세점별 베스트10 추천 예시</h2>
              <p className="section-copy">{bestSellerExampleNotice}</p>
            </div>
            <Link className="ghost-button" href="/best-seller-examples">
              전체 보기
            </Link>
          </div>

          <div className="best-preview-grid">
            {storeBestSellerExamples.map((storeExample) => (
              <Link key={storeExample.storeId} className="best-preview-card" href="/best-seller-examples">
                <span className="benefit-logo-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={storeExample.logoUrl} alt={`${storeExample.storeName} 로고`} loading="lazy" />
                </span>
                <div className="best-preview-copy">
                  <span className="chip is-soft">추천 예시 TOP 10</span>
                  <h3 className="card-title">{storeExample.storeName}</h3>
                </div>
                <div className="chip-row">
                  {storeExample.items.slice(0, 3).map((item) => (
                    <span key={item.product.slug} className="chip is-soft">
                      {item.product.displayName}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Popular Categories</span>
              <h2 className="section-title">인기 카테고리</h2>
              <p className="section-copy">자주 비교하는 면세 품목을 10개로 정리했습니다.</p>
            </div>
          </div>

          <div className="cards-grid">
            {categories.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="store-card category-card">
                <span className="chip is-soft">{category.name}</span>
                <div className="store-meta">
                  <div className="store-name-row">
                    <h3 className="card-title">{category.headline}</h3>
                    <span className="text-link">보기</span>
                  </div>
                  <p className="section-copy">{category.intro}</p>
                </div>
                <div className="chip-row">
                  {category.keywords.slice(0, 3).map((keyword) => (
                    <span key={keyword} className="chip is-soft">
                      {keyword}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div>
            <span className="eyebrow">Popular Searches</span>
            <h2 className="section-title">자주 찾는 상품</h2>
            <p className="section-copy">대표 상품을 바로 열어 면세가와 국내가를 비교합니다.</p>

            <FeaturedProductGrid products={products} priceSnapshotsByProductId={priceSnapshotsByProductId} />
          </div>
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
