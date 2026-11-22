import type { LiveOffer } from "./search-types";

export function getPriceDisplay(offers: LiveOffer[]) {
  const storeCount = new Set(offers.map((offer) => offer.storeId)).size;
  const representative = storeCount === 1
    ? offers.reduce((latest, offer) => offer.updatedAt > latest.updatedAt ? offer : latest)
    : offers[0];

  return { storeCount, representative };
}
