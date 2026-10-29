import { OFFER_VALIDATION_VERSION, filterVerifiedSnapshot } from '../src/lib/product-offer-validation.mjs';

export function buildVerifiedHistoryRecord(product, raw) {
  const snapshot = filterVerifiedSnapshot(product, raw);
  const observations = Object.fromEntries(Object.entries(snapshot.sources ?? {}).map(([store, source]) => {
    const item = (source.items ?? []).filter(item => Number.isFinite(item.priceKrw) && item.priceKrw > 0)
      .sort((a, b) => a.priceKrw - b.priceKrw)[0];
    const fetchedAt = source.fetchedAt ?? item?.fetchedAt;
    if (!item || !Number.isFinite(Date.parse(fetchedAt ?? ''))) return [store, null];
    return [store, { fetchedAt, priceKrw: item.priceKrw, priceUsd: item.priceUsd ?? null,
      itemId: item.id ?? null, title: item.title, sourceUrl: item.url ?? source.searchUrl ?? null }];
  }));
  const times = Object.values(observations).filter(Boolean).map(item => item.fetchedAt).sort((a,b) => Date.parse(a)-Date.parse(b));
  if (!times.length) return null;
  return { ts: times.at(-1), productId: product.id, validationVersion: OFFER_VALIDATION_VERSION,
    shilla: observations.shilla?.priceKrw ?? null, shinsegae: observations.shinsegae?.priceKrw ?? null,
    lotte: observations.lotte?.priceKrw ?? null, observations };
}
