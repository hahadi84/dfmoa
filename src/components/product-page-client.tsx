"use client";

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
import { PriceAlertForm } from "@/components/price-alert-form";
import { FavoriteButton, RecentProductsTracker } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { SourceHealthPanel } from "@/components/source-health-panel";
import { SourcePriceStatusPanel } from "@/components/source-price-panel";
import { StoreStatusList } from "@/components/store-status-list";
import { buildDomesticPriceApiPath, buildSearchApiPath } from "@/lib/search-api-url";
import {
  buildSourcePrices,
  getAggregatePriceCopy,
  getAggregatePriceStatus,
  getPriceStatusLabel,
  getPriceStatusTone,
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
  const lowestOffer = offers[0];
  const domesticResult = domesticState.query === product.query ? domesticState.result : null;
  const domesticError = domesticState.query === product.query ? domesticState.error : null;
  const isDomesticLoading = domesticState.query !== product.query;
  const bestStore = lowestOffer ? getStoreById(lowestOffer.storeId) : undefined;
  const sourcePrices = buildSourcePrices({ offers, statuses, query: product.query });
  const aggregateStatus = getAggregatePriceStatus(sourcePrices);
  const aggregateCopy = getAggregatePriceCopy(sourcePrices);
  const showCollectionUnavailableNotice = !isLoading && !offers.length;
  const contextLead =
    productContext?.sections.find((section) => section.body.length)?.body[0] ?? product.summary;
  const editorialNotes = [
    {
      title: "이 상품을 먼저 봐야 하는 이유",
      body: contextLead,
    },
    {
      title: "가격표 전에 확인할 점",
      body: `${categoryName ?? "해당 카테고리"}는 수령 공항, 적용 가능한 혜택, 세트 구성 차이로 실제 체감 가격이 달라질 수 있어서, headline 최저가보다 기준 시각과 상품 구성 일치 여부를 먼저 보는 편이 안전합니다.`,
    },
    {
      title: "최저가 해석 기준",
      body: "표에 보이는 숫자는 비교 출발점입니다. 먼저 소스 상태와 가격 범위를 함께 보고, 마지막에는 면세점 원문 페이지에서 결제 조건과 수령 가능 여부를 다시 확인해야 실제 구매 판단에 가깝습니다.",
    },
  ];
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
        <span className="eyebrow" style={{ marginTop: 20 }}>
          상품 상세
        </span>
        <h1 className="page-title">{product.displayName}</h1>
        <p className="page-description">{product.summary}</p>
        <p className="section-copy" style={{ marginTop: 10 }}>
          롯데·신라·신세계·현대면세점 공개가와 원본 확인 링크를 함께 비교합니다.
        </p>

        <div className="chip-row" style={{ marginTop: 16 }}>
          {categoryName ? <span className="chip">{categoryName}</span> : null}
          <span className="chip is-soft">{product.badge}</span>
          <span className="chip is-soft">{product.query}</span>
          <Link className="chip is-demo" href="/price-compare">
            면세점 가격 비교
          </Link>
          <Link className="chip is-soft" href="/deals/2026-04">
            4월 쿠폰·적립금
          </Link>
          <Link className="chip is-soft" href="/benefit-reports/2026-04-week-4-duty-free-benefits">
            이번 주 혜택
          </Link>
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

        <article className="surface-card" style={{ marginTop: 10 }}>
          <span className="eyebrow">비교 요약</span>
          <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
            가격표 전에 먼저 읽을 핵심 요약
          </h2>
          <div className="guide-body" style={{ marginTop: 10 }}>
            {editorialNotes.map((note) => (
              <section key={note.title} className="guide-section">
                <h3 className="card-title" style={{ fontSize: "1rem" }}>
                  {note.title}
                </h3>
                <p className="section-copy">{note.body}</p>
              </section>
            ))}
          </div>
        </article>

        <div className="surface-card" style={{ marginTop: 10 }}>
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
              {result?.summary && offers.length ? <PriceRangeSummary summary={result.summary} /> : null}
              <SourcePriceStatusPanel sourcePrices={sourcePrices} query={product.query} product={product} />
              {offers.length ? <BenefitApplicationPanel offers={offers} /> : null}
              {offers.length ? <OfferTable offers={offers} productSlug={product.slug} /> : null}
            </>
          ) : null}
        </div>

        {!isLoading && !error ? (
          <EffectivePriceCalculator product={product} sourcePrices={sourcePrices} />
        ) : null}

        {!isLoading && !error ? (
          <div className="surface-card" style={{ marginTop: 10 }}>
            <PriceAlertForm product={product} source="product_detail" />
          </div>
        ) : null}

        {!isLoading && !error ? <PriceHistoryPanel history={result?.history} /> : null}

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
          <p className="meta-kicker">{lowestOffer ? "최저 확인가" : "공개가 상태"}</p>
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
            <a className="button" href={lowestOffer.sourceUrl} target="_blank" rel="noreferrer">
              원본에서 확인
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
