import { PreservedPage } from "@/components/preserved-page";
import { preservedMetadata } from "@/lib/preserved-pages";

export const metadata = preservedMetadata("/price-compare");

export default function PriceComparePage() {
  return <PreservedPage path="/price-compare" />;
}
