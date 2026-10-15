import test from "node:test";
import assert from "node:assert/strict";
import { validateSearchDemand, mergeSnapshotAfterFailure } from "./search-demand.mjs";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createHash } from "node:crypto";

test("anonymous events deduplicate concurrent tab/day/product searches and expire outside seven KST days", async () => {
  const entries = new Map();
  const store = {
    async setJSON(key, value) { if (!entries.has(key)) entries.set(key, value); },
    async delete(key) { entries.delete(key); },
    async list({ prefix, directories = false }) {
      const keys = [...entries.keys()].filter((key) => key.startsWith(prefix));
      return directories
        ? { directories: [...new Set(keys.map((key) => prefix + key.slice(prefix.length).split("/")[0] + "/"))], blobs: [] }
        : { blobs: keys.map((key) => ({ key })), directories: [] };
    },
  };
  const product = { slug: "a", query: "크리드 어벤투스 50ml", displayName: "CREED Aventus 50ml",
    brand: "CREED", name: "Aventus", volume: "50ml", aliases: [] };
  const exports = {};
  const compiled = ts.transpileModule(fs.readFileSync("src/lib/search-demand.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, { exports, console, require: (name) => {
    if (name === "node:crypto") return { createHash };
    if (name === "@netlify/blobs") return { getStore: () => store, getDeployStore: () => store };
    if (name === "./site-data") return { products: [product] };
    throw new Error(name);
  } });
  assert.equal(exports.kstDay(new Date("2026-10-13T22:00:00Z")), "2026-10-14");
  assert.equal(exports.matchDemandProduct("CREED AVENTUS 50 ml").slug, "a");
  assert.equal(exports.matchDemandProduct("CREED"), null);
  await Promise.all(Array.from({ length: 10 }, () => exports.recordSearchDemand(product.query, "tab-one", false)));
  await exports.recordSearchDemand(product.displayName, "tab-two", false);
  assert.equal(entries.size, 2);
  const ranking = await exports.readSearchDemand(false);
  assert.equal(ranking.products[0].count, 2);
  entries.set("events/2020-01-01/a/old", {});
  await exports.pruneSearchDemand(false);
  assert.equal(entries.size, 2);
  assert.ok(!entries.has("events/2020-01-01/a/old"));
});

test("demand validation rejects stale data and filters unknown products and invalid counts", () => {
  const now = Date.parse("2026-10-14T00:00:00Z");
  const value = { generatedAt: "2026-10-14T00:00:00Z", windowDays: 7, metric: "daily_tab_product_searches",
    products: [{ productSlug: "a", count: 2 }, { productSlug: "b", count: 5 },
      { productSlug: "a", count: 3 }, { productSlug: "unknown", count: 999 }, { productSlug: "b", count: -1 }] };
  assert.deepEqual(validateSearchDemand(value, new Set(["a", "b"]), now).products,
    [{ productSlug: "b", count: 5 }, { productSlug: "a", count: 3 }]);
  assert.throws(() => validateSearchDemand({ ...value, generatedAt: "2026-10-10T00:00:00Z" }, new Set(), now));
  assert.throws(() => validateSearchDemand({ ...value, generatedAt: "2026-10-15T00:00:00Z" }, new Set(), now));
});

test("transient failure preserves the actual prior observation time, policy and match failures do not", () => {
  const previous = { sources: { shilla: { status: "ok", fetchedAt: "2026-10-13T07:00:00+09:00", items: [{ priceKrw: 10000 }] } } };
  const failure = { fetchedAt: "2026-10-14T07:00:00+09:00", sources: {
    shilla: { status: "error", error: "network_error", fetchedAt: "2026-10-14T07:00:00+09:00", items: [] } } };
  const merged = mergeSnapshotAfterFailure(previous, failure);
  assert.equal(merged.sources.shilla.fetchedAt, previous.sources.shilla.fetchedAt);
  assert.equal(merged.fetchedAt, previous.sources.shilla.fetchedAt);
  assert.equal(merged.sources.shilla.error, "network_error");
  for (const error of ["product_match_failed", "robots_or_terms_restricted", "cookie_or_login_required"]) {
    const result = mergeSnapshotAfterFailure(previous, { ...failure, sources: {
      shilla: { ...failure.sources.shilla, error } } });
    assert.deepEqual(result.sources.shilla.items, []);
    assert.equal(result.fetchedAt, null);
  }
});
