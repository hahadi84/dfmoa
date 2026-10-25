import type { Product } from "@/lib/site-data";
import type { SnapshotPriceItem } from "@/lib/price-snapshot-types";
const identities: Record<string, RegExp> = {
 p1: /aventus|어벤투스/i,
 p3: /first\s*care|윤조/i,
 p10: /blanche|블랑쉬/i,
 p11: /santal\s*33|상탈\s*33/i,
 p12: /bleu|블루\s*드\s*샤넬/i,
 p14: /oud\s*wood|오드\s*우드/i,
 p15: /lazy\s*sunday\s*morning|레이지\s*선데이\s*모닝/i,
 p17: /advanced\s*night\s*repair|나이트\s*리페어|ANR/i,
 p18: /genifique|제니피끄/i,
 p24: /resurrection|레저렉션/i,
};
export function isInternationalOfferMatch(product: Pick<Product, "id" | "volume">, item: Pick<SnapshotPriceItem, "title" | "priceKrw">) {
 const identity = identities[product.id];
 const volume = product.volume.match(/^(\d+(?:\.\d+)?)\s*(ml|g)$/i);
 if (!identity || !volume || !Number.isFinite(item.priceKrw) || Number(item.priceKrw) <= 0) return false;
 if (/duo|trio|set|refill|리필|듀오|세트|디스커버리|[+&]|[x×*]\s*\d/i.test(item.title)) return false;
 const exactVolume = new RegExp(`(?:^|[^\\d])${volume[1]}\\s*${volume[2]}(?![a-z])`, "i");
 return identity.test(item.title) && exactVolume.test(item.title);
}
