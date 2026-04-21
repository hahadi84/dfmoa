import { buildOfficialSearchUrl, getDutyFreeSource } from "@/lib/source-policy";
import { formatKrw, formatUsd, getStoreById, stores, type Product, type StoreId } from "@/lib/site-data";
import { createEmptyHistorySummary } from "@/lib/search-types";
import type {
  LiveOffer,
  SearchApiResponse,
  SearchPriceRangeSummary,
  SourceHealth,
  SourceHealthErrorReason,
  StoreSearchStatus,
} from "@/lib/search-types";
import type { ProductPriceSnapshot, SnapshotSourceRecord } from "@/lib/price-snapshot-types";

const SNAPSHOT_STALE_MS = 3 * 24 * 60 * 60 * 1000;
const IMAGE_FRESH_MS = 7 * 24 * 60 * 60 * 1000;
const FAILURE_MESSAGE = "가격 확인 준비 중 — 원본 면세점 확인";
const EMPTY_MESSAGE = "가격 미확인 — 원본 면세점 확인";
const BLOCKED_MESSAGE = "자동 수집 제외 — 원본 면세점 확인";
const ERROR_MESSAGE = "확인 오류 — 원본 면세점 확인";

const REAL_ERROR_REASONS = new Set<SourceHealthErrorReason>([
  "network_error",
  "parse_error",
  "function_timeout",
  "cors_or_403",
  "cookie_or_login_required",
  "frontend_state_error",
  "unknown_error",
]);

export function formatSnapshotTimestamp(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace("T", " ").slice(0, 16);
}

function parseSnapshotDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isSnapshotStale(value?: string | null) {
  const parsed = parseSnapshotDate(value);

  if (!parsed) {
    return false;
  }

  return Date.now() - parsed.getTime() > SNAPSHOT_STALE_MS;
}

export function isSnapshotImageFresh(value?: string | null) {
  const parsed = parseSnapshotDate(value);

  if (!parsed) {
    return false;
  }

  return Date.now() - parsed.getTime() <= IMAGE_FRESH_MS;
}

function getSourceEntries(snapshot?: ProductPriceSnapshot | null) {
  return Object.entries(snapshot?.sources ?? {}).filter(([, source]) => source?.items?.length);
}

export function getSnapshotBestItem(snapshot?: ProductPriceSnapshot | null) {
  return getSourceEntries(snapshot)
    .flatMap(([sourceId, source]) =>
      source.items.map((item) => ({
        sourceId: sourceId as StoreId,
        source,
        item,
      }))
    )
    .filter(({ item }) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0)
    .sort((left, right) => (left.item.priceKrw ?? Number.MAX_SAFE_INTEGER) - (right.item.priceKrw ?? Number.MAX_SAFE_INTEGER))[0];
}

function buildOffer(sourceId: StoreId, source: SnapshotSourceRecord, product: Product, index: number): LiveOffer | null {
  const item = source.items[index];
  const store = getStoreById(sourceId);
  const priceUsd = Number(item?.priceUsd ?? 0);
  const priceKrw = Number(item?.priceKrw ?? 0);
  const updatedAt = formatSnapshotTimestamp(source.fetchedAt ?? item?.fetchedAt);

  if (!item || (!priceUsd && !priceKrw) || !store) {
    return null;
  }

  return {
    id: item.id ?? `${sourceId}-${product.id}-${index + 1}`,
    storeId: sourceId,
    title: item.title,
    brand: item.brand,
    usdPrice: priceUsd || Math.round(priceKrw / 1470),
    regularUsdPrice: item.regularUsdPrice ?? undefined,
    krwPrice: priceKrw || Math.round(priceUsd * 1470),
    discountRate: item.discountRate ?? undefined,
    imageUrl: item.imageUrl ?? undefined,
    status: "available",
    pickupAirports: store.pickupAirports,
    updatedAt,
    sourceUrl: item.url || source.searchUrl || buildOfficialSearchUrl(sourceId, product.query) || store.siteUrl,
    searchUrl: source.searchUrl || buildOfficialSearchUrl(sourceId, product.query) || store.siteUrl,
    note: "최근 확인 공개가 기준",
    eventBadges: [],
    matchScore: item.matchScore ?? 99,
  };
}

function buildSummary(offers: LiveOffer[]): SearchPriceRangeSummary {
  if (!offers.length) {
    return {
      offerCount: 0,
      lowestOffer: null,
      highestOffer: null,
      spreadKrwPrice: null,
    };
  }

  const sorted = [...offers].sort((left, right) => left.krwPrice - right.krwPrice);
  const lowestOffer = sorted[0];
  const highestOffer = sorted.at(-1) ?? lowestOffer;

  return {
    offerCount: offers.length,
    lowestOffer: {
      storeId: lowestOffer.storeId,
      krwPrice: lowestOffer.krwPrice,
      usdPrice: lowestOffer.usdPrice,
    },
    highestOffer: {
      storeId: highestOffer.storeId,
      krwPrice: highestOffer.krwPrice,
      usdPrice: highestOffer.usdPrice,
    },
    spreadKrwPrice: Math.max(highestOffer.krwPrice - lowestOffer.krwPrice, 0),
  };
}

