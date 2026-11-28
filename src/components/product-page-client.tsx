"use client";

import { getPriceDisplay } from "@/lib/price-display";
import { startTransition, useEffect, useState } from "react";
import { BenefitApplicationPanel } from "@/components/benefit-application-panel";
import { CategoryTravelNotice } from "@/components/category-travel-notice";
import { ContentContextCard } from "@/components/content-context-card";
import { DomesticPricePanel } from "@/components/domestic-price-panel";
import { EffectivePriceCalculator } from "@/components/effective-price-calculator";
import Link from "@/components/app-link";
import { OfferTable } from "@/components/offer-table";
import { PriceHistoryPanel } from "@/components/price-history-panel";
import { PriceRangeSummary } from "@/components/price-range-summary";
import { PriceLoadingCard } from "@/components/price-loading-card";
import { FavoriteButton, RecentProductsTracker } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { SourceHealthPanel } from "@/components/source-health-panel";
import { SourcePriceStatusPanel } from "@/components/source-price-panel";
import { StoreStatusList } from "@/components/store-status-list";
import { trackEvent } from "@/lib/analytics";
import { buildDomesticPriceApiPath, buildSearchApiPath } from "@/lib/search-api-url";
import {
  buildSourcePrices,
  getAggregatePriceCopy,
  getAggregatePriceStatus,
  getPriceStatusLabel,
  getPriceStatusTone,
  getRoyalSaluteSearchLabel,
} from "@/lib/source-policy";
import type { DomesticPriceResult } from "@/lib/domestic-price-types";
import { formatKrw, formatUsd, getStoreById, type Product } from "@/lib/site-data";
import type { ContentContext } from "@/lib/context-content";
import type { SearchApiResponse } from "@/lib/search-types";

function getSearchErrorMessage() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "로컬에서는 netlify dev 기준으로 확인해 주세요.";
  }

  return "가격 정보를 불러오지 못했습니다.";
}

type ProductPageClientProps = {
  categoryName?: string;
  initialResult?: SearchApiResponse;
  product: Product;
  productContext?: ContentContext | null;
  relatedProducts: Product[];
};

