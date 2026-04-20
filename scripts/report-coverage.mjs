import fs from "node:fs";
import path from "node:path";

const PRICE_DIR = path.join(process.cwd(), "data", "prices");
const MANIFEST_PATH = path.join(PRICE_DIR, "manifest.json");
const CATEGORY_LABELS = {
  perfume: "향수",
  beauty: "뷰티",
  liquor: "주류",
  eyewear: "아이웨어",
  other: "기타",
};
const SOURCE_ORDER = ["shilla", "lotte", "hyundai", "shinsegae"];
const MATCHED_VIA_ORDER = ["original", "alias_en", "alias_nospace"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function summarize(records) {
  const total = records.length;
  const success = records.filter((record) => record.hasPrice).length;
  const failures = records.filter((record) => !record.hasPrice);
  const categories = Object.fromEntries(
    Object.keys(CATEGORY_LABELS).map((category) => [category, { total: 0, success: 0, failures: [] }])
  );
  const sources = Object.fromEntries(SOURCE_ORDER.map((sourceId) => [sourceId, 0]));
  const matchedVia = Object.fromEntries(MATCHED_VIA_ORDER.map((key) => [key, 0]));

  for (const record of records) {
    const category = normalizeCategory(record.snapshot?.categorySlug);
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
    snapshot,
    hasPrice: hasValidPrice(snapshot),
    failureReason: snapshot ? getFailureReason(snapshot) : "snapshot_missing",
  };
});
const attemptedRecords = manifest.attempted.map((slug) => {
  const snapshot = snapshotBySlug.get(slug);

  return {
    slug,
    snapshot,
    hasPrice: hasValidPrice(snapshot),
    failureReason: snapshot ? getFailureReason(snapshot) : "snapshot_missing",
  };
});

const selectedSummary = summarize(selectedRecords);
const attemptedSummary = summarize(attemptedRecords);

console.log("== DFMOA Price Coverage Report ==");
console.log(`총 상품: ${selectedSummary.total}`);
console.log(`최소 1건 성공: ${selectedSummary.success}`);
console.log(`전부 실패: ${selectedSummary.failures.length}`);
console.log("");
console.log("카테고리별 성공률:");
for (const [category, label] of Object.entries(CATEGORY_LABELS)) {
  const stat = selectedSummary.categories[category];
  const suffix = stat.failures.length ? ` (실패: ${stat.failures.join(", ")})` : "";
  console.log(`  ${label} ${stat.success}/${stat.total}${suffix}`);
}
console.log("");
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
console.log("수집 시도 실패 상품 목록:");
if (!attemptedSummary.failures.length) {
  console.log("  - 없음");
} else {
  for (const failure of attemptedSummary.failures) {
    console.log(`  - ${failure.slug} (${failure.failureReason})`);
  }
}
