import { load } from "cheerio";
import {
  buildLiveOffersFromExternalSnapshot,
  getExternalSnapshotFreshnessHours,
  isExternalSnapshotFresh,
  readExternalStoreSnapshot,
} from "./external-store-snapshots";
import { getStoreById, products, type OfferStatus, type Product, type StoreId } from "./site-data";
import { createEmptyPriceRangeSummary, type DutyFreeSearchResult, type LiveOffer, type StoreSearchStatus } from "./search-types";
import { buildSourceHealth } from "./source-policy";

type StoreCrawlerResult = {
  offers: LiveOffer[];
  status: StoreSearchStatus;
  candidates?: LiveOffer[];
};

type ImageRoot = {
  find: (selector: string) => {
    first: () => {
      attr: (name: string) => string | undefined;
    };
  };
};

type ShillaAjaxProduct = {
  skuNo?: string;
  code?: string;
  refNo?: string;
  name?: string;
  productNameForDisp?: string;
  brandName?: string;
  brandDisplayName?: string;
  discountPrice?: number;
  discountRate?: number;
  stockAvailable?: number;
  stockReserved?: number;
  hideWonPrice?: boolean;
  couponYn?: boolean;
  giftYn?: boolean;
  fiveHourShopYn?: boolean;
  specialPriceYn?: boolean;
  specialSaleYn?: boolean;
  galleryImages?: Array<Record<string, { url?: string }>>;
  giftThumbnail?: string[];
  userPrice?: {
    salePrice?: number;
    guestPrice?: number;
    discountPrice?: number;
    discountRate?: number;
  };
};

export type SearchDutyFreeOptions = {
  bypassCache?: boolean;
};

const REQUEST_TIMEOUT_MS = 20000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_HEADERS = {
  "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};
const resultCache = new Map<string, { expiresAt: number; result: DutyFreeSearchResult }>();
const candidateCache = new Map<string, { expiresAt: number; result: DutyFreeSearchResult }>();

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return cleanText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 0);
}

function hasKoreanText(value: string) {
  return /[가-힣]/u.test(value);
}

function includesSearchToken(haystack: string, token: string) {
  if (!token || !haystack.includes(token)) {
    return false;
  }

  if (!hasKoreanText(token)) {
    return true;
  }

  return haystack.split(/\s+/).some((part) => part === token || part.startsWith(token));
}

