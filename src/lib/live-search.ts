import "server-only";

import { load } from "cheerio";
import type { Browser, BrowserContext } from "playwright";
import { getStoreById, type OfferStatus, type StoreId } from "@/lib/site-data";

export type LiveOffer = {
  id: string;
  storeId: StoreId;
  title: string;
  brand: string;
  usdPrice: number;
  krwPrice: number;
  regularUsdPrice?: number;
  discountRate?: number;
  status: OfferStatus;
  pickupAirports: string[];
  updatedAt: string;
  sourceUrl: string;
  searchUrl: string;
  note: string;
  matchScore: number;
};

export type StoreSearchState = "live" | "blocked" | "error";

export type StoreSearchStatus = {
  storeId: StoreId;
  state: StoreSearchState;
  message: string;
  searchUrl: string;
  offerCount: number;
};

export type DutyFreeSearchResult = {
  query: string;
  offers: LiveOffer[];
  statuses: StoreSearchStatus[];
  searchedAt: string;
};

type StoreCrawlerResult = {
  offers: LiveOffer[];
  status: StoreSearchStatus;
};

const REQUEST_TIMEOUT_MS = 20000;
const PLAYWRIGHT_TIMEOUT_MS = 45000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_HEADERS = {
  "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};
const resultCache = new Map<string, { expiresAt: number; result: DutyFreeSearchResult }>();

function cleanText(value: string | undefined | null) {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value: string) {
  return cleanText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 0);
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

  if (
    normalized.includes("품절") ||
    normalized.includes("일시품절") ||
    normalized.includes("sold out")
  ) {
    return "soldout";
  }

  if (
    normalized.includes("재고") ||
    normalized.includes("소량") ||
    normalized.includes("한정") ||
    normalized.includes("limited")
  ) {
    return "limited";
  }

  if (normalized.includes("확인")) {
    return "check";
  }

  return "available";
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

  const queryHasSet = /듀오|세트|기획|set/i.test(query);
  const titleHasSet = /듀오|세트|기획|set/i.test(offer.title);

  if (titleHasSet && !queryHasSet) {
    score -= 3;
  }

  return score;
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

function getShinsegaeSearchUrl(query: string) {
  return `https://www.ssgdfs.com/kr/search/resultsTotal?startCount=0&offShop=&suggestReSearchReq=true&orReSearchReq=true&query=${encodeURIComponent(
    query
  )}`;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: DEFAULT_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function launchPlaywrightBrowser() {
  const { chromium } = await import("playwright");
  const launchOptions = [
    { channel: "msedge" as const },
    { channel: "chrome" as const },
    {},
  ];
  let lastError: unknown;

  for (const option of launchOptions) {
    try {
      return await chromium.launch({
        headless: true,
        args: ["--disable-blink-features=AutomationControlled"],
        ...option,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Playwright browser launch failed");
}

async function createStealthContext(browser: Browser) {
  const context = await browser.newContext({
    locale: "ko-KR",
    userAgent: DEFAULT_HEADERS["user-agent"],
    viewport: { width: 1440, height: 1800 },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
    Object.defineProperty(navigator, "language", {
      get: () => "ko-KR",
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["ko-KR", "ko", "en-US", "en"],
    });
    Object.defineProperty(navigator, "platform", {
      get: () => "Win32",
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4],
    });
  });

  return context;
}

async function withPlaywrightHtml(
  url: string,
  reader: (context: BrowserContext) => Promise<string>
) {
  const browser = await launchPlaywrightBrowser();

  try {
    const context = await createStealthContext(browser);

    try {
      return await reader(context);
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

function finalizeStoreResult(query: string, storeId: StoreId, searchUrl: string, offers: LiveOffer[]) {
  const store = getStoreById(storeId);
  const rankedOffers = offers
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

  const bestOffer = rankedOffers[0];

  return {
    offers: bestOffer
      ? [
          {
            ...bestOffer,
            note:
              rankedOffers.length > 1
                ? `공식 검색 결과 ${rankedOffers.length}건 중 가장 가까운 상품`
                : "공식 검색 결과 기준",
          },
        ]
      : [],
    status: {
      storeId,
      state: "live" as const,
      message: bestOffer
        ? `${store?.name ?? storeId} 검색 결과 ${rankedOffers.length}건 확인`
        : `${store?.name ?? storeId}에서 일치하는 가격 결과를 찾지 못했습니다.`,
      searchUrl,
      offerCount: rankedOffers.length,
    },
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
      status: detectOfferStatus(card.find(".unit_flag").text()),
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: `https://kor.lottedfs.com/kr/product/productDetail?prdNo=${prdNo}`,
      searchUrl,
      note: "공식 검색 결과 기준",
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
      status: detectOfferStatus(card.find(".prd_condition").text()),
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: href.startsWith("http") ? href : `https://m.hddfs.com${href}`,
      searchUrl,
      note: "공식 검색 결과 기준",
      matchScore: 0,
    });
  });

  return finalizeStoreResult(query, "hyundai", searchUrl, offers);
}

async function crawlShilla(query: string): Promise<StoreCrawlerResult> {
  const store = getStoreById("shilla");
  const searchUrl = getShillaSearchUrl(query);
  const updatedAt = formatTimestamp();
  const html = await withPlaywrightHtml(searchUrl, async (context) => {
    const page = await context.newPage();

    try {
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: PLAYWRIGHT_TIMEOUT_MS,
      });
      await page.waitForSelector("li.product_box, .search_result_product", {
        timeout: PLAYWRIGHT_TIMEOUT_MS,
      });
      await page.waitForTimeout(2500);

      return page.content();
    } finally {
      await page.close();
    }
  });
  const $ = load(html);
  const offers: LiveOffer[] = [];

  $("li.product_box").each((_, element) => {
    const card = $(element);
    const container = card.find(".product_cont").first();
    const href =
      container.find("a.pro_link").first().attr("href") ??
      container.find("a.link").first().attr("href");
    const productCode =
      href?.match(/\/p\/(\d+)/)?.[1] ??
      container.find("[data-productcode]").first().attr("data-productcode");
    const title = cleanText(container.find(".info_name").first().text());
    const brand = cleanText(container.find(".info_brand").first().text());
    const usdPrice = parseNumber(container.find(".p_sum strong").first().text());
    const krwPrice = parseNumber(container.find(".p_sum i").first().text());

    if (!productCode || !title || !brand || !usdPrice || !krwPrice || !href) {
      return;
    }

    offers.push({
      id: `shilla-${productCode}`,
      storeId: "shilla",
      title,
      brand,
      usdPrice,
      krwPrice,
      discountRate: undefined,
      status: detectOfferStatus(
        [container.find(".pro_out").text(), container.find(".info_sort").text()].join(" ")
      ),
      pickupAirports: store?.pickupAirports ?? [],
      updatedAt,
      sourceUrl: href.startsWith("http") ? href : `https://www.shilladfs.com${href}`,
      searchUrl,
      note: "공식 검색 결과 기준",
      matchScore: 0,
    });
  });

  return finalizeStoreResult(query, "shilla", searchUrl, offers);
}

async function probeShinsegae(query: string): Promise<StoreCrawlerResult> {
  const searchUrl = getShinsegaeSearchUrl(query);
  const html = await withPlaywrightHtml("https://www.ssgdfs.com/kr/main/initMain", async (context) => {
    const page = await context.newPage();

    try {
      await page.goto("https://www.ssgdfs.com/kr/main/initMain", {
        waitUntil: "domcontentloaded",
        timeout: PLAYWRIGHT_TIMEOUT_MS,
      });
      await page.waitForTimeout(2500);

      const openSearchButton = page.locator("button.btSearch").first();
      if (await openSearchButton.isVisible()) {
        await openSearchButton.click();
        await page.waitForTimeout(500);
      }

      const input = page.locator("#totalSearch");
      if (await input.isVisible()) {
        await input.fill(query);
        await page.locator("button.btSearch[type='submit']").click();
        await page.waitForTimeout(4000);
      } else {
        await page.goto(searchUrl, {
          waitUntil: "domcontentloaded",
          timeout: PLAYWRIGHT_TIMEOUT_MS,
        });
      }

      await page.waitForTimeout(4000);
      return page.content();
    } finally {
      await page.close();
    }
  });

  if (html.includes("errorWrap imp") || html.includes("temporary connection issue")) {
    return {
      offers: [],
      status: getFallbackStatus(
        query,
        "shinsegae",
        "blocked",
        "신세계면세점 온라인몰은 진입되지만 자동화 검색 단계에서 임시 연결 오류 페이지가 반환됩니다."
      ),
    };
  }

  return {
    offers: [],
    status: getFallbackStatus(
      query,
      "shinsegae",
      "error",
      "신세계면세점 온라인몰 경로는 확인했지만 현재 자동화 검색 결과 파싱은 추가 검증이 필요합니다."
    ),
  };
}

function getFallbackStatus(query: string, storeId: StoreId, state: StoreSearchState, message: string) {
  const searchUrl =
    storeId === "shilla"
      ? getShillaSearchUrl(query)
      : getShinsegaeSearchUrl(query);

  return {
    storeId,
    state,
    message,
    searchUrl,
    offerCount: 0,
  };
}

async function safelyRunCrawler(
  query: string,
  crawler: () => Promise<StoreCrawlerResult>,
  fallbackStatus: StoreSearchStatus
) {
  try {
    return await crawler();
  } catch {
    return {
      offers: [],
      status: fallbackStatus,
    };
  }
}

export async function searchDutyFreeOffers(query: string): Promise<DutyFreeSearchResult> {
  const trimmedQuery = cleanText(query);
  const searchedAt = formatTimestamp();

  if (!trimmedQuery) {
    return {
      query: "",
      offers: [],
      statuses: [],
      searchedAt,
    };
  }

  const cached = resultCache.get(trimmedQuery);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const [lotteResult, hyundaiResult, shillaResult, shinsegaeResult] = await Promise.all([
    safelyRunCrawler(
      trimmedQuery,
      () => crawlLotte(trimmedQuery),
      getFallbackStatus(
        trimmedQuery,
        "lotte",
        "error",
        "현재 롯데면세점 검색 응답을 읽지 못했습니다."
      )
    ),
    safelyRunCrawler(
      trimmedQuery,
      () => crawlHyundai(trimmedQuery),
      getFallbackStatus(
        trimmedQuery,
        "hyundai",
        "error",
        "현재 현대면세점 검색 응답을 읽지 못했습니다."
      )
    ),
    safelyRunCrawler(
      trimmedQuery,
      () => crawlShilla(trimmedQuery),
      getFallbackStatus(
        trimmedQuery,
        "shilla",
        "error",
        "현재 신라면세점 Playwright 검색 응답을 읽지 못했습니다."
      )
    ),
    safelyRunCrawler(
      trimmedQuery,
      () => probeShinsegae(trimmedQuery),
      getFallbackStatus(
        trimmedQuery,
        "shinsegae",
        "error",
        "현재 신세계면세점 온라인몰 검색 응답을 읽지 못했습니다."
      )
    ),
  ]);

  const statuses: StoreSearchStatus[] = [
    lotteResult.status,
    hyundaiResult.status,
    shillaResult.status,
    shinsegaeResult.status,
  ];

  const offers = [...lotteResult.offers, ...hyundaiResult.offers, ...shillaResult.offers].sort(
    (left, right) => left.krwPrice - right.krwPrice
  );

  const result = {
    query: trimmedQuery,
    offers,
    statuses,
    searchedAt,
  };

  resultCache.set(trimmedQuery, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    result,
  });

  return result;
}

export function getStoreSearchStateLabel(state: StoreSearchState) {
  switch (state) {
    case "live":
      return "정상";
    case "blocked":
      return "차단";
    case "error":
      return "확인 중";
    default:
      return state;
  }
}

export function getStoreSearchStateTone(state: StoreSearchState) {
  switch (state) {
    case "live":
      return "is-available";
    case "blocked":
      return "is-soldout";
    case "error":
      return "is-check";
    default:
      return "";
  }
}
