import { PreservedPage } from "@/components/preserved-page";
import { PriceCompareProductLinks } from "@/components/price-compare-product-links";
import { preservedMetadata } from "@/lib/preserved-pages";

export const metadata = preservedMetadata("/price-compare");

export default function PriceComparePage() {
  return <PriceCompareProductLinks><PreservedPage path="/price-compare" /></PriceCompareProductLinks>;
}