function getCompactSearchKey(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getKnownProductSearchValues(product: Product) {
  return [
    product.query,
    product.displayName,
    `${product.brand} ${product.name} ${product.volume}`,
    `${product.name} ${product.volume}`,
    ...product.searchTerms,
  ];
}

function findKnownProduct(query: string) {
  const queryKey = getCompactSearchKey(query);

  if (!queryKey) {
    return undefined;
  }

  return products.find((product) =>
    getKnownProductSearchValues(product).some((value) => {
      const valueKey = getCompactSearchKey(value);

      if (!valueKey) {
        return false;
      }

      return queryKey === valueKey || queryKey.includes(valueKey) || valueKey.includes(queryKey);
    })
  );
}

function getCrawlerSearchQueries(query: string) {
  const product = findKnownProduct(query);

  if (!product) {
    return [query];
  }

  return dedupeText([
    product.query,
    `${product.name} ${product.volume}`,
    product.displayName,
    `${product.brand} ${product.name} ${product.volume}`,
    ...(isSpecificSearchQuery(query) ? [query] : []),
  ]).slice(0, 4);
}

function isSpecificSearchQuery(query: string) {
  const volumeTokens = getVolumeTokens(query);
  const textTokens = getTokens(query).filter((token) => token.length > 1 && !volumeTokens.includes(token));

  return volumeTokens.length > 0 || textTokens.length >= 2;
}

function parseNumber(value: string | undefined | null) {
  const numeric = cleanText(value).replace(/[^0-9.]/g, "");

  if (!numeric) {
    return undefined;
  }

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePercent(value: string | undefined | null) {
  const numeric = cleanText(value).replace(/[^0-9.]/g, "");

  if (!numeric) {
    return undefined;
  }

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getFirstSrcsetCandidate(value: string | undefined | null) {
  return cleanText(value)
    .split(",")
    .map((part) => cleanText(part).split(/\s+/)[0])
    .find(Boolean);
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
  return (
    normalized.includes("noimg") ||
    normalized.includes("img_default") ||
    normalized.includes("img_blank") ||
    normalized.includes("/offer/gwp/")
  );
}

function extractImageUrl(root: ImageRoot, baseUrl: string) {
  const image = root.find("img").first();
  const candidates = [
    getFirstSrcsetCandidate(image.attr("data-srcset")),
    image.attr("data-original"),
    image.attr("data-src"),
    getFirstSrcsetCandidate(image.attr("srcset")),
    image.attr("src"),
  ];

  for (const candidate of candidates) {
    const imageUrl = resolveUrl(candidate, baseUrl);

    if (!isPlaceholderImage(imageUrl)) {
      return imageUrl;
    }
  }

  return undefined;
}

function computeDiscountRate(regularUsdPrice: number | undefined, usdPrice: number) {
  if (!regularUsdPrice || regularUsdPrice <= usdPrice) {
    return undefined;
  }

  return Math.round(((regularUsdPrice - usdPrice) / regularUsdPrice) * 100);
}

function detectOfferStatus(text: string): OfferStatus {
  const normalized = normalizeText(text);

  if (!normalized) {
    return "available";
  }

  if (normalized.includes("sold out")) {
    return "soldout";
  }

  if (normalized.includes("limited")) {
    return "limited";
  }

  return "available";
}

function dedupeText(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.replace(/\s+/g, "");

    if (!cleaned || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function normalizeEventBadge(value: string) {
  const cleaned = cleanText(value);
  const compact = cleaned.replace(/\s+/g, "");

  if (!compact) {
    return null;
  }

  if (/^\d+시간전$/u.test(compact) || /^\d+일전$/u.test(compact)) {
    return null;
  }

  if (compact.includes("핫세일")) {
    return "핫세일";
  }

  if (compact.includes("모바일특가")) {
    return "모바일특가";
  }

  if (compact.includes("온라인단독")) {
    return "온라인단독";
  }

  if (compact.includes("쿠폰")) {
    return "쿠폰";
  }

  if (compact.includes("적립금")) {
    return "적립금";
  }

  if (compact.includes("사은품")) {
    return "사은품";
  }

  if (compact.includes("세일")) {
    return "세일";
  }

  if (compact.includes("혜택")) {
    return "혜택";
  }

  if (compact.includes("베스트") || compact.includes("신상품") || compact.includes("new")) {
    return null;
  }

  return cleaned.length <= 10 ? cleaned : null;
}

function collectEventBadges(values: string[], giftCount?: number) {
  const badges = dedupeText(values.map((value) => normalizeEventBadge(value) ?? "").filter(Boolean));

  if (giftCount && giftCount > 0) {
    const giftLabel = giftCount > 1 ? `사은품 ${giftCount}종` : "사은품";
    const withoutGift = badges.filter((badge) => badge !== "사은품");
    return dedupeText([giftLabel, ...withoutGift]).slice(0, 4);
  }

  return badges.slice(0, 4);
}

function getVolumeTokens(value: string) {
  const matches = cleanText(value).match(/\d+(?:\.\d+)?\s?(?:ml|g|kg|oz|cl|l)\b/gi);
  return matches ? matches.map((match) => normalizeText(match)) : [];
}

function scoreOffer(query: string, offer: Pick<LiveOffer, "title" | "brand" | "krwPrice">) {
  const normalizedQuery = normalizeText(query);
  const title = normalizeText(`${offer.brand} ${offer.title}`);
  const queryTokens = getTokens(query);
  const volumeTokens = getVolumeTokens(query);

  let score = 0;

  if (title.includes(normalizedQuery)) {
    score += 20;
  }

  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += token.length >= 4 ? 4 : 2;
    }
  }

  for (const volume of volumeTokens) {
    if (title.includes(volume)) {
      score += 8;
    }
  }

  if (offer.krwPrice > 0) {
    score += 1;
  }

  return score;
}

function hasQueryTextSignal(query: string, offer: Pick<LiveOffer, "title" | "brand">) {
  const haystack = normalizeText(`${offer.brand} ${offer.title}`);
  const rawHaystack = cleanText(`${offer.brand} ${offer.title}`).normalize("NFKC").toLowerCase();
  const volumeTokens = new Set(getVolumeTokens(query));
  const textTokens = getTokens(query).filter((token) => token.length > 1 && !volumeTokens.has(token));
  const matchedTextCount = textTokens.filter((token) => includesSearchToken(haystack, token)).length;
  const matchedVolumeCount = Array.from(volumeTokens).filter((token) => haystack.includes(token)).length;
  const rawTextTokens = cleanText(query)
    .normalize("NFKC")
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 1 && !getVolumeTokens(token).length);
  const matchedRawTextCount = rawTextTokens.filter((token) => includesSearchToken(rawHaystack, token)).length;

  if (volumeTokens.size > 0 && matchedVolumeCount !== volumeTokens.size) {
    return false;
  }

  if (!textTokens.length) {
    return !rawTextTokens.length || rawTextTokens.some((token) => includesSearchToken(rawHaystack, token));
  }

  if (textTokens.length === 1) {
    return matchedTextCount === 1 || matchedRawTextCount === 1;
  }

  const requiredTextCount = Math.min(2, textTokens.length);
  const requiredRawTextCount = Math.min(2, rawTextTokens.length);

  return (
    matchedTextCount >= requiredTextCount ||
    (requiredRawTextCount > 0 && matchedRawTextCount >= requiredRawTextCount)
  );
}

function hasRelatedQuerySignal(query: string, offer: Pick<LiveOffer, "title" | "brand">) {
  const haystack = normalizeText(`${offer.brand} ${offer.title}`);
  const rawHaystack = cleanText(`${offer.brand} ${offer.title}`).normalize("NFKC").toLowerCase();
  const volumeTokens = new Set(getVolumeTokens(query));
  const textTokens = getTokens(query).filter((token) => token.length > 1 && !volumeTokens.has(token));
  const rawTextTokens = cleanText(query)
    .normalize("NFKC")
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 1 && !getVolumeTokens(token).length);
  const matchedVolumeCount = Array.from(volumeTokens).filter((token) => haystack.includes(token)).length;
  const matchedTextCount = textTokens.filter((token) => includesSearchToken(haystack, token)).length;
  const matchedRawTextCount = rawTextTokens.filter((token) => includesSearchToken(rawHaystack, token)).length;

  if (volumeTokens.size > 0 && matchedVolumeCount === 0) {
    return false;
  }

  return matchedTextCount > 0 || matchedRawTextCount > 0;
}

function hasKnownVariantMismatch(query: string, offer: Pick<LiveOffer, "title" | "brand">) {
  const normalizedQuery = normalizeText(query);
  const normalizedOffer = normalizeText(`${offer.brand} ${offer.title}`);
  const queryHasAventus = normalizedQuery.includes("aventus") || normalizedQuery.includes("어벤투스");

  if (!queryHasAventus) {
    return false;
  }

  const aventusVariantTokens = ["cologne", "코롱", "absolu", "앱솔루", "for her", "포허"];

  return aventusVariantTokens.some(
    (token) => normalizedOffer.includes(token) && !normalizedQuery.includes(token)
  );
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

function buildPriceRangeSummary(offers: LiveOffer[]) {
  if (!offers.length) {
    return createEmptyPriceRangeSummary();
  }

  const sorted = [...offers].sort((left, right) => left.krwPrice - right.krwPrice);
  const lowestOffer = sorted[0];
  const highestOffer = sorted.at(-1) ?? lowestOffer;

  return {
    offerCount: sorted.length,
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

function buildShillaEventMap(html: string) {
  const $ = load(html);
  const eventMap = new Map<string, string[]>();

  $(".product_box").each((_, element) => {
    const root = $(element);
    const input = root.find("input[data-productcode]").first();
    const productCode = cleanText(input.attr("data-productcode"));
    const productName = cleanText(input.attr("data-name") ?? root.find(".info_name").first().text());

    if (!productCode) {
      return;
    }

    const badgeTexts = root
      .find(".info_sort li")
      .map((__, badgeElement) => cleanText($(badgeElement).text()))
      .get();
    const giftCount = root.find(".pro_giftarea .thum_item").length;

    if (input.attr("data-couponyn") === "true") {
      badgeTexts.push("쿠폰");
    }

    if (input.attr("data-giftyn") === "true" && giftCount === 0) {
      badgeTexts.push("사은품");
    }

    const badges = collectEventBadges(badgeTexts, giftCount);
    eventMap.set(productCode, badges);

    const normalizedProductName = normalizeText(productName);
    if (normalizedProductName) {
      eventMap.set(normalizedProductName, badges);
    }
  });

  return eventMap;
}

function buildShillaImageMap(html: string) {
  const $ = load(html);
  const imageMap = new Map<string, string>();

  $(".product_box").each((_, element) => {
    const root = $(element);
    const input = root.find("input[data-productcode]").first();
    const productCode = cleanText(input.attr("data-productcode") ?? input.attr("data-code"));
    const skuNo = cleanText(input.attr("data-skuno") ?? input.attr("data-sku"));
    const productName = cleanText(input.attr("data-name") ?? root.find(".info_name").first().text());
    const imageUrl = extractImageUrl(root, "https://www.shilladfs.com");

    if (!imageUrl) {
      return;
    }

    if (productCode) {
      imageMap.set(productCode, imageUrl);
    }

    if (skuNo) {
      imageMap.set(skuNo, imageUrl);
    }

    const normalizedProductName = normalizeText(productName);
    if (normalizedProductName) {
      imageMap.set(normalizedProductName, imageUrl);
    }
  });

  return imageMap;
}

function extractShillaGalleryImageUrl(item: ShillaAjaxProduct) {
  const preferredSizes = ["320X", "210X", "470X", "100X", "80X", "0X"];

  for (const galleryImage of item.galleryImages ?? []) {
    for (const size of preferredSizes) {
      const imageUrl = resolveUrl(galleryImage[size]?.url, "https://www.shilladfs.com");

      if (!isPlaceholderImage(imageUrl)) {
        return imageUrl;
      }
    }

    for (const image of Object.values(galleryImage)) {
      const imageUrl = resolveUrl(image?.url, "https://www.shilladfs.com");

      if (!isPlaceholderImage(imageUrl)) {
        return imageUrl;
      }
    }
  }

  return undefined;
}

function buildShillaItemEventBadges(
  item: ShillaAjaxProduct,
  title: string,
  eventMap: Map<string, string[]>
) {
  const badgeTexts = [
    ...(eventMap.get(cleanText(item.code)) ?? []),
    ...(eventMap.get(cleanText(item.skuNo)) ?? []),
    ...(eventMap.get(normalizeText(title)) ?? []),
  ];

  if (item.specialPriceYn || item.specialSaleYn) {
    badgeTexts.push("핫세일");
  }

  if (item.couponYn) {
    badgeTexts.push("쿠폰");
  }

  if (item.giftYn) {
    badgeTexts.push("사은품");
  }

  if (item.fiveHourShopYn) {
    badgeTexts.push("5시간");
  }

  return collectEventBadges(badgeTexts, item.giftThumbnail?.length);
}

function getLotteSearchUrl(query: string) {
  return `https://kor.lottedfs.com/kr/search?comSearchWord=${encodeURIComponent(query)}`;
}

function getHyundaiSearchUrl(query: string) {
  return `https://m.hddfs.com/shop/sr/searchResult.do?searchTerm=${encodeURIComponent(
    query
  )}&searchType=basic`;
}

function getShillaSearchUrl(query: string) {
  return `https://www.shilladfs.com/estore/kr/ko/search?text=${encodeURIComponent(query)}`;
}

function getShinsegaeSearchUrl() {
  return "https://www.ssgdfs.com/kr/main/initMain";
}

const SHINSEGAE_SOURCE_PAGES = [
  { label: "메인", url: "https://www.ssgdfs.com/kr/main/initMain" },
  { label: "타임세일", url: "https://www.ssgdfs.com/kr/shop/initTimeSale" },
  { label: "3시간전", url: "https://www.ssgdfs.com/kr/shop/initThreeHours" },
  { label: "세일", url: "https://www.ssgdfs.com/kr/shop/initSaleAllView?type=2" },
  { label: "뷰티", url: "https://www.ssgdfs.com/kr/dispctg/ctg/beauty" },
  { label: "패션", url: "https://www.ssgdfs.com/kr/dispctg/ctg/fashion" },
  { label: "럭셔리", url: "https://www.ssgdfs.com/kr/shop/luxury" },
  { label: "주류", url: "https://www.ssgdfs.com/kr/shop/liquor_home" },
] as const;

type ShinsegaeSourcePage = (typeof SHINSEGAE_SOURCE_PAGES)[number];

function extractShinsegaeExchangeRate(html: string) {
  return (
    parseNumber(html.match(/"exchange_rate(?:_dal)?":"([0-9.]+)"/)?.[1]) ??
    parseNumber(html.match(/오늘의 환율\$1\s*=\s*([0-9.,]+)원/)?.[1])
  );
}

function extractShinsegaeDetailParam(onclick: string, key: string) {
  return cleanText(onclick.match(new RegExp(`${key}\\s*:\\s*'([^']*)'`))?.[1]);
}

function extractTitleBracketBadges(title: string) {
  return Array.from(title.matchAll(/\[([^[\]]+)\]/g))
    .map((match) => cleanText(match[1]))
    .flatMap((label) => {
      if (!label) {
        return [];
      }

      if (label.includes("신세계단독")) {
        return ["신세계단독"];
      }

      if (label.includes("면세전용")) {
        return ["면세전용"];
      }

      if (label.includes("사은")) {
        return ["사은품"];
      }

      if (label.length <= 12) {
        return [label];
      }

      return [];
    });
}

function buildShinsegaeEventBadges(title: string, discountRate?: number, isDailyPick = false) {
  return dedupeText(
    [
      ...(isDailyPick ? ["추천"] : []),
      ...(discountRate ? ["세일"] : []),
      ...extractTitleBracketBadges(title),
    ].filter(Boolean)
  ).slice(0, 4);
}

function hasShinsegaeQueryMatch(query: string, offer: Pick<LiveOffer, "title" | "brand">) {
  const haystack = normalizeText(`${offer.brand} ${offer.title}`);
  const normalizedQuery = normalizeText(query);
  const queryTokens = getTokens(query).filter((token) => token.length > 1);
  const volumeTokens = getVolumeTokens(query);
  const textTokens = queryTokens.filter((token) => !volumeTokens.includes(token));
  const matchedTextCount = textTokens.filter((token) => haystack.includes(token)).length;
  const matchedVolumeCount = volumeTokens.filter((token) => haystack.includes(token)).length;

  if (!normalizedQuery) {
    return false;
  }

  if (haystack.includes(normalizedQuery)) {
    return true;
  }

  if (volumeTokens.length > 0 && matchedVolumeCount !== volumeTokens.length) {
    return false;
  }

  if (textTokens.length === 0) {
    return volumeTokens.length > 0;
  }

  if (textTokens.length === 1) {
    return matchedTextCount === 1;
  }

  return matchedTextCount >= Math.min(2, textTokens.length);
}

async function fetchResponse(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response;
}

async function fetchHtml(url: string, init: RequestInit = {}) {
  const response = await fetchResponse(url, init);
  return response.text();
}

function extractResponseCookies(headers: Headers) {
  const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(headers);
  }

  const rawSetCookie = headers.get("set-cookie");

  if (!rawSetCookie) {
    return [];
  }

  return rawSetCookie.split(/,(?=\s*[^;,=\s]+=[^;]+)/g);
}

function extractShillaCsrfToken(html: string) {
  return cleanText(html.match(/name="CSRFToken"\s+value="([^"]+)"/)?.[1]);
}

function extractShillaExchangeRate(html: string) {
  return parseNumber(html.match(/id="exchangeRate"\s+value="([^"]+)"/)?.[1]);
}

function detectShillaOfferStatus(stockAvailable: number | undefined, stockReserved: number | undefined) {
  const available = stockAvailable ?? 0;
  const reserved = stockReserved ?? 0;

  if (available <= 0 && reserved <= 0) {
    return "soldout" as const;
  }

  if (available > 0 && available <= 3) {
    return "limited" as const;
  }

  return "available" as const;
}

function finalizeStoreResult(
  query: string,
  storeId: StoreId,
  searchUrl: string,
  offers: LiveOffer[],
  resultSourceLabel = "공식 검색 결과"
) {
  const store = getStoreById(storeId);
  const rankedOffers = offers
    .filter((offer) => hasQueryTextSignal(query, offer) && !hasKnownVariantMismatch(query, offer))
    .map((offer) => ({
      ...offer,
      matchScore: scoreOffer(query, offer),
    }))
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.krwPrice - right.krwPrice;
    });
  const relatedCandidates = offers
    .filter((offer) => !rankedOffers.some((rankedOffer) => rankedOffer.id === offer.id))
    .filter((offer) => hasRelatedQuerySignal(query, offer))
    .map((offer) => ({
      ...offer,
      matchScore: scoreOffer(query, offer),
      note: "관련 후보 - 정확 일치 비교 제외",
    }))
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.krwPrice - right.krwPrice;
    })
    .slice(0, 3);

  const bestOffer = rankedOffers[0];
  const statusEventBadges = collectEventBadges(
    rankedOffers.slice(0, 3).flatMap((offer) => offer.eventBadges ?? [])
  );

  return {
    offers: bestOffer
      ? [
          {
            ...bestOffer,
            note:
              rankedOffers.length > 1
                ? `${resultSourceLabel} ${rankedOffers.length}건 중 가장 가까운 상품`
                : `${resultSourceLabel} 기준`,
          },
        ]
      : [],
    status: {
      storeId,
      state: "live" as const,
      message: bestOffer
        ? `${store?.name ?? storeId} ${resultSourceLabel} ${rankedOffers.length}건 확인`
        : `${store?.name ?? storeId}에서 일치하는 결과를 찾지 못했습니다.`,
      searchUrl,
      offerCount: rankedOffers.length,
      eventBadges: statusEventBadges,
    },
    candidates: [...rankedOffers, ...relatedCandidates],
  };
}

