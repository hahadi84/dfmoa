"use client";

import { trackEvent } from "@/lib/analytics";
import {
  buildOfficialSearchUrl,
  dutyFreeSources,
  formatDisplayTimestamp,
  getAggregatePriceCopy,
  getComparableSourcePrices,
  getPriceStatusLabel,
  getPriceStatusTone,
  getSourceAccessLabel,
  getSourceCtaLabel,
} from "@/lib/source-policy";
import { formatKrw, getStoreById, type Product, type StoreId } from "@/lib/site-data";
import type { SourcePrice } from "@/lib/search-types";

type OfficialSourceLinksProps = {
  query: string;
  compact?: boolean;
};

type SourcePriceStatusPanelProps = {
  sourcePrices: SourcePrice[];
  query: string;
  showIntro?: boolean;
  product?: Product;
};

export function OfficialSourceLinks({ query, compact = false }: OfficialSourceLinksProps) {
  return (
    <div className={compact ? "official-link-row is-compact" : "official-link-row"}>
      {dutyFreeSources.map((source) => {
        const href = buildOfficialSearchUrl(source.id, query) ?? source.homepageUrl;
        const label = source.searchUrlTemplate ? `${source.name}에서 검색` : `${source.name} 공식몰`;

        return (
          <a
            key={source.id}
            className="official-link-button"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("outbound_click_store", {
                store: source.id,
                product_slug: "search",
                price_krw: 0,
                source_status: "unavailable",
                source_page: "search",
                cta_type: source.searchUrlTemplate ? "official_search" : "official_home",
              })
            }
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}

export function SourcePriceStatusPanel({
  sourcePrices,
  query,
  showIntro = true,
  product,
}: SourcePriceStatusPanelProps) {
  const comparablePrices = getComparableSourcePrices(sourcePrices);
  const copy = getAggregatePriceCopy(sourcePrices);

  return (
    <div className="source-price-panel">
      {showIntro ? (
        <div className="price-state-callout">
          <div>
            <strong>{copy.title}</strong>
            <span>{copy.description}</span>
          </div>
          <span className="status-chip is-soft">{comparablePrices.length}개 가격</span>
        </div>
      ) : null}

      <div className="source-price-grid">
        {sourcePrices.map((sourcePrice) => {
          const store = getStoreById(sourcePrice.sourceId as StoreId);
          const sourceHref =
            sourcePrice.sourceUrl || sourcePrice.searchUrl || buildOfficialSearchUrl(sourcePrice.sourceId, query);
          const timestamp = formatDisplayTimestamp(sourcePrice.fetchedAt);
          const hasPrice = typeof sourcePrice.price === "number";
          const source = dutyFreeSources.find((item) => item.id === sourcePrice.sourceId);

          return (
            <article
              key={sourcePrice.sourceId}
              className="source-price-card"
              aria-label={`${sourcePrice.sourceName} ${getPriceStatusLabel(sourcePrice.status)}`}
            >
              <div className="source-price-head">
                <span className="source-price-logo source-text-logo" aria-hidden="true">
                  {store?.shortName ?? sourcePrice.sourceName.slice(0, 2)}
                </span>
                <div className="source-price-copy">
                  <strong>{sourcePrice.sourceName.replace("면세점", "")}</strong>
                  <span>{sourcePrice.message}</span>
                </div>
                <span className={`status-chip ${getPriceStatusTone(sourcePrice.status)}`}>
                  {getPriceStatusLabel(sourcePrice.status)}
                </span>
              </div>

              {hasPrice ? (
                <div className="source-price-value">
                  <strong>{formatKrw(sourcePrice.price ?? 0)}</strong>
                  <span>{timestamp ? `가격 기준 시각: ${timestamp}` : "최근 확인 시각 없음"}</span>
                </div>
              ) : (
                <div className="source-price-value is-muted">
                  <strong>원본 확인</strong>
                  <span>{getSourceAccessLabel(source?.accessPolicy ?? "limited")}</span>
                </div>
              )}

              {sourceHref ? (
                <a
                  className="source-price-cta"
                  href={sourceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${sourcePrice.sourceName} 원본에서 확인`}
                  onClick={() =>
                    trackEvent("outbound_click_store", {
                      store: sourcePrice.sourceId,
                      product_id: product?.id,
                      product_slug: product?.slug ?? "search",
                      price_krw: sourcePrice.price ?? 0,
                      source_status: sourcePrice.status,
                      page_type: "product",
                      cta_type: sourcePrice.sourceUrl ? "original_source" : "official_search",
                    })
                  }
                >
                  {getSourceCtaLabel(sourcePrice)}
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
