import { dutyFreeBenefitStores, dutyFreeBenefitUpdatedAt } from "./duty-free-benefits";
import { getStoreById, type StoreId } from "./site-data";

export type BenefitReportBenefit = {
  title: string;
  type: string;
  description: string;
  url: string;
};

export type BenefitReportStoreSection = {
  storeId: StoreId;
  storeName: string;
  logoUrl: string;
  summary: string;
  benefitTypes: string[];
  benefits: BenefitReportBenefit[];
  checkPoints: string[];
  editorialNote: string;
};

export type BenefitReportSourceLink = {
  storeName: string;
  label: string;
  url: string;
};

export type BenefitReport = {
  slug: string;
  title: string;
  description: string;
  monthSlug: string;
  weekLabel: string;
  periodStart: string;
  periodEnd: string;
  publishedAt: string;
  updatedAt: string;
  periodLabel: string;
  storeCount: number;
  sourceCount: number;
  benefitTypes: string[];
  highlights: string[];
  changesFromPreviousWeek: string[];
  coupons: string[];
  rewards: string[];
  cardDiscounts: string[];
  brandEvents: string[];
  expiredNotes: string[];
  sourceLinks: BenefitReportSourceLink[];
  relatedProductSlugs: string[];
  indexable: boolean;
  canonicalSlug?: string;
  stores: BenefitReportStoreSection[];
  sections: BenefitReportStoreSection[];
  methodology: string[];
  automationNote: string;
  disclaimer: string;
};

const REPORT_TIME_ZONE = "Asia/Seoul";

