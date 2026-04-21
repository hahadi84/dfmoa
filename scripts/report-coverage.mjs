import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const ROOT_DIR = process.cwd();
const require = createRequire(import.meta.url);
const SITE_DATA_PATH = path.join(ROOT_DIR, "src/lib/site-data.ts");
const PRICE_DIR = path.join(ROOT_DIR, "data", "prices");
const MANIFEST_PATH = path.join(PRICE_DIR, "manifest.json");
const CATEGORY_LABELS = {
  perfume: "향수",
  beauty: "뷰티",
  liquor: "주류",
  eyewear: "아이웨어",
  fashion: "패션잡화",
  watch: "시계",
  jewelry: "주얼리",
  health: "건강식품",
  food: "식품",
  electronics: "전자기기",
  other: "기타",
};
const SOURCE_ORDER = ["shilla", "lotte", "hyundai", "shinsegae"];
const MATCHED_VIA_ORDER = ["original", "alias_en", "alias_nospace"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

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

function normalizeCategory(categorySlug) {
  return Object.hasOwn(CATEGORY_LABELS, categorySlug) ? categorySlug : "other";
}

function getSourceEntries(snapshot) {
  return Object.entries(snapshot?.sources ?? {});
}

function getValidItems(source) {
  return (source?.items ?? []).filter((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0);
}

function hasValidPrice(snapshot) {
  return getSourceEntries(snapshot).some(([, source]) => getValidItems(source).length > 0);
}

function getFailureReason(snapshot) {
  const reasons = getSourceEntries(snapshot)
    .map(([sourceId, source]) => `${sourceId}:${source?.error || source?.status || "unknown"}`)
    .filter(Boolean);

  return reasons.join(", ") || "unknown";
}

function createCategoryStats() {
  return Object.fromEntries(
    Object.keys(CATEGORY_LABELS).map((category) => [category, { total: 0, success: 0, failures: [] }])
  );
}

function summarize(records) {
  const total = records.length;
  const success = records.filter((record) => record.hasPrice).length;
  const failures = records.filter((record) => !record.hasPrice);
  const categories = createCategoryStats();
  const sources = Object.fromEntries(SOURCE_ORDER.map((sourceId) => [sourceId, 0]));
  const matchedVia = Object.fromEntries(MATCHED_VIA_ORDER.map((key) => [key, 0]));

  for (const record of records) {
    const category = normalizeCategory(record.categorySlug ?? record.snapshot?.categorySlug);
    categories[category].total += 1;

    if (record.hasPrice) {
      categories[category].success += 1;
    } else {
      categories[category].failures.push(record.slug);
    }

    for (const [sourceId, source] of getSourceEntries(record.snapshot)) {
      const validItemCount = getValidItems(source).length;
      sources[sourceId] = (sources[sourceId] ?? 0) + validItemCount;

      if (validItemCount > 0) {
        const key = source.matched_via || "original";
        matchedVia[key] = (matchedVia[key] ?? 0) + validItemCount;
      }
    }
  }

  return { total, success, failures, categories, sources, matchedVia };
}

function printSummary(title, summary) {
  console.log(title);
  console.log(`총 상품: ${summary.total}`);
  console.log(`최소 1건 성공: ${summary.success}`);
  console.log(`전부 실패: ${summary.failures.length}`);
  console.log("");
  console.log("카테고리별 성공률:");
  for (const [category, label] of Object.entries(CATEGORY_LABELS)) {
    const stat = summary.categories[category];

    if (!stat.total) {
      continue;
    }

    const suffix = stat.failures.length ? ` (실패: ${stat.failures.join(", ")})` : "";
    console.log(`  ${label} ${stat.success}/${stat.total}${suffix}`);
  }
  console.log("");
}

const { products } = loadSiteData();
const manifest = readJson(MANIFEST_PATH);
const snapshotBySlug = new Map(
  fs
    .readdirSync(PRICE_DIR)
    .filter((name) => /^p\d+\.json$/.test(name))
    .map((name) => {
      const snapshot = readJson(path.join(PRICE_DIR, name));
      return [snapshot.productSlug, snapshot];
    })
);

const selectedRecords = manifest.selected.map((item) => {
  const snapshot = snapshotBySlug.get(item.productSlug);

  return {
    slug: item.productSlug,
    categorySlug: item.categorySlug,
    snapshot,
    hasPrice: hasValidPrice(snapshot),
    failureReason: snapshot ? getFailureReason(snapshot) : "snapshot_missing",
  };
});
const attemptedRecords = manifest.attempted.map((slug) => {
  const snapshot = snapshotBySlug.get(slug);

  return {
    slug,
    categorySlug: snapshot?.categorySlug,
    snapshot,
    hasPrice: hasValidPrice(snapshot),
    failureReason: snapshot ? getFailureReason(snapshot) : "snapshot_missing",
  };
});
const allProductRecords = products.map((product) => {
  const snapshot = snapshotBySlug.get(product.slug);

  return {
    slug: product.slug,
    categorySlug: product.categorySlug,
    snapshot,
    hasPrice: hasValidPrice(snapshot),
    failureReason: snapshot ? getFailureReason(snapshot) : "snapshot_missing",
  };
});

const selectedSummary = summarize(selectedRecords);
const attemptedSummary = summarize(attemptedRecords);
const allProductSummary = summarize(allProductRecords);
const missingSnapshotCount = allProductRecords.filter((record) => !record.snapshot).length;

console.log("== DFMOA Price Coverage Report ==");
printSummary("대표 수집 상품", selectedSummary);
console.log("소스별 성공 건수(중복 포함):");
for (const sourceId of SOURCE_ORDER) {
  console.log(`  ${sourceId}: ${String(selectedSummary.sources[sourceId] ?? 0).padStart(4, " ")}`);
}
console.log("");
console.log("매칭 경로 분포:");
for (const key of MATCHED_VIA_ORDER) {
  console.log(`  ${key}: ${String(selectedSummary.matchedVia[key] ?? 0).padStart(5, " ")}`);
}
console.log("");
console.log(`수집 시도 상품: ${attemptedSummary.total}`);
console.log(`수집 시도 중 최소 1건 성공: ${attemptedSummary.success}`);
console.log(`수집 시도 중 전부 실패: ${attemptedSummary.failures.length}`);
console.log("");
console.log(`전체 상품 페이지: ${allProductSummary.total}`);
console.log(`전체 상품 페이지 중 offers 있음: ${allProductSummary.success}`);
console.log(`전체 상품 페이지 중 offers 없음: ${allProductSummary.failures.length}`);
console.log(`스냅샷 미생성 상품: ${missingSnapshotCount}`);
console.log("");
console.log("전체 상품 페이지 카테고리별 offers:");
for (const [category, label] of Object.entries(CATEGORY_LABELS)) {
  const stat = allProductSummary.categories[category];

  if (!stat.total) {
    continue;
  }

  console.log(`  ${label} ${stat.success}/${stat.total}`);
}
console.log("");
console.log("수집 시도 실패 상품 목록:");
if (!attemptedSummary.failures.length) {
  console.log("  - 없음");
} else {
  for (const failure of attemptedSummary.failures) {
    console.log(`  - ${failure.slug} (${failure.failureReason})`);
  }
}
