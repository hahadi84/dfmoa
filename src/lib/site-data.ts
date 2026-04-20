export type StoreId = "lotte" | "shilla" | "hyundai" | "shinsegae";
export type CategorySlug =
  | "perfume"
  | "beauty"
  | "liquor"
  | "eyewear"
  | "fashion"
  | "watch"
  | "jewelry"
  | "health"
  | "food"
  | "electronics";
export type OfferStatus = "available" | "limited" | "soldout" | "check";
export type StoreSupportState = "live" | "planned";

export type Store = {
  id: StoreId;
  name: string;
  shortName: string;
  logoUrl: string;
  description: string;
  accent: string;
  pickupAirports: string[];
  siteUrl: string;
  supportState: StoreSupportState;
  supportNote: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  headline: string;
  intro: string;
  keywords: string[];
  guideSlug: string;
};

export type Product = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  displayName: string;
  query: string;
  volume: string;
  categorySlug: CategorySlug;
  summary: string;
  badge: string;
  tags: string[];
  searchTerms: string[];
  aliases?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  sections: {
    heading: string;
    body: string[];
    bullets?: string[];
  }[];
};

export type Faq = {
  question: string;
  answer: string;
};

export const airports = ["ICN T1", "ICN T2", "GMP", "PUS", "CJU"] as const;

export const stores: Store[] = [
  {
    id: "lotte",
    name: "롯데면세점",
    shortName: "롯데",
    logoUrl: "/store-logos/lotte-logo.png",
    description: "공개 검색 결과를 기준으로 최근 확인가와 원본 링크를 함께 제공하는 운영사",
    accent: "linear-gradient(135deg, #1d4ed8, #38bdf8)",
    pickupAirports: ["ICN T1", "ICN T2", "GMP", "PUS", "CJU"],
    siteUrl: "https://kor.lottedfs.com/kr",
    supportState: "live",
    supportNote: "공식 검색 결과 기준 확인",
  },
  {
    id: "hyundai",
    name: "현대면세점",
    shortName: "현대",
    logoUrl: "/store-logos/hyundai-logo.png",
    description: "모바일 공개 검색 결과를 기준으로 최근 확인가와 원본 링크를 제공하는 운영사",
    accent: "linear-gradient(135deg, #0f766e, #5eead4)",
    pickupAirports: ["ICN T1", "ICN T2", "GMP", "PUS"],
    siteUrl: "https://www.hddfs.com/shop/dm/main.do",
    supportState: "live",
    supportNote: "공식 모바일 검색 결과 기준 확인",
  },
  {
    id: "shilla",
    name: "신라면세점",
    shortName: "신라",
    logoUrl: "/store-logos/shilla-logo.png",
    description: "공식 검색 응답에서 확인 가능한 공개가와 원본 링크를 제공하는 운영사",
    accent: "linear-gradient(135deg, #0f172a, #475569)",
    pickupAirports: ["ICN T1", "ICN T2", "GMP", "CJU"],
    siteUrl: "https://www.shilladfs.com/",
    supportState: "live",
    supportNote: "공식 검색 응답 기준 확인",
  },
  {
    id: "shinsegae",
    name: "신세계면세점",
    shortName: "신세계",
    logoUrl: "/store-logos/shinsegae-logo.png",
    description: "공식 검색은 차단되지만 접근 가능한 공식 노출 상품과 외부 스냅샷을 함께 반영하는 운영사",
    accent: "linear-gradient(135deg, #7c2d12, #fdba74)",
    pickupAirports: ["ICN T1", "ICN T2", "PUS"],
    siteUrl: "https://www.ssgdfs.com/kr/main/initMain",
    supportState: "live",
    supportNote: "공식 노출 상품 기준 부분 확인",
  },
];

export const categories: Category[] = [
  {
    slug: "perfume",
    name: "향수",
    headline: "향수 가격 비교",
    intro: "용량과 에디션만 정확히 맞추면 가장 빠르게 비교 효율이 나는 대표 카테고리입니다.",
    keywords: ["조 말론", "딥디크", "크리드", "르 라보", "바이레도"],
    guideSlug: "airport-duty-free-basics",
  },
  {
    slug: "beauty",
    name: "뷰티",
    headline: "스킨케어·메이크업 비교",
    intro: "회원가, 세트 구성, 증정품 차이 때문에 상품 정규화가 특히 중요한 카테고리입니다.",
    keywords: ["설화수", "SK-II", "에스티 로더", "랑콤", "헤라"],
    guideSlug: "price-comparison-checklist",
  },
  {
    slug: "liquor",
    name: "주류",
    headline: "위스키·사케 가격 비교",
    intro: "가격뿐 아니라 재고와 수령 공항까지 같이 봐야 실제 구매 판단에 가까워집니다.",
    keywords: ["발렌타인", "글렌피딕", "히비키", "조니워커", "야마자키"],
    guideSlug: "pickup-and-limit-guide",
  },
  {
    slug: "eyewear",
    name: "아이웨어",
    headline: "선글라스·안경 비교",
    intro: "모델명과 컬러 코드 일치 여부가 핵심이라 검색어 정확도가 특히 중요합니다.",
    keywords: ["젠틀몬스터", "레이밴", "톰포드", "프라다", "구찌"],
    guideSlug: "price-comparison-checklist",
  },
  {
    slug: "fashion",
    name: "패션잡화",
    headline: "가방·지갑·스카프 비교",
    intro: "모델명과 컬러 차이가 커서 상품명 정규화가 특히 중요한 카테고리입니다.",
    keywords: ["롱샴", "투미", "코치", "폴로", "몽블랑"],
    guideSlug: "price-comparison-checklist",
  },
  {
    slug: "watch",
    name: "시계",
    headline: "시계·스마트워치 비교",
    intro: "레퍼런스 번호와 색상, 스트랩 구성이 가격 판단의 핵심입니다.",
    keywords: ["세이코", "시티즌", "티쏘", "카시오", "애플워치"],
    guideSlug: "price-comparison-checklist",
  },
  {
    slug: "jewelry",
    name: "주얼리",
    headline: "주얼리·액세서리 비교",
    intro: "소재와 사이즈, 세트 여부에 따라 검색 결과가 쉽게 갈리는 카테고리입니다.",
    keywords: ["스와로브스키", "판도라", "제이에스티나", "스톤헨지", "티파니"],
    guideSlug: "price-comparison-checklist",
  },
  {
    slug: "health",
    name: "건강식품",
    headline: "비타민·영양제 비교",
    intro: "수량, 정제 수, 패키지 구성이 달라 단가 비교가 중요한 카테고리입니다.",
    keywords: ["정관장", "센트룸", "오쏘몰", "솔가", "GNC"],
    guideSlug: "pickup-and-limit-guide",
  },
  {
    slug: "food",
    name: "식품",
    headline: "초콜릿·간식·선물세트 비교",
    intro: "선물용 묶음 구성과 중량 차이를 함께 확인해야 비교가 쉬워집니다.",
    keywords: ["고디바", "로이스", "레더라", "하리보", "정관장"],
    guideSlug: "pickup-and-limit-guide",
  },
  {
    slug: "electronics",
    name: "전자기기",
    headline: "이어폰·디바이스 비교",
    intro: "모델 코드와 세대, 색상명이 정확해야 같은 상품끼리 비교할 수 있습니다.",
    keywords: ["애플", "소니", "보스", "다이슨", "브라운"],
    guideSlug: "price-comparison-checklist",
  },
];

type ProductSeed = Omit<Product, "id" | "categorySlug" | "tags" | "searchTerms"> & {
  tags?: string[];
  searchTerms?: string[];
  aliases?: string[];
};

function createCategoryProducts(categorySlug: CategorySlug, startId: number, seeds: ProductSeed[]): Product[] {
  return seeds.map((seed, index) => ({
    ...seed,
    id: `p${startId + index}`,
    categorySlug,
    tags: seed.tags ?? [seed.brand, seed.volume, seed.badge],
    searchTerms: seed.searchTerms ?? [seed.brand, seed.name, seed.displayName, seed.query],
  }));
}