function dedupeText(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function toDateInput(value: string | Date) {
  if (value instanceof Date) {
    return value;
  }

  return new Date(`${value}T00:00:00+09:00`);
}

export function getKoreaDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatKoreanDate(value: string | Date) {
  const date = toDateInput(value);
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("ko-KR", {
    timeZone: REPORT_TIME_ZONE,
    weekday: "short",
  }).format(date);

  return `${dateLabel}(${weekday})`;
}

function buildSlug(publishedAt: string) {
  return `${publishedAt}-duty-free-benefit-weekly`;
}

function getEditorialNote(types: string[]) {
  if (types.includes("카드할인")) {
    return "카드 할인은 결제수단, 구매금액대, 간편결제 조합에 따라 체감가 차이가 커서 원본 조건 확인이 필요합니다.";
  }

  if (types.includes("적립금")) {
    return "적립금은 로그인, 회원 등급, 출국일 등록 여부에 따라 노출과 사용 가능 금액이 달라질 수 있습니다.";
  }

  if (types.includes("쿠폰")) {
    return "쿠폰형 혜택은 발급 수량, 사용 기간, 브랜드 제외 조건을 먼저 확인하는 편이 안전합니다.";
  }

  return "기획전과 브랜드 행사는 재고 소진, 행사 기간, 지점 조건이 함께 바뀔 수 있어 원본 확인이 중요합니다.";
}

function buildStoreSections() {
  const sections = dutyFreeBenefitStores.flatMap((benefitStore) => {
    const store = getStoreById(benefitStore.storeId);

    if (!store) {
      return [];
    }

    const benefitTypes = dedupeText(benefitStore.eventLinks.map((eventLink) => eventLink.type));

    return [
      {
        storeId: benefitStore.storeId,
        storeName: store.name,
        logoUrl: store.logoUrl,
        summary: benefitStore.summary,
        benefitTypes,
        benefits: benefitStore.eventLinks.map((eventLink) => ({
          title: eventLink.title,
          type: eventLink.type,
          description: eventLink.description,
          url: eventLink.url,
        })),
        checkPoints: benefitStore.checkPoints,
        editorialNote: getEditorialNote(benefitTypes),
      },
    ];
  });

  return sections;
}

function buildSourceLinks() {
  const sourceMap = new Map<string, BenefitReportSourceLink>();

  dutyFreeBenefitStores.forEach((benefitStore) => {
    const store = getStoreById(benefitStore.storeId);
    const storeName = store?.name ?? benefitStore.storeId;

    sourceMap.set(`${storeName}-${benefitStore.benefitHomeUrl}`, {
      storeName,
      label: `${storeName} 혜택 홈`,
      url: benefitStore.benefitHomeUrl,
    });

    benefitStore.eventLinks.forEach((eventLink) => {
      sourceMap.set(`${storeName}-${eventLink.url}`, {
        storeName,
        label: eventLink.title,
        url: eventLink.url,
      });
    });
  });

  return Array.from(sourceMap.values());
}

type WeeklyBenefitReportSeed = {
  slug: string;
  monthSlug: string;
  weekLabel: string;
  periodStart: string;
  periodEnd: string;
  publishedAt: string;
  updatedAt: string;
  highlights: string[];
  changesFromPreviousWeek: string[];
  coupons: string[];
  rewards: string[];
  cardDiscounts: string[];
  brandEvents: string[];
  expiredNotes: string[];
  relatedProductSlugs: string[];
  title?: string;
  description?: string;
  indexable?: boolean;
  canonicalSlug?: string;
};

function buildWeeklyBenefitReport(seed: WeeklyBenefitReportSeed): BenefitReport {
  const sections = buildStoreSections();
  const allBenefits = sections.flatMap((section) => section.benefits);
  const benefitTypes = dedupeText(allBenefits.map((benefit) => benefit.type));
  const year = seed.monthSlug.slice(0, 4);
  const defaultTitle = `${year}년 ${seed.weekLabel} 면세점 쿠폰·적립금 혜택｜신세계·신라·롯데·현대`;
  const defaultDescription = `신세계·신라·롯데·현대면세점의 ${year}년 ${seed.weekLabel} 쿠폰, 적립금, 카드 할인, 브랜드 이벤트 변경사항을 출국 전 확인용으로 정리했습니다.`;

  return {
    slug: seed.slug,
    title: seed.title ?? defaultTitle,
    description: seed.description ?? defaultDescription,
    monthSlug: seed.monthSlug,
    weekLabel: seed.weekLabel,
    periodStart: seed.periodStart,
    periodEnd: seed.periodEnd,
    publishedAt: seed.publishedAt,
    updatedAt: seed.updatedAt,
    periodLabel: `${formatKoreanDate(seed.periodStart)}~${formatKoreanDate(seed.periodEnd)}`,
    storeCount: sections.length,
    sourceCount: buildSourceLinks().length,
    benefitTypes,
    highlights: seed.highlights,
    changesFromPreviousWeek: seed.changesFromPreviousWeek,
    coupons: seed.coupons,
    rewards: seed.rewards,
    cardDiscounts: seed.cardDiscounts,
    brandEvents: seed.brandEvents,
    expiredNotes: seed.expiredNotes,
    sourceLinks: buildSourceLinks(),
    relatedProductSlugs: seed.relatedProductSlugs,
    indexable: seed.indexable ?? true,
    canonicalSlug: seed.canonicalSlug,
    stores: sections,
    sections,
    methodology: [
      "각 면세점 공식 혜택 페이지와 대표 이벤트 링크를 기준으로 정리했습니다.",
      "상품별 실제 적용 금액은 검색 결과의 공개가, 이벤트 배지, 원본 혜택 페이지를 함께 확인해야 합니다.",
      "로그인 후 개인별로 달라지는 쿠폰·적립금·카드 청구할인은 확정 결제 전 단계에서만 최종 확인할 수 있습니다.",
    ],
    automationNote:
      "이 리포트 형식은 매주 자동 초안으로 생성할 수 있게 구성했습니다. 자동 초안은 원본 링크와 조건을 모으고, 최종 공개 전 문구와 기간을 검수하는 흐름을 권장합니다.",
    disclaimer:
      "DFMOA는 면세점 공식 페이지의 공개 정보를 정리합니다. 혜택의 최종 적용 여부와 결제 금액은 각 면세점 원본 페이지에서 확인해야 합니다.",
  };
}

export function buildBenefitReport(publishedAt = dutyFreeBenefitUpdatedAt): BenefitReport {
  const reportDate = /^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ? publishedAt : getKoreaDateString();
  const monthSlug = reportDate.slice(0, 7);
  const month = Number(reportDate.slice(5, 7));
  const day = Number(reportDate.slice(8, 10));
  const weekNumber = Math.max(1, Math.ceil(day / 7));

  return buildWeeklyBenefitReport({
    slug: buildSlug(reportDate),
    monthSlug,
    weekLabel: `${month}월 ${weekNumber}주차`,
    periodStart: reportDate,
    periodEnd: reportDate,
    publishedAt: reportDate,
    updatedAt: dutyFreeBenefitUpdatedAt,
    highlights: [
      "공개 가격에 이미 반영된 할인과 결제 전 추가 확인이 필요한 쿠폰·적립금을 분리해서 봐야 합니다.",
      "출국일, 회원 등급, 결제수단, 브랜드 제외 조건에 따라 같은 상품도 최종 결제 금액이 달라질 수 있습니다.",
      "타임세일과 선착순 쿠폰은 재고와 발급 수량이 빠르게 변하므로 원본 페이지에서 마감 여부를 확인해야 합니다.",
    ],
    changesFromPreviousWeek: ["주간 자동 초안 기준으로 공식 혜택 링크와 확인 포인트를 정리했습니다."],
    coupons: ["출국예정일 등록 쿠폰", "신규회원 쿠폰", "선착순 쿠폰"],
    rewards: ["멤버십 포인트", "H.oney", "신라 선불 혜택"],
    cardDiscounts: ["삼성카드 결제 혜택", "간편결제 제휴 카드 혜택"],
    brandEvents: ["브랜드 사은품", "타임세일", "시즌 기획전"],
    expiredNotes: ["혜택별 종료일과 선착순 마감 여부는 원본 면세점에서 확인해야 합니다."],
    relatedProductSlugs: ["sk2-pitera-essence-230ml", "bleu-de-chanel-edp-100ml", "glenfiddich-15-700ml"],
  });
}

const weeklyBenefitReportSeeds: WeeklyBenefitReportSeed[] = [
  {
    slug: "2026-06-week-1-duty-free-benefits",
    monthSlug: "2026-06",
    weekLabel: "6월 1주차",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-07",
    publishedAt: "2026-06-02",
    updatedAt: "2026-06-02",
    title: "2026년 6월 1주차 면세점 쿠폰·적립금 혜택｜신세계·신라·롯데·현대",
    description:
      "신세계·신라·롯데·현대면세점의 2026년 6월 1주차 쿠폰, 적립금, 결제쿠폰, H.oney, 카드 할인, 제휴 이벤트를 출국 전 확인용으로 정리했습니다.",
    highlights: [
      "6월 첫 주 출국자는 월초 신규 쿠폰, 결제수단별 즉시 할인, 출국정보 입력 혜택, 적립금성 혜택을 결제 직전 원본 면세점에서 다시 확인해야 합니다.",
      "롯데면세점 혜택 홈에는 카카오페이머니, PAYCO, 우리카드, 롯데카드, 하나 AMEX 등 결제 혜택과 오늘의 쿠폰·출국정보 입력 혜택이 노출됩니다.",
      "현대면세점은 6월 1~7일 구간의 카드 혜택, 얼리 썸머, 6월 면세 쇼핑 지원금, 인천공항점 단독 혜택을 함께 확인하는 흐름이 필요합니다.",
    ],
    changesFromPreviousWeek: [
      "5월 말 리포트에서 6월 1주차 리포트와 월간 혜택 총정리(`/deals/2026-06`)로 최신 확인 경로를 전환했습니다.",
      "6월 초 기준으로 결제쿠폰, 출국정보 입력 혜택, H.oney·쇼핑 지원금, 제휴카드 혜택을 별도 체크 항목으로 분리했습니다.",
    ],
    coupons: ["롯데 오늘의 쿠폰 혜택", "출국 정보 입력 혜택", "신라 제휴쿠폰", "신세계·현대 이벤트 쿠폰"],
    rewards: ["현대 H.oney", "6월 면세 쇼핑 지원금", "롯데 멤버십·포인트 혜택", "신라·신세계 월별 적립 혜택"],
    cardDiscounts: [
      "롯데 카카오페이머니·PAYCO·우리카드·롯데카드·하나 AMEX 결제 혜택",
      "현대 6월 1주차 카드 혜택",
      "신라 제휴카드·간편결제 혜택",
    ],
    brandEvents: ["현대 얼리 썸머 혜택", "인천공항점 단독 혜택", "브랜드 사은·증정 행사", "시즌 기획전·타임세일"],
    expiredNotes: [
      "6월 1주차 혜택은 6월 7일 전후로 종료되거나 2주차 조건으로 교체될 수 있으므로 출국일과 주문 마감일을 원본 페이지에서 다시 확인하세요.",
      "쿠폰·적립금은 로그인, 회원등급, 여권·출국정보 등록, 결제수단, 브랜드 제외 조건에 따라 노출 여부가 달라질 수 있습니다.",
    ],
    relatedProductSlugs: [
      "creed-aventus-50ml",
      "jo-malone-english-pear-100ml",
      "sk2-pitera-essence-230ml",
      "dyson-supersonic",
    ],
  },
  {
    slug: "2026-05-week-4-duty-free-benefits",
    monthSlug: "2026-05",
    weekLabel: "5월 4주차",
    periodStart: "2026-05-22",
    periodEnd: "2026-05-27",
    publishedAt: "2026-05-27",
    updatedAt: "2026-05-27",
    title: "2026년 5월 4주차 면세점 쿠폰·적립금 혜택｜신세계·신라·롯데·현대",
    description:
      "신세계·신라·롯데·현대면세점의 2026년 5월 쿠폰, 적립금, H.oney, 카드 할인, 제휴 이벤트를 출국 전 확인용으로 정리했습니다.",
    highlights: [
      "5월 말 출국 전에는 월간 쿠폰, 신규가입 혜택, 제휴카드 혜택, 적립금성 혜택을 결제 직전 원본 면세점에서 다시 확인해야 합니다.",
      "신라면세점은 5월에도 제휴쿠폰과 더블적립금성 이벤트가 이어져 쿠폰번호 등록, 사용 기간, 구매금액 조건을 분리해 보는 것이 안전합니다.",
      "현대면세점은 H.oney와 공항점·카드 연계 혜택이 함께 노출될 수 있어 회원가입 여부, 대상 지점, 결제수단 조건을 먼저 확인해야 합니다.",
    ],
    changesFromPreviousWeek: [
      "4월 월간 허브에서 5월 월간 혜택 총정리(`/deals/2026-05`)로 최신 확인 경로를 전환했습니다.",
      "5월 말 기준으로 제휴쿠폰, H.oney, 신규회원, 카드 혜택을 별도 체크 항목으로 분리했습니다.",
    ],
    coupons: ["신라 제휴쿠폰", "출국예정 등록 쿠폰", "신규회원 쿠폰", "롯데·신세계 이벤트 쿠폰"],
    rewards: ["현대 H.oney", "신라 더블적립금", "롯데 멤버십 포인트", "신세계 월별 적립 혜택"],
    cardDiscounts: ["현대 제휴카드 결제 혜택", "신라 제휴카드·간편결제 혜택", "면세점별 결제수단별 추가 할인"],
    brandEvents: ["코리아듀티프리페스타 연계 혜택", "브랜드 사은·증정 행사", "공항점 신규 오픈·카테고리별 페이백"],
    expiredNotes: [
      "5월 혜택은 5월 31일 또는 6월 초 종료 조건이 섞여 있으므로 출국일과 주문 마감일을 원본 페이지에서 다시 확인하세요.",
      "쿠폰·적립금은 로그인, 회원등급, 여권·출국정보 등록, 결제수단, 브랜드 제외 조건에 따라 노출 여부가 달라질 수 있습니다.",
    ],
    relatedProductSlugs: [
      "creed-aventus-50ml",
      "sk2-pitera-essence-230ml",
      "hera-black-cushion-15g",
      "glenfiddich-15-700ml",
    ],
  },
  {
    slug: "2026-04-week-1-duty-free-benefits",
    monthSlug: "2026-04",
    weekLabel: "4월 1주차",
    periodStart: "2026-04-01",
    periodEnd: "2026-04-07",
    publishedAt: "2026-04-07",
    updatedAt: "2026-04-07",
    highlights: [
      "4월 출국 수요에 맞춰 신규회원 쿠폰, 출국예정일 등록 쿠폰, 멤버십 적립 혜택을 먼저 확인합니다.",
      "신세계·신라·롯데·현대면세점 모두 혜택 홈에서 쿠폰과 적립금 조건을 분리해 확인해야 합니다.",
      "가격 비교 전 공개가와 쿠폰 적용 가능 여부를 나눠 보면 실제 결제 전 판단이 쉬워집니다.",
    ],
    changesFromPreviousWeek: [
      "3월 아카이브에서 4월 월간 혜택 확인 기준으로 전환했습니다.",
      "신세계 타임세일, 신라 출국예정일 쿠폰, 롯데 멤버십 포인트 확인 항목을 추가했습니다.",
    ],
    coupons: ["신라 출국예정일 등록 더하기 쿠폰", "신세계 신규회원 쿠폰", "롯데 오늘의 혜택 쿠폰"],
    rewards: ["롯데 LDF 멤버십 등급 혜택", "현대 H.oney 적립 혜택", "신라 선불 혜택"],
    cardDiscounts: ["현대 삼성카드 결제 혜택", "신라 간편결제 제휴 카드 혜택"],
    brandEvents: ["신세계 타임세일", "현대 브랜드 사은품", "롯데 인천공항점 온라인 단독 이벤트"],
    expiredNotes: ["3월 종료 혜택은 월간 4월 허브에서 제외하고 원본 확인 링크 중심으로 정리했습니다."],
    relatedProductSlugs: ["sk2-pitera-essence-230ml", "sulwhasoo-first-care-serum-90ml", "jo-malone-english-pear-100ml"],
  },
  {
    slug: "2026-04-week-2-duty-free-benefits",
    monthSlug: "2026-04",
    weekLabel: "4월 2주차",
    periodStart: "2026-04-08",
    periodEnd: "2026-04-14",
    publishedAt: "2026-04-14",
    updatedAt: "2026-04-14",
    highlights: [
      "쿠폰 발급 여부보다 실제 적용 가능한 브랜드 제외 조건과 구매금액대를 먼저 확인합니다.",
      "주류와 향수는 공개가가 좋아도 수령 공항과 출국 정보 입력 후 원본에서 최종 확인이 필요합니다.",
      "카드 할인은 결제수단 조합에 따라 실결제가 차이가 커서 쿠폰과 별도로 기록합니다.",
    ],
    changesFromPreviousWeek: [
      "카드 할인 확인 항목을 별도 섹션으로 분리했습니다.",
      "관련 상품 링크를 뷰티 중심에서 향수·주류까지 확장했습니다.",
    ],
    coupons: ["신라 오늘의 혜택 쿠폰", "신세계 신규회원 특별 혜택", "롯데 선착순 쿠폰"],
    rewards: ["현대 선착순 반값 H.oney", "롯데 멤버십 포인트", "신라 구매금액대별 선불 혜택"],
    cardDiscounts: ["현대 삼성카드 결제일 할인", "신라 카카오페이X삼성카드 혜택"],
    brandEvents: ["현대 브랜드 행사", "롯데 브랜드 특가", "신세계 주말 타임세일"],
    expiredNotes: ["선착순 쿠폰과 타임세일은 페이지 확인 시점 이후 조기 종료될 수 있습니다."],
    relatedProductSlugs: ["bleu-de-chanel-edp-100ml", "creed-aventus-50ml", "glenfiddich-15-700ml"],
  },
  {
    slug: "2026-04-week-3-duty-free-benefits",
    monthSlug: "2026-04",
    weekLabel: "4월 3주차",
    periodStart: "2026-04-15",
    periodEnd: "2026-04-21",
    publishedAt: "2026-04-21",
    updatedAt: "2026-04-21",
    highlights: [
      "신세계 면세점 쿠폰 2026 검색 수요에 맞춰 신세계 혜택 홈과 월별 혜택 확인 흐름을 함께 정리합니다.",
      "뷰티 상품은 공개가, 적립금, 브랜드 사은품이 따로 움직이므로 원본 혜택 링크를 함께 확인해야 합니다.",
      "면세점별 쿠폰·적립금·카드 할인은 월간 허브에서 비교하고 주간 리포트에서 변경점을 확인합니다.",
    ],
    changesFromPreviousWeek: [
      "신세계 쿠폰 검색어 대응 문구와 원본 확인 링크를 보강했습니다.",
      "SK-II, 헤라, 블루 드 샤넬 등 대표 상품 가격 확인 링크를 추가했습니다.",
    ],
    coupons: ["신세계 신규회원 특별 혜택", "신라 출국예정일 쿠폰", "롯데 오늘의 혜택 받기"],
    rewards: ["신라 선불 최대 혜택", "현대 H.oney", "롯데 LDF 멤버십 등급 혜택"],
    cardDiscounts: ["현대 삼성카드 혜택", "신라 간편결제 카드 혜택"],
    brandEvents: ["신세계 52시간 Weekend Sale", "현대 브랜드 사은품", "롯데 온라인 단독 이벤트"],
    expiredNotes: ["주말 한정 세일은 다음 주차 리포트에서 종료 여부를 다시 확인합니다."],
    relatedProductSlugs: ["sk2-pitera-essence-230ml", "hera-black-cushion-15g", "bleu-de-chanel-edp-100ml"],
  },
  {
    slug: "2026-04-week-4-duty-free-benefits",
    monthSlug: "2026-04",
    weekLabel: "4월 4주차",
    periodStart: "2026-04-22",
    periodEnd: "2026-04-25",
    publishedAt: "2026-04-25",
    updatedAt: "2026-04-25",
    highlights: [
      "4월 말 출국 전 쿠폰·적립금·카드 할인은 월간 허브에서 비교하고 원본 면세점에서 최종 적용을 확인합니다.",
      "신세계·신라·롯데·현대면세점의 혜택 홈 링크를 기준으로 이번 주 확인 포인트를 정리했습니다.",
      "가격 비교 랜딩과 대표 상품 페이지를 함께 연결해 쿠폰 확인 후 상품 가격 비교로 이어지게 구성했습니다.",
    ],
    changesFromPreviousWeek: [
      "월간 허브 `/deals/2026-04`로 내부 링크를 모으는 주간 아카이브 구조를 반영했습니다.",
      "면세점 가격 비교 시작 페이지와 대표 상품 3개의 연결을 강화했습니다.",
    ],
    coupons: ["신세계 신규회원 쿠폰", "신라 출국예정일 등록 더하기 쿠폰", "롯데 선착순 쿠폰"],
    rewards: ["현대 H.oney", "신라 선불 혜택", "롯데 멤버십 포인트"],
    cardDiscounts: ["현대 삼성카드 결제 혜택", "신라 카카오페이X삼성카드 혜택"],
    brandEvents: ["신세계 타임세일", "현대 브랜드 행사", "롯데 인천공항점 오픈 기념 이벤트"],
    expiredNotes: ["월말 혜택은 5월 조건으로 교체될 수 있으므로 출국 전 원본 페이지에서 기간을 다시 확인하세요."],
    relatedProductSlugs: ["bleu-de-chanel-edp-100ml", "sk2-pitera-essence-230ml", "hera-black-cushion-15g"],
  },
  {
    slug: "2026-04-19-duty-free-benefit-weekly",
    monthSlug: "2026-04",
    weekLabel: "4월 3주차",
    periodStart: "2026-04-15",
    periodEnd: "2026-04-21",
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
    title: "2026년 4월 19일 면세점 혜택 주간 리포트",
    description:
      "롯데·현대·신라·신세계면세점의 2026년 4월 3주차 쿠폰, 적립금, 카드 할인, 브랜드 이벤트 확인 포인트와 표준 주차 URL을 정리했습니다.",
    highlights: [
      "기존 색인 URL 보존을 위해 유지하는 2026년 4월 19일 기준 리포트입니다.",
      "표준 주간 아카이브는 2026년 4월 3주차 리포트에서 확인할 수 있습니다.",
      "원본 면세점 혜택 페이지에서 쿠폰·적립금·카드 할인 조건을 다시 확인해야 합니다.",
    ],
    changesFromPreviousWeek: [
      "기존 단일 주간 리포트를 월간 허브 + 주간 아카이브 구조로 정리했습니다.",
      "중복 색인을 줄이기 위해 표준 3주차 URL을 canonical 대상으로 지정합니다.",
    ],
    coupons: ["신세계 신규회원 특별 혜택", "신라 출국예정일 쿠폰", "롯데 오늘의 혜택"],
    rewards: ["신라 선불 혜택", "현대 H.oney", "롯데 멤버십 포인트"],
    cardDiscounts: ["현대 삼성카드 혜택", "신라 간편결제 카드 혜택"],
    brandEvents: ["신세계 52시간 Weekend Sale", "현대 브랜드 행사", "롯데 온라인 단독 이벤트"],
    expiredNotes: ["레거시 URL은 접근 보존용이며 최신 주간 비교는 표준 주차 URL에서 확인합니다."],
    relatedProductSlugs: ["sk2-pitera-essence-230ml", "hera-black-cushion-15g", "bleu-de-chanel-edp-100ml"],
    indexable: false,
    canonicalSlug: "2026-04-week-3-duty-free-benefits",
  },
];

function sortBenefitReportsByLatest(reports: BenefitReport[]) {
  return [...reports].sort(
    (left, right) =>
      right.periodStart.localeCompare(left.periodStart) ||
      right.publishedAt.localeCompare(left.publishedAt) ||
      right.slug.localeCompare(left.slug)
  );
}

function sortBenefitReportsChronologically(reports: BenefitReport[]) {
  return [...reports].sort(
    (left, right) =>
      left.periodStart.localeCompare(right.periodStart) ||
      left.publishedAt.localeCompare(right.publishedAt) ||
      left.slug.localeCompare(right.slug)
  );
}

export const benefitReports: BenefitReport[] = sortBenefitReportsByLatest(
  weeklyBenefitReportSeeds.map((seed) => buildWeeklyBenefitReport(seed))
);

export function isBenefitReportIndexable(report: BenefitReport) {
  return report.indexable !== false;
}

export const indexableBenefitReports = benefitReports.filter(isBenefitReportIndexable);

export const latestBenefitReport = indexableBenefitReports[0] ?? benefitReports[0];

export function getBenefitReportBySlug(slug: string) {
  return benefitReports.find((report) => report.slug === slug);
}

export function getBenefitReportsByMonth(monthSlug: string, options?: { includeNoindex?: boolean }) {
  return sortBenefitReportsByLatest(
    benefitReports.filter((report) => report.monthSlug === monthSlug && (options?.includeNoindex || isBenefitReportIndexable(report)))
  );
}

export function getLatestBenefitReportForMonth(monthSlug: string) {
  return getBenefitReportsByMonth(monthSlug)[0] ?? null;
}

export function getAdjacentBenefitReports(slug: string) {
  const current = getBenefitReportBySlug(slug);
  const monthSlug = current?.monthSlug ?? "2026-04";
  const sortedReports = sortBenefitReportsChronologically(getBenefitReportsByMonth(monthSlug));
  const currentSlug = current?.canonicalSlug ?? slug;
  const index = sortedReports.findIndex((report) => report.slug === currentSlug);

  return {
    previousReport: index > 0 ? sortedReports[index - 1] : null,
    nextReport: index >= 0 && index < sortedReports.length - 1 ? sortedReports[index + 1] : null,
  };
}