function normalizeSnapshotErrorReason(error?: string | null): SourceHealthErrorReason | undefined {
  switch (error) {
    case "robots_or_terms_restricted":
    case "disabled_by_policy":
    case "request_failed_406":
      return "robots_or_terms_restricted";
    case "product_match_failed":
      return "product_match_failed";
    case "low_confidence_match":
      return "low_confidence_match";
    case "network_error":
    case "parse_error":
    case "function_timeout":
    case "cors_or_403":
    case "cookie_or_login_required":
    case "frontend_state_error":
    case "unknown_error":
      return error;
    default:
      return undefined;
  }
}

function getEmptySnapshotStatus(
  store: (typeof stores)[number],
  source: SnapshotSourceRecord | undefined,
  query: string
): StoreSearchStatus {
  const dutyFreeSource = getDutyFreeSource(store.id);
  const errorReason = normalizeSnapshotErrorReason(source?.error);
  const isPolicyBlocked =
    source?.status === "disabled_by_policy" ||
    source?.source_status === "disabled_by_policy" ||
    errorReason === "robots_or_terms_restricted" ||
    dutyFreeSource?.accessPolicy === "blocked_by_policy";
  const isRealError = Boolean(errorReason && REAL_ERROR_REASONS.has(errorReason));
  const state: StoreSearchStatus["state"] = isPolicyBlocked ? "blocked" : isRealError ? "error" : "empty";

  return {
    storeId: store.id,
    state,
    message: state === "blocked" ? BLOCKED_MESSAGE : state === "error" ? ERROR_MESSAGE : EMPTY_MESSAGE,
    searchUrl: source?.searchUrl || buildOfficialSearchUrl(store.id, query) || store.siteUrl,
    offerCount: 0,
    eventBadges: [],
  };
}

function buildSnapshotSourceHealth(
  status: StoreSearchStatus,
  source: SnapshotSourceRecord | undefined,
  product: Product,
  firstFetchedAt: string,
  snapshotFetchedAt?: string | null
): SourceHealth {
  const errorReason = normalizeSnapshotErrorReason(source?.error);
  const healthStatus: SourceHealth["status"] =
    status.offerCount > 0 ? "ok" : status.state === "blocked" ? "blocked" : status.state === "error" ? "error" : "degraded";

  return {
    sourceId: status.storeId,
    productId: product.id,
    lastAttemptedAt: formatSnapshotTimestamp(source?.fetchedAt ?? snapshotFetchedAt) || firstFetchedAt || "최근 확인 시각 없음",
    lastSuccessAt: status.offerCount > 0 ? firstFetchedAt : null,
    status: healthStatus,
    errorReason:
      status.offerCount > 0
        ? undefined
        : errorReason ?? (status.state === "empty" ? "product_match_failed" : status.state === "blocked" ? "robots_or_terms_restricted" : "unknown_error"),
    note: status.offerCount > 0 ? "최근 확인 공개가 기준" : status.message,
  };
}

export function buildSearchResultFromSnapshot(product: Product, snapshot?: ProductPriceSnapshot | null): SearchApiResponse {
  const sourceEntries = getSourceEntries(snapshot);
  const offers = sourceEntries
    .flatMap(([sourceId, source]) => source.items.map((_, index) => buildOffer(sourceId as StoreId, source, product, index)))
    .filter((offer): offer is LiveOffer => Boolean(offer))
    .sort((left, right) => left.krwPrice - right.krwPrice);
  const firstFetchedAt = offers[0]?.updatedAt || formatSnapshotTimestamp(snapshot?.fetchedAt) || "";
  const statuses: StoreSearchStatus[] = stores.map((store) => {
    const source = snapshot?.sources?.[store.id];
    const offerCount = source?.items?.length ?? 0;

    if (offerCount > 0) {
      return {
        storeId: store.id,
        state: "live",
        message: `${store.shortName} 최근 확인 공개가 ${offerCount}건`,
        searchUrl: source?.searchUrl || buildOfficialSearchUrl(store.id, product.query) || store.siteUrl,
        offerCount,
        eventBadges: [],
      };
    }

    return getEmptySnapshotStatus(store, source, product.query);
  });
  const sourceHealth: SourceHealth[] = statuses.map((status) =>
    buildSnapshotSourceHealth(status, snapshot?.sources?.[status.storeId], product, firstFetchedAt, snapshot?.fetchedAt)
  );

  return {
    query: product.query,
    offers,
    relatedOffers: [],
    statuses,
    sourceHealth,
    searchedAt: firstFetchedAt || "최근 확인 시각 없음",
    summary: buildSummary(offers),
    history: createEmptyHistorySummary(),
  };
}

export function getSnapshotPriceLine(snapshot?: ProductPriceSnapshot | null) {
  const best = getSnapshotBestItem(snapshot);

  if (!best) {
    return {
      text: FAILURE_MESSAGE,
      isStale: false,
      imageUrl: null,
    };
  }

  const store = getStoreById(best.sourceId);
  const timestamp = formatSnapshotTimestamp(best.source.fetchedAt ?? best.item.fetchedAt);
  const stale = isSnapshotStale(best.source.fetchedAt ?? best.item.fetchedAt);
  const priceText = best.item.priceKrw ? formatKrw(best.item.priceKrw) : formatUsd(best.item.priceUsd ?? 0);

  return {
    text: `${store?.shortName ?? best.sourceId} ${priceText} · ${timestamp} 기준${stale ? " · 수집 지연" : ""}`,
    isStale: stale,
    imageUrl: isSnapshotImageFresh(best.source.fetchedAt ?? best.item.fetchedAt) ? best.item.imageUrl ?? null : null,
  };
}

export { FAILURE_MESSAGE };