export const products: Product[] = [
  {
    id: "p1",
    slug: "creed-aventus-50ml",
    brand: "CREED",
    name: "Aventus",
    displayName: "CREED Aventus 50ml",
    query: "크리드 어벤투스 50ml",
    volume: "50ml",
    categorySlug: "perfume",
    summary: "남성 향수 대표 검색어로 자주 들어오는 스테디셀러입니다.",
    badge: "향수 베스트",
    tags: ["니치향수", "남성향수", "50ml"],
    searchTerms: ["크리드", "어벤투스", "aventus", "creed 50ml"],
  },
  {
    id: "p2",
    slug: "jo-malone-english-pear-100ml",
    brand: "Jo Malone",
    name: "English Pear & Freesia Cologne",
    displayName: "Jo Malone English Pear & Freesia 100ml",
    query: "조말론 잉글리쉬 페어 프리지아 100ml",
    volume: "100ml",
    categorySlug: "perfume",
    summary: "선물 수요가 높아 면세점별 프로모션 차이가 자주 나는 대표 향수입니다.",
    badge: "선물 인기",
    tags: ["여행 선물", "코롱", "100ml"],
    searchTerms: ["조말론", "잉글리쉬 페어", "english pear", "freesia"],
  },
  {
    id: "p3",
    slug: "sulwhasoo-first-care-serum-90ml",
    brand: "Sulwhasoo",
    name: "First Care Activating Serum",
    displayName: "Sulwhasoo First Care Activating Serum 90ml",
    query: "설화수 윤조에센스 90ml",
    volume: "90ml",
    categorySlug: "beauty",
    summary: "세트 구성과 사은품 차이까지 비교하면 체감 가격 차이가 크게 나는 상품입니다.",
    badge: "K-뷰티 대표",
    tags: ["세럼", "설화수", "90ml"],
    searchTerms: ["설화수", "윤조에센스", "first care", "activating serum"],
  },
  {
    id: "p4",
    slug: "sk2-pitera-essence-230ml",
    brand: "SK-II",
    name: "Facial Treatment Essence",
    displayName: "SK-II Facial Treatment Essence 230ml",
    query: "SK-II 피테라 에센스 230ml",
    volume: "230ml",
    categorySlug: "beauty",
    summary: "용량별 가격 차이가 크고 운영사별 행사 빈도도 높은 편입니다.",
    badge: "가격 편차 큼",
    tags: ["에센스", "피테라", "230ml"],
    searchTerms: ["sk2", "피테라", "treatment essence", "230ml"],
  },
  {
    id: "p5",
    slug: "glenfiddich-15-700ml",
    brand: "Glenfiddich",
    name: "15 Year Old Solera",
    displayName: "Glenfiddich 15YO 700ml",
    query: "글렌피딕 15년 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "면세 주류 비교 입문용으로 많이 찾는 대표 위스키입니다.",
    badge: "주류 베스트",
    tags: ["위스키", "싱글몰트", "700ml"],
    searchTerms: ["글렌피딕", "15년", "glenfiddich 15", "위스키"],
  },
  {
    id: "p6",
    slug: "hibiki-harmony-700ml",
    brand: "Hibiki",
    name: "Japanese Harmony",
    displayName: "Hibiki Japanese Harmony 700ml",
    query: "히비키 하모니 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "재고 변동이 빠른 편이라 가격과 판매 상태를 같이 봐야 하는 상품입니다.",
    badge: "재고 변동 큼",
    tags: ["일본 위스키", "하모니", "700ml"],
    searchTerms: ["히비키", "하모니", "hibiki harmony", "japanese harmony"],
    aliases: ["Hibiki Harmony 700ml", "Hibiki Japanese Harmony 700ml", "히비키하모니 700ml", "Hibiki Harmony"],
  },
  {
    id: "p7",
    slug: "gentle-monster-dear-01",
    brand: "Gentle Monster",
    name: "Dear 01",
    displayName: "Gentle Monster Dear 01",
    query: "젠틀몬스터 Dear 01",
    volume: "Black",
    categorySlug: "eyewear",
    summary: "모델명과 컬러 코드를 정확히 맞춰야 비교가 가능한 아이웨어 상품입니다.",
    badge: "아이웨어 인기",
    tags: ["선글라스", "블랙", "젠틀몬스터"],
    searchTerms: ["젠틀몬스터", "디어 01", "dear 01", "black"],
    aliases: ["Gentle Monster Dear 01", "젠틀몬스터디어 01", "Dear 01"],
  },
  {
    id: "p8",
    slug: "rayban-wayfarer-rb2140",
    brand: "Ray-Ban",
    name: "Original Wayfarer RB2140",
    displayName: "Ray-Ban Original Wayfarer RB2140",
    query: "레이밴 웨이페어러 RB2140",
    volume: "Black / G-15",
    categorySlug: "eyewear",
    summary: "컬러 코드와 렌즈 타입을 함께 비교해야 중복 매칭을 줄일 수 있습니다.",
    badge: "클래식 모델",
    tags: ["웨이페어러", "RB2140", "클래식"],
    searchTerms: ["레이밴", "wayfarer", "rb2140", "rayban"],
    aliases: ["Ray-Ban Original Wayfarer RB2140", "Ray Ban Wayfarer RB2140", "레이밴웨이페어러 RB2140"],
  },
  {
    id: "p9",
    slug: "diptyque-do-son-75ml",
    brand: "Diptyque",
    name: "Do Son Eau de Toilette",
    displayName: "Diptyque Do Son EDT 75ml",
    query: "딥디크 도손 오 드 뚜왈렛 75ml",
    volume: "75ml",
    categorySlug: "perfume",
    summary: "플로럴 계열 니치 향수로 용량 일치 검색 수요가 높습니다.",
    badge: "니치 인기",
    tags: ["딥디크", "도손", "75ml"],
    searchTerms: ["diptyque", "do son", "도손", "오드뚜왈렛"],
  },
  {
    id: "p10",
    slug: "byredo-blanche-100ml",
    brand: "Byredo",
    name: "Blanche Eau de Parfum",
    displayName: "Byredo Blanche EDP 100ml",
    query: "바이레도 블랑쉬 100ml",
    volume: "100ml",
    categorySlug: "perfume",
    summary: "선물용 수요가 꾸준하고 면세점별 행사 차이가 납니다.",
    badge: "선물 인기",
    tags: ["바이레도", "블랑쉬", "100ml"],
    searchTerms: ["byredo", "blanche", "블랑쉬", "블랑쉐"],
    aliases: ["Byredo Blanche 100ml", "Byredo Blanche EDP 100ml", "바이레도블랑쉬 100ml"],
  },
  {
    id: "p11",
    slug: "le-labo-santal-33-50ml",
    brand: "Le Labo",
    name: "Santal 33 Eau de Parfum",
    displayName: "Le Labo Santal 33 EDP 50ml",
    query: "르라보 상탈 33 50ml",
    volume: "50ml",
    categorySlug: "perfume",
    summary: "영문·국문 표기가 섞여 브랜드 정규화가 중요한 상품입니다.",
    badge: "검색 빈도 높음",
    tags: ["르라보", "상탈33", "50ml"],
    searchTerms: ["le labo", "santal 33", "상탈", "산탈"],
    aliases: ["Le Labo Santal 33 50ml", "Le Labo Santal 33 EDP 50ml", "르라보상탈33 50ml"],
  },
  {
    id: "p12",
    slug: "bleu-de-chanel-edp-100ml",
    brand: "Chanel",
    name: "Bleu de Chanel Eau de Parfum",
    displayName: "Bleu de Chanel EDP 100ml",
    query: "블루 드 샤넬 오 드 빠르펭 100ml",
    volume: "100ml",
    categorySlug: "perfume",
    summary: "남성 향수 대표 상품으로 가격과 재고 확인 수요가 큽니다.",
    badge: "남성 향수",
    tags: ["샤넬", "블루드샤넬", "100ml"],
    searchTerms: ["chanel", "bleu de chanel", "블루 드 샤넬"],
  },
  {
    id: "p13",
    slug: "dior-sauvage-edp-100ml",
    brand: "Dior",
    name: "Sauvage Eau de Parfum",
    displayName: "Dior Sauvage EDP 100ml",
    query: "디올 소바쥬 오 드 퍼퓸 100ml",
    volume: "100ml",
    categorySlug: "perfume",
    summary: "인기 남성 향수라 운영사별 노출 가격 비교에 적합합니다.",
    badge: "스테디셀러",
    tags: ["디올", "소바쥬", "100ml"],
    searchTerms: ["dior", "sauvage", "소바쥬", "소바주"],
  },
  {
    id: "p14",
    slug: "tom-ford-oud-wood-50ml",
    brand: "Tom Ford",
    name: "Oud Wood Eau de Parfum",
    displayName: "Tom Ford Oud Wood EDP 50ml",
    query: "톰포드 오드 우드 50ml",
    volume: "50ml",
    categorySlug: "perfume",
    summary: "고가 니치 향수라 작은 할인 차이도 체감 금액이 큽니다.",
    badge: "고가 비교",
    tags: ["톰포드", "오드우드", "50ml"],
    searchTerms: ["tom ford", "oud wood", "오드 우드", "우드"],
  },
  {
    id: "p15",
    slug: "maison-margiela-lazy-sunday-morning-100ml",
    brand: "Maison Margiela",
    name: "Lazy Sunday Morning",
    displayName: "Maison Margiela Lazy Sunday Morning 100ml",
    query: "메종 마르지엘라 레이지 선데이 모닝 100ml",
    volume: "100ml",
    categorySlug: "perfume",
    summary: "제품명이 길어 검색어 축약과 원문 매칭을 함께 봐야 합니다.",
    badge: "롱테일 인기",
    tags: ["마르지엘라", "레이지선데이", "100ml"],
    searchTerms: ["margiela", "lazy sunday morning", "레이지 선데이"],
  },
  {
    id: "p16",
    slug: "penhaligons-halfeti-100ml",
    brand: "Penhaligon's",
    name: "Halfeti Eau de Parfum",
    displayName: "Penhaligon's Halfeti EDP 100ml",
    query: "펜할리곤스 할페티 100ml",
    volume: "100ml",
    categorySlug: "perfume",
    summary: "브랜드 표기 변형이 잦아 검색어 후보를 넓게 잡기 좋습니다.",
    badge: "니치 향수",
    tags: ["펜할리곤스", "할페티", "100ml"],
    searchTerms: ["penhaligon", "halfeti", "펜할리곤", "할페티"],
  },
  {
    id: "p17",
    slug: "estee-lauder-anr-100ml",
    brand: "Estee Lauder",
    name: "Advanced Night Repair",
    displayName: "Estee Lauder ANR 100ml",
    query: "에스티로더 갈색병 100ml",
    volume: "100ml",
    categorySlug: "beauty",
    summary: "면세 뷰티 대표 상품으로 세트·단품 구분이 중요합니다.",
    badge: "뷰티 베스트",
    tags: ["갈색병", "에스티로더", "100ml"],
    searchTerms: ["estee lauder", "advanced night repair", "갈색병", "anr"],
  },
  {
    id: "p18",
    slug: "lancome-genifique-100ml",
    brand: "Lancome",
    name: "Advanced Genifique Serum",
    displayName: "Lancome Genifique Serum 100ml",
    query: "랑콤 제니피끄 세럼 100ml",
    volume: "100ml",
    categorySlug: "beauty",
    summary: "대용량 행사와 세트 구성이 자주 바뀌는 상품입니다.",
    badge: "세럼 인기",
    tags: ["랑콤", "제니피끄", "100ml"],
    searchTerms: ["lancome", "genifique", "제니피끄", "세럼"],
  },
  {
    id: "p19",
    slug: "hera-black-cushion-15g",
    brand: "Hera",
    name: "Black Cushion",
    displayName: "Hera Black Cushion 15g",
    query: "헤라 블랙 쿠션 15g",
    volume: "15g",
    categorySlug: "beauty",
    summary: "호수와 리필 구성 차이를 확인해야 하는 메이크업 상품입니다.",
    badge: "메이크업",
    tags: ["헤라", "쿠션", "15g"],
    searchTerms: ["hera", "black cushion", "블랙쿠션", "헤라 쿠션"],
  },
  {
    id: "p20",
    slug: "kiehls-ultra-facial-cream-125ml",
    brand: "Kiehl's",
    name: "Ultra Facial Cream",
    displayName: "Kiehl's Ultra Facial Cream 125ml",
    query: "키엘 울트라 훼이셜 크림 125ml",
    volume: "125ml",
    categorySlug: "beauty",
    summary: "용량별 단가 비교가 쉬운 보습 크림 대표 상품입니다.",
    badge: "보습 크림",
    tags: ["키엘", "수분크림", "125ml"],
    searchTerms: ["kiehl", "ultra facial", "키엘", "수분 크림"],
  },
  {
    id: "p21",
    slug: "la-mer-moisturizing-cream-60ml",
    brand: "La Mer",
    name: "Creme de la Mer",
    displayName: "La Mer Moisturizing Cream 60ml",
    query: "라메르 크렘 드 라 메르 60ml",
    volume: "60ml",
    categorySlug: "beauty",
    summary: "고가 크림이라 할인율과 증정품 차이를 같이 보기 좋습니다.",
    badge: "럭셔리 뷰티",
    tags: ["라메르", "크림", "60ml"],
    searchTerms: ["la mer", "creme de la mer", "라메르", "크렘"],
  },
  {
    id: "p22",
    slug: "shiseido-ultimune-75ml",
    brand: "Shiseido",
    name: "Ultimune Power Infusing Concentrate",
    displayName: "Shiseido Ultimune 75ml",
    query: "시세이도 얼티뮨 75ml",
    volume: "75ml",
    categorySlug: "beauty",
    summary: "브랜드별 프로모션이 잦아 이벤트 태그 확인 가치가 큽니다.",
    badge: "프로모션 잦음",
    tags: ["시세이도", "얼티뮨", "75ml"],
    searchTerms: ["shiseido", "ultimune", "얼티뮨", "파워 인퓨징"],
  },
  {
    id: "p23",
    slug: "biotherm-life-plankton-125ml",
    brand: "Biotherm",
    name: "Life Plankton Essence",
    displayName: "Biotherm Life Plankton 125ml",
    query: "비오템 라이프 플랑크톤 에센스 125ml",
    volume: "125ml",
    categorySlug: "beauty",
    summary: "용량과 구성에 따라 검색 결과가 갈리는 에센스 상품입니다.",
    badge: "에센스",
    tags: ["비오템", "플랑크톤", "125ml"],
    searchTerms: ["biotherm", "life plankton", "플랑크톤", "에센스"],
  },
  {
    id: "p24",
    slug: "aesop-resurrection-hand-balm-75ml",
    brand: "Aesop",
    name: "Resurrection Aromatique Hand Balm",
    displayName: "Aesop Resurrection Hand Balm 75ml",
    query: "이솝 레저렉션 핸드밤 75ml",
    volume: "75ml",
    categorySlug: "beauty",
    summary: "선물용 뷰티 소품으로 검색 진입이 많은 상품입니다.",
    badge: "선물 소품",
    tags: ["이솝", "핸드밤", "75ml"],
    searchTerms: ["aesop", "resurrection", "레저렉션", "핸드밤"],
  },
  {
    id: "p25",
    slug: "ballantines-21-700ml",
    brand: "Ballantine's",
    name: "21 Year Old",
    displayName: "Ballantine's 21YO 700ml",
    query: "발렌타인 21년 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "선물용 위스키 대표 상품으로 공항별 재고 확인이 중요합니다.",
    badge: "선물 주류",
    tags: ["발렌타인", "21년", "700ml"],
    searchTerms: ["ballantine", "21", "발렌타인", "위스키"],
    aliases: ["Ballantine's 21 700ml", "Ballantines 21 Year Old 700ml", "발렌타인21년 700ml"],
  },
  {
    id: "p26",
    slug: "johnnie-walker-blue-label-750ml",
    brand: "Johnnie Walker",
    name: "Blue Label",
    displayName: "Johnnie Walker Blue Label 750ml",
    query: "조니워커 블루라벨 750ml",
    volume: "750ml",
    categorySlug: "liquor",
    summary: "면세 주류 가격 비교에서 가장 자주 확인하는 상품입니다.",
    badge: "블루라벨",
    tags: ["조니워커", "블루라벨", "750ml"],
    searchTerms: ["johnnie walker", "blue label", "조니워커", "블루"],
    aliases: ["Johnnie Walker Blue Label 750ml", "Johnnie Walker Blue 750ml", "조니워커블루라벨 750ml"],
  },
  {
    id: "p27",
    slug: "macallan-12-double-cask-700ml",
    brand: "The Macallan",
    name: "12 Double Cask",
    displayName: "The Macallan 12 Double Cask 700ml",
    query: "맥캘란 12년 더블 캐스크 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "상품명 변형이 많아 정확한 캐스크명 매칭이 필요합니다.",
    badge: "싱글몰트",
    tags: ["맥캘란", "12년", "더블캐스크"],
    searchTerms: ["macallan", "double cask", "맥캘란", "맥켈란"],
    aliases: ["The Macallan 12 Double Cask 700ml", "Macallan Double Cask 12 700ml", "맥캘란12년 더블캐스크"],
  },
  {
    id: "p28",
    slug: "yamazaki-12-700ml",
    brand: "Yamazaki",
    name: "12 Year Old",
    displayName: "Yamazaki 12YO 700ml",
    query: "야마자키 12년 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "희소성이 높아 판매 상태와 가격 변동을 같이 봐야 합니다.",
    badge: "재고 민감",
    tags: ["야마자키", "12년", "700ml"],
    searchTerms: ["yamazaki", "야마자키", "12 year", "일본 위스키"],
  },
  {
    id: "p29",
    slug: "royal-salute-21-700ml",
    brand: "Royal Salute",
    name: "21 Year Old",
    displayName: "Royal Salute 21YO 700ml",
    query: "로얄살루트 21년 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "선물 수요가 높아 운영사별 프로모션 차이가 큽니다.",
    badge: "프리미엄",
    tags: ["로얄살루트", "21년", "700ml"],
    searchTerms: ["royal salute", "로얄살루트", "21", "위스키"],
  },
  {
    id: "p30",
    slug: "glenmorangie-original-10-700ml",
    brand: "Glenmorangie",
    name: "Original 10 Year Old",
    displayName: "Glenmorangie Original 10YO 700ml",
    query: "글렌모렌지 오리지널 10년 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "입문용 싱글몰트로 가격 비교 진입이 쉬운 상품입니다.",
    badge: "입문 싱글몰트",
    tags: ["글렌모렌지", "10년", "700ml"],
    searchTerms: ["glenmorangie", "글렌모렌지", "original", "10"],
  },
  {
    id: "p31",
    slug: "hennessy-xo-700ml",
    brand: "Hennessy",
    name: "XO",
    displayName: "Hennessy XO 700ml",
    query: "헤네시 XO 700ml",
    volume: "700ml",
    categorySlug: "liquor",
    summary: "브랜디 대표 상품으로 면세가 비교 수요가 꾸준합니다.",
    badge: "코냑",
    tags: ["헤네시", "XO", "700ml"],
    searchTerms: ["hennessy", "헤네시", "xo", "코냑"],
  },
  {
    id: "p32",
    slug: "don-julio-1942-750ml",
    brand: "Don Julio",
    name: "1942",
    displayName: "Don Julio 1942 750ml",
    query: "돈 훌리오 1942 750ml",
    volume: "750ml",
    categorySlug: "liquor",
    summary: "프리미엄 데킬라로 최근 검색 수요가 늘어난 상품입니다.",
    badge: "데킬라",
    tags: ["돈훌리오", "1942", "750ml"],
    searchTerms: ["don julio", "돈 훌리오", "1942", "tequila"],
  },
  {
    id: "p33",
    slug: "oakley-sutro-oo9406",
    brand: "Oakley",
    name: "Sutro OO9406",
    displayName: "Oakley Sutro OO9406",
    query: "오클리 수트로 OO9406",
    volume: "OO9406",
    categorySlug: "eyewear",
    summary: "스포츠 선글라스 대표 모델로 컬러 코드 확인이 필요합니다.",
    badge: "스포츠",
    tags: ["오클리", "수트로", "OO9406"],
    searchTerms: ["oakley", "sutro", "오클리", "수트로"],
    aliases: ["Oakley Sutro OO9406", "Oakley Sutro 9406", "오클리수트로 OO9406"],
  },
  {
    id: "p34",
    slug: "tom-ford-snowdon-ft0237",
    brand: "Tom Ford",
    name: "Snowdon FT0237",
    displayName: "Tom Ford Snowdon FT0237",
    query: "톰포드 스노든 FT0237",
    volume: "FT0237",
    categorySlug: "eyewear",
    summary: "모델 코드와 렌즈 색상 차이를 같이 확인해야 합니다.",
    badge: "럭셔리",
    tags: ["톰포드", "스노든", "FT0237"],
    searchTerms: ["tom ford", "snowdon", "스노든", "ft0237"],
  },
  {
    id: "p35",
    slug: "prada-pr-17ws",
    brand: "Prada",
    name: "PR 17WS",
    displayName: "Prada PR 17WS",
    query: "프라다 PR 17WS 선글라스",
    volume: "PR 17WS",
    categorySlug: "eyewear",
    summary: "여성 선글라스 인기 모델로 색상 코드 비교가 중요합니다.",
    badge: "패션 인기",
    tags: ["프라다", "PR17WS", "선글라스"],
    searchTerms: ["prada", "17ws", "프라다", "선글라스"],
  },
  {
    id: "p36",
    slug: "gucci-gg0061s",
    brand: "Gucci",
    name: "GG0061S",
    displayName: "Gucci GG0061S",
    query: "구찌 GG0061S 선글라스",
    volume: "GG0061S",
    categorySlug: "eyewear",
    summary: "구찌 대표 아이웨어로 모델명 정확도가 핵심입니다.",
    badge: "브랜드 인기",
    tags: ["구찌", "GG0061S", "선글라스"],
    searchTerms: ["gucci", "gg0061s", "구찌", "아이웨어"],
  },
  {
    id: "p37",
    slug: "celine-triomphe-cl40194u",
    brand: "Celine",
    name: "Triomphe CL40194U",
    displayName: "Celine Triomphe CL40194U",
    query: "셀린느 트리옹프 CL40194U",
    volume: "CL40194U",
    categorySlug: "eyewear",
    summary: "트리옹프 라인 대표 모델로 품번 매칭이 중요합니다.",
    badge: "여성 인기",
    tags: ["셀린느", "트리옹프", "CL40194U"],
    searchTerms: ["celine", "triomphe", "셀린느", "트리옹프"],
  },
  {
    id: "p38",
    slug: "saint-laurent-sl-276-mica",
    brand: "Saint Laurent",
    name: "SL 276 Mica",
    displayName: "Saint Laurent SL 276 Mica",
    query: "생로랑 SL 276 Mica 선글라스",
    volume: "SL 276",
    categorySlug: "eyewear",
    summary: "상품명과 모델 코드가 함께 노출되는지 확인해야 합니다.",
    badge: "디자이너",
    tags: ["생로랑", "SL276", "Mica"],
    searchTerms: ["saint laurent", "sl 276", "mica", "생로랑"],
  },
  {
    id: "p39",
    slug: "maui-jim-peahi-b202",
    brand: "Maui Jim",
    name: "Peahi B202",
    displayName: "Maui Jim Peahi B202",
    query: "마우이짐 피아히 B202",
    volume: "B202",
    categorySlug: "eyewear",
    summary: "편광 렌즈 여부에 따라 가격 차이가 생기는 모델입니다.",
    badge: "편광 렌즈",
    tags: ["마우이짐", "피아히", "B202"],
    searchTerms: ["maui jim", "peahi", "마우이짐", "편광"],
  },
  {
    id: "p40",
    slug: "persol-po0649",
    brand: "Persol",
    name: "PO0649",
    displayName: "Persol PO0649",
    query: "퍼솔 PO0649 선글라스",
    volume: "PO0649",
    categorySlug: "eyewear",
    summary: "클래식 아이웨어로 컬러와 사이즈 코드 확인이 필요합니다.",
    badge: "클래식",
    tags: ["퍼솔", "PO0649", "선글라스"],
    searchTerms: ["persol", "po0649", "퍼솔", "649"],
  },
  ...createCategoryProducts("fashion", 41, [
    {
      slug: "longchamp-le-pliage-medium",
      brand: "Longchamp",
      name: "Le Pliage Original Medium",
      displayName: "Longchamp Le Pliage Medium",
      query: "롱샴 르 플리아쥬 미디엄",
      volume: "Medium",
      summary: "컬러와 사이즈 옵션이 많아 모델명 기준 비교가 필요한 대표 가방입니다.",
      badge: "가방 인기",
      aliases: ["Longchamp Le Pliage Medium", "Longchamp Le Pliage Original Medium", "롱샴르플리아쥬 미디엄"],
    },
    {
      slug: "tumi-alpha-bravo-backpack",
      brand: "TUMI",
      name: "Alpha Bravo Navigation Backpack",
      displayName: "TUMI Alpha Bravo Backpack",
      query: "투미 알파 브라보 백팩",
      volume: "Backpack",
      summary: "출장·여행 수요가 높아 면세점별 재고 확인이 잦은 상품입니다.",
      badge: "비즈니스",
      aliases: ["TUMI Alpha Bravo Backpack", "TUMI Alpha Bravo Navigation Backpack", "투미알파브라보 백팩"],
    },
    {
      slug: "montblanc-meisterstuck-wallet",
      brand: "Montblanc",
      name: "Meisterstuck Wallet",
      displayName: "Montblanc Meisterstuck Wallet",
      query: "몽블랑 마이스터스튁 지갑",
      volume: "Wallet",
      summary: "선물용 지갑 대표 검색어로 색상과 수납 구성이 중요합니다.",
      badge: "선물 지갑",
      aliases: ["Montblanc Meisterstuck Wallet", "Montblanc Meisterstuck 4810 Wallet", "몽블랑마이스터스튁 지갑"],
    },
    {
      slug: "coach-tabby-shoulder-bag",
      brand: "Coach",
      name: "Tabby Shoulder Bag",
      displayName: "Coach Tabby Shoulder Bag",
      query: "코치 태비 숄더백",
      volume: "Shoulder",
      summary: "시즌 컬러와 사이즈별 가격 차이가 자주 생기는 패션잡화입니다.",
      badge: "숄더백",
    },
    {
      slug: "polo-ralph-lauren-cap",
      brand: "Polo Ralph Lauren",
      name: "Cotton Chino Cap",
      displayName: "Polo Ralph Lauren Cap",
      query: "폴로 랄프로렌 볼캡",
      volume: "Cap",
      summary: "컬러 선택지가 많아 검색어와 원본 옵션 확인이 필요합니다.",
      badge: "캐주얼",
    },
    {
      slug: "mcm-stark-backpack",
      brand: "MCM",
      name: "Stark Backpack",
      displayName: "MCM Stark Backpack",
      query: "MCM 스타크 백팩",
      volume: "Backpack",
      summary: "사이즈와 패턴 차이가 커서 상품명 매칭을 꼼꼼히 봐야 합니다.",
      badge: "백팩",
    },
    {
      slug: "samsonite-evoa-spinner",
      brand: "Samsonite",
      name: "Evoa Spinner",
      displayName: "Samsonite Evoa Spinner",
      query: "쌤소나이트 에보아 캐리어",
      volume: "Spinner",
      summary: "캐리어는 인치와 색상에 따라 가격이 달라지는 대표 상품입니다.",
      badge: "여행가방",
    },
    {
      slug: "vivienne-westwood-wallet",
      brand: "Vivienne Westwood",
      name: "Orb Wallet",
      displayName: "Vivienne Westwood Orb Wallet",
      query: "비비안웨스트우드 오브 지갑",
      volume: "Wallet",
      summary: "장지갑·반지갑 구성이 섞일 수 있어 원본 확인이 중요합니다.",
      badge: "지갑",
    },
    {
      slug: "ferragamo-reversible-belt",
      brand: "Ferragamo",
      name: "Reversible Belt",
      displayName: "Ferragamo Reversible Belt",
      query: "페라가모 리버시블 벨트",
      volume: "Belt",
      summary: "버클 디자인과 폭 차이를 함께 봐야 하는 패션 액세서리입니다.",
      badge: "벨트",
    },
    {
      slug: "lululemon-everywhere-belt-bag",
      brand: "Lululemon",
      name: "Everywhere Belt Bag",
      displayName: "Lululemon Everywhere Belt Bag",
      query: "룰루레몬 에브리웨어 벨트백",
      volume: "Belt Bag",
      summary: "가벼운 여행용 가방으로 색상별 재고 변동이 빠른 편입니다.",
      badge: "트래블",
    },
  ]),
  ...createCategoryProducts("watch", 51, [
    {
      slug: "seiko-presage-cocktail-time",
      brand: "Seiko",
      name: "Presage Cocktail Time",
      displayName: "Seiko Presage Cocktail Time",
      query: "세이코 프레사지 칵테일 타임",
      volume: "Automatic",
      summary: "레퍼런스와 다이얼 색상에 따라 가격 차이가 나는 입문 시계입니다.",
      badge: "오토매틱",
    },
    {
      slug: "citizen-tsuyosa-nj015",
      brand: "Citizen",
      name: "Tsuyosa NJ015",
      displayName: "Citizen Tsuyosa NJ015",
      query: "시티즌 츠요사 NJ015",
      volume: "NJ015",
      summary: "컬러 다이얼 선택지가 많아 모델 코드 비교가 핵심입니다.",
      badge: "컬러 다이얼",
    },
    {
      slug: "tissot-prx-powermatic-80",
      brand: "Tissot",
      name: "PRX Powermatic 80",
      displayName: "Tissot PRX Powermatic 80",
      query: "티쏘 PRX 파워매틱 80",
      volume: "40mm",
      summary: "케이스 사이즈와 무브먼트 차이를 구분해야 하는 인기 모델입니다.",
      badge: "스위스",
    },
    {
      slug: "casio-g-shock-ga-2100",
      brand: "Casio",
      name: "G-Shock GA-2100",
      displayName: "Casio G-Shock GA-2100",
      query: "카시오 지샥 GA-2100",
      volume: "GA-2100",
      summary: "컬러 코드가 다양해 정확한 모델명 검색이 필요합니다.",
      badge: "지샥",
    },
    {
      slug: "garmin-venu-3",
      brand: "Garmin",
      name: "Venu 3",
      displayName: "Garmin Venu 3",
      query: "가민 베뉴 3",
      volume: "Venu 3",
      summary: "스마트워치는 색상과 사이즈 조합별 가격 비교가 유용합니다.",
      badge: "스마트워치",
    },
    {
      slug: "apple-watch-series-9",
      brand: "Apple",
      name: "Watch Series 9",
      displayName: "Apple Watch Series 9",
      query: "애플워치 시리즈 9",
      volume: "Series 9",
      summary: "케이스 크기와 밴드 구성이 가격 비교 기준이 됩니다.",
      badge: "디바이스",
    },
    {
      slug: "hamilton-khaki-field-mechanical",
      brand: "Hamilton",
      name: "Khaki Field Mechanical",
      displayName: "Hamilton Khaki Field Mechanical",
      query: "해밀턴 카키 필드 메카니컬",
      volume: "38mm",
      summary: "필드워치 대표 모델로 사이즈와 스트랩 구분이 중요합니다.",
      badge: "필드워치",
    },
    {
      slug: "longines-hydroconquest",
      brand: "Longines",
      name: "HydroConquest",
      displayName: "Longines HydroConquest",
      query: "론진 하이드로콘퀘스트",
      volume: "Diver",
      summary: "다이버 워치는 사이즈와 베젤 색상을 함께 확인해야 합니다.",
      badge: "다이버",
    },
    {
      slug: "swatch-moonswatch-mission-moon",
      brand: "Swatch",
      name: "MoonSwatch Mission to the Moon",
      displayName: "Swatch MoonSwatch Mission to the Moon",
      query: "스와치 문스와치 미션 투 더 문",
      volume: "Moon",
      summary: "컬렉션명이 길어 검색어 매칭과 원본 옵션 확인이 필요합니다.",
      badge: "컬렉션",
    },
    {
      slug: "fossil-machine-chronograph",
      brand: "Fossil",
      name: "Machine Chronograph",
      displayName: "Fossil Machine Chronograph",
      query: "파슬 머신 크로노그래프",
      volume: "Chronograph",
      summary: "캐주얼 시계로 색상과 스트랩 소재별 비교가 쉽습니다.",
      badge: "크로노",
    },
  ]),
  ...createCategoryProducts("jewelry", 61, [
    {
      slug: "swarovski-tennis-bracelet",
      brand: "Swarovski",
      name: "Tennis Bracelet",
      displayName: "Swarovski Tennis Bracelet",
      query: "스와로브스키 테니스 브레이슬릿",
      volume: "Bracelet",
      summary: "사이즈와 컬러 옵션이 많아 원본 상품명 확인이 필요합니다.",
      badge: "브레이슬릿",
    },
    {
      slug: "pandora-moments-bracelet",
      brand: "Pandora",
      name: "Moments Bracelet",
      displayName: "Pandora Moments Bracelet",
      query: "판도라 모멘츠 브레이슬릿",
      volume: "Bracelet",
      summary: "참 호환 여부와 팔찌 사이즈를 함께 봐야 합니다.",
      badge: "참 팔찌",
    },
    {
      slug: "jestina-tiara-necklace",
      brand: "J.ESTINA",
      name: "Tiara Necklace",
      displayName: "J.ESTINA Tiara Necklace",
      query: "제이에스티나 티아라 목걸이",
      volume: "Necklace",
      summary: "국문·영문 브랜드 표기가 섞여 검색어 후보가 중요합니다.",
      badge: "목걸이",
    },
    {
      slug: "stonehenge-silver-necklace",
      brand: "Stonehenge",
      name: "Silver Necklace",
      displayName: "Stonehenge Silver Necklace",
      query: "스톤헨지 실버 목걸이",
      volume: "Silver",
      summary: "소재와 펜던트 디자인별로 가격 차이가 나는 상품군입니다.",
      badge: "실버",
    },
    {
      slug: "tiffany-return-to-tiffany-bracelet",
      brand: "Tiffany & Co.",
      name: "Return to Tiffany Bracelet",
      displayName: "Tiffany Return to Tiffany Bracelet",
      query: "티파니 리턴 투 티파니 브레이슬릿",
      volume: "Bracelet",
      summary: "라인명과 소재가 정확히 맞아야 비교 신뢰도가 높아집니다.",
      badge: "럭셔리",
    },
    {
      slug: "swarovski-matrix-earrings",
      brand: "Swarovski",
      name: "Matrix Earrings",
      displayName: "Swarovski Matrix Earrings",
      query: "스와로브스키 매트릭스 이어링",
      volume: "Earrings",
      summary: "귀걸이는 컬러와 컷 차이를 함께 확인해야 합니다.",
      badge: "이어링",
    },
    {
      slug: "swarovski-swan-necklace",
      brand: "Swarovski",
      name: "Swan Necklace",
      displayName: "Swarovski Swan Necklace",
      query: "스와로브스키 스완 목걸이",
      volume: "Necklace",
      summary: "선물 수요가 높은 스테디셀러 주얼리입니다.",
      badge: "선물 인기",
    },
    {
      slug: "pandora-sparkling-charm",
      brand: "Pandora",
      name: "Sparkling Charm",
      displayName: "Pandora Sparkling Charm",
      query: "판도라 스파클링 참",
      volume: "Charm",
      summary: "참 디자인명이 다양해 키워드 확장이 유용합니다.",
      badge: "참",
    },
    {
      slug: "agatha-scottie-earrings",
      brand: "Agatha",
      name: "Scottie Earrings",
      displayName: "Agatha Scottie Earrings",
      query: "아가타 스코티 이어링",
      volume: "Earrings",
      summary: "아이콘 디자인 중심으로 검색되는 액세서리입니다.",
      badge: "아이콘",
    },
    {
      slug: "goldendew-diamond-necklace",
      brand: "Golden Dew",
      name: "Diamond Necklace",
      displayName: "Golden Dew Diamond Necklace",
      query: "골든듀 다이아몬드 목걸이",
      volume: "Diamond",
      summary: "소재와 스톤 구성이 가격 비교의 핵심입니다.",
      badge: "파인 주얼리",
    },
  ]),
  ...createCategoryProducts("health", 71, [
    {
      slug: "kgc-everytime-royal",
      brand: "KGC",
      name: "Everytime Royal",
      displayName: "KGC Everytime Royal",
      query: "정관장 에브리타임 로얄",
      volume: "Stick",
      summary: "선물용 건강식품 대표 상품으로 구성 수량 확인이 중요합니다.",
      badge: "홍삼",
    },
    {
      slug: "orthomol-immun",
      brand: "Orthomol",
      name: "Immun",
      displayName: "Orthomol Immun",
      query: "오쏘몰 이뮨",
      volume: "30일분",
      summary: "패키지 수량에 따라 단가 차이가 커지는 비타민 상품입니다.",
      badge: "비타민",
    },
    {
      slug: "centrum-multivitamin",
      brand: "Centrum",
      name: "Multivitamin",
      displayName: "Centrum Multivitamin",
      query: "센트룸 멀티비타민",
      volume: "Tablets",
      summary: "정제 수와 성별 라인 구분이 필요한 대표 영양제입니다.",
      badge: "멀티비타민",
    },
    {
      slug: "solgar-vitamin-d3",
      brand: "Solgar",
      name: "Vitamin D3",
      displayName: "Solgar Vitamin D3",
      query: "솔가 비타민 D3",
      volume: "Capsules",
      summary: "함량과 캡슐 수를 함께 봐야 정확한 비교가 가능합니다.",
      badge: "비타민D",
    },
    {
      slug: "gnc-mega-men",
      brand: "GNC",
      name: "Mega Men",
      displayName: "GNC Mega Men",
      query: "GNC 메가맨",
      volume: "Tablets",
      summary: "성별 라인과 수량별 가격 차이를 비교하기 좋은 상품입니다.",
      badge: "남성 영양",
    },
    {
      slug: "lacto-fit-gold",
      brand: "Lacto-Fit",
      name: "Gold Probiotics",
      displayName: "Lacto-Fit Gold",
      query: "락토핏 골드 유산균",
      volume: "Stick",
      summary: "스틱 수량과 패키지 묶음 구성이 가격 판단의 기준입니다.",
      badge: "유산균",
    },
    {
      slug: "nutri-dday-diet",
      brand: "Nutri D-Day",
      name: "Diet Supplement",
      displayName: "Nutri D-Day Diet Supplement",
      query: "뉴트리디데이 다이어트",
      volume: "Supplement",
      summary: "묶음 판매가 많아 구성 수량 확인이 필요합니다.",
      badge: "다이어트",
    },
    {
      slug: "blackmores-propolis",
      brand: "Blackmores",
      name: "Propolis",
      displayName: "Blackmores Propolis",
      query: "블랙모어스 프로폴리스",
      volume: "Capsules",
      summary: "캡슐 수와 함량별로 가격 비교가 쉬운 건강식품입니다.",
      badge: "프로폴리스",
    },
    {
      slug: "now-omega-3",
      brand: "NOW",
      name: "Omega-3",
      displayName: "NOW Omega-3",
      query: "나우 오메가3",
      volume: "Softgels",
      summary: "함량과 소프트젤 수를 같이 봐야 단가 비교가 됩니다.",
      badge: "오메가3",
    },
    {
      slug: "korea-eundan-vitamin-c",
      brand: "Korea Eundan",
      name: "Vitamin C",
      displayName: "Korea Eundan Vitamin C",
      query: "고려은단 비타민C",
      volume: "Tablets",
      summary: "국민 비타민 상품으로 수량별 가격 차이를 보기 좋습니다.",
      badge: "비타민C",
    },
  ]),
  ...createCategoryProducts("food", 81, [
    {
      slug: "godiva-gold-collection",
      brand: "Godiva",
      name: "Gold Collection",
      displayName: "Godiva Gold Collection",
      query: "고디바 골드 컬렉션",
      volume: "Chocolate",
      summary: "선물용 초콜릿 대표 상품으로 박스 수량 확인이 중요합니다.",
      badge: "초콜릿",
    },
    {
      slug: "royce-nama-chocolate",
      brand: "Royce",
      name: "Nama Chocolate",
      displayName: "Royce Nama Chocolate",
      query: "로이스 나마 초콜릿",
      volume: "Nama",
      summary: "맛 옵션과 보관 조건 때문에 원본 페이지 확인이 필요합니다.",
      badge: "일본 간식",
    },
    {
      slug: "laderach-frischschoggi",
      brand: "Laderach",
      name: "FrischSchoggi",
      displayName: "Laderach FrischSchoggi",
      query: "레더라 프레시초기",
      volume: "Chocolate",
      summary: "중량과 구성별로 가격 차이가 나는 프리미엄 초콜릿입니다.",
      badge: "프리미엄",
    },
    {
      slug: "haribo-goldbears",
      brand: "Haribo",
      name: "Goldbears",
      displayName: "Haribo Goldbears",
      query: "하리보 골드베렌",
      volume: "Gummy",
      summary: "대용량 팩과 소포장 묶음 구분이 필요한 간식입니다.",
      badge: "젤리",
    },
    {
      slug: "lindt-swiss-luxury-selection",
      brand: "Lindt",
      name: "Swiss Luxury Selection",
      displayName: "Lindt Swiss Luxury Selection",
      query: "린트 스위스 럭셔리 셀렉션",
      volume: "Chocolate",
      summary: "박스 구성과 중량에 따라 가격 비교가 달라집니다.",
      badge: "선물세트",
    },
    {
      slug: "toblerone-milk-chocolate",
      brand: "Toblerone",
      name: "Milk Chocolate",
      displayName: "Toblerone Milk Chocolate",
      query: "토블론 밀크 초콜릿",
      volume: "Chocolate",
      summary: "중량별 상품이 많아 용량 기준 비교가 중요합니다.",
      badge: "스위스",
    },
    {
      slug: "ferrero-rocher",
      brand: "Ferrero Rocher",
      name: "Chocolate",
      displayName: "Ferrero Rocher Chocolate",
      query: "페레로로쉐 초콜릿",
      volume: "Chocolate",
      summary: "개수와 패키지 구성이 다양한 초콜릿 대표 상품입니다.",
      badge: "초콜릿",
    },
    {
      slug: "jeju-orange-chocolate",
      brand: "Jeju",
      name: "Orange Chocolate",
      displayName: "Jeju Orange Chocolate",
      query: "제주 감귤 초콜릿",
      volume: "Gift",
      summary: "국내 선물용 식품으로 묶음 구성을 확인하기 좋습니다.",
      badge: "국내 선물",
    },
    {
      slug: "loacker-quadratini",
      brand: "Loacker",
      name: "Quadratini",
      displayName: "Loacker Quadratini",
      query: "로아커 콰드라티니",
      volume: "Wafer",
      summary: "맛과 중량 옵션이 많아 키워드 매칭이 필요합니다.",
      badge: "웨하스",
    },
    {
      slug: "baci-perugina-chocolate",
      brand: "Baci",
      name: "Perugina Chocolate",
      displayName: "Baci Perugina Chocolate",
      query: "바치 페루지나 초콜릿",
      volume: "Chocolate",
      summary: "선물용 패키지와 개수별 가격 차이를 보기 좋은 상품입니다.",
      badge: "이탈리아",
    },
  ]),
  ...createCategoryProducts("electronics", 91, [
    {
      slug: "apple-airpods-pro-2",
      brand: "Apple",
      name: "AirPods Pro 2",
      displayName: "Apple AirPods Pro 2",
      query: "애플 에어팟 프로 2세대",
      volume: "2nd Gen",
      summary: "세대와 충전 케이스 구분이 중요한 이어폰 대표 상품입니다.",
      badge: "이어폰",
    },
    {
      slug: "sony-wh-1000xm5",
      brand: "Sony",
      name: "WH-1000XM5",
      displayName: "Sony WH-1000XM5",
      query: "소니 WH-1000XM5",
      volume: "Headphones",
      summary: "컬러와 모델 코드가 명확한 노이즈캔슬링 헤드폰입니다.",
      badge: "헤드폰",
    },
    {
      slug: "bose-quietcomfort-ultra",
      brand: "Bose",
      name: "QuietComfort Ultra",
      displayName: "Bose QuietComfort Ultra",
      query: "보스 QuietComfort Ultra",
      volume: "Headphones",
      summary: "헤드폰과 이어버드 모델이 섞이지 않게 구분해야 합니다.",
      badge: "노캔",
    },
    {
      slug: "dyson-supersonic",
      brand: "Dyson",
      name: "Supersonic",
      displayName: "Dyson Supersonic",
      query: "다이슨 슈퍼소닉 드라이어",
      volume: "Hair Dryer",
      summary: "색상과 구성품 차이가 가격 비교에 영향을 주는 제품입니다.",
      badge: "드라이어",
    },
    {
      slug: "braun-series-9-pro",
      brand: "Braun",
      name: "Series 9 Pro",
      displayName: "Braun Series 9 Pro",
      query: "브라운 시리즈 9 프로",
      volume: "Shaver",
      summary: "세척 스테이션 포함 여부를 함께 확인해야 합니다.",
      badge: "면도기",
    },
    {
      slug: "oral-b-io-series-9",
      brand: "Oral-B",
      name: "iO Series 9",
      displayName: "Oral-B iO Series 9",
      query: "오랄비 iO 시리즈 9",
      volume: "Toothbrush",
      summary: "본체 색상과 브러시 구성 차이를 비교하기 좋은 상품입니다.",
      badge: "전동칫솔",
    },
    {
      slug: "jbl-flip-6",
      brand: "JBL",
      name: "Flip 6",
      displayName: "JBL Flip 6",
      query: "JBL 플립 6",
      volume: "Speaker",
      summary: "색상별 재고와 가격 차이가 생기는 휴대용 스피커입니다.",
      badge: "스피커",
    },
    {
      slug: "anker-powercore-20000",
      brand: "Anker",
      name: "PowerCore 20000",
      displayName: "Anker PowerCore 20000",
      query: "앤커 파워코어 20000",
      volume: "20000mAh",
      summary: "용량과 출력 스펙을 함께 봐야 하는 보조배터리입니다.",
      badge: "배터리",
    },
    {
      slug: "nintendo-switch-oled",
      brand: "Nintendo",
      name: "Switch OLED",
      displayName: "Nintendo Switch OLED",
      query: "닌텐도 스위치 OLED",
      volume: "OLED",
      summary: "본체 색상과 패키지 구성을 확인해야 하는 게임기입니다.",
      badge: "게임기",
    },
    {
      slug: "samsung-galaxy-buds2-pro",
      brand: "Samsung",
      name: "Galaxy Buds2 Pro",
      displayName: "Samsung Galaxy Buds2 Pro",
      query: "삼성 갤럭시 버즈2 프로",
      volume: "Earbuds",
      summary: "색상과 모델명이 명확해 검색 비교에 적합한 이어버드입니다.",
      badge: "이어버드",
    },
  ]),
];

