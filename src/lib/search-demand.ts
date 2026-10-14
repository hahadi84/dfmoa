import { createHash } from "node:crypto";
import { getDeployStore, getStore } from "@netlify/blobs";
import { products } from "./site-data";

const STORE_NAME = "dfmoa-search-demand";
const DAY_MS = 86_400_000;

export function kstDay(date = new Date()) {
  return new Date(date.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}

function demandStore(production: boolean) {
  return production
    ? getStore(STORE_NAME, { consistency: "strong" })
    : getDeployStore({ name: STORE_NAME, consistency: "strong" });
}

export function normalizeDemandQuery(query: string) {
  return query.normalize("NFKC").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

export function matchDemandProduct(query: string) {
  const key = normalizeDemandQuery(query);
  if (!key) return null;
  const matches = products.filter((product) =>
    [product.query, product.displayName, `${product.brand} ${product.name} ${product.volume}`, ...(product.aliases ?? [])]
      .some((alias) => normalizeDemandQuery(alias) === key)
  );
  return matches.length === 1 ? matches[0] : null;
}

export async function recordSearchDemand(query: string, sessionId: string, production: boolean) {
  const product = matchDemandProduct(query);
  if (!product) return;
  const day = kstDay();
  // Immutable event: no shared counter or read-modify-write race, no raw search text or visitor ID.
  const key = createHash("sha256").update(`${day}:${product.slug}:${sessionId}`).digest("hex");
  await demandStore(production).setJSON(`events/${day}/${product.slug}/${key}`, {}, { onlyIfNew: true });
}

export async function readSearchDemand(production: boolean, now = new Date()) {
  const store = demandStore(production);
  const counts = new Map<string, number>();
  // Seven Korean calendar days, including today.
  for (let offset = 0; offset < 7; offset++) {
    const day = kstDay(new Date(now.getTime() - offset * DAY_MS));
    const { blobs } = await store.list({ prefix: `events/${day}/` });
    for (const blob of blobs) {
      const slug = blob.key.split("/")[2];
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return {
    generatedAt: now.toISOString(),
    windowDays: 7,
    metric: "daily_tab_product_searches",
    products: products.map((product) => ({ productSlug: product.slug, count: counts.get(product.slug) ?? 0 }))
      .filter((product) => product.count > 0)
      .sort((a, b) => b.count - a.count || a.productSlug.localeCompare(b.productSlug)),
  };
}

export async function pruneSearchDemand(production: boolean, now = new Date()) {
  const store = demandStore(production);
  const cutoff = kstDay(new Date(now.getTime() - 6 * DAY_MS));
  const { directories } = await store.list({ prefix: "events/", directories: true });
  for (const directory of directories) {
    const day = directory.replace(/\/$/, "").split("/").at(-1) ?? "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day >= cutoff) continue;
    const { blobs } = await store.list({ prefix: directory });
    for (const blob of blobs) await store.delete(blob.key);
  }
}
