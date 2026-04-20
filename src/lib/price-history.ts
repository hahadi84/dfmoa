import { getDeployStore, getStore } from "@netlify/blobs";
import type {
  DutyFreeSearchResult,
  SearchHistoryPoint,
  SearchHistorySummary,
  StoreTrendSummary,
} from "@/lib/search-types";
import { createEmptyHistorySummary } from "@/lib/search-types";
import type { StoreId } from "@/lib/site-data";

const HISTORY_STORE_NAME = "dfmoa-history";
const MAX_HISTORY_POINTS = 180;

type HistorySubject = {
  type: "product" | "query";
  key: string;
  label: string;
};

type QueryHistoryRecord = {
  subject?: HistorySubject;
  query: string;
  points: SearchHistoryPoint[];
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

function normalizeQueryKey(query: string) {
  return query
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s-]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 160);
}

function normalizeSubjectKey(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
}

function getHistorySubject(
  result: DutyFreeSearchResult,
  subject?: Partial<HistorySubject>
): HistorySubject {
  if (subject?.type === "product" && subject.key) {
    return {
      type: "product",
      key: normalizeSubjectKey(subject.key) || normalizeQueryKey(result.query) || "empty",
      label: subject.label?.trim() || result.query,
    };
  }

  return {
    type: "query",
    key: normalizeQueryKey(result.query) || "empty",
    label: result.query,
  };
}

function getHistoryKey(subject: HistorySubject) {
  return `${subject.type}/${subject.key}`;
}

function getHistoryStore() {
  const deployContext = (globalThis as typeof globalThis & NetlifyContextShape).Netlify?.context?.deploy?.context;

  if (deployContext === "production") {
    return getStore(HISTORY_STORE_NAME, { consistency: "strong" });
  }

  return getDeployStore({
    name: HISTORY_STORE_NAME,
    consistency: "strong",
  });
}

function buildHistoryPoint(result: DutyFreeSearchResult): SearchHistoryPoint {
  return {
    searchedAt: result.searchedAt,
    bestKrwPrice: result.offers[0]?.krwPrice ?? null,
    bestStoreId: result.offers[0]?.storeId ?? null,
    offers: result.offers.map((offer) => ({
      storeId: offer.storeId,
      krwPrice: offer.krwPrice,
      usdPrice: offer.usdPrice,
      title: offer.title,
      brand: offer.brand,
      sourceUrl: offer.sourceUrl,
      discountRate: offer.discountRate,
      matchScore: offer.matchScore,
    })),
  };
}

function isSamePoint(left: SearchHistoryPoint | undefined, right: SearchHistoryPoint) {
  if (!left) {
    return false;
  }

  if (left.bestKrwPrice !== right.bestKrwPrice || left.bestStoreId !== right.bestStoreId) {
    return false;
  }

  if (left.offers.length !== right.offers.length) {
    return false;
  }

  return left.offers.every((offer, index) => {
    const other = right.offers[index];
    return (
      offer.storeId === other?.storeId &&
      offer.krwPrice === other?.krwPrice &&
      offer.usdPrice === other?.usdPrice &&
      offer.sourceUrl === other?.sourceUrl
    );
  });
}

function getStoreTrend(points: SearchHistoryPoint[], storeId: StoreId): StoreTrendSummary {
  const history = points
    .map((point) => ({
      searchedAt: point.searchedAt,
      offer: point.offers.find((item) => item.storeId === storeId) ?? null,
    }))
    .filter((item): item is { searchedAt: string; offer: NonNullable<typeof item.offer> } => Boolean(item.offer));

  const prices = history.map((item) => item.offer.krwPrice);
  const current = history.at(-1)?.offer.krwPrice ?? null;
  const previous = history.length > 1 ? history.at(-2)?.offer.krwPrice ?? null : null;
  const change = current !== null && previous !== null ? current - previous : null;

  let changeDirection: StoreTrendSummary["changeDirection"] = "new";

  if (change === null) {
    changeDirection = "new";
  } else if (change === 0) {
    changeDirection = "flat";
  } else if (change > 0) {
    changeDirection = "up";
  } else {
    changeDirection = "down";
  }

  return {
    storeId,
    currentKrwPrice: current,
    previousKrwPrice: previous,
    lowestKrwPrice: prices.length ? Math.min(...prices) : null,
    highestKrwPrice: prices.length ? Math.max(...prices) : null,
    changeKrwPrice: change,
    changeDirection,
    observations: history.length,
    points: history.map((item) => ({
      searchedAt: item.searchedAt,
      krwPrice: item.offer.krwPrice,
      usdPrice: item.offer.usdPrice,
    })),
  };
}

function summarizeHistory(points: SearchHistoryPoint[], subject: HistorySubject): SearchHistorySummary {
  if (!points.length) {
    return {
      ...createEmptyHistorySummary(),
      subject,
    };
  }

  const storeIds = new Set<StoreId>();

  for (const point of points) {
    for (const offer of point.offers) {
      storeIds.add(offer.storeId);
    }
  }

  const storeTrends = Array.from(storeIds)
    .map((storeId) => getStoreTrend(points, storeId))
    .sort((left, right) => {
      if (left.currentKrwPrice === null) {
        return 1;
      }

      if (right.currentKrwPrice === null) {
        return -1;
      }

      return left.currentKrwPrice - right.currentKrwPrice;
    });

  return {
    subject,
    points,
    storeTrends,
    lastRecordedAt: points.at(-1)?.searchedAt ?? null,
  };
}

export async function recordPriceHistory(
  result: DutyFreeSearchResult,
  options: {
    subject?: Partial<HistorySubject>;
  } = {}
): Promise<SearchHistorySummary> {
  if (!result.query.trim()) {
    return createEmptyHistorySummary();
  }

  const subject = getHistorySubject(result, options.subject);
  const store = getHistoryStore();
  const key = getHistoryKey(subject);
  const existing = (await store.get(key, { type: "json" })) as QueryHistoryRecord | null;
  const points = existing?.points ?? [];

  if (!result.offers.length) {
    return summarizeHistory(points, subject);
  }

  const nextPoint = buildHistoryPoint(result);
  const nextPoints = isSamePoint(points.at(-1), nextPoint)
    ? points
    : [...points, nextPoint].slice(-MAX_HISTORY_POINTS);

  if (nextPoints !== points) {
    await store.setJSON(key, {
      subject,
      query: result.query,
      points: nextPoints,
    });
  }

  return summarizeHistory(nextPoints, subject);
}
