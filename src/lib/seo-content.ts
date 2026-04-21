import type { AirportGuide, BrandLanding, MonthlyDealReport, ProductComparePage } from "@/lib/content-models";
import { benefitRules } from "@/lib/effective-price";
import { dutyFreeBenefitStores, dutyFreeBenefitUpdatedAt } from "@/lib/duty-free-benefits";
import { categories, guides, products, stores, type Category, type CategorySlug, type Guide } from "@/lib/site-data";

const UPDATED_AT = "2026-04-19";

function productId(slug: string) {
  return products.find((product) => product.slug === slug)?.id;
}

function idsFromSlugs(slugs: string[]) {
  return slugs.map(productId).filter((id): id is string => Boolean(id));
}

function representativeProducts(seedSlugs: string[], categorySlug: CategorySlug, brandName?: string) {
  const seeded = idsFromSlugs(seedSlugs);
  const sameBrand = brandName
    ? products
        .filter((product) => product.brand.toLowerCase() === brandName.toLowerCase())
        .map((product) => product.id)
    : [];
  const sameCategory = products.filter((product) => product.categorySlug === categorySlug).map((product) => product.id);

  return Array.from(new Set([...seeded, ...sameBrand, ...sameCategory])).slice(0, 5);
}

export const brandLandings: BrandLanding[] = [
  {
    slug: "creed",
    nameKo: "크리드",
    nameEn: "CREED",
    description:
      "크리드는 향수 카테고리에서 검색 수요가 높은 브랜드입니다. DFMOA에서는 대표 상품의 최근 확인 공개가, 면세점별 상태, 원본 확인 링크를 함께 제공해 구매 전 비교 시간을 줄이는 데 초점을 둡니다.",
    categoryIds: ["perfume"],
    representativeProductIds: representativeProducts(["creed-aventus-50ml"], "perfume", "CREED"),
    relatedGuideSlugs: ["price-comparison-checklist", "airport-duty-free-basics"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
    seoTitle: "크리드 면세 가격 비교와 예상 실결제가 계산",
  },
  {
    slug: "jo-malone",
    nameKo: "조말론",
    nameEn: "Jo Malone",
    description:
      "조말론은 선물용 향수로 자주 비교되는 브랜드입니다. 용량과 향 이름이 비슷한 상품이 많아 브랜드명, 상품명, 용량을 함께 확인하는 것이 중요합니다.",
    categoryIds: ["perfume"],
    representativeProductIds: representativeProducts(["jo-malone-english-pear-100ml"], "perfume", "Jo Malone"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sulwhasoo",
    nameKo: "설화수",
    nameEn: "Sulwhasoo",
    description:
      "설화수는 세트 구성과 증정품, 적립금 조건에 따라 체감 가격 차이가 커지는 뷰티 브랜드입니다. 공개가와 혜택 적용 가능성을 분리해 확인하는 것이 좋습니다.",
    categoryIds: ["beauty"],
    representativeProductIds: representativeProducts(["sulwhasoo-first-care-serum-90ml"], "beauty", "Sulwhasoo"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sk-ii",
    nameKo: "SK-II",
    nameEn: "SK-II",
    description:
      "SK-II는 용량과 세트 구성 차이가 가격 비교에 큰 영향을 주는 브랜드입니다. 최근 확인 공개가와 국내가 참고 비교를 함께 확인해 보세요.",
    categoryIds: ["beauty"],
    representativeProductIds: representativeProducts(["sk2-pitera-essence-230ml"], "beauty", "SK-II"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "glenfiddich",
    nameKo: "글렌피딕",
    nameEn: "Glenfiddich",
    description:
      "글렌피딕은 주류 면세 비교에서 수령 공항, 반입 주의, 용량 확인이 함께 필요한 브랜드입니다. 원본 면세점에서 출국 정보를 입력한 뒤 최종 수령 가능 여부를 확인해야 합니다.",
    categoryIds: ["liquor"],
    representativeProductIds: representativeProducts(["glenfiddich-15-700ml"], "liquor", "Glenfiddich"),
    relatedGuideSlugs: ["pickup-and-limit-guide", "airport-duty-free-basics"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "hibiki",
    nameKo: "히비키",
    nameEn: "Hibiki",
    description:
      "히비키는 재고와 노출 상태가 빠르게 바뀔 수 있는 위스키 브랜드입니다. 가격이 없을 때는 실패가 아니라 원본 확인이 필요한 상태로 표시합니다.",
    categoryIds: ["liquor"],
    representativeProductIds: representativeProducts(["hibiki-harmony-700ml"], "liquor", "Hibiki"),
    relatedGuideSlugs: ["pickup-and-limit-guide"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "gentle-monster",
    nameKo: "젠틀몬스터",
    nameEn: "Gentle Monster",
    description:
      "젠틀몬스터는 모델명과 컬러 코드 일치 여부가 중요합니다. 동일 모델인지 확인한 뒤 면세가와 국내가를 참고 비교하는 흐름을 권장합니다.",
    categoryIds: ["eyewear"],
    representativeProductIds: representativeProducts(["gentle-monster-dear-01"], "eyewear", "Gentle Monster"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "ray-ban",
    nameKo: "레이밴",
    nameEn: "Ray-Ban",
    description:
      "레이밴은 같은 모델명이라도 렌즈 색상, 사이즈, 코드가 다를 수 있습니다. DFMOA에서는 상품명과 용량/옵션을 기준으로 보수적으로 매칭합니다.",
    categoryIds: ["eyewear"],
    representativeProductIds: representativeProducts(["rayban-wayfarer-rb2140"], "eyewear", "Ray-Ban"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "diptyque",
    nameKo: "딥티크",
    nameEn: "Diptyque",
    description:
      "딥티크는 향 이름과 EDT/EDP 표기가 가격 비교에 영향을 줍니다. 공개가가 일부만 확인될 수 있어 원본 링크와 함께 보는 것이 안전합니다.",
    categoryIds: ["perfume"],
    representativeProductIds: representativeProducts(["diptyque-do-son-75ml"], "perfume", "Diptyque"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "byredo",
    nameKo: "바이레도",
    nameEn: "Byredo",
    description:
      "바이레도는 향수 용량과 향 이름을 정확히 맞춰야 의미 있는 비교가 가능합니다. 예상 실결제가 계산기는 쿠폰과 카드 혜택을 직접 입력해 참고값을 계산합니다.",
    categoryIds: ["perfume"],
    representativeProductIds: representativeProducts(["byredo-blanche-100ml"], "perfume", "Byredo"),
    relatedGuideSlugs: ["price-comparison-checklist"],
    relatedDealSlugs: ["2026-04"],
    updatedAt: UPDATED_AT,
  },
];

export const airportGuides: AirportGuide[] = [
  {
    slug: "icn-t1",
    title: "인천공항 T1 면세 수령 가이드",
    airportName: "인천국제공항",
    terminal: "T1",
    description: "인천 T1 출국 전 면세품 수령은 출국 정보와 탑승 동선에 따라 달라질 수 있습니다.",
    pickupNotes: [
      "면세점 원본에서 출국일, 항공편, 터미널 정보를 입력한 뒤 수령 가능 여부를 확인하세요.",
      "주류, 향수, 담배 등은 항공사·도착지 규정과 반입 한도를 함께 확인해야 합니다.",
      "DFMOA는 수령 가능 재고를 확정 표시하지 않고 공식 확인 링크를 제공합니다.",
    ],
    categoryWarnings: [
      { category: "주류", warnings: ["용량과 수량 제한, 환승 국가 규정을 원본에서 확인하세요."] },
      { category: "향수", warnings: ["액체류 반입·환승 보안 규정을 함께 확인하세요."] },
      { category: "화장품", warnings: ["세트 구성과 증정품 수령 조건이 달라질 수 있습니다."] },
    ],
    officialLinks: [
      { label: "인천공항 공식 안내", url: "https://www.airport.kr" },
      { label: "관세청 여행자 휴대품 안내", url: "https://www.customs.go.kr" },
    ],
    relatedProductIds: idsFromSlugs(["creed-aventus-50ml", "sulwhasoo-first-care-serum-90ml", "glenfiddich-15-700ml"]),
    relatedGuideSlugs: ["pickup-and-limit-guide", "airport-duty-free-basics"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "icn-t2",
    title: "인천공항 T2 면세 수령 가이드",
    airportName: "인천국제공항",
    terminal: "T2",
    description: "인천 T2는 항공사와 출국 동선에 따라 인도장 확인이 특히 중요합니다.",
    pickupNotes: [
      "출국 터미널이 T2인지 원본 면세점과 항공권에서 함께 확인하세요.",
      "주문 후 항공편 변경 시 수령 가능 여부가 달라질 수 있습니다.",
      "실제 인도장 위치는 공항·면세점 공지를 우선합니다.",
    ],
    categoryWarnings: [
      { category: "주류", warnings: ["위스키·와인 등은 도착지 반입 규정을 확인하세요."] },
      { category: "향수", warnings: ["환승 여정에서는 액체류 밀봉 상태와 보안 규정을 확인하세요."] },
      { category: "전자기기", warnings: ["배터리 포함 제품은 항공사 기내 반입 규정을 확인하세요."] },
    ],
    officialLinks: [
      { label: "인천공항 공식 안내", url: "https://www.airport.kr" },
      { label: "관세청 여행자 휴대품 안내", url: "https://www.customs.go.kr" },
    ],
    relatedProductIds: idsFromSlugs(["jo-malone-english-pear-100ml", "sk2-pitera-essence-230ml"]),
    relatedGuideSlugs: ["pickup-and-limit-guide"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "gmp",
    title: "김포공항 면세 수령 가이드",
    airportName: "김포국제공항",
    description: "김포공항 출국은 노선과 면세점별 수령 가능 상품이 다를 수 있어 원본 확인이 필요합니다.",
    pickupNotes: [
      "국제선 출국 여부와 항공편 정보를 원본 면세점에서 확인하세요.",
      "카테고리별 수령 가능 상품과 마감 시간이 다를 수 있습니다.",
      "DFMOA의 가격 정보는 최근 확인 공개가 기준 참고 정보입니다.",
    ],
    categoryWarnings: [
      { category: "향수", warnings: ["액체류 반입 기준을 확인하세요."] },
      { category: "화장품", warnings: ["세트 구성과 증정 조건을 확인하세요."] },
    ],
    officialLinks: [
      { label: "한국공항공사 김포공항", url: "https://www.airport.co.kr/gimpo" },
      { label: "관세청 여행자 휴대품 안내", url: "https://www.customs.go.kr" },
    ],
    relatedProductIds: idsFromSlugs(["sulwhasoo-first-care-serum-90ml", "gentle-monster-dear-01"]),
    relatedGuideSlugs: ["airport-duty-free-basics"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "cju",
    title: "제주공항 면세 이용 가이드",
    airportName: "제주국제공항",
    description: "제주공항 면세 이용은 내국인 면세와 국제선 면세 조건을 구분해 확인해야 합니다.",
    pickupNotes: [
      "이용 가능한 면세점과 수령 방식은 여정과 구매 채널에 따라 달라질 수 있습니다.",
      "주류·담배 등은 별도 한도와 규정을 확인하세요.",
      "원본 면세점에서 출국 또는 탑승 정보를 입력한 뒤 최종 확인하세요.",
    ],
    categoryWarnings: [
      { category: "주류", warnings: ["제주 면세 한도와 항공 보안 규정을 함께 확인하세요."] },
      { category: "식품", warnings: ["선물세트 구성과 반입 제한 품목을 확인하세요."] },
    ],
    officialLinks: [
      { label: "한국공항공사 제주공항", url: "https://www.airport.co.kr/jeju" },
      { label: "관세청 여행자 휴대품 안내", url: "https://www.customs.go.kr" },
    ],
    relatedProductIds: idsFromSlugs(["hibiki-harmony-700ml", "glenfiddich-15-700ml"]),
    relatedGuideSlugs: ["pickup-and-limit-guide"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "pus",
    title: "부산 김해공항 면세 수령 가이드",
    airportName: "김해국제공항",
    description: "부산 김해공항 출국 전에는 면세점별 수령 가능 여부와 인도장 동선을 확인해야 합니다.",
    pickupNotes: [
      "항공편과 출국 터미널 기준으로 원본 면세점에서 최종 수령 가능 여부를 확인하세요.",
      "지역 공항은 상품 노출과 수령 가능성이 수도권 공항과 다를 수 있습니다.",
      "가격과 혜택은 최근 확인 공개가 기준 참고값으로 봐야 합니다.",
    ],
    categoryWarnings: [
      { category: "주류", warnings: ["도착지 반입 규정과 수량 제한을 확인하세요."] },
      { category: "향수", warnings: ["액체류 보안 봉투와 환승 조건을 확인하세요."] },
    ],
    officialLinks: [
      { label: "한국공항공사 김해공항", url: "https://www.airport.co.kr/gimhae" },
      { label: "관세청 여행자 휴대품 안내", url: "https://www.customs.go.kr" },
    ],
    relatedProductIds: idsFromSlugs(["rayban-wayfarer-rb2140", "byredo-blanche-100ml"]),
    relatedGuideSlugs: ["airport-duty-free-basics"],
    updatedAt: UPDATED_AT,
  },
];

const sourceLinks = dutyFreeBenefitStores.map((store) => ({
  sourceName: stores.find((item) => item.id === store.storeId)?.name ?? store.storeId,
  url: store.benefitHomeUrl,
  lastVerifiedAt: dutyFreeBenefitUpdatedAt,
}));

export const monthlyDealReports: MonthlyDealReport[] = [
  {
    slug: "2026-04",
    year: 2026,
    month: 4,
    title: "2026년 4월 면세 혜택 총정리",
    summary: "4월 공개 혜택 링크와 쿠폰·적립금·카드 조건을 예상 실결제가 계산 관점에서 정리했습니다.",
    benefitRuleIds: benefitRules.map((rule) => rule.id),
    sourceLinks,
    relatedProductIds: idsFromSlugs(["creed-aventus-50ml", "sulwhasoo-first-care-serum-90ml", "glenfiddich-15-700ml"]),
    publishedAt: "2026-04-19",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "2026-03",
    year: 2026,
    month: 3,
    title: "2026년 3월 면세 혜택 아카이브",
    summary: "운영자가 월간 리포트 포맷을 검수하기 위한 3월 혜택 아카이브입니다. 실제 조건은 원본 링크 확인이 필요합니다.",
    benefitRuleIds: benefitRules.slice(0, 3).map((rule) => rule.id),
    sourceLinks,
    relatedProductIds: idsFromSlugs(["jo-malone-english-pear-100ml", "sk2-pitera-essence-230ml"]),
    publishedAt: "2026-03-31",
    updatedAt: UPDATED_AT,
  },
  {
    slug: "2026-02",
    year: 2026,
    month: 2,
    title: "2026년 2월 면세 혜택 아카이브",
    summary: "최근 3개월 혜택 페이지 구조를 위한 2월 아카이브입니다. 제휴/광고 링크 포함 가능성을 함께 고지합니다.",
    benefitRuleIds: benefitRules.slice(1).map((rule) => rule.id),
    sourceLinks,
    relatedProductIds: idsFromSlugs(["diptyque-do-son-75ml", "byredo-blanche-100ml"]),
    publishedAt: "2026-02-28",
    updatedAt: UPDATED_AT,
  },
];

export const comparePages: ProductComparePage[] = [
  {
    slug: "creed-aventus-50ml-vs-diptyque-do-son-75ml",
    productIds: idsFromSlugs(["creed-aventus-50ml", "diptyque-do-son-75ml"]),
    categoryId: "perfume",
    title: "크리드 어벤투스 50ml vs 딥티크 도손 75ml",
    comparisonSummary: "남성 향수 대표 검색어와 니치 향수 대표 상품을 공개가, source status, 예상 실결제가 계산 진입점 기준으로 비교합니다.",
    createdReason: "curated",
    relatedGuideSlugs: ["price-comparison-checklist"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "sulwhasoo-first-care-serum-90ml-vs-sk-ii-facial-treatment-essence-230ml",
    productIds: idsFromSlugs(["sulwhasoo-first-care-serum-90ml", "sk2-pitera-essence-230ml"]),
    categoryId: "beauty",
    title: "설화수 윤조에센스 90ml vs SK-II 피테라 에센스 230ml",
    comparisonSummary: "뷰티 대표 에센스 상품을 세트 구성, 용량, 공개가 상태, 혜택 적용 가능성 기준으로 비교합니다.",
    createdReason: "popular_pair",
    relatedGuideSlugs: ["price-comparison-checklist"],
    updatedAt: UPDATED_AT,
  },
  {
    slug: "glenfiddich-15-700ml-vs-hibiki-harmony-700ml",
    productIds: idsFromSlugs(["glenfiddich-15-700ml", "hibiki-harmony-700ml"]),
    categoryId: "liquor",
    title: "글렌피딕 15년 700ml vs 히비키 하모니 700ml",
    comparisonSummary: "주류 상품은 가격뿐 아니라 수령 공항, 반입 주의, 재고 노출 상태를 함께 확인해야 합니다.",
    createdReason: "curated",
    relatedGuideSlugs: ["pickup-and-limit-guide"],
    updatedAt: UPDATED_AT,
  },
];

export function getBrandLandingBySlug(slug: string) {
  return brandLandings.find((brand) => brand.slug === slug);
}

export function getAirportGuideBySlug(slug: string) {
  return airportGuides.find((airport) => airport.slug === slug);
}

export function getMonthlyDealReportBySlug(slug: string) {
  return monthlyDealReports.find((report) => report.slug === slug);
}

export function getComparePageBySlug(slug: string) {
  return comparePages.find((page) => page.slug === slug);
}

export function getRelatedGuides(slugs?: string[]) {
  return (slugs ?? [])
    .map((slug) => guides.find((guide) => guide.slug === slug))
    .filter((guide): guide is Guide => Boolean(guide));
}

export function getCategoryLinks(categoryIds: CategorySlug[]) {
  return categoryIds
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is Category => Boolean(category));
}