export const guides: Guide[] = [
  {
    slug: "airport-duty-free-basics",
    title: "공항면세점 비교 전에 먼저 정리할 기본값",
    excerpt: "같은 상품이라도 공항, 출국일, 회원 혜택, 용량 차이 때문에 실제 비교 기준이 달라집니다.",
    sections: [
      {
        heading: "1. 상품명을 브랜드와 함께 입력하세요",
        body: [
          "면세점 상품명은 브랜드 표기 방식이 제각각이라서 브랜드 없이 검색하면 오탐이 늘어납니다.",
          "예를 들어 '어벤투스'보다는 '크리드 어벤투스 50ml'처럼 입력하는 편이 매칭 정확도가 훨씬 좋습니다.",
        ],
      },
      {
        heading: "2. 용량과 모델 코드를 같이 확인하세요",
        body: [
          "향수와 스킨케어는 50ml, 100ml, 230ml처럼 용량 차이가 가격 차이보다 더 중요할 수 있습니다.",
          "아이웨어는 모델명 외에 컬러 코드나 렌즈 타입이 다르면 다른 상품으로 봐야 합니다.",
        ],
        bullets: [
          "향수: 브랜드 + 제품명 + 용량",
          "뷰티: 브랜드 + 제품명 + 세트 구성",
          "아이웨어: 모델명 + 컬러 코드",
        ],
      },
      {
        heading: "3. 노출가와 최종 결제가는 분리해서 보세요",
        body: [
          "면세점은 회원 등급, 쿠폰, 적립금, 이벤트 적용 여부에 따라 최종 결제 금액이 달라질 수 있습니다.",
          "그래서 비교 서비스는 먼저 공개 노출가를 기준으로 정렬하고, 추가 혜택은 보조 정보로 붙이는 구조가 안정적입니다.",
        ],
      },
    ],
  },
  {
    slug: "pickup-and-limit-guide",
    title: "수령 공항과 면세 한도까지 같이 보는 방법",
    excerpt: "특히 주류는 가격이 좋아도 수령 가능 공항과 재고 상태를 같이 확인해야 실사용 가치가 높습니다.",
    sections: [
      {
        heading: "1. 인도 가능 공항을 먼저 좁히세요",
        body: [
          "운영사마다 인도장 운영 공항과 시간대가 다를 수 있어서, 가격이 싸더라도 내가 출국하는 공항에서 수령이 안 되면 의미가 없습니다.",
          "검색 결과에서 공항 필터를 기본값으로 넣으면 클릭 손실을 크게 줄일 수 있습니다.",
        ],
      },
      {
        heading: "2. 주류는 재고와 품절 변동이 빠릅니다",
        body: [
          "히비키 같은 인기 상품은 가격보다 판매 상태 변동이 더 빠른 경우가 많습니다.",
          "검색 결과 카드에 '재고 적음', '품절', '수량 한정' 같은 상태를 함께 보여주는 것이 중요합니다.",
        ],
      },
      {
        heading: "3. 면세 한도 안내는 최신 공식 문구와 같이 노출하세요",
        body: [
          "가격 비교 페이지 안쪽에 한도 안내를 짧게 붙여두면 이탈 없이 필요한 법적 정보를 전달할 수 있습니다.",
          "다만 실제 규정은 바뀔 수 있으므로, 고정 문구보다 공식 안내 링크와 최신 갱신일을 함께 표시하는 편이 안전합니다.",
        ],
      },
    ],
  },
  {
    slug: "price-comparison-checklist",
    title: "면세점 가격 비교 서비스에 꼭 필요한 체크리스트",
    excerpt: "검색 정확도는 크롤링보다 정규화와 상품 매칭 로직에서 먼저 갈립니다.",
    sections: [
      {
        heading: "1. 동일 상품 기준을 명확히 정의하세요",
        body: [
          "상품명 유사도만으로 묶으면 세트 상품이나 한정판을 같은 상품으로 잘못 묶을 가능성이 큽니다.",
          "브랜드, 제품명, 용량, 모델 코드, 세트 여부를 조합한 내부 키가 필요합니다.",
        ],
        bullets: [
          "브랜드 정규화 테이블",
          "영문/국문 상품명 동의어 사전",
          "용량 및 모델 코드 파서",
        ],
      },
      {
        heading: "2. 가격은 변경 이력을 같이 저장하세요",
        body: [
          "현재가만 보이면 사용자는 할인 폭이 큰지 작은지 감이 오지 않습니다.",
          "상품별 최근 7일 또는 30일 최저가를 함께 보여주면 클릭률과 신뢰도가 올라갑니다.",
        ],
      },
      {
        heading: "3. 검색 결과는 숫자 읽기가 가장 쉬워야 합니다",
        body: [
          "홈은 감성적으로 가더라도 결과 화면은 브랜드, 상품명, 용량, 가격, 운영사 수, 수령 공항이 가장 빨리 읽혀야 합니다.",
          "비교 서비스의 핵심은 예쁜 카드보다 빠른 판단이므로 정보 위계를 분명하게 잡는 것이 중요합니다.",
        ],
      },
    ],
  },
  {
    slug: "duty-free-domestic-price-guide",
    title: "면세가와 국내 판매가를 함께 비교하는 기준",
    excerpt: "면세점 노출가만 보지 않고 국내 공개 판매가와 비교할 때 확인해야 할 기준을 정리했습니다.",
    sections: [
      {
        heading: "1. 비교 기준은 동일 상품이어야 합니다",
        body: [
          "면세점과 국내 판매처의 상품명이 비슷해도 용량, 세트 구성, 리필 여부, 한정판 여부가 다르면 가격 비교가 왜곡될 수 있습니다.",
          "DFMOA는 브랜드, 제품명, 용량, 모델 코드, 세트 표기를 함께 보고 같은 상품 후보인지 판단합니다.",
        ],
        bullets: [
          "향수: 제품명과 용량을 함께 확인",
          "스킨케어: 본품, 리필, 세트 구성을 분리",
          "아이웨어와 전자기기: 모델 코드와 색상 확인",
        ],
      },
      {
        heading: "2. 국내 판매가는 최종 결제 전 참고값입니다",
        body: [
          "국내 판매가는 공개 검색 결과에서 확인 가능한 가격을 기준으로 가져옵니다.",
          "배송비, 카드 할인, 쿠폰, 판매자 옵션, 병행수입 여부에 따라 실제 결제 금액은 달라질 수 있으므로 원본 페이지 확인이 필요합니다.",
        ],
      },
      {
        heading: "3. 면세가는 출국 조건과 함께 봐야 합니다",
        body: [
          "면세점 가격이 더 낮아도 출국일, 수령 공항, 재고, 회원 혜택, 구매 한도 조건에 따라 실제 구매 가능 여부가 달라질 수 있습니다.",
          "가격 차이가 작다면 국내 배송 편의, 교환·반품 조건, 수령 시간을 함께 비교하는 편이 안전합니다.",
        ],
      },
      {
        heading: "4. 광고와 비교 결과는 분리해서 봅니다",
        body: [
          "DFMOA의 비교 결과는 공개 가격과 상품 일치도를 중심으로 정리합니다.",
          "광고나 후원 콘텐츠가 포함되는 경우 일반 비교 결과와 구분해 표시하고, 구매 결정은 원본 판매처의 조건을 기준으로 해야 합니다.",
        ],
      },
    ],
  },
];