async function crawlLotte(query: string): Promise<StoreCrawlerResult> {
  const store = getStoreById("lotte");
  const searchUrl = getLotteSearchUrl(query);
  const html = await fetchHtml(searchUrl);
  const $ = load(html);
  const updatedAt = formatTimestamp();
  const offers: LiveOffer[] = [];

  $("a.unit_link.js-contextmenu[data-prdno]").each((_, element) => {
    const card = $(element);
    const prdNo = card.attr("data-prdno");
    const title = cleanText(card.find(".unit_info .name").first().text());
    const brand = cleanText(card.find(".unit_info .brand").first().text());
    const regularUsdPrice = parseNumber(card.find(".price01").first().text());
    const usdPrice = parseNumber(card.find(".price02").first().text()) ?? regularUsdPrice;
    const krwPrice = parseNumber(card.find(".price03").first().text());
    const discountRate =
      parsePercent(card.find(".sale").first().text()) ??
      (usdPrice ? computeDiscountRate(regularUsdPrice, usdPrice) : undefined);

    if (!prdNo || !title || !brand || !usdPrice || !krwPrice) {
      return;
    }

    offers.push({
      id: `lotte-${prdNo}`,
      storeId: "lotte",
      title,
      brand,
      usdPrice,
      regularUsdPrice,
      krwPrice,
      discountRate,
      imageUrl: extractImageUrl(card, "https://kor.lottedfs.com"),
      status: detectOfferStatus(card.find(".unit_flag").text()),
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: `https://kor.lottedfs.com/kr/product/productDetail?prdNo=${prdNo}`,
      searchUrl,
      note: "공식 검색 결과 기준",
      eventBadges: collectEventBadges(
        card
          .find(".unit_flag.list_flag span, .unit_flag.thmb_flag span")
          .map((__, badgeElement) => cleanText($(badgeElement).text()))
          .get()
      ),
      matchScore: 0,
    });
  });

  return finalizeStoreResult(query, "lotte", searchUrl, offers);
}

