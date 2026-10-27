import fs from "node:fs";
import { filterVerifiedSnapshot } from "../src/lib/product-offer-validation.mjs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { fetchShillaPrices, shillaCrawlerConfig } from "./shilla-fetcher.mjs";
import { validateSearchDemand, mergeSnapshotAfterFailure } from "./search-demand.mjs";

const ROOT_DIR = process.cwd();
const require = createRequire(import.meta.url);
const SITE_DATA_PATH = path.join(ROOT_DIR, "src/lib/site-data.ts");
const SHILLA_SEARCH_CACHE_PATH = path.join(ROOT_DIR, "data/shilla-search-cache.json");
const PRICE_DIR = path.join(ROOT_DIR, "data/prices");
const HISTORY_DIR = path.join(ROOT_DIR, "data/history");
const MANIFEST_PATH = path.join(PRICE_DIR, "manifest.json");
const LAST_ERROR_PATH = path.join(ROOT_DIR, "data/last-error.json");
const SEARCH_DEMAND_PATH = path.join(ROOT_DIR, "data/search-demand.json");
import { REQUIRED_TOTAL, CATEGORY_QUOTAS, CATEGORY_POOLS } from "./category-watchlist.mjs";

function loadSiteData() {
  const source = fs.readFileSync(SITE_DATA_PATH, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const sandbox = { exports: {}, require, console };

  vm.runInNewContext(js, sandbox, { filename: SITE_DATA_PATH });
  return sandbox.exports;
}

function loadShillaSearchCache() {
  if (!fs.existsSync(SHILLA_SEARCH_CACHE_PATH)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(SHILLA_SEARCH_CACHE_PATH, "utf8"));
}

function dedupe(values) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function buildLookupQueries(product) {
  return dedupe([
    product.query,
    ...(product.aliases ?? []),
    product.displayName,
    `${product.brand} ${product.name} ${product.volume}`,
  ]).slice(0, 6);
}

function buildSourceRecord(result, sourceId) {
  return {
    store: sourceId,
    status: result.status,
    source_status: result.status,
    searchUrl: result.searchUrl,
    fetchedAt: result.fetchedAt,
    matched_via: result.matched_via ?? null,
    attempted_queries: result.attempted_queries ?? [result.query].filter(Boolean),
    items: result.items ?? [],
    error: result.error ?? null,
  };
}

function buildSnapshot(product, sourceResults) {
  const sources = Object.fromEntries(
    sourceResults.map((result) => [result.store, buildSourceRecord(result, result.store)])
  );
  const fetchedAt = sourceResults
    .map((result) => result.fetchedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    productId: product.id,
    productSlug: product.slug,
    categorySlug: product.categorySlug,
    query: product.query,
    fetchedAt,
    updatedAtLabel: fetchedAt ? `${fetchedAt.replace("T", " ").slice(0, 16)} 기준` : null,
    sources,
  };
}

function hasValidPrice(snapshot) {
  return Boolean(
    Object.values(snapshot?.sources ?? {}).some((source) =>
      source?.items?.some((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0)
    )
  );
}

function normalizeQuotaGroup(categorySlug) {
  return Object.hasOwn(CATEGORY_QUOTAS, categorySlug) ? categorySlug : null;
}

function getPrimarySourceEntry(snapshot) {
  return Object.entries(snapshot?.sources ?? {}).find(([, source]) =>
    source?.items?.some((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0)
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildErrorResult(sourceId, product, error) {
  const fetchedAt = new Date().toISOString();
  const searchUrl =
    sourceId === "lotte"
      ? `https://kor.lottedfs.com/kr/search?comSearchWord=${encodeURIComponent(product.query)}`
      : sourceId === "shinsegae"
        ? `https://www.ssgdfs.com/kr/search/resultsTotal?query=${encodeURIComponent(product.query)}`
        : `https://www.shilladfs.com/estore/kr/ko/search?text=${encodeURIComponent(product.query)}`;

  return {
    store: sourceId,
    query: product.query,
    searchUrl,
    fetchedAt,
    status: "error",
    items: [],
    error: error instanceof Error ? error.message : String(error ?? "unknown_error"),
    matched_via: "original",
    attempted_queries: buildLookupQueries(product),
  };
}

function buildDisabledResult(sourceId, product, error = "disabled_by_policy") {
  const fetchedAt = new Date().toISOString();
  const searchUrl =
    sourceId === "lotte"
      ? `https://kor.lottedfs.com/kr/search?comSearchWord=${encodeURIComponent(product.query)}`
      : `https://www.ssgdfs.com/kr/search/resultsTotal?query=${encodeURIComponent(product.query)}`;

  return {
    store: sourceId,
    query: product.query,
    searchUrl,
    fetchedAt,
    status: "disabled_by_policy",
    items: [],
    error,
    matched_via: "original",
    attempted_queries: buildLookupQueries(product),
  };
}

async function fetchSource(sourceId, fetcher, product) {
  try {
    return await fetcher(product.query, { product });
  } catch (error) {
    return buildErrorResult(sourceId, product, error);
  }
}

async function collectProduct(product, shillaSearchCache) {
  const cachedQuery = shillaSearchCache[product.slug];
  const shillaProduct = cachedQuery
    ? {
        ...product,
        aliases: dedupe([cachedQuery, ...(product.aliases ?? [])]),
      }
    : product;
  const shillaResult = await fetchSource("shilla", fetchShillaPrices, {
    ...shillaProduct,
    query: cachedQuery || product.query,
  });
  const shinsegaeResult = buildDisabledResult("shinsegae", product, "cookie_or_login_required");
  const lotteResult = buildDisabledResult("lotte", product);

  return buildSnapshot(product, [shillaResult, shinsegaeResult, lotteResult]);
}

function getLowestKrwPrice(source) {
  return (source?.items ?? [])
    .map((item) => Number(item.priceKrw) || Math.round(Number(item.priceUsd ?? 0) * 1470))
    .filter((price) => price > 0)
    .sort((left, right) => left - right)[0] ?? null;
}

function appendHistory(snapshot, ts) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });

  const filePath = path.join(HISTORY_DIR, `${snapshot.productId}.jsonl`);
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const record = {
    ts,
    shilla: getLowestKrwPrice(snapshot.sources.shilla),
    shinsegae: getLowestKrwPrice(snapshot.sources.shinsegae),
    lotte: getLowestKrwPrice(snapshot.sources.lotte),
  };
  const records = fs.existsSync(filePath)
    ? fs
        .readFileSync(filePath, "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter((item) => {
          const parsed = new Date(item.ts).getTime();
          return Number.isFinite(parsed) && parsed >= cutoff;
        })
    : [];

  records.push(record);

  while (Buffer.byteLength(records.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf8") > 100 * 1024) {
    records.shift();
  }

  fs.writeFileSync(filePath, `${records.map((item) => JSON.stringify(item)).join("\n")}\n`);
}

function getSnapshotFailureReason(snapshot) {
  return Object.entries(snapshot.sources ?? {})
    .map(([sourceId, source]) => `${sourceId}:${source.error || source.status || "unknown"}`)
    .join(", ");
}

function writeLastError(failures, attemptedCount) {
  if (!failures.length) {
    if (fs.existsSync(LAST_ERROR_PATH)) {
      fs.unlinkSync(LAST_ERROR_PATH);
    }

    return;
  }

  fs.writeFileSync(
    LAST_ERROR_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        attemptedCount,
        failureCount: failures.length,
        failures,
      },
      null,
      2
    )}\n`
  );
}

function topUpSelectedWithFailures(selected, failures, productBySlug) {
  const selectedSlugs = new Set(selected.map((item) => item.productSlug));
  const selectedTotals = Object.fromEntries(Object.keys(CATEGORY_QUOTAS).map((group) => [group, 0]));

  for (const item of selected) {
    const group = normalizeQuotaGroup(item.categorySlug);

    if (group) {
      selectedTotals[group] += 1;
    }
  }

  const addFailure = (failure) => {
    if (selected.length >= REQUIRED_TOTAL || selectedSlugs.has(failure.productSlug)) {
      return;
    }

    const product = productBySlug.get(failure.productSlug);

    if (!product) {
      return;
    }

    selected.push({
      productId: product.id,
      productSlug: product.slug,
      categorySlug: product.categorySlug,
      sourceId: null,
      fetchedAt: null,
      priceKrw: null,
      priceUsd: null,
      error: failure.error,
    });
    selectedSlugs.add(product.slug);
    const group = normalizeQuotaGroup(product.categorySlug);

    if (group) {
      selectedTotals[group] += 1;
    }
  };

  for (const failure of failures) {
    const group = normalizeQuotaGroup(failure.categorySlug);

    if (group && selectedTotals[group] < CATEGORY_QUOTAS[group]) {
      addFailure(failure);
    }
  }

  for (const failure of failures) {
    addFailure(failure);
  }
}

async function main() {
  const { products } = loadSiteData();
  const shillaSearchCache = loadShillaSearchCache();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const selected = [];
  const attempted = [];
  const failures = [];
  const rejectedOffers = [];
  let searchDemand = { generatedAt: null, windowDays: 7, metric: "daily_tab_product_searches", products: [] };
  try {
    const response = await fetch("https://www.dfmoa.com/api/search-demand", { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Search demand HTTP ${response.status}`);
    searchDemand = validateSearchDemand(await response.json(), new Set(products.map((product) => product.slug)));
  } catch (error) {
    console.warn(`[snapshot] Internal search demand unavailable: ${error.message}; using category watchlist.`);
  }
  fs.writeFileSync(SEARCH_DEMAND_PATH, `${JSON.stringify(searchDemand, null, 2)}\n`);

  fs.mkdirSync(PRICE_DIR, { recursive: true });
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  const historyTimestamp = new Date().toISOString();

  const collect = async (product) => {
    attempted.push(product.slug);
    console.log(`[snapshot] ${product.categorySlug} ${product.slug}`);
    const raw = await collectProduct(product, shillaSearchCache);
    for (const [store, source] of Object.entries(raw.sources)) {
      const verified = filterVerifiedSnapshot(product, { sources: { [store]: source } });
      const accepted = new Set(verified.sources[store].items);
      for (const item of source.items ?? []) {
        if (!accepted.has(item)) rejectedOffers.push({ productId: product.id, categorySlug: product.categorySlug,
          store, title: item.title, observedAt: source.fetchedAt, sourceUrl: source.searchUrl });
      }
    }
    const snapshot = filterVerifiedSnapshot(product, raw);
    const filePath = path.join(PRICE_DIR, `${product.id}.json`);
    const previous = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : null;
    fs.writeFileSync(filePath, `${JSON.stringify(filterVerifiedSnapshot(product, mergeSnapshotAfterFailure(previous, snapshot)), null, 2)}\n`);
    appendHistory(snapshot, historyTimestamp);
    const successful = hasValidPrice(snapshot);
    if (successful) {
      const [sourceId, source] = getPrimarySourceEntry(snapshot);
      selected.push({ productId: product.id, productSlug: product.slug, categorySlug: product.categorySlug,
        sourceId, fetchedAt: source.fetchedAt, priceKrw: source.items[0]?.priceKrw ?? null,
        priceUsd: source.items[0]?.priceUsd ?? null });
    } else {
      failures.push({ productId: product.id, productSlug: product.slug, categorySlug: product.categorySlug,
        error: getSnapshotFailureReason(snapshot) });
    }
    await sleep(shillaCrawlerConfig.crawlDelaySeconds * 1000);
    return successful;
  };

  // Real internal demand comes first, including categories outside the curated quotas.
  for (const { productSlug } of searchDemand.products.slice(0, 30)) {
    const product = productBySlug.get(productSlug);
    if (product) await collect(product);
  }

  for (const [group, quota] of Object.entries(CATEGORY_QUOTAS)) {
    let accepted = selected.filter((item) => item.categorySlug === group).length;

    for (const slug of CATEGORY_POOLS[group]) {
      if (accepted >= quota || selected.length >= REQUIRED_TOTAL) {
        break;
      }

      const product = productBySlug.get(slug);

      if (!product || attempted.includes(slug)) {
        continue;
      }

      if (await collect(product)) accepted += 1;
    }
  }

  topUpSelectedWithFailures(selected, failures, productBySlug);
  const selectedFailureCount = selected.filter((item) => !item.priceKrw && !item.priceUsd).length;
  const successfulSelectionCount = selected.length - selectedFailureCount;
  const manifest = {
    generatedAt: new Date().toISOString(),
    generatedAtKst: new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()),
    requiredTotal: REQUIRED_TOTAL,
    searchDemandGeneratedAt: searchDemand.generatedAt,
    prioritizedSlugs: searchDemand.products.slice(0, 30).map((item) => item.productSlug),
    selectedCount: selected.length,
    quotas: CATEGORY_QUOTAS,
    attempted,
    selected,
    failures,
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  // Keep mismatched titles for review, without publishing their unverified prices.
  fs.writeFileSync(path.join(ROOT_DIR, "data/category-collection-review.json"), `${JSON.stringify({ generatedAt: manifest.generatedAt, rejectedOffers }, null, 2)}\n`);
  writeLastError(failures, attempted.length);
  console.log(`[snapshot] selected ${selected.length}/${REQUIRED_TOTAL}`);
  console.log(`[snapshot] successful ${successfulSelectionCount}, fallback ${selectedFailureCount}`);

  // Keep the daily snapshot flowing unless we produced no usable prices at all.
  // Partial freshness is better than blocking commits and serving multi-day stale data.
  if (successfulSelectionCount === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
