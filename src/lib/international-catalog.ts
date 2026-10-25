import { products, type StoreId } from "@/lib/site-data";
import { readProductPriceSnapshot } from "@/lib/static-price-snapshots";
import { isInternationalOfferMatch } from "@/lib/international-offer-match";
import { internationalProductIds } from "@/lib/international";

export function getEnglishCatalog() {
  return internationalProductIds.map(id => {
    const product = products.find(product => product.id === id)!;
    const snapshot = readProductPriceSnapshot(id);
    const offers = Object.entries(snapshot?.sources ?? {}).flatMap(([storeId, source]) =>
      source.items.filter(item => isInternationalOfferMatch(product, item))
        .map(item => ({ storeId: storeId as StoreId, krw: Number(item.priceKrw), usd: Number(item.priceUsd) || null,
          checkedAt: item.fetchedAt ?? source.fetchedAt ?? snapshot?.fetchedAt ?? null,
          listingTitle: item.title, sourceUrl: item.url || source.searchUrl || "", imageUrl: item.imageUrl || null }))
    ).sort((a,b) => a.krw - b.krw);
    return { id, slug: product.slug, name: product.displayName, brand: product.brand, category: product.categorySlug,
      volume: product.volume, offers };
  });
}
export type EnglishCatalogItem = ReturnType<typeof getEnglishCatalog>[number];