async function crawlHyundai(query: string): Promise<StoreCrawlerResult> {
  const store = getStoreById("hyundai");
  const searchUrl = getHyundaiSearchUrl(query);
  const html = await fetchHtml(searchUrl);
  const $ = load(html);
  const updatedAt = formatTimestamp();
  const offers: LiveOffer[] = [];

  $(".prd_tit2[data-gooscd]").each((_, element) => {
    const card = $(element);
    const root = card.closest("li");
    const goosCd = card.attr("data-gooscd");
    const title = cleanText(card.attr("data-goosnm") ?? card.find(".goosNm").first().text());
    const brand = cleanText(card.attr("data-brannm") ?? card.find(".brand").first().text());
    const regularUsdPrice = parseNumber(card.find(".be").first().text());
    const usdPrice =
      parseNumber(card.find(".sale").first().attr("data-price")) ??
      parseNumber(card.find(".sale").first().text()) ??
      regularUsdPrice;
    const krwPrice =
      parseNumber(card.find(".won").first().attr("data-price")) ??
      parseNumber(card.find(".won").first().text());
    const discountRate =
      parsePercent(card.find(".be_per").first().text()) ??
      (usdPrice ? computeDiscountRate(regularUsdPrice, usdPrice) : undefined);
    const href = card.find("a").first().attr("href");

    if (!goosCd || !title || !brand || !usdPrice || !krwPrice || !href) {
      return;
    }

    offers.push({
      id: `hyundai-${goosCd}`,
      storeId: "hyundai",
      title,
      brand,
      usdPrice,
      regularUsdPrice,
      krwPrice,
      discountRate,
      imageUrl: extractImageUrl(root.length ? root : card, "https://m.hddfs.com"),
      status: detectOfferStatus(card.find(".prd_condition").text()),
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: href.startsWith("http") ? href : `https://m.hddfs.com${href}`,
      searchUrl,
      note: "공식 검색 결과 기준",
      eventBadges: collectEventBadges(
        card
          .find(".prd_condition span")
          .map((__, badgeElement) => cleanText($(badgeElement).text()))
          .get()
      ),
      matchScore: 0,
    });
  });

  return finalizeStoreResult(query, "hyundai", searchUrl, offers);
}

