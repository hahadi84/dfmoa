import { formatKrw, getStoreById, type Product, type StoreId } from "@/lib/site-data";
import { formatSnapshotTimestamp, getSnapshotBestItem } from "@/lib/price-snapshot-view";
import type { ProductPriceSnapshot } from "@/lib/price-snapshot-types";

export type LowestPriceSummary = {
  product: Product;
  storeName: string;
  priceKrw: number;
  priceLabel: string;
  imageUrl: string | null;
  timestamp: string;
};

export function hasSnapshotPrice(snapshot?: ProductPriceSnapshot | null) {
  return Object.values(snapshot?.sources ?? {}).some((source) =>
    source?.items?.some((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0)
  );
}

export function getLowestPriceSummary(product: Product, snapshot?: ProductPriceSnapshot | null) {
  const bestItem = getSnapshotBestItem(snapshot);
  const priceKrw = Number(bestItem?.item.priceKrw ?? 0);

  if (!bestItem || !priceKrw) {
    return null;
  }

  const store = getStoreById(bestItem.sourceId as StoreId);
  const timestamp = formatSnapshotTimestamp(bestItem.source.fetchedAt ?? bestItem.item.fetchedAt);

  return {
    product,
    storeName: store?.shortName ?? bestItem.sourceId,
    priceKrw,
    priceLabel: formatKrw(priceKrw),
    imageUrl: bestItem.item.imageUrl ?? null,
    timestamp,
  } satisfies LowestPriceSummary;
}

export function getLowestPriceSummaries(
  products: Product[],
  priceSnapshotsByProductId: Record<string, ProductPriceSnapshot | null>,
  limit = products.length
) {
  return products
    .flatMap((product) => {
      const item = getLowestPriceSummary(product, priceSnapshotsByProductId[product.id]);
      return item ? [item] : [];
    })
    .sort((left, right) => left.priceKrw - right.priceKrw)
    .slice(0, limit);
}
