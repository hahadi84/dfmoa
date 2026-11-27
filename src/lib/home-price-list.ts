import { products } from "@/lib/site-data";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";
import { getLowestPriceSummaries } from "@/lib/snapshot-summaries";
import searchDemand from "../../data/search-demand.json";

export function getHomePriceList(priceSnapshotsByProductId = readPriceSnapshotsByProductId(products)) {
  const buildTimestamp = Date.now();
  const demandRows = searchDemand.products as { productSlug: string; count: number }[];
  const demandTimestamp = Date.parse(searchDemand.generatedAt ?? "");
  const hasSearchDemand = Number.isFinite(demandTimestamp) && buildTimestamp - demandTimestamp < 48 * 3_600_000 && demandRows.length > 0;
  const demandCounts = new Map(hasSearchDemand ? demandRows.map((item) => [item.productSlug, item.count]) : []);
  const recentPriceItems = getLowestPriceSummaries(products, priceSnapshotsByProductId)
    .filter((item) => {
      const timestamp = Date.parse(item.observedAt ?? "");
      return Number.isFinite(timestamp) && buildTimestamp - timestamp <= 3 * 86_400_000;
    });
  const popularPriceItems = recentPriceItems.filter((item) => demandCounts.has(item.product.slug))
    .sort((a, b) => (demandCounts.get(b.product.slug) ?? 0) - (demandCounts.get(a.product.slug) ?? 0) || a.product.slug.localeCompare(b.product.slug));
  const lowestPriceItems = (popularPriceItems.length ? popularPriceItems : recentPriceItems).slice(0, 6);
  return { lowestPriceItems, hasSearchDemand, demandRows, hasRankedPrices: popularPriceItems.length > 0 };
}
