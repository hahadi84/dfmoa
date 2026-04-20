import type { PriceStatus } from "@/lib/search-types";

export type AdPageContext = {
  pageType:
    | "home"
    | "category"
    | "search"
    | "product"
    | "guide"
    | "report"
    | "brand"
    | "airport"
    | "compare"
    | "policy";
  hasPublisherContent: boolean;
  hasPriceData?: boolean;
  hasSearchResults?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  isThinTemplate?: boolean;
  isNoindex?: boolean;
  priceStatuses?: PriceStatus[];
};

export function canShowAds({
  pageType,
  hasPublisherContent,
  hasPriceData,
  hasSearchResults,
  isLoading = false,
  isError = false,
  isEmpty = false,
  isThinTemplate = false,
  isNoindex = false,
  priceStatuses = [],
}: AdPageContext) {
  if (isLoading || isError || isEmpty) {
    return false;
  }

  if (isNoindex || isThinTemplate || !hasPublisherContent) {
    return false;
  }

  if (pageType === "policy") {
    return false;
  }

  if (pageType === "search" && !hasSearchResults) {
    return false;
  }

  if (pageType === "product") {
    if (!hasPriceData) {
      return false;
    }

    return priceStatuses.some(
      (status) => status === "available" || status === "partial" || status === "stale"
    );
  }

  return true;
}
