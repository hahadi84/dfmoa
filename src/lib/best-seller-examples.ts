import { getProductBySlug, getStoreById, type Product, type StoreId } from "./site-data";

export type BestSellerExampleItem = {
  rank: number;
  product: Product;
  reason: string;
  signal: string;
};

export type StoreBestSellerExample = {
  storeId: StoreId;
  storeName: string;
  logoUrl: string;
  summary: string;
  caution: string;
  items: BestSellerExampleItem[];
};

type BestSellerExampleSeed = {
  storeId: StoreId;
  summary: string;
  caution: string;
  items: Array<{
    slug: string;
    reason: string;
    signal: string;
  }>;
};

export const bestSellerExampleUpdatedAt = "2026-04-19";

export const bestSellerExampleNotice =
  "공식 판매량 기준의 순위가 아닙니다. DFMOA의 대표 검색어, 카테고리 수요, 혜택 노출 가능성, 면세 쇼핑 빈출 품목을 바탕으로 구성한 추천 예시입니다.";

export const bestSellerExampleMethodology = [
  "면세점이 실제 판매량을 공개하지 않는 경우가 많아 확정 순위로 표시하지 않습니다.",
  "상품명과 용량이 비교 가능한 대표 품목을 우선 배치했습니다.",
  "향수, 뷰티, 주류, 아이웨어처럼 면세 구매 목적이 뚜렷한 카테고리를 중심으로 구성했습니다.",
  "가격 비교를 시작하기 좋은 검색 예시이며, 최종 구매 판단은 각 면세점 원본 페이지에서 확인해야 합니다.",
];