export const faqs: Faq[] = [
  {
    question: "이 사이트에서 바로 구매할 수 있나요?",
    answer:
      "아니요. 이 서비스는 가격 비교와 탐색용입니다. 클릭하면 각 면세점의 원본 상품 페이지로 이동합니다.",
  },
  {
    question: "가격은 실시간으로 완전히 동일한가요?",
    answer:
      "검색 시점에 공식 검색 결과를 다시 읽어 오지만, 최종 결제가는 회원 등급, 쿠폰, 출국 정보에 따라 달라질 수 있습니다.",
  },
  {
    question: "현재 가격 확인을 지원하는 면세점은 어디인가요?",
    answer:
      "현재 구현은 롯데면세점, 현대면세점, 신라면세점의 공개 검색 결과와 신세계면세점의 공식 노출 상품을 기준으로 최근 확인 가능한 정보와 원본 링크를 함께 제공합니다.",
  },
  {
    question: "공항별 수령 가능 여부도 같이 보여주나요?",
    answer:
      "네. 운영사별 인도 가능 공항을 비교 표와 상세 정보에 함께 노출합니다.",
  },
];

export const featureSearches = [
  "크리드 어벤투스 50ml",
  "설화수 윤조에센스 90ml",
  "히비키 하모니 700ml",
  "젠틀몬스터 Dear 01",
];

