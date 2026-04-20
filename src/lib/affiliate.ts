import type { Product } from "@/lib/site-data";

export const AFFILIATE_DISCLOSURE_TEXT =
  "이 페이지는 쿠팡 파트너스 활동을 포함하며, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.";

export type AffiliateLink = {
  network: "coupang_partners" | "other";
  productId: string;
  url: string;
  label: string;
  disclosureText: string;
  rel: "sponsored nofollow" | "sponsored nofollow noopener noreferrer";
  createdAt?: string;
};

const coupangPartnerLinks: Record<string, string> = {
  "creed-aventus-50ml": "https://www.coupang.com/np/search?q=CREED%20Aventus%2050ml",
  "jo-malone-english-pear-100ml": "https://www.coupang.com/np/search?q=Jo%20Malone%20English%20Pear%20100ml",
  "sulwhasoo-first-care-serum-90ml":
    "https://www.coupang.com/np/search?q=%EC%84%A4%ED%99%94%EC%88%98%20%EC%9C%A4%EC%A1%B0%EC%97%90%EC%84%BC%EC%8A%A4%2090ml",
  "sk-ii-facial-treatment-essence-230ml":
    "https://www.coupang.com/np/search?q=SK-II%20Facial%20Treatment%20Essence%20230ml",
  "glenfiddich-15-700ml": "https://www.coupang.com/np/search?q=Glenfiddich%2015%20700ml",
  "hibiki-harmony-700ml": "https://www.coupang.com/np/search?q=Hibiki%20Harmony%20700ml",
  "gentle-monster-dear-01": "https://www.coupang.com/np/search?q=Gentle%20Monster%20Dear%2001",
  "rayban-wayfarer-rb2140": "https://www.coupang.com/np/search?q=Ray-Ban%20Wayfarer%20RB2140",
  "diptyque-do-son-75ml": "https://www.coupang.com/np/search?q=Diptyque%20Do%20Son%2075ml",
  "byredo-blanche-100ml": "https://www.coupang.com/np/search?q=Byredo%20Blanche%20100ml",
};

export function getAffiliateLinkForProduct(product: Product): AffiliateLink | null {
  const url = coupangPartnerLinks[product.slug];

  if (!url) {
    return null;
  }

  return {
    network: "coupang_partners",
    productId: product.id,
    url,
    label: "쿠팡에서 국내 판매가 참고",
    disclosureText: AFFILIATE_DISCLOSURE_TEXT,
    rel: "sponsored nofollow noopener noreferrer",
    createdAt: "2026-04-19",
  };
}