const exampleSeeds: BestSellerExampleSeed[] = [
  {
    storeId: "lotte",
    summary: "대중적인 향수, K-뷰티, 주류 수요가 함께 섞이는 종합형 추천 예시입니다.",
    caution: "롯데 추천 예시는 검색 진입용 샘플이며 실제 판매량 순위가 아닙니다.",
    items: [
      { slug: "creed-aventus-50ml", reason: "니치 향수 대표 검색어", signal: "향수 베스트 예시" },
      { slug: "jo-malone-english-pear-100ml", reason: "선물 수요가 높은 향수", signal: "선물 인기 예시" },
      { slug: "sulwhasoo-first-care-serum-90ml", reason: "K-뷰티 대표 세럼", signal: "뷰티 베스트 예시" },
      { slug: "sk2-pitera-essence-230ml", reason: "면세 가격 편차가 큰 스킨케어", signal: "가격 비교 예시" },
      { slug: "glenfiddich-15-700ml", reason: "입문 위스키 검색 수요", signal: "주류 베스트 예시" },
      { slug: "hibiki-harmony-700ml", reason: "재고 확인 수요가 높은 위스키", signal: "재고 확인 예시" },
      { slug: "gentle-monster-dear-01", reason: "모델명 검색이 많은 아이웨어", signal: "아이웨어 예시" },
      { slug: "rayban-wayfarer-rb2140", reason: "클래식 선글라스 비교 품목", signal: "스테디셀러 예시" },
      { slug: "diptyque-do-son-75ml", reason: "니치 향수 가격 비교 입문", signal: "니치 인기 예시" },
      { slug: "byredo-blanche-100ml", reason: "선물형 니치 향수 후보", signal: "선물 후보 예시" },
    ],
  },
  {
    storeId: "hyundai",
    summary: "뷰티, 카드 혜택, 브랜드 행사 적용 여부를 확인하기 좋은 추천 예시입니다.",
    caution: "현대 추천 예시는 혜택 확인용 샘플이며 실제 판매량 순위가 아닙니다.",
    items: [
      { slug: "sulwhasoo-first-care-serum-90ml", reason: "K-뷰티 세트 구성 확인", signal: "뷰티 대표 예시" },
      { slug: "sk2-pitera-essence-230ml", reason: "용량별 가격 비교 수요", signal: "가격 편차 예시" },
      { slug: "estee-lauder-anr-100ml", reason: "대용량 세럼 면세 후보", signal: "스킨케어 예시" },
      { slug: "la-mer-moisturizing-cream-60ml", reason: "고가 크림 체감가 확인", signal: "고가 비교 예시" },
      { slug: "kiehls-ultra-facial-cream-125ml", reason: "데일리 크림 선물 수요", signal: "선물 후보 예시" },
      { slug: "tom-ford-oud-wood-50ml", reason: "프리미엄 향수 가격 비교", signal: "럭셔리 향수 예시" },
      { slug: "bleu-de-chanel-edp-100ml", reason: "남성 향수 대표 후보", signal: "남성 향수 예시" },
      { slug: "maison-margiela-lazy-sunday-morning-100ml", reason: "선물형 향수 후보", signal: "선물 인기 예시" },
      { slug: "gentle-monster-dear-01", reason: "출국 전 아이웨어 확인", signal: "아이웨어 예시" },
      { slug: "glenfiddich-15-700ml", reason: "주류 가격 확인 입문", signal: "주류 후보 예시" },
    ],
  },
  {
    storeId: "shilla",
    summary: "향수와 뷰티 중심으로 쿠폰·선불 혜택 적용 가능성을 함께 보는 추천 예시입니다.",
    caution: "신라 추천 예시는 구매 후보를 잡기 위한 샘플이며 실제 판매량 순위가 아닙니다.",
    items: [
      { slug: "creed-aventus-50ml", reason: "고가 향수 체감가 확인", signal: "향수 베스트 예시" },
      { slug: "diptyque-do-son-75ml", reason: "니치 향수 쿠폰 확인", signal: "니치 향수 예시" },
      { slug: "le-labo-santal-33-50ml", reason: "영문 상품명 정합성 확인", signal: "검색 정확도 예시" },
      { slug: "byredo-blanche-100ml", reason: "선물형 향수 비교 후보", signal: "선물 후보 예시" },
      { slug: "tom-ford-oud-wood-50ml", reason: "프리미엄 향수 가격 편차", signal: "고가 향수 예시" },
      { slug: "sulwhasoo-first-care-serum-90ml", reason: "K-뷰티 혜택 확인", signal: "뷰티 대표 예시" },
      { slug: "sk2-pitera-essence-230ml", reason: "스킨케어 대용량 후보", signal: "가격 비교 예시" },
      { slug: "bleu-de-chanel-edp-100ml", reason: "남성 향수 대표 검색어", signal: "남성 향수 예시" },
      { slug: "rayban-wayfarer-rb2140", reason: "아이웨어 모델명 비교", signal: "아이웨어 예시" },
      { slug: "hibiki-harmony-700ml", reason: "재고와 가격 동시 확인", signal: "주류 후보 예시" },
    ],
  },
  {
    storeId: "shinsegae",
    summary: "타임세일, 신규회원, 주류·뷰티 특가 확인에 맞춘 추천 예시입니다.",
    caution: "신세계 추천 예시는 타임세일 확인용 샘플이며 실제 판매량 순위가 아닙니다.",
    items: [
      { slug: "glenfiddich-15-700ml", reason: "주류 특가 확인 입문", signal: "주류 베스트 예시" },
      { slug: "hibiki-harmony-700ml", reason: "재고 변동 확인 필요", signal: "재고 확인 예시" },
      { slug: "ballantines-21-700ml", reason: "선물형 위스키 후보", signal: "선물 주류 예시" },
      { slug: "johnnie-walker-blue-label-750ml", reason: "고가 주류 가격 비교", signal: "고가 주류 예시" },
      { slug: "sulwhasoo-first-care-serum-90ml", reason: "신규회원 혜택 확인", signal: "뷰티 대표 예시" },
      { slug: "sk2-pitera-essence-230ml", reason: "고가 스킨케어 비교", signal: "가격 편차 예시" },
      { slug: "jo-malone-english-pear-100ml", reason: "선물 향수 후보", signal: "선물 인기 예시" },
      { slug: "creed-aventus-50ml", reason: "프리미엄 향수 후보", signal: "향수 베스트 예시" },
      { slug: "aesop-resurrection-hand-balm-75ml", reason: "소액 선물 후보", signal: "소액 선물 예시" },
      { slug: "maison-margiela-lazy-sunday-morning-100ml", reason: "캐주얼 향수 선물 후보", signal: "향수 후보 예시" },
    ],
  },
];

export const storeBestSellerExamples: StoreBestSellerExample[] = exampleSeeds.flatMap((seed) => {
  const store = getStoreById(seed.storeId);

  if (!store) {
    return [];
  }

  return [
    {
      storeId: seed.storeId,
      storeName: store.name,
      logoUrl: store.logoUrl,
      summary: seed.summary,
      caution: seed.caution,
      items: seed.items.flatMap((item, index) => {
        const product = getProductBySlug(item.slug);

        if (!product) {
          return [];
        }

        return [
          {
            rank: index + 1,
            product,
            reason: item.reason,
            signal: item.signal,
          },
        ];
      }),
    },
  ];
});
