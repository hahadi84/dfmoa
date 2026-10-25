"use client";
import { trackEvent } from "@/lib/analytics";
import { englishStores } from "@/lib/international";
import type { StoreId } from "@/lib/site-data";
export function InternationalRetailerLink({ storeId, slug, price = 0 }: { storeId: StoreId; slug: string; price?: number }) {
  const store = englishStores[storeId];
  return <a href={store.url} target="_blank" rel="noreferrer" onClick={() => trackEvent("outbound_click_store", { store: storeId, product_slug: slug, price_krw: price, source_status: "english_storefront_link", language: "en" })}>Open {store.name} in English</a>;
}