async function crawlShilla(query: string): Promise<StoreCrawlerResult> {
  const store = getStoreById("shilla");
  const searchUrl = getShillaSearchUrl(query);
  const searchResponse = await fetchResponse(searchUrl);
  const html = await searchResponse.text();
  const shillaEventMap = buildShillaEventMap(html);
  const shillaImageMap = buildShillaImageMap(html);
  const csrfToken = extractShillaCsrfToken(html);
  const exchangeRate = extractShillaExchangeRate(html);
  const cookieHeader = extractResponseCookies(searchResponse.headers)
    .map((cookie) => cookie.split(";")[0])
    .filter(Boolean)
    .join("; ");

  if (!csrfToken || !exchangeRate || !cookieHeader) {
    throw new Error("Missing Shilla session data");
  }

  const requestBody = new URLSearchParams({
    json: JSON.stringify({
      category: [],
      sort: "topSelling",
      size: "40",
      page: 0,
      text: query,
      within: "",
      query: "",
      pagination: "",
      condition: {
        brand: [],
        gender: [],
        priceRange: [0, 999999],
        discountRate: "0",
        giftYnOption: false,
        isNewProductOption: false,
        fastShopYnOption: false,
        fiveHourShopYnOption: false,
        parallelImportationOption: false,
        couponYnOption: false,
        flatPriceYnOption: false,
      },
    }),
    CSRFToken: csrfToken,
  });

  const ajaxResponse = await fetchResponse("https://www.shilladfs.com/estore/kr/ko/ajaxProducts", {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      origin: "https://www.shilladfs.com",
      referer: searchUrl,
      cookie: cookieHeader,
      "x-requested-with": "XMLHttpRequest",
    },
    body: requestBody,
  });
  const payload = (JSON.parse(await ajaxResponse.text()) as { results?: ShillaAjaxProduct[] }) ?? {};
  const updatedAt = formatTimestamp();
  const offers: LiveOffer[] = [];

  for (const item of payload.results ?? []) {
    const skuNo = cleanText(item.skuNo);
    const code = cleanText(item.code);
    const title = cleanText(item.productNameForDisp ?? item.name);
    const brand = cleanText(item.brandDisplayName ?? item.brandName);
    const regularUsdPrice =
      Number(item.userPrice?.salePrice ?? item.userPrice?.guestPrice ?? 0) || undefined;
    const usdPrice =
      Number(item.discountPrice ?? item.userPrice?.discountPrice ?? regularUsdPrice ?? 0) || undefined;

    if (!skuNo || !title || !brand || !usdPrice) {
      continue;
    }

    offers.push({
      id: `shilla-${skuNo}`,
      storeId: "shilla",
      title,
      brand,
      usdPrice,
      regularUsdPrice,
      krwPrice: Math.round(usdPrice * exchangeRate),
      discountRate:
        Number(item.discountRate ?? item.userPrice?.discountRate ?? 0) ||
        computeDiscountRate(regularUsdPrice, usdPrice),
      imageUrl:
        extractShillaGalleryImageUrl(item) ??
        shillaImageMap.get(code) ??
        shillaImageMap.get(skuNo) ??
        shillaImageMap.get(normalizeText(title)),
      status: detectShillaOfferStatus(item.stockAvailable, item.stockReserved),
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: code ? `https://www.shilladfs.com/estore/kr/ko/search?text=${encodeURIComponent(title)}` : searchUrl,
      searchUrl,
      note: "공식 검색 결과 기준",
      eventBadges: buildShillaItemEventBadges(item, title, shillaEventMap),
      matchScore: 0,
    });
  }

  return finalizeStoreResult(query, "shilla", searchUrl, offers);
}