export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function getStoreById(storeId: StoreId) {
  return stores.find((store) => store.id === storeId);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return products.filter((product) => product.categorySlug === slug);
}

export function getFeaturedProducts(limit = 4) {
  return products.slice(0, limit);
}

export function getRelatedProducts(categorySlug: string, excludeProductId?: string) {
  return getProductsByCategory(categorySlug)
    .filter((product) => product.id !== excludeProductId)
    .slice(0, 3);
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣぁ-んァ-ン一-龥\s]+/g, " ")
    .replace(/\s+/g, " ");
}

export function searchProducts(query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return products
    .map((product) => {
      const category = getCategoryBySlug(product.categorySlug);
      const haystack = normalizeText(
        [
          product.brand,
          product.name,
          product.displayName,
          product.query,
          product.volume,
          category?.name ?? "",
          product.summary,
          product.badge,
          ...product.tags,
          ...product.searchTerms,
        ].join(" ")
      );

      let score = 0;

      if (normalizeText(product.displayName).includes(normalizedQuery)) {
        score += 8;
      }

      if (normalizeText(product.query).includes(normalizedQuery)) {
        score += 10;
      }

      if (haystack.includes(normalizedQuery)) {
        score += 3;
      }

      score += tokens.reduce((total, token) => {
        if (normalizeText(product.brand).includes(token)) {
          return total + 3;
        }

        if (haystack.includes(token)) {
          return total + 1;
        }

        return total;
      }, 0);

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

export function getStatusLabel(status: OfferStatus) {
  switch (status) {
    case "available":
      return "판매중";
    case "limited":
      return "재고 적음";
    case "soldout":
      return "품절";
    case "check":
      return "확인 필요";
    default:
      return status;
  }
}

export function getStatusTone(status: OfferStatus) {
  switch (status) {
    case "available":
      return "is-available";
    case "limited":
      return "is-limited";
    case "soldout":
      return "is-soldout";
    case "check":
      return "is-check";
    default:
      return "";
  }
}

export function getSupportLabel(state: StoreSupportState) {
  return state === "live" ? "공개가 확인" : "확장 예정";
}

export function getSupportTone(state: StoreSupportState) {
  return state === "live" ? "is-available" : "is-limited";
}