export function ProductPageClient({
  categoryName,
  initialResult,
  product,
  productContext,
  relatedProducts,
}: ProductPageClientProps) {
  const [result, setResult] = useState<SearchApiResponse | null>(initialResult ?? null);
  const [isLoading, setIsLoading] = useState(!initialResult);
  const [error, setError] = useState<string | null>(null);
  const [domesticState, setDomesticState] = useState<{
    query: string;
    result: DomesticPriceResult | null;
    error: string | null;
  }>({
    query: "",
    result: null,
    error: null,
  });

  useEffect(() => {
    if (initialResult) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    fetch(buildSearchApiPath(product.query, { productId: product.slug }), {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return (await response.json()) as SearchApiResponse;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setResult(data);
          setIsLoading(false);
          setError(null);
        });
      })
      .catch((fetchError: unknown) => {
        if (cancelled || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }

        startTransition(() => {
          setResult(null);
          setIsLoading(false);
          setError(getSearchErrorMessage());
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [initialResult, product.query, product.slug]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetch(buildDomesticPriceApiPath(product.query, { productId: product.slug }), {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return (await response.json()) as DomesticPriceResult;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setDomesticState({
            query: product.query,
            result: data,
            error: null,
          });
        });
      })
      .catch((fetchError: unknown) => {
        if (cancelled || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }

        startTransition(() => {
          setDomesticState({
            query: product.query,
            result: null,
            error: "국내 판매가를 불러오지 못했습니다.",
          });
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [product.query, product.slug]);

  const offers = result?.offers ?? [];
  const statuses = result?.statuses ?? [];
  const { storeCount, representative: lowestOffer } = getPriceDisplay(offers);
  const domesticResult = domesticState.query === product.query ? domesticState.result : null;
  const domesticError = domesticState.query === product.query ? domesticState.error : null;
  const isDomesticLoading = domesticState.query !== product.query;
  const bestStore = lowestOffer ? getStoreById(lowestOffer.storeId) : undefined;
  const searchLabel = getRoyalSaluteSearchLabel(product.slug, lowestOffer?.sourceUrl);
  const sourcePrices = buildSourcePrices({ offers, statuses, query: product.query });
  const isChanelEdp = product.slug === "bleu-de-chanel-edp-100ml";
  const calculatorPrices = isChanelEdp ? sourcePrices.map((source) =>
    source.sourceId === "lotte" && (source.price == null || source.status === "low_confidence")
      ? { ...source, price: 205433, currency: "KRW" as const, fetchedAt: "2026-11-28T23:21:00+09:00",
          message: "2026년 11월 28일 23:21(KST) 공식 상품 페이지에서 확인한 판매가 기준",
          status: "manual_only" as const }
      : source
  ) : sourcePrices;
  const aggregateStatus = getAggregatePriceStatus(sourcePrices);
  const aggregateCopy = getAggregatePriceCopy(sourcePrices);
  const showCollectionUnavailableNotice = !isLoading && !offers.length;
  const storeCards = statuses.map((status) => {
    const store = getStoreById(status.storeId);

    return {
      key: status.storeId,
      href: status.searchUrl,
      name: store?.name ?? status.storeId,
      shortName: store?.shortName ?? status.storeId,
      logoUrl: store?.logoUrl,
      accent: store?.accent,
      description: status.message,
      state: status.state,
      count: status.offerCount,
      eventBadges: status.eventBadges,
    };
  });

  return (
    <div className="detail-grid">
      <RecentProductsTracker product={product} />
      <div>
        {!isChanelEdp && <span className="eyebrow" style={{ marginTop: 20 }}>Product detail</span>}
        <h1 className={isChanelEdp ? "fragrance-heading" : "page-title"}>{product.query}{product.slug === "estee-lauder-anr-100ml" ? " 면세점 가격 비교" : " 면세 가격"}</h1>
        <p className="section-copy">{product.displayName}</p>
        {!isChanelEdp && <p className="page-description">{product.summary}</p>}
        {isChanelEdp && (
          <section className="surface-card fragrance-comparison" aria-labelledby="chanel-observed-prices">
            <h2 className="card-title" id="chanel-observed-prices">롯데·신라 면세 가격과 할인 조건</h2>
            <p className="fragrance-spec">100ml 스프레이 1병 · 품번 107360</p>
            <div className="fragrance-stores">
            {[
              { store: "lotte", name: "롯데", label: "판매가", note: "샤넬 제품에는 쿠폰 할인과 적립금이 적용되지 않으며 구매금액별 사은행사에서도 제외됩니다.", url: "https://kor.lottedfs.com/kr/product/productDetail?prdNo=10002012173" },
              { store: "shilla", name: "신라", label: "정상가", note: "상품 상세에는 정상가만 표시됐습니다. 회원·쿠폰 추가 할인 여부는 주문 시 확인하세요.", url: "https://m.shilladfs.com/estore/kr/ko/p/370545" },
            ].map(({ store, name, label, note, url }) => (
              <div key={store} className="fragrance-store">
                <h3>{name}면세점</h3>
                <div className="fragrance-price"><strong>US$153</strong><span>{label} · 205,433원</span></div>
                <p>{note}</p>
                <a className="fragrance-official" href={url} target="_blank" rel="noreferrer"
                  onClick={() => trackEvent("outbound_click_store", {
                    store, product_id: product.id, product_slug: product.slug, price_krw: 205433,
                    source_status: "editorial_observation", page_type: "product", cta_type: "official_product",
                  })}>{name} 공식몰에서 확인 <span aria-hidden="true">↗</span></a>
              </div>
            ))}
            </div>
            <footer className="fragrance-actions">
              <small>한국어 공식몰 확인 · <time dateTime="2026-11-28T23:21:00+09:00">2026.11.28 23:21 KST</time></small>
              {!isLoading && !error && <a className="button is-primary" href="#effective-price">예상 결제액 계산</a>}
            </footer>
          </section>
        )}
        {product.slug === "estee-lauder-anr-100ml" ? (
          <a className="button is-secondary" href="#public-prices">면세점별 공개가와 공식몰 보기</a>
        ) : null}

        <div className="chip-row" style={{ marginTop: 16 }}>
          {categoryName ? <span className="chip">{categoryName}</span> : null}
          <span className="chip is-soft">{product.badge}</span>
          <span className="chip is-soft">{product.query}</span>
        </div>

        {showCollectionUnavailableNotice ? (
          <div className="product-collection-status" role="status">
            <strong>현재 신라/신세계 면세점에서 공개가를 확인할 수 없는 상품입니다.</strong>
            <span>공식 검색 링크를 통해 원본 면세점에서 직접 확인해 주세요.</span>
          </div>
        ) : null}

        {productContext ? (
          <ContentContextCard context={productContext} title="상품 배경과 면세 구매 체크" />
        ) : null}

        <div id="public-prices" className="surface-card" style={{ marginTop: 10 }}>
          <div className="section-head">
            <div>
              <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
                최근 확인 공개가
              </h2>
              <p className="section-copy" style={{ marginTop: 6 }}>
                최종 결제가는 면세점 원본에서 확인해 주세요.
              </p>
            </div>
          </div>

          <p className="section-copy" style={{ marginTop: 4 }}>
            가격 기준 시각: {result?.searchedAt ?? "최근 확인 시각 없음"} 기준
          </p>

          {isLoading ? <PriceLoadingCard description="면세점별 공개가와 혜택 태그를 확인하고 있습니다." /> : null}
          {error ? (
            <div className="empty-state search-state-card">
              <strong>{error}</strong>
              <span>공식 면세점 링크에서 현재 판매 여부를 확인해 주세요.</span>
              <SourcePriceStatusPanel sourcePrices={sourcePrices} query={product.query} showIntro={false} product={product} />
            </div>
          ) : null}

          {!isLoading && !error ? (
            <>
              {result?.summary && offers.length ? <PriceRangeSummary summary={result.summary} offers={offers} /> : null}
              <SourcePriceStatusPanel sourcePrices={sourcePrices} query={product.query} product={product} />
              {offers.length ? <BenefitApplicationPanel offers={offers} productSlug={product.slug} /> : null}
              {offers.length ? <OfferTable offers={offers} productSlug={product.slug} showAd /> : null}
            </>
          ) : null}
        </div>

        {product.slug === "royal-salute-21-700ml" && (
          <section className="surface-card">
            <h2 className="card-title">제주항공 국제선 기내에서 살 때</h2>
            <p>롯데기내면세점의 로얄살루트 21년 시그니처 블렌드 700ml 한 병은
              2026년 10~11월 카탈로그 기준 <strong>162,000원(US$122)</strong>입니다.
              정상가 US$174에서 30% 할인한 표시가입니다.</p>
            <p className="section-copy">11월 28일 확인한 한국어 카탈로그 가격입니다.
              탑승편의 판매 여부와 결제 가격을 확인하세요. 온라인 면세점 상품과
              에디션·포장 및 인도 조건이 일치하는지는 확인이 필요합니다.</p>
            <a href="https://static.jejuair.net/cms/images/pdf/20260928172426817.pdf">
              제주항공 공식 기내 면세 카탈로그 35쪽 확인
            </a>
          </section>
        )}

        {!isLoading && !error ? (
          <EffectivePriceCalculator product={product} sourcePrices={calculatorPrices} />
        ) : null}


        {!isLoading && !error ? (
          <DomesticPricePanel
            domestic={domesticResult}
            dutyFreeLowestOffer={lowestOffer}
            error={domesticError}
            isLoading={isDomesticLoading}
            product={product}
            query={product.query}
          />
        ) : null}

        {!isLoading && !error ? <PriceHistoryPanel history={result?.history} /> : null}

        <div className="split-grid" style={{ marginTop: 10 }}>
          <div className="surface-card">
            <p className="panel-title">연결 상태</p>
            <div style={{ marginTop: 8 }}>
              {storeCards.length ? <StoreStatusList items={storeCards} /> : null}
              {!isLoading && !storeCards.length ? (
                <p className="empty-state">연결 결과가 없습니다.</p>
              ) : null}
            </div>
          </div>

          <div className="surface-card">
            <p className="panel-title">관련 상품</p>
            <div className="subgrid" style={{ marginTop: 8 }}>
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.slug}`} className="list-item">
                  <span className="list-number">{relatedProduct.brand}</span>
                  <p className="list-copy">
                    <strong>{relatedProduct.displayName}</strong>
                    {relatedProduct.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="split-grid" style={{ marginTop: 10 }}>
          <CategoryTravelNotice categorySlug={product.categorySlug} />
          {!isLoading && !error ? <SourceHealthPanel sourceHealth={result?.sourceHealth ?? []} /> : null}
        </div>
      </div>

      <aside className="sticky-panel">
        <div className="meta-panel">
          <div className="detail-product-visual">
            <SafeProductImage
              src={lowestOffer?.imageUrl}
              alt={`${product.displayName} 대표 이미지`}
              categorySlug={product.categorySlug}
            />
          </div>
          <div className="meta-action-row">
            <span className={`status-chip ${getPriceStatusTone(aggregateStatus)}`}>
              {getPriceStatusLabel(aggregateStatus)}
            </span>
            <FavoriteButton product={product} />
          </div>
          <p className="meta-kicker">{storeCount > 1 ? "최저 확인가" : lowestOffer ? "최근 확인가" : "공개가 상태"}</p>
          <p className={`meta-value${lowestOffer ? "" : " is-state"}`}>
            {lowestOffer ? formatKrw(lowestOffer.krwPrice) : aggregateCopy.title}
          </p>
          <p className="price-subtle">
            {lowestOffer
              ? `${formatUsd(lowestOffer.usdPrice)} · 가격 기준 시각: ${lowestOffer.updatedAt}`
              : "공식 면세점 링크에서 직접 확인"}
          </p>

          <div className="meta-list">
            <div className="meta-item">
              <span>면세점</span>
              <strong>{bestStore?.name ?? "원본 확인 필요"}</strong>
            </div>
            <div className="meta-item">
              <span>공항</span>
              <strong>{lowestOffer?.pickupAirports.join(" · ") || "원본에서 확인"}</strong>
            </div>
            <div className="meta-item">
              <span>검색어</span>
              <strong>{product.query}</strong>
            </div>
          </div>

          {lowestOffer ? (
            <a
              className="button"
              href={lowestOffer.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={searchLabel ? () => trackEvent("outbound_click_store", {
                store: lowestOffer.storeId,
                product_id: product.id,
                product_slug: product.slug,
                price_krw: lowestOffer.krwPrice,
                source_status: lowestOffer.status,
                page_type: "product",
                cta_type: "official_search",
              }) : undefined}
            >
              {searchLabel ?? "원본에서 확인"}
            </a>
          ) : null}

          <Link className="ghost-button" href={`/search?q=${encodeURIComponent(product.query)}`}>
            검색 결과
          </Link>
        </div>
      </aside>
    </div>
  );
}