function parseShinsegaeSourceOffers(
  query: string,
  source: ShinsegaeSourcePage,
  html: string,
  exchangeRate: number
) {
  const store = getStoreById("shinsegae");
  const $ = load(html);
  const updatedAt = formatTimestamp();
  const seenIds = new Set<string>();
  const offers: LiveOffer[] = [];

  $(".prodCont").each((_, element) => {
    const root = $(element);
    const onclick =
      cleanText(root.attr("onclick")) ||
      cleanText(root.find("[onclick*='goDetail']").first().attr("onclick"));
    const goosCd = extractShinsegaeDetailParam(onclick, "goos_cd");
    const title = cleanText(root.find(".prodName").first().text());
    const brand =
      cleanText(root.find(".brandName").first().text()) || extractShinsegaeDetailParam(onclick, "bran_nm");
    const usdPrice = parseNumber(root.find(".saleDollar").first().text());
    const discountRate = parsePercent(root.find(".saleNum").first().text());
    const isDailyPick = Boolean(cleanText(root.find(".dailyPicks").first().text()));

    if (!goosCd || seenIds.has(goosCd) || !title || !brand || !usdPrice) {
      return;
    }

    const offer = {
      id: `shinsegae-${goosCd}`,
      storeId: "shinsegae" as const,
      title,
      brand,
      usdPrice,
      regularUsdPrice:
        discountRate && discountRate > 0 && discountRate < 100
          ? Number((usdPrice / (1 - discountRate / 100)).toFixed(2))
          : undefined,
      krwPrice: Math.round(usdPrice * exchangeRate),
      discountRate,
      imageUrl: extractImageUrl(root, source.url),
      status: "available" as const,
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: source.url,
      searchUrl: source.url,
      note: `신세계 ${source.label} 기준`,
      eventBadges: buildShinsegaeEventBadges(title, discountRate, isDailyPick),
      matchScore: 0,
    };

    if (!hasShinsegaeQueryMatch(query, offer)) {
      return;
    }

    seenIds.add(goosCd);
    offers.push(offer);
  });

  return offers;
}

