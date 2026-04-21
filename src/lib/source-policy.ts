import { stores, type StoreId } from "@/lib/site-data";
import type {
  LiveOffer,
  PriceStatus,
  SourceHealth,
  SourceHealthErrorReason,
  SourcePrice,
  StoreSearchStatus,
} from "@/lib/search-types";

export type SourceAccessPolicy = "allowed" | "limited" | "manual_only" | "blocked_by_policy";
export type BrandAssetUsageStatus =
  | "not_used"
  | "text_only"
  | "permission_confirmed"
  | "official_partner"
  | "unknown_do_not_use";

export type SourceBrandAssetPolicy = {
  sourceId: StoreId | string;
  logoUsageStatus: BrandAssetUsageStatus;
  note?: string;
  checkedAt?: string;
};

export type DutyFreeSource = {
  id: StoreId;
  name: string;
  homepageUrl: string;
  searchUrlTemplate?: string;
  accessPolicy: SourceAccessPolicy;
  crawlDelaySeconds?: number;
  policyNote: string;
  robotsCheckedAt?: string;
};

export const dutyFreeSources: DutyFreeSource[] = [
  {
    id: "lotte",
    name: "롯데면세점",
    homepageUrl: "https://kor.lottedfs.com/kr",
    searchUrlTemplate: "https://kor.lottedfs.com/kr/search?comSearchWord={query}",
    accessPolicy: "blocked_by_policy",
    policyNote: "롯데는 robots.txt 제한으로 현재 자동 수집을 지원하지 않습니다. 원본 링크에서 직접 확인해 주세요.",
    robotsCheckedAt: "2026-04-20",
  },
  {
    id: "hyundai",
    name: "현대면세점",
    homepageUrl: "https://www.hddfs.com/shop/dm/main.do",
    searchUrlTemplate: "https://m.hddfs.com/shop/sr/searchResult.do?searchTerm={query}&searchType=basic",
    accessPolicy: "limited",
    crawlDelaySeconds: 5,
    policyNote: "공개 검색 결과를 제한된 빈도로 확인하고 원본 링크를 함께 제공합니다.",
    robotsCheckedAt: "2026-04-19",
  },
  {
    id: "shilla",
    name: "신라면세점",
    homepageUrl: "https://www.shilladfs.com/",
    searchUrlTemplate: "https://www.shilladfs.com/estore/kr/ko/search?text={query}",
    accessPolicy: "limited",
    crawlDelaySeconds: 5,
    policyNote: "공개 검색 결과를 제한된 빈도로 확인하고 원본 링크를 함께 제공합니다.",
    robotsCheckedAt: "2026-04-19",
  },
  {
    id: "shinsegae",
    name: "신세계면세점",
    homepageUrl: "https://www.ssgdfs.com/kr/main/initMain",
    searchUrlTemplate: "https://www.ssgdfs.com/kr/search/resultsTotal?query={query}",
    accessPolicy: "blocked_by_policy",
    crawlDelaySeconds: 5,
    policyNote: "robots.txt는 허용하지만 공개 검색 URL이 406/FEC challenge를 반환해 GitHub Actions 자동 수집은 현재 제외합니다.",
    robotsCheckedAt: "2026-04-20",
  },
];

export const sourceBrandAssetPolicies: SourceBrandAssetPolicy[] = stores.map((store) => ({
  sourceId: store.id,
  logoUsageStatus: "text_only",
  checkedAt: "2026-04-19",
  note: "권리 확인 전에는 로고 대신 텍스트명과 중립 라벨을 사용합니다. 별도 제휴 또는 사용 허가가 확인되면 상태를 갱신합니다.",
}));

const STALE_PRICE_MS = 24 * 60 * 60 * 1000;

export function getDutyFreeSource(sourceId: StoreId | string) {
  return dutyFreeSources.find((source) => source.id === sourceId);
}

export function buildOfficialSearchUrl(sourceId: StoreId | string, query: string) {
  const source = getDutyFreeSource(sourceId);

  if (!source) {
    return null;
  }

  if (!source.searchUrlTemplate) {
    return source.homepageUrl;
  }

  return source.searchUrlTemplate.replace("{query}", encodeURIComponent(query));
}

export function getSourceAccessLabel(policy: SourceAccessPolicy) {
  switch (policy) {
    case "allowed":
      return "공개가 확인";
    case "limited":
      return "일부 정보 제공";
    case "manual_only":
      return "원본 확인 우선";
    case "blocked_by_policy":
      return "자동 수집 제외";
    default:
      return "정책 확인";
  }
}

export function getPriceStatusLabel(status: PriceStatus) {
  switch (status) {
    case "available":
      return "최근 확인가";
    case "partial":
      return "일부 확인";
    case "stale":
      return "최근 확인가";
    case "unavailable":
      return "가격 미확인";
    case "manual_only":
      return "원본 확인 필요";
    case "blocked_by_policy":
      return "원본 확인 필요";
    case "low_confidence":
      return "매칭 확인 필요";
    case "error":
      return "확인 오류";
    default:
      return "상태 확인";
  }
}

