import { load } from "cheerio";
import {
  createEmptyDomesticPriceSummary,
  type DomesticPriceOffer,
  type DomesticPriceResult,
  type DomesticPriceSourceId,
  type DomesticPriceStatus,
} from "./domestic-price-types";

type DomesticCrawlerResult = {
  offers: DomesticPriceOffer[];
  status: DomesticPriceStatus;
};

type SsgSearchItem = {
  itemId?: string;
  itemName?: string;
  brandName?: string;
  itemImgUrl?: string;
  itemUrl?: string;
  priceInfo?: {
    primaryPrice?: string;
    strikeOutPrice?: string;
    discountRate?: string;
  };
};

export type SearchDomesticPricesOptions = {
  bypassCache?: boolean;
};

const REQUEST_TIMEOUT_MS = 16000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_OFFERS = 12;
const MIN_MATCH_SCORE = 16;
const MIN_REQUIRED_TEXT_TOKEN_COUNT = 2;
const DOMESTIC_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};
const resultCache = new Map<string, { expiresAt: number; result: DomesticPriceResult }>();

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return cleanText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/sk[\s-]?ii/g, "sk ii")
    .replace(/sk2/g, "sk ii")
    .replace(/로즈마리/g, "로즈메리")
    .replace(/딥디크/g, "딥티크")
    .replace(/조말론/g, "조 말론")
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string | undefined | null) {
  const numeric = cleanText(value).replace(/[^0-9]/g, "");

  if (!numeric) {
    return undefined;
  }

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePercent(value: string | undefined | null) {
  return parseNumber(value);
}

function getTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function getVolumeTokens(value: string) {
  const matches = cleanText(value).match(/\d+(?:\.\d+)?\s?(?:ml|g|kg|oz|cl|l)\b/gi);
  return matches ? matches.map((match) => normalizeVolumeToken(match)) : [];
}

function normalizeVolumeToken(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getSearchTokens(value: string) {
  const volumeTokenSet = new Set(getVolumeTokens(value));

  return getTokens(value).filter((token) => !volumeTokenSet.has(normalizeVolumeToken(token)));
}

function getRequiredTextTokens(query: string) {
  const stopTokens = new Set([
    "정품",
    "공식",
    "국내",
    "해외",
    "무료배송",
    "백화점",
    "new",
    "the",
    "and",
    "for",
    "with",
  ]);

  return getSearchTokens(query).filter((token) => token.length > 1 && !stopTokens.has(token));
}

function hasAllVolumeTokens(query: string, title: string) {
  const queryVolumes = getVolumeTokens(query);

  if (!queryVolumes.length) {
    return true;
  }

  const titleVolumes = new Set(getVolumeTokens(title));
  return queryVolumes.every((token) => titleVolumes.has(token));
}

function hasKnownAliasMatch(normalizedQuery: string, normalizedTitle: string, missingToken: string) {
  if (
    missingToken === "피테라" &&
    normalizedQuery.includes("피테라") &&
    normalizedTitle.includes("페이셜") &&
    normalizedTitle.includes("트리트먼트") &&
    normalizedTitle.includes("에센스")
  ) {
    return true;
  }

  if (
    (missingToken === "윤조에센스" || missingToken === "윤조") &&
    (normalizedTitle.includes("퍼스트 케어") || normalizedTitle.includes("first care")) &&
    (normalizedTitle.includes("세럼") || normalizedTitle.includes("serum") || normalizedTitle.includes("에센스"))
  ) {
    return true;
  }

  return false;
}

function hasRejectedProductMismatch(normalizedQuery: string, normalizedTitle: string) {
  const hardRejectTokens = [
    "만들기",
    "diy",
    "디퓨저",
    "프래그런스 오일",
    "프래그런스오일",
    "향수 오일",
    "향수오일",
    "원액",
    "타입",
    "type",
    "시향",
    "소분",
    "공병",
    "샘플",
    "쇼퍼백",
    "쇼퍼 백",
    "쇼핑백",
    "쇼핑 백",
    "파우치",
    "케이스",
    "스티커",
    "레몬향",
    "캔들",
    "룸스프레이",
    "방향제",
  ];

  for (const token of hardRejectTokens) {
    if (normalizedTitle.includes(token) && !normalizedQuery.includes(token)) {
      return true;
    }
  }

  if (normalizedTitle.includes("오일") && !normalizedQuery.includes("오일")) {
    return true;
  }

  if (
    normalizedQuery.includes("어벤투스") &&
    !normalizedQuery.includes("코롱") &&
    (normalizedTitle.includes("어벤투스 코롱") || normalizedTitle.includes("aventus cologne"))
  ) {
    return true;
  }

  return false;
}

function isLikelySameProduct(query: string, offer: Pick<DomesticPriceOffer, "title" | "brand">) {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(`${offer.brand ?? ""} ${offer.title}`);

  if (!hasAllVolumeTokens(query, `${offer.brand ?? ""} ${offer.title}`)) {
    return false;
  }

  if (hasRejectedProductMismatch(normalizedQuery, normalizedTitle)) {
    return false;
  }

  const requiredTokens = getRequiredTextTokens(query);

  if (requiredTokens.length < MIN_REQUIRED_TEXT_TOKEN_COUNT) {
    return false;
  }

  return requiredTokens.every(
    (token) => normalizedTitle.includes(token) || hasKnownAliasMatch(normalizedQuery, normalizedTitle, token)
  );
}

function resolveUrl(value: string | undefined | null, baseUrl: string) {
  const cleaned = cleanText(value);

  if (!cleaned || cleaned.startsWith("data:")) {
    return undefined;
  }

  try {
    if (cleaned.startsWith("//")) {
      return `https:${cleaned}`;
    }

    return new URL(cleaned, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function isPlaceholderImage(url: string | undefined) {
  if (!url) {
    return true;
  }

  const normalized = url.toLowerCase();
  return normalized.includes("noimg") || normalized.includes("nodata") || normalized.includes("blank");
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

function getSearchUrl(sourceId: DomesticPriceSourceId, query: string) {
  if (sourceId === "ssg") {
    return `https://www.ssg.com/search.ssg?query=${encodeURIComponent(query)}`;
  }

  return `https://search.danawa.com/dsearch.php?k1=${encodeURIComponent(query)}`;
}

function scoreDomesticOffer(query: string, offer: Pick<DomesticPriceOffer, "title" | "brand" | "krwPrice">) {
  const title = normalizeText(`${offer.brand ?? ""} ${offer.title}`);
  const volumeTokens = getVolumeTokens(query);
  const textTokens = getRequiredTextTokens(query);
  const matchedTextCount = textTokens.filter((token) => title.includes(token)).length;
  const titleVolumeTokens = new Set(getVolumeTokens(`${offer.brand ?? ""} ${offer.title}`));
  const matchedVolumeCount = volumeTokens.filter((token) => titleVolumeTokens.has(token)).length;
  const variantPenaltyTokens = ["세트", "2종", "기획", "리필", "컨디셔너", "로션", "맨", "men", "homme", "absolu"];

  let score = 0;

  if (volumeTokens.length && matchedVolumeCount === volumeTokens.length) {
    score += 8;
  }

  for (const token of textTokens) {
    if (title.includes(token)) {
      score += token.length >= 4 ? 5 : 3;
    }
  }

  if (matchedTextCount >= Math.min(2, textTokens.length)) {
    score += 6;
  }

  if (offer.krwPrice > 0) {
    score += 1;
  }

  const normalizedQuery = normalizeText(query);

  for (const token of variantPenaltyTokens) {
    if (title.includes(token) && !normalizedQuery.includes(token)) {
      score -= 10;
    }
  }

  if (normalizedQuery.includes("샴푸") && title.includes("컨디셔너")) {
    score -= 24;
  }

  if (normalizedQuery.includes("에센스") && title.includes("로션") && !normalizedQuery.includes("로션")) {
    score -= 16;
  }

  return score;
}

function filterAndRankOffers(query: string, offers: DomesticPriceOffer[]) {
  const seen = new Set<string>();

  return offers
    .filter((offer) => isLikelySameProduct(query, offer))
    .map((offer) => ({
      ...offer,
      matchScore: scoreDomesticOffer(query, offer),
    }))
    .filter((offer) => offer.matchScore >= MIN_MATCH_SCORE)
    .filter((offer) => {
      const key = `${offer.sourceId}:${normalizeText(offer.title)}:${offer.krwPrice}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.krwPrice - right.krwPrice;
    })
    .slice(0, MAX_OFFERS)
    .sort((left, right) => left.krwPrice - right.krwPrice);
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: DOMESTIC_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function crawlDanawa(query: string): Promise<DomesticCrawlerResult> {
  const searchUrl = getSearchUrl("danawa", query);
  const html = await fetchHtml(searchUrl);
  const $ = load(html);
  const offers: DomesticPriceOffer[] = [];

  $(".prod_main_info").each((_, element) => {
    const root = $(element);
    const title = cleanText(root.find(".prod_name a").first().text());
    const sourceUrl = resolveUrl(root.find(".prod_name a").first().attr("href"), "https://search.danawa.com");
    const krwPrice = parseNumber(root.find(".price_sect strong").first().text());
    const imageUrl = resolveUrl(
      root.find(".thumb_image img, img").first().attr("data-original") ??
        root.find(".thumb_image img, img").first().attr("src"),
      "https://search.danawa.com"
    );

    if (!title || !sourceUrl || !krwPrice) {
      return;
    }

    offers.push({
      id: `danawa-${offers.length}-${krwPrice}`,
      sourceId: "danawa",
      sourceName: "다나와",
      title,
      krwPrice,
      imageUrl: isPlaceholderImage(imageUrl) ? undefined : imageUrl,
      sourceUrl,
      searchUrl,
      note: cleanText(root.find(".mall_count").first().text()) || "가격비교 검색 결과",
      matchScore: 0,
    });
  });

  const rankedOffers = filterAndRankOffers(query, offers);

  return {
    offers: rankedOffers,
    status: {
      sourceId: "danawa",
      sourceName: "다나와",
      state: "live",
      message: rankedOffers.length ? `국내 가격 후보 ${rankedOffers.length}건` : "일치 후보 없음",
      searchUrl,
      offerCount: rankedOffers.length,
    },
  };
}

function collectSsgItems(value: unknown, items: SsgSearchItem[] = []) {
  if (!value || typeof value !== "object") {
    return items;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSsgItems(item, items);
    }

    return items;
  }

  const item = value as SsgSearchItem & Record<string, unknown>;

  if (typeof item.itemName === "string" && item.priceInfo && typeof item.priceInfo === "object") {
    items.push(item);
  }

  for (const child of Object.values(item)) {
    if (typeof child === "object") {
      collectSsgItems(child, items);
    }
  }

  return items;
}

async function crawlSsg(query: string): Promise<DomesticCrawlerResult> {
  const searchUrl = getSearchUrl("ssg", query);
  const html = await fetchHtml(searchUrl);
  const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];

  if (!nextData) {
    throw new Error("Missing SSG search data");
  }

  const payload = JSON.parse(nextData) as unknown;
  const items = collectSsgItems(payload).slice(0, 80);
  const offers: DomesticPriceOffer[] = [];

  for (const item of items) {
    const title = cleanText(item.itemName);
    const krwPrice = parseNumber(item.priceInfo?.primaryPrice);
    const sourceUrl = resolveUrl(item.itemUrl, "https://www.ssg.com");
    const imageUrl = resolveUrl(item.itemImgUrl, "https://www.ssg.com");

    if (!title || !krwPrice || !sourceUrl) {
      continue;
    }

    offers.push({
      id: `ssg-${item.itemId ?? offers.length}`,
      sourceId: "ssg",
      sourceName: "SSG.COM",
      title,
      brand: cleanText(item.brandName) || undefined,
      krwPrice,
      regularKrwPrice: parseNumber(item.priceInfo?.strikeOutPrice),
      discountRate: parsePercent(item.priceInfo?.discountRate),
      imageUrl: isPlaceholderImage(imageUrl) ? undefined : imageUrl,
      sourceUrl,
      searchUrl,
      note: "공개 검색 결과",
      matchScore: 0,
    });
  }

  const rankedOffers = filterAndRankOffers(query, offers);

  return {
    offers: rankedOffers,
    status: {
      sourceId: "ssg",
      sourceName: "SSG.COM",
      state: "live",
      message: rankedOffers.length ? `국내 판매 후보 ${rankedOffers.length}건` : "일치 후보 없음",
      searchUrl,
      offerCount: rankedOffers.length,
    },
  };
}

function getBlockedStatus(
  sourceId: DomesticPriceSourceId,
  query: string,
  message: string,
  state: DomesticPriceStatus["state"] = "blocked"
): DomesticCrawlerResult {
  return {
    offers: [],
    status: {
      sourceId,
      sourceName: sourceId === "ssg" ? "SSG.COM" : "다나와",
      state,
      message,
      searchUrl: getSearchUrl(sourceId, query),
      offerCount: 0,
    },
  };
}

async function safelyRunCrawler(
  crawler: () => Promise<DomesticCrawlerResult>,
  fallback: DomesticCrawlerResult
) {
  try {
    return await crawler();
  } catch {
    return fallback;
  }
}

function buildSummary(offers: DomesticPriceOffer[]) {
  if (!offers.length) {
    return createEmptyDomesticPriceSummary();
  }

  const sorted = [...offers].sort((left, right) => left.krwPrice - right.krwPrice);
  const middle = Math.floor(sorted.length / 2);
  const medianKrwPrice =
    sorted.length % 2 === 0
      ? Math.round((sorted[middle - 1].krwPrice + sorted[middle].krwPrice) / 2)
      : sorted[middle].krwPrice;
  const lowestOffer = sorted[0];
  const highestOffer = sorted.at(-1) ?? lowestOffer;

  return {
    offerCount: sorted.length,
    lowestOffer,
    medianKrwPrice,
    highestOffer,
    spreadKrwPrice: highestOffer.krwPrice - lowestOffer.krwPrice,
  };
}

export async function searchDomesticPrices(
  query: string,
  options: SearchDomesticPricesOptions = {}
): Promise<DomesticPriceResult> {
  const trimmedQuery = cleanText(query);
  const searchedAt = formatTimestamp();

  if (!trimmedQuery) {
    return {
      query: "",
      offers: [],
      statuses: [],
      searchedAt,
      summary: createEmptyDomesticPriceSummary(),
    };
  }

  const cached = !options.bypassCache ? resultCache.get(trimmedQuery) : undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const [danawaResult, ssgResult] = await Promise.all([
    safelyRunCrawler(
      () => crawlDanawa(trimmedQuery),
      getBlockedStatus("danawa", trimmedQuery, "다나와 검색 결과를 불러오지 못했습니다.", "error")
    ),
    safelyRunCrawler(
      () => crawlSsg(trimmedQuery),
      getBlockedStatus("ssg", trimmedQuery, "SSG.COM 검색 결과를 불러오지 못했습니다.", "error")
    ),
  ]);
  const offers = [...danawaResult.offers, ...ssgResult.offers]
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.krwPrice - right.krwPrice;
    })
    .slice(0, MAX_OFFERS)
    .sort((left, right) => left.krwPrice - right.krwPrice);
  const result = {
    query: trimmedQuery,
    offers,
    statuses: [danawaResult.status, ssgResult.status],
    searchedAt,
    summary: buildSummary(offers),
  };

  if (!options.bypassCache) {
    resultCache.set(trimmedQuery, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      result,
    });
  }

  return result;
}