async function crawlShinsegaeOfficialPages(query: string): Promise<StoreCrawlerResult> {
  const settledPages = await Promise.allSettled(
    SHINSEGAE_SOURCE_PAGES.map(async (source) => ({
      source,
      html: await fetchHtml(source.url),
    }))
  );
  const successfulPages = settledPages
    .filter((page): page is PromiseFulfilledResult<{ source: ShinsegaeSourcePage; html: string }> => {
      return page.status === "fulfilled";
    })
    .map((page) => page.value);
  const exchangeRate = successfulPages
    .map((page) => extractShinsegaeExchangeRate(page.html))
    .find((value): value is number => Boolean(value));

  if (!successfulPages.length || !exchangeRate) {
    throw new Error("No accessible Shinsegae source pages");
  }

  const offerMap = new Map<string, LiveOffer>();

  for (const page of successfulPages) {
    for (const offer of parseShinsegaeSourceOffers(query, page.source, page.html, exchangeRate)) {
      const existingOffer = offerMap.get(offer.id);

      if (!existingOffer || offer.krwPrice < existingOffer.krwPrice) {
        offerMap.set(offer.id, offer);
      }
    }
  }

  return finalizeStoreResult(
    query,
    "shinsegae",
    getShinsegaeSearchUrl(),
    [...offerMap.values()],
    "공식 노출 상품"
  );
}

async function crawlShinsegae(query: string): Promise<StoreCrawlerResult> {
  const snapshot = await readExternalStoreSnapshot(query, "shinsegae");

  if (snapshot && isExternalSnapshotFresh(snapshot)) {
    return finalizeStoreResult(
      query,
      "shinsegae",
      snapshot.searchUrl,
      buildLiveOffersFromExternalSnapshot(snapshot),
      "외부 브라우저 수집"
    );
  }

  try {
    return await crawlShinsegaeOfficialPages(query);
  } catch {
    if (snapshot) {
      return getBlockedStatus(
        "shinsegae",
        query,
        `신세계 외부 수집 데이터가 ${getExternalSnapshotFreshnessHours()}시간을 넘어 보류되었습니다.`
      );
    }

    return getBlockedStatus("shinsegae", query, "신세계는 접근 가능한 공식 노출 상품만 부분 반영 중입니다.");
  }
}

function getBlockedStatus(storeId: StoreId, query: string, message: string): StoreCrawlerResult {
  const searchUrl =
    storeId === "shilla"
      ? getShillaSearchUrl(query)
      : storeId === "shinsegae"
        ? getShinsegaeSearchUrl()
        : storeId === "lotte"
          ? getLotteSearchUrl(query)
          : getHyundaiSearchUrl(query);

  return {
    offers: [],
    status: {
      storeId,
      state: "blocked",
      message,
      searchUrl,
      offerCount: 0,
      eventBadges: [],
    },
  };
}

async function safelyRunCrawler(
  crawler: () => Promise<StoreCrawlerResult>,
  fallback: StoreCrawlerResult
) {
  try {
    return await crawler();
  } catch {
    return fallback;
  }
}