export function getPriceStatusTone(status: PriceStatus) {
  switch (status) {
    case "available":
      return "is-available";
    case "partial":
    case "stale":
    case "low_confidence":
      return "is-limited";
    case "manual_only":
    case "blocked_by_policy":
    case "unavailable":
      return "is-soft";
    case "error":
      return "is-soldout";
    default:
      return "is-soft";
  }
}

export function getSourceCtaLabel(sourcePrice: SourcePrice) {
  if (sourcePrice.sourceUrl) {
    return "원본에서 확인";
  }

  const source = getDutyFreeSource(sourcePrice.sourceId);

  if (source?.searchUrlTemplate) {
    return "공식 검색으로 확인";
  }

  return "공식몰 바로가기";
}

export function formatDisplayTimestamp(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.replace("T", " ").slice(0, 16);
}

function getParsedKstDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}:00+09:00`;
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getOfferPriceStatus(offer: LiveOffer): PriceStatus {
  if (offer.matchScore > 0 && offer.matchScore < 13) {
    return "low_confidence";
  }

  const parsed = getParsedKstDate(offer.updatedAt);

  if (parsed && Date.now() - parsed.getTime() > STALE_PRICE_MS) {
    return "stale";
  }

  return "available";
}

function getUnavailableStatus(source: DutyFreeSource, status?: StoreSearchStatus): PriceStatus {
  if (source.accessPolicy === "manual_only") {
    return "manual_only";
  }

  if (source.accessPolicy === "blocked_by_policy" || status?.state === "blocked") {
    return "blocked_by_policy";
  }

  if (status?.state === "error") {
    return "error";
  }

  return "unavailable";
}

function getUnavailableMessage(source: DutyFreeSource, status?: StoreSearchStatus) {
  if (status?.message) {
    return status.message;
  }
  if (status?.state === "error") {
    return "가격 확인 중 문제가 발생했습니다. 원본에서 확인해 주세요.";
  }

  if (source.accessPolicy === "manual_only") {
    return "자동 확인 대상이 아닙니다. 원본에서 직접 확인해 주세요.";
  }

  if (source.accessPolicy === "blocked_by_policy") {
    return "자동 수집 제외 소스입니다. 원본에서 직접 확인해 주세요.";
  }

  return status?.message || "현재 확인된 공개가가 없습니다.";
}

export function buildSourcePrices({
  offers,
  statuses,
  query,
}: {
  offers: LiveOffer[];
  statuses: StoreSearchStatus[];
  query: string;
}) {
  return stores.map<SourcePrice>((store) => {
    const source = getDutyFreeSource(store.id);
    const status = statuses.find((item) => item.storeId === store.id);
    const bestOffer = offers
      .filter((offer) => offer.storeId === store.id)
      .sort((left, right) => left.krwPrice - right.krwPrice)[0];
    const searchUrl = status?.searchUrl || buildOfficialSearchUrl(store.id, query) || source?.homepageUrl || store.siteUrl;

    if (bestOffer) {
      return {
        sourceId: store.id,
        sourceName: store.name,
        status: getOfferPriceStatus(bestOffer),
        price: bestOffer.krwPrice,
        currency: "KRW",
        fetchedAt: bestOffer.updatedAt,
        sourceUrl: bestOffer.sourceUrl,
        searchUrl,
        message:
          getOfferPriceStatus(bestOffer) === "stale"
            ? "최근 확인가입니다. 원본에서 최종 결제 금액을 확인해 주세요."
            : "최근 확인 공개가 기준입니다.",
        matchScore: bestOffer.matchScore,
      };
    }

    if (!source) {
      return {
        sourceId: store.id,
        sourceName: store.name,
        status: status?.state === "error" ? "error" : "unavailable",
        price: null,
        currency: "KRW",
        fetchedAt: null,
        sourceUrl: null,
        searchUrl,
        message: status?.message || "현재 확인된 공개가가 없습니다.",
      };
    }

    return {
      sourceId: store.id,
      sourceName: source.name,
      status: getUnavailableStatus(source, status),
      price: null,
      currency: "KRW",
      fetchedAt: null,
      sourceUrl: null,
      searchUrl,
      message: getUnavailableMessage(source, status),
    };
  });
}

export function getComparableSourcePrices(sourcePrices: SourcePrice[]) {
  return sourcePrices.filter(
    (sourcePrice) =>
      (sourcePrice.status === "available" || sourcePrice.status === "partial" || sourcePrice.status === "stale") &&
      typeof sourcePrice.price === "number"
  );
}

export function getAggregatePriceStatus(sourcePrices: SourcePrice[]): PriceStatus {
  const comparableCount = getComparableSourcePrices(sourcePrices).length;

  if (comparableCount === 0) {
    if (sourcePrices.some((sourcePrice) => sourcePrice.status === "low_confidence")) {
      return "low_confidence";
    }

    if (sourcePrices.some((sourcePrice) => sourcePrice.status === "error")) {
      return "error";
    }

    if (sourcePrices.every((sourcePrice) => sourcePrice.status === "manual_only")) {
      return "manual_only";
    }

    if (sourcePrices.every((sourcePrice) => sourcePrice.status === "blocked_by_policy")) {
      return "blocked_by_policy";
    }

    return "unavailable";
  }

  if (comparableCount < sourcePrices.length) {
    return "partial";
  }

  return sourcePrices.some((sourcePrice) => sourcePrice.status === "stale") ? "stale" : "available";
}

export function getAggregatePriceCopy(sourcePrices: SourcePrice[]) {
  const aggregateStatus = getAggregatePriceStatus(sourcePrices);

  switch (aggregateStatus) {
    case "available":
      return {
        title: "최근 확인 공개가",
        description: "최종 결제가는 각 면세점 원본 페이지에서 확인해 주세요.",
      };
    case "partial":
      return {
        title: "일부 면세점 공개가만 확인됨",
        description: "가격 정보는 수집 상태에 따라 일부 면세점만 표시될 수 있습니다.",
      };
    case "stale":
      return {
        title: "최근 확인가",
        description: "오래된 확인가가 포함되어 원본 확인이 필요합니다.",
      };
    case "low_confidence":
      return {
        title: "상품 매칭 확인 필요",
        description: "상품명이나 용량 매칭 신뢰도가 낮아 원본 확인이 필요합니다.",
      };
    case "manual_only":
      return {
        title: "원본 확인 필요",
        description: "자동 확인 대상이 아닌 소스는 공식 링크에서 직접 확인해 주세요.",
      };
    case "blocked_by_policy":
      return {
        title: "원본 확인 필요",
        description: "자동 수집 제외 소스는 공식 링크에서 직접 확인해 주세요.",
      };
    case "error":
      return {
        title: "가격 확인 오류",
        description: "가격 확인 중 문제가 발생했습니다. 원본에서 확인해 주세요.",
      };
    case "unavailable":
    default:
      return {
        title: "아직 확인된 공개가가 없습니다.",
        description: "아래 공식 면세점 링크에서 현재 판매 여부와 최종 결제 금액을 확인해 주세요.",
      };
  }
}

function getHealthReason(status: StoreSearchStatus, source?: DutyFreeSource): SourceHealthErrorReason | undefined {
  const message = status.message.toLowerCase();

  if (status.state === "live" && status.offerCount > 0) {
    return undefined;
  }

  if (source?.accessPolicy === "manual_only" || source?.accessPolicy === "blocked_by_policy") {
    return "robots_or_terms_restricted";
  }

  if (status.state === "live" && status.offerCount === 0) {
    return "product_match_failed";
  }

  if (status.state === "empty") {
    return "product_match_failed";
  }

  if (message.includes("403") || message.includes("차단")) {
    return "cors_or_403";
  }

  if (message.includes("로그인") || message.includes("session") || message.includes("쿠키")) {
    return "cookie_or_login_required";
  }

  if (message.includes("parse") || message.includes("파싱")) {
    return "parse_error";
  }

  if (message.includes("timeout") || message.includes("시간")) {
    return "function_timeout";
  }

  if (message.includes("불러오지") || message.includes("network")) {
    return "network_error";
  }

  return status.state === "error" || status.state === "blocked" ? "unknown_error" : undefined;
}

export function buildSourceHealth(
  statuses: StoreSearchStatus[],
  lastAttemptedAt: string,
  productId?: string
): SourceHealth[] {
  return stores.map((store) => {
    const status = statuses.find((item) => item.storeId === store.id);
    const source = getDutyFreeSource(store.id);

    if (!status) {
      return {
        sourceId: store.id,
        productId,
        lastAttemptedAt,
        lastSuccessAt: null,
        status: "unknown",
        errorReason: "unknown_error",
        robotsCheckedAt: source?.robotsCheckedAt,
        crawlDelaySeconds: source?.crawlDelaySeconds,
        note: "아직 확인 시도가 없습니다.",
      };
    }

    const healthStatus: SourceHealth["status"] =
      status.state === "error"
        ? "error"
        : status.state === "blocked"
          ? "blocked"
          : status.offerCount > 0
            ? "ok"
            : "degraded";

    return {
      sourceId: status.storeId,
      productId,
      lastAttemptedAt,
      lastSuccessAt: healthStatus === "ok" ? lastAttemptedAt : null,
      status: healthStatus,
      errorReason: getHealthReason(status, source),
      robotsCheckedAt: source?.robotsCheckedAt,
      crawlDelaySeconds: source?.crawlDelaySeconds,
      note: status.message,
    };
  });
}
