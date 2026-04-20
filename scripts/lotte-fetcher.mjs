import { load } from "cheerio";

const LOTTE_BASE_URL = "https://kor.lottedfs.com";
const SEARCH_PATH = "/kr/search";
const ROBOTS_URL = `${LOTTE_BASE_URL}/robots.txt`;
const USER_AGENT = "DFMOA/1.0 (+https://dfmoa.netlify.app)";
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();
let robotsPromise = null;

function nowKstIso() {
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

  return `${formatter.format(new Date()).replace(" ", "T")}+09:00`;
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

function removeVolumeTerms(value) {
  return cleanText(value).replace(/\b\d+(?:\.\d+)?\s?(?:ml|g|kg|oz|cl|l)\b/gi, "").trim();
}

function getSearchUrl(query) {
  return `${LOTTE_BASE_URL}${SEARCH_PATH}?comSearchWord=${encodeURIComponent(query)}`;
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

async function assertRobotsAllowed() {
  if (!robotsPromise) {
    robotsPromise = fetchWithTimeout(ROBOTS_URL)
      .then((response) => response.text())
      .then((robotsText) => {
        const disallowed = [];
        const allowed = [];
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

          if (!appliesToDfmoa) {
            continue;
          }

          if (/^allow:/i.test(line)) {
            allowed.push(line.replace(/^allow:\s*/i, "").trim());
          }

          if (/^disallow:/i.test(line)) {
            const value = line.replace(/^disallow:\s*/i, "").trim();

            if (value) {
              disallowed.push(value);
            }
          }
        }

        const targetPath = SEARCH_PATH;
        const blockedByDisallow = disallowed.some((path) => path === "/" || targetPath.startsWith(path));
        const allowedByRule = allowed.some((path) => path && targetPath.startsWith(path));

        return {
          checkedAt: nowKstIso(),
          crawlDelaySeconds: Number(robotsText.match(/crawl-delay:\s*(\d+)/i)?.[1] ?? 5),
          allowed: allowedByRule || !blockedByDisallow,
        };
      });
  }

  const robots = await robotsPromise;

  if (!robots.allowed) {
    throw new Error("robots_or_terms_restricted");
  }

  return robots;
}

function parseCurrencyNumber(value) {
  const text = cleanText(value);
  const currencyMatch = text.match(/[$＄]\s*([0-9,]+(?:\.[0-9]+)?)/);
  const fallbackMatch = text.match(/([0-9,]+(?:\.[0-9]+)?)/);
  const numeric = (currencyMatch?.[1] ?? fallbackMatch?.[1] ?? "").replace(/,/g, "");

  if (!numeric) {
    return undefined;
  }

  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseKrw(value) {
  const numeric = cleanText(value).replace(/[^0-9]/g, "");
  const parsed = Number(numeric);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
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
    return `${LOTTE_BASE_URL}${cleaned}`;
  }

  return `${LOTTE_BASE_URL}/${cleaned}`;
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
  const brandTokens = new Set([...getTokens(product.brand), ...getTokens(product.query).slice(0, 1)]);
  const distinctiveTokens = Array.from(
    new Set(
      [product.name, product.displayName, product.query, ...(product.aliases ?? []), ...(product.searchTerms ?? [])]
        .flatMap((value) => getTokens(value))
        .map((token) => token.replace(/\s+/g, ""))
        .filter((token) => token.length > 1 && !volumeTokens.has(token) && !brandTokens.has(token))
    )
  );

  if (!distinctiveTokens.length) {
    return true;
  }

  return distinctiveTokens.some((token) => haystack.includes(token) || compactHaystack.includes(token));
}

function scoreItem(item, query, product) {
  const haystack = normalizeText(`${item.brand} ${item.title}`);
  const compactHaystack = compactText(`${item.brand} ${item.title}`);
  const matchText = buildMatchText(product, query);
  const matchTokens = Array.from(new Set(getTokens(matchText))).filter((token) => token.length > 1);
  const volumeTokens = getVolumeTokens(product?.volume ?? query);
  const brandTokens = product
    ? [...getTokens(product.brand), ...getTokens(product.query).slice(0, 1)]
    : getTokens(query);
  let score = 0;

  if (!hasDistinctiveProductSignal(product, haystack, compactHaystack)) {
    return -100;
  }

  if (volumeTokens.length && volumeTokens.every((token) => compactHaystack.includes(token))) {
    score += 35;
  } else if (volumeTokens.length) {
    return -100;
  }

  if (brandTokens.some((token) => haystack.includes(token) || compactHaystack.includes(token.replace(/\s+/g, "")))) {
    score += 25;
  }

  for (const token of matchTokens) {
    const compactToken = token.replace(/\s+/g, "");

    if (haystack.includes(token) || compactHaystack.includes(compactToken)) {
      score += token.length >= 4 ? 8 : 4;
    }
  }

  if (compactHaystack.includes(compactText(query))) {
    score += 30;
  }

  return score;
}

export function parseLotteSearchHtml(html, query, product, fetchedAt, matchedVia = "original") {
  const $ = load(html);
  const items = [];

  $("#unitStyleList li").each((_, element) => {
    const root = $(element);
    const link = root.find("a.unit_link").first();
    const prdNo = cleanText(link.attr("data-prdno") ?? link.attr("data-prdNo"));
    const title = cleanText(root.find(".unit_info .name").first().text() || root.find(".unit_img img").first().attr("alt"));
    const brand = cleanText(root.find(".unit_info .brand .kor").first().text() || root.find(".unit_info .brand").first().text());
    const priceUsd = parseCurrencyNumber(root.find(".unit_price .price02").first().text());
    const regularUsdPrice = parseCurrencyNumber(root.find(".unit_price .price01").first().text()) ?? priceUsd;
    const priceKrw = parseKrw(root.find(".unit_price .price03").first().text());
    const discountRate = parseCurrencyNumber(root.find(".unit_price .sale").first().text());
    const imageUrl = resolveUrl(root.find(".unit_img img").first().attr("src"));

    if (!prdNo || !title || !brand || (!priceUsd && !priceKrw)) {
      return;
    }

    const candidate = {
      id: `lotte-${prdNo}`,
      title,
      brand,
      priceKrw: priceKrw ?? null,
      priceUsd: priceUsd ?? null,
      regularUsdPrice: regularUsdPrice ?? null,
      discountRate: discountRate ?? null,
      url: `${LOTTE_BASE_URL}/kr/product/productDetail?prdNo=${prdNo}`,
      imageUrl,
      matchScore: 0,
      fetchedAt,
      matched_via: matchedVia,
    };
    const score = scoreItem(candidate, query, product);

    if (score >= 30) {
      items.push({
        ...candidate,
        matchScore: score,
      });
    }
  });

  return items.sort((left, right) => right.matchScore - left.matchScore).slice(0, 3);
}

async function fetchLottePricesOnce(query, options = {}, matchedVia = "original") {
  const trimmedQuery = cleanText(query);
  const fetchedAt = nowKstIso();
  const searchUrl = getSearchUrl(trimmedQuery);
  const cacheKey = `${trimmedQuery}::${options.product?.slug ?? ""}::${matchedVia}`;

  if (!trimmedQuery) {
    return {
      store: "lotte",
      query: trimmedQuery,
      searchUrl,
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

    const response = await fetchWithTimeout(searchUrl);
    const html = await response.text();
    const items = parseLotteSearchHtml(html, trimmedQuery, options.product, fetchedAt, matchedVia);
    const result = {
      store: "lotte",
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
      store: "lotte",
      query: trimmedQuery,
      searchUrl,
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

export async function fetchLottePrices(query, options = {}) {
  const attempts = buildQueryAttempts(query, options.product);
  const attemptedQueries = attempts.map((attempt) => attempt.query);
  let lastResult = null;

  for (const attempt of attempts) {
    const result = await fetchLottePricesOnce(attempt.query, options, attempt.matchedVia);
    lastResult = result;

    if (result.status === "ok" && result.items.length) {
      return {
        ...result,
        attempted_queries: attemptedQueries,
      };
    }

    if (result.error === "robots_or_terms_restricted") {
      break;
    }
  }

  return {
    ...(lastResult ?? {
      store: "lotte",
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

export const lotteCrawlerConfig = {
  userAgent: USER_AGENT,
  timeoutMs: REQUEST_TIMEOUT_MS,
  cacheTtlMs: CACHE_TTL_MS,
  crawlDelaySeconds: 5,
};