async function runStoreCrawlersWithQueryFallbacks(searchQueries: string[]) {
  const primaryQuery = searchQueries[0] ?? "";
  const crawlerFactories = [
    {
      storeId: "lotte" as const,
      run: crawlLotte,
      fallbackMessage: "롯데면세점 검색 결과를 불러오지 못했습니다.",
    },
    {
      storeId: "hyundai" as const,
      run: crawlHyundai,
      fallbackMessage: "현대면세점 검색 결과를 불러오지 못했습니다.",
    },
    {
      storeId: "shilla" as const,
      run: crawlShilla,
      fallbackMessage: "신라면세점 검색 결과를 불러오지 못했습니다.",
    },
    {
      storeId: "shinsegae" as const,
      run: crawlShinsegae,
      fallbackMessage: "신세계면세점 데이터를 불러오지 못했습니다.",
    },
  ];

  return Promise.all(
    crawlerFactories.map(async ({ storeId, run, fallbackMessage }) => {
      let latestResult: StoreCrawlerResult | null = null;
      let bestCandidateResult: StoreCrawlerResult | null = null;

      for (const searchQuery of searchQueries) {
        const result = await safelyRunCrawler(
          () => run(searchQuery),
          getBlockedStatus(storeId, searchQuery, fallbackMessage)
        );

        latestResult = result;

        if (result.offers.length > 0) {
          return result;
        }

        if (!bestCandidateResult && (result.candidates?.length ?? 0) > 0) {
          bestCandidateResult = result;
        }
      }

      return bestCandidateResult ?? latestResult ?? getBlockedStatus(storeId, primaryQuery, fallbackMessage);
    })
  );
}

function dedupeOffers(offers: LiveOffer[]) {
  const seen = new Set<string>();
  const deduped: LiveOffer[] = [];

  for (const offer of offers) {
    const key = `${offer.storeId}:${offer.id}:${offer.sourceUrl}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(offer);
  }

  return deduped;
}

export async function searchDutyFreeOffersLite(
  query: string,
  options: SearchDutyFreeOptions = {}
): Promise<DutyFreeSearchResult> {
  const trimmedQuery = cleanText(query);
  const searchedAt = formatTimestamp();

  if (!trimmedQuery) {
    return {
      query: "",
      offers: [],
      statuses: [],
      sourceHealth: [],
      searchedAt,
      summary: createEmptyPriceRangeSummary(),
    };
  }

  const cached = !options.bypassCache ? resultCache.get(trimmedQuery) : undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const crawlerQueries = getCrawlerSearchQueries(trimmedQuery);
  const [lotteResult, hyundaiResult, shillaResult, shinsegaeResult] =
    await runStoreCrawlersWithQueryFallbacks(crawlerQueries);

  const statuses = [lotteResult.status, hyundaiResult.status, shillaResult.status, shinsegaeResult.status];
  const result = {
    query: trimmedQuery,
    offers: [...lotteResult.offers, ...hyundaiResult.offers, ...shillaResult.offers, ...shinsegaeResult.offers].sort(
      (left, right) => left.krwPrice - right.krwPrice
    ),
    relatedOffers: dedupeOffers(
      [lotteResult, hyundaiResult, shillaResult, shinsegaeResult].flatMap((crawlerResult) =>
        (crawlerResult.candidates ?? []).filter(
          (candidate) =>
            ![...lotteResult.offers, ...hyundaiResult.offers, ...shillaResult.offers, ...shinsegaeResult.offers].some(
              (offer) => offer.storeId === candidate.storeId && offer.id === candidate.id
            )
        )
      )
    )
      .sort((left, right) => {
        if (right.matchScore !== left.matchScore) {
          return right.matchScore - left.matchScore;
        }

        return left.krwPrice - right.krwPrice;
      })
      .slice(0, 6),
    statuses,
    sourceHealth: buildSourceHealth(statuses, searchedAt),
    searchedAt,
    summary: buildPriceRangeSummary([
      ...lotteResult.offers,
      ...hyundaiResult.offers,
      ...shillaResult.offers,
      ...shinsegaeResult.offers,
    ]),
  };

  if (!options.bypassCache) {
    resultCache.set(trimmedQuery, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      result,
    });
  }

  return result;
}

export async function searchDutyFreeImageCandidatesLite(
  query: string,
  options: SearchDutyFreeOptions = {}
): Promise<DutyFreeSearchResult> {
  const trimmedQuery = cleanText(query);
  const searchedAt = formatTimestamp();

  if (!trimmedQuery) {
    return {
      query: "",
      offers: [],
      statuses: [],
      sourceHealth: [],
      searchedAt,
      summary: createEmptyPriceRangeSummary(),
    };
  }

  const cached = !options.bypassCache ? candidateCache.get(trimmedQuery) : undefined;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const crawlerQueries = getCrawlerSearchQueries(trimmedQuery);
  const [lotteResult, hyundaiResult, shillaResult, shinsegaeResult] =
    await runStoreCrawlersWithQueryFallbacks(crawlerQueries);
  const crawlerResults = [lotteResult, hyundaiResult, shillaResult, shinsegaeResult];
  const offers = dedupeOffers(
    crawlerResults.flatMap((result) => result.candidates ?? result.offers).filter((offer) => offer.imageUrl)
  ).sort((left, right) => {
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore;
    }

    return left.krwPrice - right.krwPrice;
  });

  const statuses = crawlerResults.map((result) => result.status);
  const result = {
    query: trimmedQuery,
    offers,
    statuses,
    sourceHealth: buildSourceHealth(statuses, searchedAt),
    searchedAt,
    summary: buildPriceRangeSummary(offers),
  };

  if (!options.bypassCache) {
    candidateCache.set(trimmedQuery, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      result,
    });
  }

  return result;
}
