export function validateSearchDemand(value, knownSlugs, now = Date.now()) {
  if (!value || value.windowDays !== 7 || value.metric !== "daily_tab_product_searches" ||
      !Array.isArray(value.products) || !Number.isFinite(Date.parse(value.generatedAt)) ||
      now - Date.parse(value.generatedAt) > 48 * 3_600_000 || Date.parse(value.generatedAt) > now + 60_000) {
    throw new Error("Invalid or stale internal search demand");
  }
  const counts = new Map();
  for (const item of value.products) {
    if (knownSlugs.has(item.productSlug) && Number.isSafeInteger(item.count) && item.count > 0) {
      counts.set(item.productSlug, Math.max(counts.get(item.productSlug) ?? 0, item.count));
    }
  }
  return { generatedAt: value.generatedAt, windowDays: 7, metric: value.metric,
    products: [...counts].map(([productSlug, count]) => ({ productSlug, count }))
      .sort((a, b) => b.count - a.count || a.productSlug.localeCompare(b.productSlug)) };
}

export function mergeSnapshotAfterFailure(previous, current) {
  const sources = Object.fromEntries(Object.entries(current.sources).map(([key, source]) => {
    const prior = previous?.sources?.[key];
    // Only transient failures keep a previous observation. Policy exclusions and mismatches must not.
    if (source.status === "error" && !source.items?.length && prior?.items?.length &&
        !/match|policy|robots|cookie|login|403|406/.test(source.error ?? "")) {
      return [key, { ...source, items: prior.items, fetchedAt: prior.fetchedAt }];
    }
    return [key, source];
  }));
  const fetchedAt = Object.values(sources).filter((source) => source.items?.length)
    .map((source) => source.fetchedAt).filter(Boolean).sort().at(-1) ?? null;
  return { ...current, sources, fetchedAt,
    updatedAtLabel: fetchedAt ? `${fetchedAt.replace("T", " ").slice(0, 16)} 기준` : null };
}
