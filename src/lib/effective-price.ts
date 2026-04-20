import { dutyFreeBenefitStores, dutyFreeBenefitUpdatedAt } from "@/lib/duty-free-benefits";
import type { CategorySlug, StoreId } from "@/lib/site-data";

export type BenefitRule = {
  id: string;
  sourceId: StoreId;
  title: string;
  type: "vip_discount" | "coupon" | "card" | "points" | "exchange_rate" | "promotion" | "manual";
  discountMethod: "percent" | "fixed" | "manual";
  discountValue?: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  stackable: boolean;
  stackGroup?: string;
  applicableCategories?: CategorySlug[];
  excludedBrands?: string[];
  validFrom?: string;
  validTo?: string;
  lastVerifiedAt: string;
  sourceUrl?: string;
  confidence: "high" | "medium" | "low";
  note?: string;
};

export type ExchangeRateSnapshot = {
  baseCurrency: "USD";
  targetCurrency: "KRW";
  rate: number;
  sourceName: string;
  sourceUrl?: string;
  fetchedAt: string;
  validForDate?: string;
};

export type EffectivePriceEstimate = {
  productId: string;
  sourceId: string;
  basePrice: number;
  currency: "KRW" | "USD";
  exchangeRate?: number;
  estimatedKrwPrice: number;
  discounts: {
    label: string;
    amount: number;
    source: "vip" | "coupon" | "card" | "points" | "manual";
  }[];
  estimatedFinalPrice: number;
  assumptions: string[];
  warnings: string[];
  lastCalculatedAt: string;
  confidence: "high" | "medium" | "low";
};

export type PriceHistoryPoint = {
  productId: string;
  sourceId: string;
  price: number;
  currency: "KRW" | "USD";
  fetchedAt: string;
  status: "available" | "stale" | "low_confidence";
  matchScore?: number;
};

export type EffectivePricePreferences = {
  sourceId?: StoreId;
  vipDiscountPercent: number;
  couponAmount: number;
  cardDiscountAmount: number;
  pointsAmount: number;
  manualDiscountAmount: number;
  exchangeRate: number;
};

const benefitHomeUrlByStoreId = new Map(
  dutyFreeBenefitStores.map((benefitStore) => [benefitStore.storeId, benefitStore.benefitHomeUrl])
);

export const exchangeRateSnapshot: ExchangeRateSnapshot = {
  baseCurrency: "USD",
  targetCurrency: "KRW",
  rate: 1473,
  sourceName: "DFMOA 참고 환산 기준",
  fetchedAt: "2026-04-19 09:00",
  validForDate: "2026-04-19",
};

export const benefitRules: BenefitRule[] = [
  {
    id: "lotte-public-coupon-check",
    sourceId: "lotte",
    title: "롯데 공개 쿠폰 확인",
    type: "coupon",
    discountMethod: "manual",
    stackable: true,
    stackGroup: "coupon",
    lastVerifiedAt: dutyFreeBenefitUpdatedAt,
    sourceUrl: benefitHomeUrlByStoreId.get("lotte"),
    confidence: "medium",
    note: "쿠폰 금액은 로그인, 출국일, 브랜드 제외 조건에 따라 달라져 직접 입력 방식으로 계산합니다.",
  },
  {
    id: "hyundai-honey-points-check",
    sourceId: "hyundai",
    title: "현대 H.oney/적립금 확인",
    type: "points",
    discountMethod: "manual",
    stackable: true,
    stackGroup: "points",
    lastVerifiedAt: dutyFreeBenefitUpdatedAt,
    sourceUrl: benefitHomeUrlByStoreId.get("hyundai"),
    confidence: "medium",
    note: "H.oney와 적립금은 발급 시간, 회원 조건, 사용 기간 확인이 필요합니다.",
  },
  {
    id: "shilla-departure-coupon-check",
    sourceId: "shilla",
    title: "신라 출국예정일 쿠폰 확인",
    type: "coupon",
    discountMethod: "manual",
    stackable: true,
    stackGroup: "coupon",
    lastVerifiedAt: dutyFreeBenefitUpdatedAt,
    sourceUrl: benefitHomeUrlByStoreId.get("shilla"),
    confidence: "medium",
    note: "출국예정일 등록 여부에 따라 쿠폰 노출과 적용 가능 금액이 달라질 수 있습니다.",
  },
  {
    id: "shinsegae-promotion-check",
    sourceId: "shinsegae",
    title: "신세계 월별 혜택 확인",
    type: "promotion",
    discountMethod: "manual",
    stackable: true,
    stackGroup: "promotion",
    lastVerifiedAt: dutyFreeBenefitUpdatedAt,
    sourceUrl: benefitHomeUrlByStoreId.get("shinsegae"),
    confidence: "low",
    note: "공식 이벤트 메인과 상품 원본에서 브랜드 제외, 타임세일, 카드 조건을 직접 확인해야 합니다.",
  },
];

