import { getDeployStore, getStore } from "@netlify/blobs";
import { getNetlifyDeployContext, getNetlifyEnv } from "@/lib/netlify-runtime";
import { getStoreById, type OfferStatus, type StoreId } from "@/lib/site-data";
import type { LiveOffer, StoreSearchStatus } from "@/lib/search-types";

const EXTERNAL_SNAPSHOT_STORE_NAME = "dfmoa-external-snapshots";
const DEFAULT_MAX_AGE_HOURS = 24;

export type ExternalCollectorOfferInput = {
  id?: string;
  title: string;
  brand: string;
  usdPrice: number;
  krwPrice: number;
  regularUsdPrice?: number;
  discountRate?: number;
  imageUrl?: string;
  status?: OfferStatus;
  sourceUrl: string;
  eventBadges?: string[];
  note?: string;
};

export type ExternalStoreSnapshotInput = {
  storeId: StoreId;
  query: string;
  searchUrl: string;
  offers: ExternalCollectorOfferInput[];
  collectedAt?: string;
  collector?: string;
  note?: string;
};

export type ExternalStoreSnapshotRecord = {
  storeId: StoreId;
  query: string;
  searchUrl: string;
  offers: ExternalCollectorOfferInput[];
  collectedAt: string;
  collectedAtMs: number;
  collector: string;
  note: string;
  recordedAt: string;
};

type NetlifyContextShape = {
  Netlify?: {
    context?: {
      deploy?: {
        context?: string;
      };
    };
  };
};

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeQueryKey(query: string) {
  return cleanText(query)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s-]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 160);
}

function getSnapshotKey(storeId: StoreId, query: string) {
  return `${storeId}/${normalizeQueryKey(query) || "empty"}`;
}

function formatTimestamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function getSnapshotStore() {
  const deployContext = (globalThis as typeof globalThis & NetlifyContextShape).Netlify?.context?.deploy?.context;

  if (deployContext === "production" || getNetlifyDeployContext() === "production") {
    return getStore(EXTERNAL_SNAPSHOT_STORE_NAME, { consistency: "strong" });
  }

  return getDeployStore({
    name: EXTERNAL_SNAPSHOT_STORE_NAME,
    consistency: "strong",
  });
}

function getSnapshotMaxAgeHours() {
  const configured = Number(getNetlifyEnv("EXTERNAL_SNAPSHOT_MAX_AGE_HOURS") ?? "");
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return DEFAULT_MAX_AGE_HOURS;
}

function sanitizeOffer(input: ExternalCollectorOfferInput, index: number): ExternalCollectorOfferInput | null {
  const title = cleanText(input.title);
  const brand = cleanText(input.brand);
  const sourceUrl = cleanText(input.sourceUrl);
  const usdPrice = Number(input.usdPrice);
  const krwPrice = Number(input.krwPrice);
  const regularUsdPrice = Number(input.regularUsdPrice);
  const discountRate = Number(input.discountRate);
  const imageUrl = cleanText(input.imageUrl);

  if (!title || !brand || !sourceUrl || !Number.isFinite(usdPrice) || !Number.isFinite(krwPrice)) {
    return null;
  }

  return {
    id: cleanText(input.id) || undefined,
    title,
    brand,
    usdPrice,
    krwPrice,
    regularUsdPrice: Number.isFinite(regularUsdPrice) ? regularUsdPrice : undefined,
    discountRate: Number.isFinite(discountRate) ? discountRate : undefined,
    imageUrl: imageUrl || undefined,
    status: input.status ?? "available",
    sourceUrl,
    eventBadges: (input.eventBadges ?? []).map((badge) => cleanText(badge)).filter(Boolean).slice(0, 6),
    note: cleanText(input.note) || `외부 수집 ${index + 1}번 결과`,
  } satisfies ExternalCollectorOfferInput;
}

function buildRecord(input: ExternalStoreSnapshotInput): ExternalStoreSnapshotRecord {
  const query = cleanText(input.query);
  const searchUrl = cleanText(input.searchUrl);
  const offers = input.offers
    .map((offer, index) => sanitizeOffer(offer, index))
    .filter((offer): offer is ExternalCollectorOfferInput => Boolean(offer));

  if (!query || !searchUrl || !offers.length) {
    throw new Error("Invalid external snapshot payload");
  }

  return {
    storeId: input.storeId,
    query,
    searchUrl,
    offers,
    collectedAt: cleanText(input.collectedAt) || formatTimestamp(),
    collectedAtMs: Date.now(),
    collector: cleanText(input.collector) || "external-browser-worker",
    note: cleanText(input.note) || "외부 브라우저 수집 기준",
    recordedAt: formatTimestamp(),
  };
}

export function isExternalSnapshotFresh(snapshot: ExternalStoreSnapshotRecord) {
  return Date.now() - snapshot.collectedAtMs <= getSnapshotMaxAgeHours() * 60 * 60 * 1000;
}

export function getExternalSnapshotFreshnessHours() {
  return getSnapshotMaxAgeHours();
}

export async function readExternalStoreSnapshot(query: string, storeId: StoreId) {
  const normalizedQuery = cleanText(query);

  if (!normalizedQuery) {
    return null;
  }

  const store = getSnapshotStore();
  return (await store.get(getSnapshotKey(storeId, normalizedQuery), {
    type: "json",
  })) as ExternalStoreSnapshotRecord | null;
}

export async function saveExternalStoreSnapshot(input: ExternalStoreSnapshotInput) {
  const record = buildRecord(input);
  const store = getSnapshotStore();
  await store.setJSON(getSnapshotKey(record.storeId, record.query), record);
  return record;
}

export function buildLiveOffersFromExternalSnapshot(snapshot: ExternalStoreSnapshotRecord): LiveOffer[] {
  const store = getStoreById(snapshot.storeId);

  return snapshot.offers.map((offer, index) => ({
    id: offer.id ?? `${snapshot.storeId}-external-${index + 1}`,
    storeId: snapshot.storeId,
    title: offer.title,
    brand: offer.brand,
    usdPrice: offer.usdPrice,
    krwPrice: offer.krwPrice,
    regularUsdPrice: offer.regularUsdPrice,
    discountRate: offer.discountRate,
    imageUrl: offer.imageUrl,
    status: offer.status ?? "available",
    pickupAirports: store?.pickupAirports ?? [],
    updatedAt: snapshot.collectedAt,
    sourceUrl: offer.sourceUrl,
    searchUrl: snapshot.searchUrl,
    note: offer.note ?? snapshot.note,
    eventBadges: offer.eventBadges ?? [],
    matchScore: 0,
  }));
}

export function buildExternalSnapshotStatus(snapshot: ExternalStoreSnapshotRecord): StoreSearchStatus {
  const store = getStoreById(snapshot.storeId);

  return {
    storeId: snapshot.storeId,
    state: "live",
    message: `${store?.name ?? snapshot.storeId} 외부 수집 ${snapshot.offers.length}건 확인`,
    searchUrl: snapshot.searchUrl,
    offerCount: snapshot.offers.length,
    eventBadges: snapshot.offers.flatMap((offer) => offer.eventBadges ?? []).filter(Boolean).slice(0, 6),
  };
}
