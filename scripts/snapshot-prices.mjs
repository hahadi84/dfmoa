import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { fetchShillaPrices, shillaCrawlerConfig } from "./shilla-fetcher.mjs";
import { fetchShinsegaePrices, shinsegaeCrawlerConfig } from "./shinsegae-fetcher.mjs";
import { fetchLottePrices, lotteCrawlerConfig } from "./lotte-fetcher.mjs";

const ROOT_DIR = process.cwd();
const require = createRequire(import.meta.url);
const SITE_DATA_PATH = path.join(ROOT_DIR, "src/lib/site-data.ts");
const PRICE_DIR = path.join(ROOT_DIR, "data/prices");
const HISTORY_DIR = path.join(ROOT_DIR, "data/history");
const MANIFEST_PATH = path.join(PRICE_DIR, "manifest.json");
const LAST_ERROR_PATH = path.join(ROOT_DIR, "data/last-error.json");
const REQUIRED_TOTAL = 20;
const CATEGORY_QUOTAS = {
  perfume: 6,
  beauty: 4,
  liquor: 4,
  eyewear: 3,
  other: 3,
};
const CATEGORY_POOLS = {
  perfume: [
    "creed-aventus-50ml",
    "jo-malone-english-pear-100ml",
    "diptyque-do-son-75ml",
    "byredo-blanche-100ml",
    "le-labo-santal-33-50ml",
    "bleu-de-chanel-edp-100ml",
    "dior-sauvage-edp-100ml",
    "tom-ford-oud-wood-50ml",
    "maison-margiela-lazy-sunday-morning-100ml",
    "penhaligons-halfeti-100ml",
  ],
  beauty: [
    "sulwhasoo-first-care-serum-90ml",
    "sk2-pitera-essence-230ml",
    "estee-lauder-anr-100ml",
    "lancome-genifique-100ml",
    "hera-black-cushion-15g",
    "kiehls-ultra-facial-cream-125ml",
    "la-mer-moisturizing-cream-60ml",
    "shiseido-ultimune-75ml",
    "biotherm-life-plankton-125ml",
    "aesop-resurrection-hand-balm-75ml",
  ],
  liquor: [
    "glenfiddich-15-700ml",
    "hibiki-harmony-700ml",
    "ballantines-21-700ml",
    "johnnie-walker-blue-label-750ml",
    "macallan-12-double-cask-700ml",
    "yamazaki-12-700ml",
    "royal-salute-21-700ml",
    "glenmorangie-original-10-700ml",
    "hennessy-xo-700ml",
    "don-julio-1942-750ml",
  ],
  eyewear: [
    "gentle-monster-dear-01",
    "rayban-wayfarer-rb2140",
    "oakley-sutro-oo9406",
    "tom-ford-snowdon-ft0237",
    "prada-pr-17ws",
    "gucci-gg0061s",
    "celine-triomphe-cl40194u",
    "saint-laurent-sl-276-mica",
    "maui-jim-peahi-b202",
    "persol-po0649",
  ],
  other: [
    "longchamp-le-pliage-medium",
    "tumi-alpha-bravo-backpack",
    "montblanc-meisterstuck-wallet",
    "seiko-presage-cocktail-time",
    "citizen-tsuyosa-nj015",
    "swarovski-tennis-bracelet",
    "pandora-moments-bracelet",
    "kgc-everytime-royal",
    "orthomol-immun",
    "godiva-gold-collection",
    "royce-nama-chocolate",
    "apple-airpods-pro-2",
    "sony-wh-1000xm5",
  ],
};

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
  return Object.hasOwn(CATEGORY_QUOTAS, categorySlug) ? categorySlug : "other";
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

async function fetchSource(sourceId, fetcher, product) {
  try {
    return await fetcher(product.query, { product });
  } catch (error) {
    return buildErrorResult(sourceId, product, error);
  }
}

async function collectProduct(product) {
  const shillaResult = await fetchSource("shilla", fetchShillaPrices, product);

  await sleep(500);

  const shinsegaeResult = await fetchSource("shinsegae", fetchShinsegaePrices, product);

  await sleep(500);

  const lotteResult = await fetchSource("lotte", fetchLottePrices, product);

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
    selectedTotals[normalizeQuotaGroup(item.categorySlug)] += 1;
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
    selectedTotals[normalizeQuotaGroup(product.categorySlug)] += 1;
  };

  for (const failure of failures) {
    const group = normalizeQuotaGroup(failure.categorySlug);

    if (selectedTotals[group] < CATEGORY_QUOTAS[group]) {
      addFailure(failure);
    }
  }

  for (const failure of failures) {
    addFailure(failure);
  }
}

async function main() {
  const { products } = loadSiteData();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const selected = [];
  const attempted = [];
  const failures = [];

  fs.mkdirSync(PRICE_DIR, { recursive: true });
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  const historyTimestamp = new Date().toISOString();

  for (const [group, quota] of Object.entries(CATEGORY_QUOTAS)) {
    let accepted = 0;

    for (const slug of CATEGORY_POOLS[group]) {
      if (accepted >= quota) {
        break;
      }

      const product = productBySlug.get(slug);

      if (!product) {
        continue;
      }

      attempted.push(product.slug);
      console.log(`[snapshot] ${group} ${product.slug}`);
      const snapshot = await collectProduct(product);

      fs.writeFileSync(path.join(PRICE_DIR, `${product.id}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
      appendHistory(snapshot, historyTimestamp);

      if (hasValidPrice(snapshot)) {
        const [sourceId, source] = getPrimarySourceEntry(snapshot);
        selected.push({
          productId: product.id,
          productSlug: product.slug,
          categorySlug: product.categorySlug,
          sourceId,
          fetchedAt: source.fetchedAt,
          priceKrw: source.items[0]?.priceKrw ?? null,
          priceUsd: source.items[0]?.priceUsd ?? null,
        });
        accepted += 1;
      } else {
        failures.push({
          productId: product.id,
          productSlug: product.slug,
          categorySlug: product.categorySlug,
          error: getSnapshotFailureReason(snapshot),
        });
      }

      await sleep(
        Math.max(
          shillaCrawlerConfig.crawlDelaySeconds,
          shinsegaeCrawlerConfig.crawlDelaySeconds,
          lotteCrawlerConfig.crawlDelaySeconds
        ) * 1000
      );
    }
  }

  topUpSelectedWithFailures(selected, failures, productBySlug);
  const selectedFailureCount = selected.filter((item) => !item.priceKrw && !item.priceUsd).length;
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
    selectedCount: selected.length,
    quotas: CATEGORY_QUOTAS,
    attempted,
    selected,
    failures,
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  writeLastError(failures, attempted.length);
  console.log(`[snapshot] selected ${selected.length}/${REQUIRED_TOTAL}`);

  if (selectedFailureCount / Math.max(selected.length, 1) >= 0.5) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
