import { recordPriceHistory } from "./price-history";
import { searchDutyFreeOffersLite, type SearchDutyFreeOptions } from "./live-search-lite";
import { featureSearches, products, type StoreId } from "./site-data";

const DEFAULT_BATCH_CONCURRENCY = 2;

type HistoryRefreshTarget = {
  query: string;
  productId?: string;
};

export type HistoryRefreshResult = {
  query: string;
  productId?: string;
  ok: boolean;
  hasOffers: boolean;
  offerCount: number;
  bestKrwPrice: number | null;
  bestStoreId: StoreId | null;
  searchedAt: string | null;
  lastRecordedAt: string | null;
  liveStoreCount: number;
  blockedStoreCount: number;
  note: string;
};

export type HistoryRefreshSummary = {
  startedAt: string;
  finishedAt: string;
  queryCount: number;
  successCount: number;
  withOffersCount: number;
  results: HistoryRefreshResult[];
};

function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeQueryKey(value: string) {
  return cleanText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeTargets(targets: HistoryRefreshTarget[]) {
  const unique = new Map<string, HistoryRefreshTarget>();

  for (const target of targets) {
    const cleaned = cleanText(target.query);

    if (!cleaned) {
      continue;
    }

    const normalized = target.productId ? `product:${target.productId}` : `query:${normalizeQueryKey(cleaned)}`;

    if (!unique.has(normalized)) {
      unique.set(normalized, {
        query: cleaned,
        productId: target.productId,
      });
    }
  }

  return Array.from(unique.values());
}

function dedupeQueries(queries: string[]) {
  return dedupeTargets(queries.map((query) => ({ query }))).map((target) => target.query);
}

export function parseHistoryQueriesInput(raw: string | null | undefined) {
  return dedupeQueries((raw ?? "").split(/[\r\n,]+/));
}

export function getDefaultHistoryWatchlistQueries(extraQueries: string[] = []) {
  return dedupeTargets([
    ...products.map((product) => ({
      query: product.query,
      productId: product.slug,
    })),
    ...featureSearches.map((query) => ({ query })),
    ...extraQueries.map((query) => ({ query })),
  ]);
}

async function refreshSingleQuery(
  target: HistoryRefreshTarget,
  searchOptions: SearchDutyFreeOptions
): Promise<HistoryRefreshResult> {
  try {
    const query = target.query;
    const result = await searchDutyFreeOffersLite(query, searchOptions);
    const history = await recordPriceHistory(result, {
      subject: target.productId
        ? {
            type: "product",
            key: target.productId,
            label: result.query || query,
          }
        : undefined,
    });
    const liveStoreCount = result.statuses.filter((status) => status.state === "live").length;
    const blockedStoreCount = result.statuses.length - liveStoreCount;
    const firstBlockedMessage = result.statuses.find((status) => status.state !== "live")?.message ?? null;

    return {
      query: result.query || query,
      productId: target.productId,
      ok: true,
      hasOffers: result.offers.length > 0,
      offerCount: result.offers.length,
      bestKrwPrice: result.offers[0]?.krwPrice ?? null,
      bestStoreId: result.offers[0]?.storeId ?? null,
      searchedAt: result.searchedAt,
      lastRecordedAt: history.lastRecordedAt,
      liveStoreCount,
      blockedStoreCount,
      note:
        result.offers.length > 0
          ? `가격 이력 기록 완료 (${result.offers.length}건 비교)`
          : firstBlockedMessage ?? "비교 가능한 상품을 찾지 못했습니다.",
    };
  } catch (error) {
    return {
      query: target.query,
      productId: target.productId,
      ok: false,
      hasOffers: false,
      offerCount: 0,
      bestKrwPrice: null,
      bestStoreId: null,
      searchedAt: null,
      lastRecordedAt: null,
      liveStoreCount: 0,
      blockedStoreCount: 0,
      note: error instanceof Error ? error.message : "Unknown refresh error",
    };
  }
}

export async function refreshPriceHistoryBatch({
  queries,
  extraQueries = [],
  concurrency = DEFAULT_BATCH_CONCURRENCY,
  bypassCache = true,
}: {
  queries?: string[];
  extraQueries?: string[];
  concurrency?: number;
  bypassCache?: boolean;
} = {}): Promise<HistoryRefreshSummary> {
  const batchQueries =
    queries && queries.length > 0
      ? dedupeTargets(queries.map((query) => ({ query })))
      : getDefaultHistoryWatchlistQueries(extraQueries);
  const startedAt = new Date().toISOString();
  const results: HistoryRefreshResult[] = [];
  const safeConcurrency = Math.max(1, concurrency);

  for (let index = 0; index < batchQueries.length; index += safeConcurrency) {
    const chunk = batchQueries.slice(index, index + safeConcurrency);
    const chunkResults = await Promise.all(
      chunk.map((target) => refreshSingleQuery(target, { bypassCache }))
    );

    results.push(...chunkResults);
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    queryCount: batchQueries.length,
    successCount: results.filter((result) => result.ok).length,
    withOffersCount: results.filter((result) => result.hasOffers).length,
    results,
  };
}
