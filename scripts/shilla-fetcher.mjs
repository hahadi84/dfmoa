import { load } from "cheerio";

const SHILLA_BASE_URL = "https://www.shilladfs.com";
const SEARCH_PATH = "/estore/kr/ko/search";
const AJAX_PRODUCTS_URL = `${SHILLA_BASE_URL}/estore/kr/ko/ajaxProducts`;
const ROBOTS_URL = `${SHILLA_BASE_URL}/robots.txt`;
const USER_AGENT = "DFMOA/1.0 (+https://dfmoa.netlify.app)";
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const VARIANT_TOKENS = ["absolu", "cologne", "homme", "men", "intense", "parfum extrait"];
const cache = new Map();
let robotsPromise = null;

function nowKstIso() {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${formatter.format(date).replace(" ", "T")}+09:00`;
}

export function formatKstMinute(value) {
  if (!value) {
    return "";
  }

  return value.replace("T", " ").slice(0, 16);
}

function cleanText(value) {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return cleanText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getTokens(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function getVolumeTokens(value) {
  return cleanText(value)
    .match(/\d+(?:\.\d+)?\s?(?:ml|g|kg|oz|cl|l)\b/gi)
    ?.map((token) => normalizeText(token).replace(/\s+/g, "")) ?? [];
}

function parseNumber(value) {
  const numeric = cleanText(value).replace(/[^0-9.]/g, "");

  if (!numeric) {
    return undefined;
  }

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getSearchUrl(query) {
  return `${SHILLA_BASE_URL}${SEARCH_PATH}?text=${encodeURIComponent(query)}`;
}

function removeVolumeTerms(value) {
  return cleanText(value).replace(/\b\d+(?:\.\d+)?\s?(?:ml|g|kg|oz|cl|l)\b/gi, "").trim();
}

function getMatchedVia(query, originalQuery) {
  const normalizedQuery = normalizeText(query);
  const normalizedOriginal = normalizeText(originalQuery);

  if (normalizedQuery === normalizedOriginal) {
    return "original";
  }

  if (compactText(query) === compactText(originalQuery) && normalizedQuery !== normalizedOriginal) {
    return "alias_nospace";
  }

  if (/[a-z]/i.test(query)) {
    return "alias_en";
  }

  return "alias_nospace";
}

function buildQueryAttempts(originalQuery, product) {
  const attempts = [];
  const seen = new Set();
  const push = (query, matchedVia = getMatchedVia(query, originalQuery)) => {
    const cleaned = cleanText(query);
    const key = normalizeText(cleaned);

    if (!cleaned || seen.has(key)) {
      return;
    }

    seen.add(key);
    attempts.push({ query: cleaned, matchedVia });
  };

  push(originalQuery, "original");

  for (const alias of product?.aliases ?? []) {
    push(alias);
  }

  push(compactText(originalQuery), "alias_nospace");

  for (const alias of product?.aliases ?? []) {
    push(compactText(alias), "alias_nospace");
  }

  push(removeVolumeTerms(originalQuery));

  for (const alias of product?.aliases ?? []) {
    push(removeVolumeTerms(alias));
  }

  return attempts.slice(0, 10);
}

function getHeaders(extraHeaders = {}) {
  return {
    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "no-cache",
    pragma: "no-cache",
    "user-agent": USER_AGENT,
    ...extraHeaders,
  };
}

async function fetchWithTimeout(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: getHeaders(init.headers),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response;
}

function extractResponseCookies(headers) {
  const getSetCookie = headers.getSetCookie;

  if (typeof getSetCookie === "function") {
    return getSetCookie.call(headers);
  }

  const rawSetCookie = headers.get("set-cookie");

  if (!rawSetCookie) {
    return [];
  }

  return rawSetCookie.split(/,(?=\s*[^;,=\s]+=[^;]+)/g);
}

function extractCsrfToken(html) {
  return cleanText(html.match(/name="CSRFToken"\s+value="([^"]+)"/)?.[1]);
}

function extractExchangeRate(html) {
  return parseNumber(html.match(/id="exchangeRate"\s+value="([^"]+)"/)?.[1]);
}

function resolveUrl(url) {
  const cleaned = cleanText(url);

  if (!cleaned) {
    return null;
  }

  if (cleaned.startsWith("//")) {
    return `https:${cleaned}`;
  }

  if (cleaned.startsWith("http")) {
    return cleaned;
  }

  if (cleaned.startsWith("/")) {
    return `${SHILLA_BASE_URL}${cleaned}`;
  }

  return `${SHILLA_BASE_URL}/${cleaned}`;
}

function isPlaceholderImage(url) {
  return !url || /no[_-]?image|coming|dummy|blank/i.test(url);
}

function extractGalleryImageUrl(item) {
  const preferredSizes = ["320X", "210X", "470X", "100X", "80X", "0X"];

  for (const galleryImage of item.galleryImages ?? []) {
    for (const size of preferredSizes) {
      const imageUrl = resolveUrl(galleryImage?.[size]?.url);

      if (!isPlaceholderImage(imageUrl)) {
        return imageUrl;
      }
    }

    for (const image of Object.values(galleryImage ?? {})) {
      const imageUrl = resolveUrl(image?.url);

      if (!isPlaceholderImage(imageUrl)) {
        return imageUrl;
      }
    }
  }

  return null;
}

function buildImageMap(html) {
  const $ = load(html);
  const imageMap = new Map();

  $("li, .product-list-item, .product-item").each((_, element) => {
    const root = $(element);
    const skuNo = cleanText(root.find("[data-skuno]").first().attr("data-skuno") ?? root.find("[data-sku]").first().attr("data-sku"));
    const title = cleanText(root.find(".info_name").first().text());
    const src =
      root.find("img").first().attr("data-src") ??
      root.find("img").first().attr("src") ??
      root.find("source").first().attr("srcset");
    const imageUrl = resolveUrl(src?.split(",")[0]?.trim().split(/\s+/)[0]);

    if (!imageUrl || isPlaceholderImage(imageUrl)) {
      return;
    }

    if (skuNo) {
      imageMap.set(skuNo, imageUrl);
    }

    if (title) {
      imageMap.set(normalizeText(title), imageUrl);
    }
  });

  return imageMap;
}

function computeDiscountRate(regularUsdPrice, usdPrice) {
  if (!regularUsdPrice || regularUsdPrice <= usdPrice) {
    return undefined;
  }

  return Math.round(((regularUsdPrice - usdPrice) / regularUsdPrice) * 100);
}

function buildMatchText(product, query) {
  if (!product) {
    return query;
  }

  return [
    product.brand,
    product.name,
    product.displayName,
    product.query,
    product.volume,
    ...(product.aliases ?? []),
    ...(product.searchTerms ?? []),
  ].join(" ");
}

function hasDistinctiveProductSignal(product, haystack, compactHaystack) {
  if (!product) {
    return true;
  }

  const volumeTokens = new Set(getVolumeTokens(product.volume));
  const brandTokens = new Set(
    [...getTokens(product.brand), ...getTokens(product.query).slice(0, 1)].map((token) => token.replace(/\s+/g, ""))
  );
  const distinctiveTokens = Array.from(
    new Set(
      [product.name, product.displayName, product.query, ...(product.searchTerms ?? [])]
        .flatMap((value) => getTokens(value))
        .map((token) => token.replace(/\s+/g, ""))
        .filter((token) => token.length > 2 && !volumeTokens.has(token) && !brandTokens.has(token))
    )
  );

  if (!distinctiveTokens.length) {
    return true;
  }

  return distinctiveTokens.some((token) => haystack.includes(token) || compactHaystack.includes(token));
}

function scoreItem(item, query, product) {
  const title = cleanText(item.productNameForDisp ?? item.name);
  const brand = cleanText(item.brandDisplayName ?? item.brandName);
  const haystack = normalizeText(`${brand} ${title}`);
  const compactHaystack = compactText(`${brand} ${title}`);
  const matchText = buildMatchText(product, query);
  const matchTokens = Array.from(new Set(getTokens(matchText))).filter((token) => token.length > 2);
  const volumeTokens = getVolumeTokens(product?.volume ?? query);
  const brandTokens = getTokens(product?.brand ?? getTokens(query)[0] ?? "");
  let score = 0;

  if (!hasDistinctiveProductSignal(product, haystack, compactHaystack)) {
    return -100;
  }

  if (volumeTokens.length && volumeTokens.every((token) => compactHaystack.includes(token))) {
    score += 40;
  } else if (volumeTokens.length) {
    return -100;
  }

  if (brandTokens.some((token) => haystack.includes(token) || compactHaystack.includes(token))) {
    score += 35;
  }

  for (const token of matchTokens) {
    const compactToken = token.replace(/\s+/g, "");

    if (haystack.includes(token) || compactHaystack.includes(compactToken)) {
      score += token.length >= 4 ? 8 : 4;
    }
  }

  const expectedText = normalizeText(matchText);

  for (const variantToken of VARIANT_TOKENS) {
    if (haystack.includes(variantToken) && !expectedText.includes(variantToken)) {
      return -100;
    }
  }

  return score;
}

function getBestItems(items, query, product) {
  return items
    .map((item) => ({
      item,
      score: scoreItem(item, query, product),
    }))
    .filter(({ score }) => score >= 40)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

async function assertRobotsAllowed() {
  if (!robotsPromise) {
    robotsPromise = fetchWithTimeout(ROBOTS_URL)
      .then((response) => response.text())
      .then((robotsText) => {
        const disallowed = [];
        let appliesToDfmoa = false;

        for (const rawLine of robotsText.split(/\r?\n/)) {
          const line = rawLine.trim();

          if (!line || line.startsWith("#")) {
            continue;
          }

          if (/^user-agent:/i.test(line)) {
            const agent = line.replace(/^user-agent:\s*/i, "").trim().toLowerCase();
            appliesToDfmoa = agent === "*" || agent === "dfmoa";
            continue;
          }

          if (appliesToDfmoa && /^disallow:/i.test(line)) {
            const value = line.replace(/^disallow:\s*/i, "").trim();

            if (value) {
              disallowed.push(value);
            }
          }
        }

        const targetPath = SEARCH_PATH;
        const ajaxPath = new URL(AJAX_PRODUCTS_URL).pathname;
        const blocked = disallowed.some(
          (path) => targetPath.startsWith(path) || ajaxPath.startsWith(path)
        );

        return {
          checkedAt: nowKstIso(),
          crawlDelaySeconds: Number(robotsText.match(/crawl-delay:\s*(\d+)/i)?.[1] ?? 5),
          allowed: !blocked,
        };
      });
  }

  const robots = await robotsPromise;

  if (!robots.allowed) {
    throw new Error("robots_or_terms_restricted");
  }

  return robots;
}

function toPublicItem({ item, score }, exchangeRate, imageMap, query, fetchedAt) {
  const skuNo = cleanText(item.skuNo);
  const code = cleanText(item.code);
  const title = cleanText(item.productNameForDisp ?? item.name);
  const brand = cleanText(item.brandDisplayName ?? item.brandName);
  const regularUsdPrice = Number(item.userPrice?.salePrice ?? item.userPrice?.guestPrice ?? 0) || undefined;
  const priceUsd = Number(item.discountPrice ?? item.userPrice?.discountPrice ?? regularUsdPrice ?? 0) || undefined;

  if (!skuNo || !title || !brand || !priceUsd) {
    return null;
  }

  return {
    id: `shilla-${skuNo}`,
    title,
    brand,
    priceKrw: Math.round(priceUsd * exchangeRate),
    priceUsd,
    regularUsdPrice,
    discountRate:
      Number(item.discountRate ?? item.userPrice?.discountRate ?? 0) ||
      (computeDiscountRate(regularUsdPrice, priceUsd) ?? null),
    url: code
      ? `${SHILLA_BASE_URL}/estore/kr/ko/search?text=${encodeURIComponent(title)}`
      : getSearchUrl(query),
    imageUrl:
      extractGalleryImageUrl(item) ??
      imageMap.get(code) ??
      imageMap.get(skuNo) ??
      imageMap.get(normalizeText(title)) ??
      null,
    matchScore: score,
    fetchedAt,
  };
}

async function fetchShillaPricesOnce(query, options = {}, matchedVia = "original") {
  const trimmedQuery = cleanText(query);
  const fetchedAt = nowKstIso();
  const cacheKey = `${trimmedQuery}::${options.product?.slug ?? ""}::${matchedVia}`;

  if (!trimmedQuery) {
    return {
      store: "shilla",
      query: trimmedQuery,
      items: [],
      fetchedAt,
      status: "error",
      error: "검색어가 비어 있습니다.",
      matched_via: matchedVia,
    };
  }

  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  try {
    await assertRobotsAllowed();

    const searchUrl = getSearchUrl(trimmedQuery);
    const searchResponse = await fetchWithTimeout(searchUrl);
    const html = await searchResponse.text();
    const csrfToken = extractCsrfToken(html);
    const exchangeRate = extractExchangeRate(html);
    const cookieHeader = extractResponseCookies(searchResponse.headers)
      .map((cookie) => cookie.split(";")[0])
      .filter(Boolean)
      .join("; ");

    if (!csrfToken || !exchangeRate || !cookieHeader) {
      throw new Error("cookie_or_login_required");
    }

    const requestBody = new URLSearchParams({
      json: JSON.stringify({
        category: [],
        sort: "topSelling",
        size: "40",
        page: 0,
        text: trimmedQuery,
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
    const ajaxResponse = await fetchWithTimeout(AJAX_PRODUCTS_URL, {
      method: "POST",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: SHILLA_BASE_URL,
        referer: searchUrl,
        cookie: cookieHeader,
        "x-requested-with": "XMLHttpRequest",
      },
      body: requestBody,
    });
    const payload = await ajaxResponse.json();
    const imageMap = buildImageMap(html);
    const rankedItems = getBestItems(payload.results ?? [], trimmedQuery, options.product);
    const items = rankedItems
      .map((rankedItem) => toPublicItem(rankedItem, exchangeRate, imageMap, trimmedQuery, fetchedAt))
      .filter(Boolean);
    const result = {
      store: "shilla",
      query: trimmedQuery,
      searchUrl,
      items,
      fetchedAt,
      status: items.length ? "ok" : "error",
      error: items.length ? undefined : "product_match_failed",
      matched_via: matchedVia,
    };

    cache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      result,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "unknown_error";
    return {
      store: "shilla",
      query: trimmedQuery,
      searchUrl: getSearchUrl(trimmedQuery),
      items: [],
      fetchedAt,
      status: "error",
      matched_via: matchedVia,
      error:
        errorMessage.includes("Timeout") || errorMessage.includes("aborted")
          ? "타임아웃"
          : errorMessage,
    };
  }
}

export async function fetchShillaPrices(query, options = {}) {
  const attempts = buildQueryAttempts(query, options.product);
  const attemptedQueries = attempts.map((attempt) => attempt.query);
  let lastResult = null;

  for (const attempt of attempts) {
    const result = await fetchShillaPricesOnce(attempt.query, options, attempt.matchedVia);
    lastResult = result;

    if (result.status === "ok" && result.items.length) {
      return {
        ...result,
        attempted_queries: attemptedQueries,
      };
    }
  }

  return {
    ...(lastResult ?? {
      store: "shilla",
      query: cleanText(query),
      searchUrl: getSearchUrl(query),
      items: [],
      fetchedAt: nowKstIso(),
      status: "error",
      error: "product_match_failed",
      matched_via: "original",
    }),
    query: cleanText(query),
    searchUrl: getSearchUrl(query),
    attempted_queries: attemptedQueries,
    error: lastResult?.error ?? "product_match_failed",
  };
}

export const shillaCrawlerConfig = {
  userAgent: USER_AGENT,
  timeoutMs: REQUEST_TIMEOUT_MS,
  cacheTtlMs: CACHE_TTL_MS,
  crawlDelaySeconds: 5,
};
