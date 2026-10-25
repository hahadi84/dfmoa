import { isVerifiedProductOffer } from "@/lib/product-offer-validation.mjs";
import type { Product } from "@/lib/site-data";
import type { SnapshotPriceItem } from "@/lib/price-snapshot-types";
export function isInternationalOfferMatch(product: Pick<Product,"id"|"volume">,item:Pick<SnapshotPriceItem,"title"|"priceKrw">) {
 return Number.isFinite(item.priceKrw) && Number(item.priceKrw)>0 && isVerifiedProductOffer(product,item);
}
