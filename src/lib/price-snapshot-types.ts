import type { CategorySlug, StoreId } from "@/lib/site-data";

export type SnapshotPriceItem = {
  id?: string;
  title: string;
  brand: string;
  priceKrw?: number | null;
  priceUsd?: number | null;
  regularUsdPrice?: number | null;
  discountRate?: number | null;
  url?: string | null;
  imageUrl?: string | null;
  matchScore?: number | null;
  fetchedAt?: string | null;
};

export type SnapshotSourceRecord = {
  store: StoreId | string;
  status: "ok" | "error";
  searchUrl?: string | null;
  fetchedAt?: string | null;
  matched_via?: "original" | "alias_en" | "alias_nospace" | null;
  attempted_queries?: string[];
  items: SnapshotPriceItem[];
  error?: string | null;
};

export type ProductPriceSnapshot = {
  productId: string;
  productSlug: string;
  categorySlug: CategorySlug;
  query: string;
  fetchedAt?: string | null;
  updatedAtLabel?: string | null;
  sources: Record<string, SnapshotSourceRecord>;
};