export const defaultEffectivePricePreferences: EffectivePricePreferences = {
  vipDiscountPercent: 0,
  couponAmount: 0,
  cardDiscountAmount: 0,
  pointsAmount: 0,
  manualDiscountAmount: 0,
  exchangeRate: exchangeRateSnapshot.rate,
};

export function getBenefitRulesForSource(sourceId: string) {
  return benefitRules.filter((rule) => rule.sourceId === sourceId);
}

export function clampDiscount(value: number, basePrice: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(Math.round(value), basePrice);
}

function getKoreaTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

export function calculateEffectivePriceEstimate({
  productId,
  sourceId,
  basePrice,
  currency = "KRW",
  preferences,
  ruleConfidence,
}: {
  productId: string;
  sourceId: string;
  basePrice: number;
  currency?: "KRW" | "USD";
  preferences: EffectivePricePreferences;
  ruleConfidence?: "high" | "medium" | "low";
}): EffectivePriceEstimate {
  const estimatedKrwPrice = currency === "USD" ? Math.round(basePrice * preferences.exchangeRate) : basePrice;
  const vipAmount = clampDiscount(estimatedKrwPrice * (preferences.vipDiscountPercent / 100), estimatedKrwPrice);
  const discounts = [
    { label: "VIP 등급 예상 할인", amount: vipAmount, source: "vip" as const },
    { label: "공개 쿠폰 직접 입력", amount: clampDiscount(preferences.couponAmount, estimatedKrwPrice), source: "coupon" as const },
    { label: "카드 할인 직접 입력", amount: clampDiscount(preferences.cardDiscountAmount, estimatedKrwPrice), source: "card" as const },
    { label: "적립금 사용 예상액", amount: clampDiscount(preferences.pointsAmount, estimatedKrwPrice), source: "points" as const },
    { label: "기타 직접 입력 할인", amount: clampDiscount(preferences.manualDiscountAmount, estimatedKrwPrice), source: "manual" as const },
  ].filter((discount) => discount.amount > 0);
  const totalDiscount = discounts.reduce((total, discount) => total + discount.amount, 0);
  const estimatedFinalPrice = Math.max(estimatedKrwPrice - totalDiscount, 0);
  const hasManualInput = discounts.some((discount) => discount.source !== "vip");
  const confidence: EffectivePriceEstimate["confidence"] =
    ruleConfidence === "low" || hasManualInput ? "low" : discounts.length ? "medium" : "medium";

  return {
    productId,
    sourceId,
    basePrice,
    currency,
    exchangeRate: preferences.exchangeRate,
    estimatedKrwPrice,
    discounts,
    estimatedFinalPrice,
    assumptions: [
      "공개가와 사용자가 입력한 혜택 조건을 기준으로 계산했습니다.",
      "쿠폰, 카드 할인, 적립금은 중복 적용 가능 여부가 면세점별로 달라질 수 있습니다.",
    ],
    warnings: [
      "최종 결제가는 면세점 원본 결제 단계에서 확인해 주세요.",
      "카드 할인은 전월 실적, 월 할인한도, 결제수단에 따라 달라질 수 있습니다.",
      "환율은 참고 환산가 기준이며 실제 결제 환율과 다를 수 있습니다.",
    ],
    lastCalculatedAt: getKoreaTimestamp(),
    confidence,
  };
}

