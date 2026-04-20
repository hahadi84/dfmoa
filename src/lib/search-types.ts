import type { OfferStatus, StoreId } from "@/lib/site-data";

export type PriceStatus =
  | "available"
  | "partial"
  | "stale"
  | "unavailable"
  | "manual_only"
  | "blocked_by_policy"
  | "low_confidence"
  | "error";

export type SourcePrice = {
  sourceId: StoreId | string;
  sourceName: string;
  status: PriceStatus;
  price?: number | null;
  currency?: "KRW" | "USD";
  fetchedAt?: string | null;
  expiresAt?: string | null;
  sourceUrl?: string | null;
  searchUrl?: string | null;
  message?: string;
  matchScore?: number;
};

export type LiveOffer = {
  id: string;
  storeId: StoreId;
  title: string;
  brand: string;
  usdPrice: number;
  krwPrice: number;
  regularUsdPrice?: number;
  discountRate?: number;
  imageUrl?: string;
  status: OfferStatus;
  pickupAirports: string[];
  updatedAt: string;
  sourceUrl: string;
  searchUrl: string;
  note: string;
  eventBadges: string[];
  matchScore: number;
};

export type StoreSearchStatus = {
  storeId: StoreId;
  state: "live" | "blocked" | "error";
  message: string;
  searchUrl: string;
  offerCount: number;
  eventBadges: string[];
};

export type SourceHealthErrorReason =
  | "network_error"
  | "parse_error"
  | "function_timeout"
  | "cors_or_403"
  | "cookie_or_login_required"
  | "robots_or_terms_restricted"
  | "product_match_failed"
  | "low_confidence_match"
  | "frontend_state_error"
  | "unknown_error";

export type SourceHealth = {
  sourceId: string;
  productId?: string;
  lastAttemptedAt: string;
  lastSuccessAt?: string | null;
  status: "ok" | "degraded" | "blocked" | "error" | "unknown";
  errorReason?: SourceHealthErrorReason;
  robotsCheckedAt?: string;
  crawlDelaySeconds?: number;
  note?: string;
};

export type SearchPriceRangeSummary = {
  offerCount: number;
  lowestOffer: {
    storeId: StoreId;
    krwPrice: number;
    usdPrice: number;
  } | null;
  highestOffer: {
    storeId: StoreId;
    krwPrice: number;
    usdPrice: number;
  } | null;
  spreadKrwPrice: number | null;
};

export type DutyFreeSearchResult = {
  query: string;
  offers: LiveOffer[];
  relatedOffers?: LiveOffer[];
  statuses: StoreSearchStatus[];
  sourceHealth: SourceHealth[];
  searchedAt: string;
  summary: SearchPriceRangeSummary;
};

export type SearchHistoryOfferPoint = {
  storeId: StoreId;
  krwPrice: number;
  usdPrice: number;
  title?: string;
  brand?: string;
  sourceUrl?: string;
  discountRate?: number;
  matchScore?: number;
};

export type SearchHistoryPoint = {
  searchedAt: string;
  bestKrwPrice: number | null;
  bestStoreId: StoreId | null;
  offers: SearchHistoryOfferPoint[];
};

export type StoreTrendSummary = {
  storeId: StoreId;
  currentKrwPrice: number | null;
  previousKrwPrice: number | null;
  lowestKrwPrice: number | null;
  highestKrwPrice: number | null;
  changeKrwPrice: number | null;
  changeDirection: "up" | "down" | "flat" | "new";
  observations: number;
  points: {
    searchedAt: string;
    krwPrice: number;
    usdPrice: number;
  }[];
};

export type SearchHistorySummary = {
  subject: {
    type: "product" | "query";
    key: string;
    label: string;
  } | null;
  points: SearchHistoryPoint[];
  storeTrends: StoreTrendSummary[];
  lastRecordedAt: string | null;
};

export type SearchApiResponse = DutyFreeSearchResult & {
  history: SearchHistorySummary;
};

export function createEmptyHistorySummary(): SearchHistorySummary {
  return {
    subject: null,
    points: [],
    storeTrends: [],
    lastRecordedAt: null,
  };
}

export function createEmptyPriceRangeSummary(): SearchPriceRangeSummary {
  return {
    offerCount: 0,
    lowestOffer: null,
    highestOffer: null,
    spreadKrwPrice: null,
  };
}
