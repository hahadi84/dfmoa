export type DomesticPriceSourceId = "danawa" | "ssg";

export type DomesticPriceOffer = {
  id: string;
  sourceId: DomesticPriceSourceId;
  sourceName: string;
  title: string;
  brand?: string;
  krwPrice: number;
  regularKrwPrice?: number;
  discountRate?: number;
  imageUrl?: string;
  sourceUrl: string;
  searchUrl: string;
  note: string;
  matchScore: number;
};

export type DomesticPriceStatus = {
  sourceId: DomesticPriceSourceId;
  sourceName: string;
  state: "live" | "blocked" | "error";
  message: string;
  searchUrl: string;
  offerCount: number;
};

export type DomesticPriceSummary = {
  offerCount: number;
  lowestOffer: DomesticPriceOffer | null;
  medianKrwPrice: number | null;
  highestOffer: DomesticPriceOffer | null;
  spreadKrwPrice: number | null;
};

export type DomesticPriceResult = {
  query: string;
  offers: DomesticPriceOffer[];
  statuses: DomesticPriceStatus[];
  searchedAt: string;
  summary: DomesticPriceSummary;
};

export function createEmptyDomesticPriceSummary(): DomesticPriceSummary {
  return {
    offerCount: 0,
    lowestOffer: null,
    medianKrwPrice: null,
    highestOffer: null,
    spreadKrwPrice: null,
  };
}
