"use client";

import { startTransition, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BenefitApplicationPanel } from "@/components/benefit-application-panel";
import { DomesticPricePanel } from "@/components/domestic-price-panel";
import Link from "@/components/app-link";
import { OfferTable } from "@/components/offer-table";
import { PriceRangeSummary } from "@/components/price-range-summary";
import { PriceLoadingCard } from "@/components/price-loading-card";
import { SearchForm } from "@/components/search-form";
import { OfficialSourceLinks, SourcePriceStatusPanel } from "@/components/source-price-panel";
import { StoreStatusList } from "@/components/store-status-list";
import { buildDomesticPriceApiPath, buildSearchApiPath } from "@/lib/search-api-url";
import type { DomesticPriceResult } from "@/lib/domestic-price-types";
import { categories, featureSearches, getStoreById, searchProducts, stores } from "@/lib/site-data";
import {
  buildSourcePrices,
  getAggregatePriceCopy,
  getAggregatePriceStatus,
  getComparableSourcePrices,
  getPriceStatusLabel,
  getPriceStatusTone,
} from "@/lib/source-policy";
import type { SearchApiResponse } from "@/lib/search-types";

function getSearchErrorMessage() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "로컬에서는 netlify dev 기준으로 확인해 주세요.";
  }

  return "가격 정보를 불러오지 못했습니다.";
}

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [state, setState] = useState<{
    query: string;
    result: SearchApiResponse | null;
    error: string | null;
  }>({
    query: "",
    result: null,
    error: null,
  });
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
    let cancelled = false;

    if (!query) {
      return;
    }

    const controller = new AbortController();

    fetch(buildSearchApiPath(query), {
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
          setState({
            query,
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
          setState({
            query,
            result: null,
            error: getSearchErrorMessage(),
          });
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    if (!query) {
      return;
    }

    const controller = new AbortController();

    fetch(buildDomesticPriceApiPath(query), {
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
            query,
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
            query,
            result: null,
            error: "국내 판매가를 불러오지 못했습니다.",
          });
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [query]);

  const result = state.query === query ? state.result : null;
  const error = state.query === query ? state.error : null;
  const isLoading = Boolean(query) && state.query !== query;
  const domesticResult = domesticState.query === query ? domesticState.result : null;
  const domesticError = domesticState.query === query ? domesticState.error : null;
  const isDomesticLoading = Boolean(query) && domesticState.query !== query;
  const liveOffers = result?.offers ?? [];
  const relatedLiveOffers = result?.relatedOffers ?? [];
  const relatedProducts = query ? searchProducts(query).slice(0, 3) : [];
  const comparableStoreCount = new Set(liveOffers.map((offer) => offer.storeId)).size;
  const fallbackStatuses = stores.map((store) => {
    const isIdle = !query;

    return {
      storeId: store.id,
      state: (isIdle || isLoading ? "blocked" : store.supportState === "live" ? "live" : "blocked") as
        | "live"
        | "blocked"
        | "error",
      message: isIdle ? "검색 전" : isLoading ? "가격 확인 중" : store.supportNote,
      searchUrl: store.siteUrl,
      offerCount: 0,
      eventBadges: [],
    };
  });

  const storeCards = (query ? result?.statuses ?? fallbackStatuses : fallbackStatuses).map((status) => {
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
  const sourcePrices = buildSourcePrices({
    offers: liveOffers,
    statuses: query ? result?.statuses ?? fallbackStatuses : fallbackStatuses,
    query,
  });
  const aggregateStatus = getAggregatePriceStatus(sourcePrices);
  const aggregateCopy = getAggregatePriceCopy(sourcePrices);
  const comparablePrices = getComparableSourcePrices(sourcePrices);

  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>검색</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Search
        </span>
        <h1 className="page-title">{query ? `${query} 비교 결과` : "상품 검색"}</h1>
        <p className="page-description">
          최근 확인 가능한 공개가와 공식 면세점 링크를 함께 제공합니다.
        </p>

        <SearchForm defaultValue={query} compact />

        <div className="chip-row" style={{ marginTop: 16 }}>
          {featureSearches.map((searchText) => (
            <Link key={searchText} className="chip is-soft" href={`/search?q=${encodeURIComponent(searchText)}`}>
              {searchText}
            </Link>
          ))}
        </div>

        <div className="split-grid search-overview-grid" style={{ marginTop: 12 }}>
          <div className="surface-card">
            <p className="panel-title">검색 요약</p>
            <div className="stats-grid" style={{ marginTop: 8 }}>
              <div className="metric-card">
                <p className="metric-title">검색어</p>
                <p className="metric-value" style={{ fontSize: "1.3rem" }}>
                  {query || "-"}
                </p>
                <p className="metric-copy">브랜드 + 상품명 + 용량</p>
              </div>
              <div className="metric-card">
                <p className="metric-title">운영사</p>
                <p className="metric-value">{comparableStoreCount}</p>
                <p className="metric-copy">{isLoading ? "확인 중" : "비교 가능 결과"}</p>
              </div>
              <div className="metric-card">
                <p className="metric-title">조회 시각</p>
                <p className="metric-value" style={{ fontSize: "1.05rem" }}>
                  {result?.searchedAt ?? (isLoading ? "확인 중" : "-")}
                </p>
                <p className="metric-copy">공식 검색 기준</p>
              </div>
              <div className="metric-card">
                <p className="metric-title">가격 상태</p>
                <p className="metric-value" style={{ fontSize: "1.05rem" }}>
                  {query ? getPriceStatusLabel(aggregateStatus) : "검색 전"}
                </p>
                <p className="metric-copy">{query ? `${comparablePrices.length}개 가격` : "상품명 입력"}</p>
              </div>
            </div>
          </div>

          <aside className="feature-panel status-panel">
            <p className="panel-title">연결 상태</p>
            <div style={{ marginTop: 5 }}>
              <StoreStatusList items={storeCards} />
            </div>
          </aside>
        </div>

        <div className="subgrid" style={{ marginTop: 12 }}>
          {!query ? (
            <article className="surface-card search-state-card">
              <h2 className="card-title" style={{ fontSize: "1.05rem" }}>
                검색어를 입력해 주세요.
              </h2>
              <p className="section-copy">
                브랜드명, 상품명, 용량을 함께 넣으면 같은 상품 후보를 더 정확히 찾습니다.
              </p>
              <div className="chip-row" style={{ marginTop: 10 }}>
                {featureSearches.map((searchText) => (
                  <Link key={searchText} className="chip is-soft" href={`/search?q=${encodeURIComponent(searchText)}`}>
                    {searchText}
                  </Link>
                ))}
              </div>
            </article>
          ) : null}

          {query && isLoading ? (
            <PriceLoadingCard
              title="공개가 확인 중"
              description="공식 검색 결과와 원본 링크를 순서대로 확인하고 있습니다."
            />
          ) : null}

          {error ? (
            <article className="surface-card search-state-card">
              <h2 className="card-title" style={{ fontSize: "1.05rem" }}>
                가격 확인 중 문제가 발생했습니다.
              </h2>
              <p className="section-copy">{error} 원본 면세점에서 직접 확인해 주세요.</p>
              <OfficialSourceLinks query={query} />
            </article>
          ) : null}

          {query && !isLoading && !error && liveOffers.length === 0 ? (
            <article className="surface-card search-state-card">
              <h2 className="card-title" style={{ fontSize: "1.05rem" }}>
                {relatedLiveOffers.length ? "정확히 일치하는 상품은 없습니다." : "검색 결과를 찾지 못했습니다."}
              </h2>
              <p className="section-copy">
                브랜드명, 상품명, 용량을 줄여 다시 검색하거나 공식 면세점 링크에서 확인해 보세요.
              </p>
              <div className="chip-row" style={{ marginTop: 10 }}>
                {featureSearches.map((searchText) => (
                  <Link key={searchText} className="chip is-soft" href={`/search?q=${encodeURIComponent(searchText)}`}>
                    {searchText}
                  </Link>
                ))}
                {categories.slice(0, 4).map((category) => (
                  <Link key={category.slug} className="chip is-soft" href={`/category/${category.slug}`}>
                    {category.name}
                  </Link>
                ))}
              </div>
              <OfficialSourceLinks query={query} />
            </article>
          ) : null}

          {query && !isLoading && !error && liveOffers.length === 0 && relatedLiveOffers.length > 0 ? (
            <article className="surface-card">
              <div className="section-head">
                <div>
                  <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
                    관련 후보
                  </h2>
                  <p className="section-copy" style={{ marginTop: 6 }}>
                    같은 상품으로 확정하지 않아 비교가에는 넣지 않았습니다. 원본에서 상품명을 확인해 주세요.
                  </p>
                </div>
              </div>

              <OfferTable offers={relatedLiveOffers} />
            </article>
          ) : null}

          {!isLoading && !error && liveOffers.length > 0 ? (
            <article className="surface-card">
              <div className="section-head">
                <div>
                  <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
                    최근 확인 공개가
                  </h2>
                  <p className="section-copy" style={{ marginTop: 6 }}>
                    {aggregateCopy.description}
                  </p>
                </div>
                <span className={`status-chip ${getPriceStatusTone(aggregateStatus)}`}>
                  {getPriceStatusLabel(aggregateStatus)}
                </span>
              </div>

              {result?.summary ? <PriceRangeSummary summary={result.summary} /> : null}
              <SourcePriceStatusPanel sourcePrices={sourcePrices} query={query} />
              <BenefitApplicationPanel offers={liveOffers} />
              <OfferTable offers={liveOffers} />
            </article>
          ) : null}

          {query && !isLoading && !error ? (
            <DomesticPricePanel
              domestic={domesticResult}
              dutyFreeLowestOffer={liveOffers[0]}
              error={domesticError}
              isLoading={isDomesticLoading}
              query={query}
            />
          ) : null}

          {relatedProducts.length > 0 ? (
            <article className="surface-card">
              <div className="section-head">
                <div>
                  <h2 className="card-title" style={{ fontSize: "1.05rem" }}>
                    관련 상품
                  </h2>
                  <p className="section-copy" style={{ marginTop: 6 }}>
                    가까운 상품 페이지
                  </p>
                </div>
              </div>

              <div className="subgrid">
                {relatedProducts.map(({ product }) => (
                  <Link key={product.id} href={`/product/${product.slug}`} className="list-item">
                    <span className="list-number">{product.brand}</span>
                    <p className="list-copy">
                      <strong>{product.displayName}</strong>
                      {product.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}
