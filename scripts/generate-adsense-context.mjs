import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

function loadTsExports(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const commonjsModule = { exports: {} };

  vm.runInNewContext(
    output,
    {
      module: commonjsModule,
      exports: commonjsModule.exports,
      require,
    },
    { filename: filePath }
  );

  return commonjsModule.exports;
}

const { categories, products } = loadTsExports("src/lib/site-data.ts");
const categoryNameBySlug = new Map(categories.map((category) => [category.slug, category.name]));

function hasSnapshotPrice(product) {
  const filePath = path.join(repoRoot, "data", "prices", `${product.id}.json`);

  if (!fs.existsSync(filePath)) {
    return false;
  }

  const snapshot = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Object.values(snapshot.sources ?? {}).some((source) =>
    (source.items ?? []).some((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0)
  );
}

const customProductContexts = {
  "hibiki-harmony-700ml": {
    background:
      "Hibiki Japanese Harmony 700ml는 블렌디드 재패니즈 위스키를 찾는 여행객이 자주 확인하는 상품입니다. 병 디자인과 브랜드 인지도 때문에 선물 수요가 높고, 같은 히비키 라인 안에서도 용량과 표기 방식에 따라 검색 결과가 갈리기 쉽습니다. DFMOA에서는 현재 유효한 공개가가 잡히지 않아 가격 대신 원본 확인 흐름을 먼저 안내합니다.",
    check:
      "주류는 출국 공항, 도착지 반입 한도, 환승 국가 규정, 주문 마감 시간이 모두 영향을 줍니다. 700ml 표기와 상품명이 맞는지 확인하고, 원본 면세점에서 항공편 정보를 입력한 뒤 인도장 수령 가능 여부와 최종 결제 금액을 다시 보세요.",
    tip: "검색어를 `Hibiki Japanese Harmony 700ml`, `히비키 하모니 700ml`, `Hibiki Harmony` 순서로 바꿔 시도하면 노출명을 찾기 쉽습니다.",
  },
  "gentle-monster-dear-01": {
    background:
      "Gentle Monster Dear 01은 국내외에서 찾는 사용자가 많은 아이웨어 모델입니다. 선글라스와 안경테는 동일한 모델명처럼 보여도 렌즈 색상, 프레임 컬러, 시즌 코드가 달라질 수 있어 단순 브랜드명만으로는 같은 상품을 확정하기 어렵습니다. DFMOA는 가격이 확인되지 않은 경우 모델 코드 중심의 비교 기준을 남깁니다.",
    check:
      "아이웨어는 착용감과 렌즈 색상, 구성품, 보증 조건까지 확인해야 합니다. 면세점 원본에서 Dear 01 표기, 컬러 코드, 수령 공항, 교환 가능 조건을 확인하고 국내 공식몰 또는 백화점 판매가와 같은 옵션인지 비교하세요.",
    tip: "검색어는 `Gentle Monster Dear 01`, `젠틀몬스터 Dear 01`, `Dear 01 sunglasses`처럼 영문 모델명을 앞에 두면 매칭 정확도가 올라갑니다.",
  },
  "rayban-wayfarer-rb2140": {
    background:
      "Ray-Ban Original Wayfarer RB2140은 웨이페어러 계열을 대표하는 아이웨어 모델로, 사이즈와 렌즈 컬러에 따라 실제 구매 대상이 크게 달라집니다. 면세 검색에서는 RB2140 코드가 빠지거나 한글 상품명만 노출되는 경우가 있어 가격이 없더라도 코드 검증이 중요합니다.",
    check:
      "RB2140은 렌즈 폭, 브릿지, 템플 길이, 렌즈 색상까지 확인해야 같은 상품 비교가 됩니다. 원본 면세점에서 모델 코드와 옵션명을 확인한 뒤 인천 T1/T2, 김포, 김해, 제주 등 수령 가능한 공항이 본인 출국 여정과 맞는지 함께 점검하세요.",
    tip: "검색어를 `Ray-Ban RB2140`, `Original Wayfarer RB2140`, `레이밴 웨이페어러 RB2140` 순서로 바꿔 보세요.",
  },
  "dior-sauvage-edp-100ml": {
    background:
      "Dior Sauvage EDP 100ml는 남성 향수 검색에서 자주 비교되는 상품입니다. 같은 Sauvage 라인이라도 EDT, EDP, Parfum, Elixir처럼 농도와 용량이 다르면 가격대와 상품 코드가 달라지므로, 100ml EDP인지 먼저 고정해야 의미 있는 비교가 됩니다.",
    check:
      "향수는 액체류 보안 규정과 환승 조건을 함께 봐야 합니다. 면세점 원본에서 EDP 100ml 표기가 맞는지, 세트 상품이 아닌 단품인지, 출국 공항과 수령 시간이 가능한지 확인한 뒤 국내가 참고 링크와 비교하세요.",
    tip: "검색어는 `Dior Sauvage EDP 100ml`, `디올 소바쥬 오드퍼퓸 100ml`, `Sauvage Eau de Parfum 100ml`을 각각 시도해 보세요.",
  },
  "penhaligons-halfeti-100ml": {
    background:
      "Penhaligon's Halfeti EDP 100ml는 니치 향수 이용자가 선물용과 개인용으로 모두 찾는 상품입니다. 브랜드 표기에는 Penhaligon's, Penhaligons, 펜할리곤스처럼 변형이 많고, Halfeti 라인도 향 이름과 용량 표기가 결과를 크게 바꿉니다.",
    check:
      "면세 구매 전에는 EDP 100ml 단품인지, 세트 구성인지, 원본 면세점이 노출하는 향 이름이 Halfeti와 일치하는지 확인하세요. 액체류 보안 봉투, 환승 일정, 공항 인도장 위치도 최종 구매 전에 함께 확인하는 편이 안전합니다.",
    tip: "검색어는 `Penhaligon's Halfeti 100ml`, `Penhaligons Halfeti EDP`, `펜할리곤스 하페티 100ml`처럼 브랜드 표기를 나눠 시도하세요.",
  },
  "kiehls-ultra-facial-cream-125ml": {
    background:
      "Kiehl's Ultra Facial Cream 125ml는 데일리 보습 크림으로 자주 비교되는 뷰티 상품입니다. 같은 제품이라도 50ml, 75ml, 125ml 등 용량 차이가 크고, 면세점에서는 세트 구성이나 증정품 조건이 함께 노출될 수 있어 단품 용량 확인이 중요합니다.",
    check:
      "스킨케어는 용량과 세트 구성, 사용기한, 증정품 조건을 확인해야 합니다. 원본 면세점에서 125ml 표기와 단품 여부를 확인하고, 국내 판매가 비교 시 배송비와 공식/병행 판매 여부가 다른지 함께 보세요.",
    tip: "검색어는 `Kiehl's Ultra Facial Cream 125ml`, `키엘 수분 크림 125ml`, `울트라 훼이셜 크림 125ml`을 나눠 입력해 보세요.",
  },
  "la-mer-moisturizing-cream-60ml": {
    background:
      "La Mer Moisturizing Cream 60ml는 고가 스킨케어 비교에서 자주 확인되는 상품입니다. 같은 브랜드 안에서도 크림, 소프트 크림, 로션처럼 제형이 다르고 용량별 가격 차이가 커서, 면세가가 없을 때도 제품명과 60ml 용량을 분리해 검증해야 합니다.",
    check:
      "고가 뷰티 상품은 세트 구성과 정품 유통, 사용기한 안내, 증정품 조건이 구매 판단에 영향을 줍니다. 원본 면세점에서 60ml 단품인지, 회원 등급 할인이나 쿠폰 적용 후 실결제가가 어떻게 바뀌는지 직접 확인하세요.",
    tip: "검색어를 `La Mer Moisturizing Cream 60ml`, `라메르 모이스처라이징 크림 60ml`, `크렘 드 라메르 60ml`로 바꿔 보세요.",
  },
  "shiseido-ultimune-75ml": {
    background:
      "Shiseido Ultimune 75ml는 면세 뷰티 카테고리에서 꾸준히 확인되는 세럼형 상품입니다. 리뉴얼, 리필, 듀오 구성, 용량 차이가 검색 결과에 함께 섞일 수 있어 단순 최저가보다 정확한 상품 매칭이 우선입니다.",
    check:
      "75ml 단품인지, 세트 또는 리필 구성인지 원본 면세점에서 확인하세요. 화장품은 증정품과 쿠폰 조건이 최종 체감가에 영향을 주므로 공개가, 쿠폰 적용 가능 여부, 출국 공항 수령 조건을 나눠 비교하는 것이 좋습니다.",
    tip: "검색어는 `Shiseido Ultimune 75ml`, `시세이도 얼티뮨 75ml`, `Ultimune Power Infusing Concentrate 75ml` 순서로 시도해 보세요.",
  },
  "biotherm-life-plankton-125ml": {
    background:
      "Biotherm Life Plankton 125ml는 에센스 또는 트리트먼트 계열로 검색되는 뷰티 상품입니다. 브랜드명과 제품명이 한글, 영문, 약칭으로 다양하게 노출되고, 같은 라인에서도 75ml와 125ml 용량이 섞일 수 있어 용량 확인이 비교의 핵심입니다.",
    check:
      "원본 면세점에서 125ml 표기와 제품 유형을 확인하고, 세트 구성이나 샘플 증정이 가격에 포함된 것인지 살펴보세요. 국내가 비교 시 판매처가 공식인지, 병행수입인지, 배송 조건이 다른지도 함께 확인해야 합니다.",
    tip: "검색어는 `Biotherm Life Plankton 125ml`, `비오템 라이프 플랑크톤 125ml`, `Life Plankton Essence 125ml`을 각각 시도해 보세요.",
  },
  "aesop-resurrection-hand-balm-75ml": {
    background:
      "Aesop Resurrection Hand Balm 75ml는 여행 선물과 개인 휴대용으로 자주 비교되는 핸드케어 상품입니다. 같은 제품이라도 75ml 튜브와 대용량 펌프형, 세트 구성이 다르게 노출될 수 있어 상품명과 용량을 고정해야 합니다.",
    check:
      "핸드밤은 단가가 낮아 쿠폰보다 묶음 구성과 배송·수령 조건의 영향이 더 크게 느껴질 수 있습니다. 원본 면세점에서 75ml 단품인지, 수령 가능한 공항과 주문 마감 시간이 맞는지 확인한 뒤 국내 판매가와 비교하세요.",
    tip: "검색어는 `Aesop Resurrection Hand Balm 75ml`, `이솝 레저렉션 핸드밤 75ml`, `Aesop hand balm 75ml`을 나눠 보세요.",
  },
  "yamazaki-12-700ml": {
    background:
      "Yamazaki 12YO 700ml는 재패니즈 위스키를 찾는 이용자가 면세점에서 자주 확인하는 상품입니다. 연산 표기, 용량, 병행 상품명 차이 때문에 검색 결과가 민감하게 갈리고 재고 노출도 빠르게 바뀔 수 있습니다.",
    check:
      "주류는 가격보다 재고와 수령 가능성이 먼저 막히는 경우가 많습니다. 12년 표기와 700ml 용량, 도착지 반입 한도, 환승 여정, 출국 공항 인도장 가능 여부를 원본 면세점과 공항 안내에서 함께 확인하세요.",
    tip: "검색어는 `Yamazaki 12 700ml`, `야마자키 12년 700ml`, `Yamazaki 12 Year Old`처럼 연산 표기를 바꿔 입력해 보세요.",
  },
  "glenmorangie-original-10-700ml": {
    background:
      "Glenmorangie Original 10YO 700ml는 싱글몰트 입문 상품으로 자주 비교되는 위스키입니다. Original, The Original, 10 Years Old처럼 상품명이 조금씩 다르게 노출될 수 있고, 700ml와 1L 면세 전용 용량이 섞일 가능성도 있어 용량 검증이 중요합니다.",
    check:
      "원본 면세점에서 10년 숙성 표기와 700ml 용량이 맞는지 확인하세요. 주류는 출국일, 수령 공항, 반입 한도, 환승지 보안 규정이 모두 영향을 주므로 가격이 보이더라도 결제 전 마지막 확인이 필요합니다.",
    tip: "검색어는 `Glenmorangie Original 10 700ml`, `글렌모렌지 오리지널 10년`, `The Original 10 Years Old`로 나눠 보세요.",
  },
  "don-julio-1942-750ml": {
    background:
      "Don Julio 1942 750ml는 프리미엄 데킬라를 찾는 이용자가 비교하는 주류 상품입니다. 데킬라는 위스키보다 면세점 카테고리 노출이 일정하지 않을 수 있고, 700ml와 750ml 표기가 혼재될 수 있어 상품명과 용량을 함께 확인해야 합니다.",
    check:
      "주류 구매 전에는 도착지 반입 가능 수량, 병 용량, 수령 공항, 주문 마감 시간을 확인하세요. 원본 면세점에서 1942 표기와 750ml 용량이 일치하는지 보고, 가격이 없으면 공식 검색 링크에서 재고 변동을 재확인하는 편이 안전합니다.",
    tip: "검색어는 `Don Julio 1942 750ml`, `돈 훌리오 1942`, `Don Julio 1942 Tequila`를 각각 시도해 보세요.",
  },
  "oakley-sutro-oo9406": {
    background:
      "Oakley Sutro OO9406은 스포츠 아이웨어로 찾는 사용자가 많은 모델입니다. 오클리 상품은 모델 코드, 프레임 색상, 렌즈 타입이 가격과 착용 목적을 바꾸므로 Sutro라는 라인명만으로는 같은 상품 비교가 어렵습니다.",
    check:
      "OO9406 모델 코드, 렌즈 컬러, 프레임 색상, 편광 여부를 원본 면세점에서 확인하세요. 아이웨어는 착용 후 교환 조건이 제한될 수 있어, 수령 공항과 구매 후 대응 정책도 가격과 함께 봐야 합니다.",
    tip: "검색어는 `Oakley Sutro OO9406`, `오클리 수트로 OO9406`, `Sutro sunglasses OO9406`처럼 코드 중심으로 입력해 보세요.",
  },
  "tom-ford-snowdon-ft0237": {
    background:
      "Tom Ford Snowdon FT0237은 패션 아이웨어 비교에서 자주 언급되는 모델입니다. 톰포드 선글라스는 FT 코드, 렌즈 색상, 프레임 컬러, 사이즈가 상품 식별의 핵심이며, Snowdon이라는 이름만으로는 유사 모델이 섞일 수 있습니다.",
    check:
      "면세점 원본에서 FT0237 코드와 컬러 옵션이 맞는지 확인하고, 국내가 비교 시 같은 렌즈 색상과 구성품인지 살펴보세요. 아이웨어는 온라인 수령 이후 착용감 이슈가 생길 수 있어 교환·환불 조건도 미리 확인해야 합니다.",
    tip: "검색어는 `Tom Ford FT0237`, `Tom Ford Snowdon`, `톰포드 스노든 FT0237`을 순서대로 시도해 보세요.",
  },
  "prada-pr-17ws": {
    background:
      "Prada PR 17WS는 프라다 아이웨어 라인에서 모델 코드 기준 비교가 필요한 상품입니다. 같은 브랜드 안에서도 PR 17WS, PR17WS, 컬러 코드, 렌즈 옵션이 함께 표기되어 가격 결과가 달라질 수 있습니다.",
    check:
      "원본 면세점에서 PR 17WS 모델명과 색상 코드, 렌즈 타입을 확인하세요. 면세점별 수령 가능 공항과 출국 정보 입력 조건이 다를 수 있으므로, 가격보다 수령 가능 여부를 먼저 확인하는 편이 좋습니다.",
    tip: "검색어는 `Prada PR 17WS`, `프라다 PR17WS`, `Prada sunglasses PR 17WS`처럼 공백 유무를 바꿔 보세요.",
  },
  "gucci-gg0061s": {
    background:
      "Gucci GG0061S는 구찌 선글라스 모델 중 코드 기반 확인이 필요한 상품입니다. 구찌 아이웨어는 GG 코드와 색상 번호가 함께 붙는 경우가 많아, 브랜드명과 모델명만으로 검색하면 다른 렌즈 색상이나 시즌 상품이 섞일 수 있습니다.",
    check:
      "GG0061S 표기와 렌즈 색상, 프레임 컬러, 구성품을 원본 면세점에서 확인하세요. 국내가 비교 시 동일 코드인지, 병행수입 여부와 보증 조건이 다른지 확인해야 가격 차이를 제대로 해석할 수 있습니다.",
    tip: "검색어는 `Gucci GG0061S`, `구찌 GG0061S`, `GG0061S sunglasses`를 각각 시도해 보세요.",
  },
  "celine-triomphe-cl40194u": {
    background:
      "Celine Triomphe CL40194U는 패션 아이웨어에서 모델 코드와 라인명이 모두 중요한 상품입니다. Triomphe라는 라인명만으로 검색하면 가방, 지갑, 선글라스가 함께 노출될 수 있어 CL40194U 코드를 반드시 붙여야 합니다.",
    check:
      "원본 면세점에서 CL40194U 코드, 색상, 렌즈 타입, 케이스 구성 여부를 확인하세요. 아이웨어는 같은 모델이라도 옵션 차이가 크므로 국내가와 비교할 때 상품 코드가 완전히 같은지 먼저 보는 것이 좋습니다.",
    tip: "검색어는 `Celine CL40194U`, `Celine Triomphe sunglasses`, `셀린느 트리옹프 CL40194U` 순서로 바꿔 보세요.",
  },
  "saint-laurent-sl-276-mica": {
    background:
      "Saint Laurent SL 276 Mica는 생로랑 아이웨어 라인에서 모델명과 코드가 함께 쓰이는 상품입니다. SL 276, Mica, 컬러 코드가 따로 노출될 수 있어 단순 브랜드 검색으로는 같은 상품 여부를 판단하기 어렵습니다.",
    check:
      "원본 면세점에서 SL 276 Mica 표기와 렌즈 색상, 프레임 컬러를 확인하세요. 수령 공항과 출국일 입력 후 재고가 바뀔 수 있고, 고가 아이웨어는 교환 조건도 구매 판단에 중요합니다.",
    tip: "검색어는 `Saint Laurent SL 276 Mica`, `YSL SL276 Mica`, `생로랑 SL 276 Mica`를 각각 시도해 보세요.",
  },
  "maui-jim-peahi-b202": {
    background:
      "Maui Jim Peahi B202는 편광 렌즈를 찾는 이용자가 확인하는 스포츠·아웃도어 아이웨어입니다. Maui Jim은 렌즈 색상과 편광 여부가 상품 경험에 직접 영향을 주므로, Peahi라는 이름과 B202 코드가 함께 맞는지 확인해야 합니다.",
    check:
      "원본 면세점에서 B202 코드, 렌즈 컬러, 편광 여부, 케이스 구성을 확인하세요. 아이웨어는 착용감과 용도 차이가 커서 가격만 비교하기보다 국내 판매처의 동일 코드 상품과 함께 보는 것이 안전합니다.",
    tip: "검색어는 `Maui Jim Peahi B202`, `마우이짐 Peahi B202`, `Peahi polarized B202`를 바꿔 입력해 보세요.",
  },
};

const categoryTemplates = {
  perfume: {
    background:
      "향수는 브랜드명, 향 이름, 농도, 용량이 모두 맞아야 같은 상품으로 볼 수 있습니다. 면세점 검색 결과에서는 EDT, EDP, Parfum, 세트 구성이 함께 노출될 수 있어 용량과 표기를 보수적으로 확인해야 합니다.",
    check:
      "액체류 보안 규정, 환승 여정, 수령 공항과 주문 마감 시간을 확인하세요. 국내가 비교 시에는 공식 판매처인지, 병행수입인지, 배송비가 포함되는지도 함께 봐야 합니다.",
    tip: "영문 브랜드명과 향 이름, 용량을 함께 쓰고 한글 상품명도 별도로 시도하세요.",
  },
  beauty: {
    background:
      "뷰티 상품은 단품, 세트, 리필, 증정품 구성이 가격 비교에 큰 영향을 줍니다. 같은 제품명이어도 용량과 패키지 구성이 다르면 실제 체감가가 달라지므로 상품명과 용량을 함께 고정해야 합니다.",
    check:
      "원본 면세점에서 용량, 구성, 사용기한 안내, 쿠폰 적용 가능 여부를 확인하세요. 국내가 비교에서는 공식몰, 병행수입, 배송 조건 차이를 분리해 보는 편이 안전합니다.",
    tip: "영문 제품명, 한글 제품명, 용량을 조합하고 세트나 리필 단어는 필요할 때만 추가하세요.",
  },
  liquor: {
    background:
      "주류는 브랜드와 상품명뿐 아니라 연산, 용량, 병 표기가 비교 기준이 됩니다. 재고와 노출 상태가 자주 달라질 수 있어 가격이 없을 때는 원본 면세점에서 수령 가능성을 직접 확인해야 합니다.",
    check:
      "도착지 반입 한도, 환승 국가 보안 규정, 출국 공항 인도장, 주문 마감 시간을 확인하세요. 같은 이름이라도 700ml와 1L 면세 전용 용량이 섞일 수 있습니다.",
    tip: "영문 브랜드명, 연산 또는 에디션명, 용량을 붙여 검색하고 한글명도 별도로 시도하세요.",
  },
  eyewear: {
    background:
      "아이웨어는 모델 코드, 컬러 코드, 렌즈 색상, 프레임 옵션이 모두 맞아야 같은 상품 비교가 됩니다. 브랜드명만으로 검색하면 유사 모델이 섞이므로 DFMOA는 코드와 옵션 확인을 우선합니다.",
    check:
      "원본 면세점에서 모델 코드, 렌즈 타입, 구성품, 교환 조건을 확인하세요. 국내가 비교 시에는 같은 코드와 색상인지, 공식 유통과 병행수입 조건이 다른지 봐야 합니다.",
    tip: "영문 모델 코드와 브랜드명을 먼저 쓰고, 공백 유무나 한글 브랜드명을 바꿔 검색하세요.",
  },
  fashion: {
    background:
      "패션잡화는 모델명, 사이즈, 소재, 컬러가 조금만 달라도 다른 상품이 됩니다. 면세점 검색에서는 시즌명이나 색상명이 빠질 수 있어 가격보다 상품 식별을 먼저 확인해야 합니다.",
    check:
      "원본 면세점에서 색상, 사이즈, 구성품, 보증 또는 교환 조건을 확인하세요. 국내가 비교에서는 같은 시즌과 같은 옵션인지, 배송·AS 조건이 다른지 함께 보세요.",
    tip: "영문 브랜드명과 상품명, 색상 또는 사이즈를 조합해 검색하고 한글명도 별도로 확인하세요.",
  },
  watch: {
    background:
      "시계는 레퍼런스 번호, 다이얼 색상, 스트랩 소재, 케이스 크기가 가격 비교의 핵심입니다. 같은 라인명이어도 세부 레퍼런스가 다르면 다른 상품으로 봐야 합니다.",
    check:
      "원본 면세점에서 레퍼런스 번호와 보증 조건, 구성품, 수령 가능 공항을 확인하세요. 국내가 비교에서는 정식 수입, 병행수입, 보증 기간 차이를 분리해 봐야 합니다.",
    tip: "레퍼런스 번호, 영문 라인명, 케이스 크기 또는 색상을 함께 입력하세요.",
  },
  jewelry: {
    background:
      "주얼리는 소재, 도금 여부, 사이즈, 세트 구성에 따라 같은 브랜드라도 가격 차이가 큽니다. 상품명이 비슷한 목걸이, 귀걸이, 팔찌가 함께 노출될 수 있어 카테고리와 모델명을 함께 확인해야 합니다.",
    check:
      "원본 면세점에서 소재, 사이즈, 세트 여부, 교환 조건을 확인하세요. 국내가 비교 시에는 같은 소재와 같은 구성인지, 보증 조건이 다른지 함께 보는 편이 안전합니다.",
    tip: "영문 브랜드명과 모델명, 상품 유형을 함께 쓰고 한글명도 별도로 시도하세요.",
  },
  health: {
    background:
      "건강식품은 정제 수, 포장 수량, 함량, 섭취 일수에 따라 단가가 달라집니다. 면세점에서는 묶음 구성이 자주 노출되므로 같은 제품인지보다 같은 수량인지 먼저 확인해야 합니다.",
    check:
      "원본 면세점에서 수량, 함량, 섭취 제한, 반입 가능 여부를 확인하세요. 국내가 비교에서는 배송 조건과 동일 구성 여부를 나눠 보는 것이 좋습니다.",
    tip: "영문 제품명, 함량, 정제 수 또는 패키지 수량을 함께 입력하세요.",
  },
  food: {
    background:
      "식품과 선물세트는 중량, 개수, 포장 구성이 가격 비교에 큰 영향을 줍니다. 같은 브랜드라도 시즌 패키지와 일반 패키지가 섞일 수 있어 상품명과 중량을 함께 확인해야 합니다.",
    check:
      "원본 면세점에서 중량, 유통기한, 반입 제한, 수령 공항을 확인하세요. 선물용 상품은 박스 구성과 쇼핑백 제공 여부도 실제 만족도에 영향을 줄 수 있습니다.",
    tip: "영문 브랜드명, 상품명, 중량 또는 개수를 함께 검색하고 한글 상품명도 따로 확인하세요.",
  },
  electronics: {
    background:
      "전자기기는 모델 코드, 세대, 색상, 구성품이 정확해야 같은 상품 비교가 됩니다. 액세서리나 리퍼 상품이 섞일 수 있어 가격이 보일 때도 모델명 검증이 먼저 필요합니다.",
    check:
      "원본 면세점에서 모델 코드, 색상, 보증, 전압·플러그, 배터리 항공 반입 조건을 확인하세요. 국내가 비교에서는 정식 유통과 병행수입의 AS 차이를 함께 봐야 합니다.",
    tip: "영문 모델 코드와 세대명, 색상을 함께 입력하고 한글 상품명은 보조 검색어로 사용하세요.",
  },
};

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function formatProductMarkdown(product, context) {
  return `# ${product.displayName} 면세 구매 메모

## 상품 배경
${normalizeWhitespace(context.background)}

## 면세 구매 시 확인 포인트
${normalizeWhitespace(context.check)}

## 검색 매칭 팁
- ${normalizeWhitespace(context.tip)}
- DFMOA 기준 상품명은 ${product.displayName}, 브랜드는 ${product.brand}, 용량 또는 모델 표기는 ${product.volume}입니다.
- 가격이 보이지 않으면 실패로 단정하지 말고 ICN T1, ICN T2, GMP, CJU, PUS 중 본인 출국 공항을 원본 면세점에서 다시 확인하세요.
`;
}

function buildTemplateProductContext(product) {
  const categoryTemplate = categoryTemplates[product.categorySlug];
  const categoryName = categoryNameBySlug.get(product.categorySlug) ?? product.categorySlug;

  return {
    background: `${product.displayName}은 ${product.brand}의 ${categoryName} 상품으로, DFMOA에서는 ${product.volume} 표기와 상품명 정합성을 기준으로 추적합니다. 현재 공개가 스냅샷에는 유효한 가격이 없어 빈 가격표 대신 구매 전 확인할 기준을 제공합니다. ${categoryTemplate.background}`,
    check: `${product.displayName} 구매 전에는 원본 면세점에서 ${product.volume} 표기, 출국 공항, 주문 마감 시간, 수령 가능 여부를 확인하세요. ${categoryTemplate.check}`,
    tip: `${categoryTemplate.tip} 기본 검색어는 \`${product.query}\`이고, 영문 브랜드명 \`${product.brand}\`와 상품명 \`${product.name}\`을 조합해 다시 검색할 수 있습니다.`,
  };
}

const brandContexts = [
  {
    slug: "creed",
    title: "크리드 브랜드 소개",
    background:
      "크리드는 니치 향수 시장에서 선물용과 개인 소장용 수요가 모두 높은 브랜드입니다. 제품명, 농도, 용량 표기가 가격 비교의 핵심이며, 인기 향은 면세점 재고와 노출 상태가 빠르게 바뀔 수 있습니다.",
    lineup:
      "대표 라인업으로는 Aventus, Silver Mountain Water, Green Irish Tweed처럼 이름이 강하게 알려진 향들이 자주 비교됩니다. 같은 향이라도 50ml, 100ml, 세트 구성이 다르면 가격 판단이 달라집니다.",
    dutyFree:
      "면세점에서는 공개가, 회원 혜택, 적립금 조건을 분리해서 보는 편이 안전합니다. DFMOA는 최저가와 원본 확인 링크를 함께 보여주지만, 최종 결제가는 출국 정보 입력 후 원본에서 확인해야 합니다.",
  },
  {
    slug: "jo-malone",
    title: "조말론 브랜드 소개",
    background:
      "조말론은 선물 수요가 많은 향수 브랜드로, 향 이름과 용량을 정확히 맞추는 것이 비교의 출발점입니다. Cologne, Cologne Intense, 세트 구성처럼 표기가 조금씩 달라질 수 있습니다.",
    lineup:
      "English Pear & Freesia, Lime Basil & Mandarin, Peony & Blush Suede 같은 향이 대표적으로 비교됩니다. 30ml, 50ml, 100ml 용량 차이와 듀오·세트 구성을 함께 봐야 합니다.",
    dutyFree:
      "면세점에서는 시즌 패키지와 증정품 조건이 함께 붙을 수 있어 단순 공개가만으로는 체감가가 정리되지 않습니다. DFMOA는 같은 상품 기준을 먼저 맞추고 원본 링크에서 최종 조건을 확인하도록 안내합니다.",
  },
  {
    slug: "sulwhasoo",
    title: "설화수 브랜드 소개",
    background:
      "설화수는 기초 스킨케어와 선물 세트 수요가 큰 뷰티 브랜드입니다. 면세점에서는 단품, 기획세트, 듀오 구성이 함께 노출될 수 있어 제품명과 용량, 구성 확인이 중요합니다.",
    lineup:
      "윤조에센스, 자음생 라인, 탄력·보습 계열 세트가 대표적으로 비교됩니다. 같은 라인이라도 리뉴얼 여부와 용량, 증정품이 달라지면 가격 비교 결과가 크게 달라질 수 있습니다.",
    dutyFree:
      "쿠폰과 적립금 적용 후 체감가는 회원 등급과 결제 수단에 따라 달라집니다. DFMOA는 공개가와 혜택 계산을 분리하고, 실제 구매 전 원본 면세점에서 세트 구성과 수령 조건을 다시 보도록 안내합니다.",
  },
  {
    slug: "sk-ii",
    title: "SK-II 브랜드 소개",
    background:
      "SK-II는 에센스와 스킨케어 세트가 면세 뷰티 비교에서 자주 등장하는 브랜드입니다. 같은 제품이라도 용량과 세트 구성, 리뉴얼 표기에 따라 가격과 상품 매칭이 달라질 수 있습니다.",
    lineup:
      "Facial Treatment Essence, GenOptics, Skinpower 계열이 대표적으로 확인됩니다. 특히 에센스는 75ml, 160ml, 230ml처럼 용량 차이가 커서 단가 비교가 중요합니다.",
    dutyFree:
      "면세점에서는 고가 뷰티 상품일수록 쿠폰·적립금의 영향이 커집니다. DFMOA는 공개가를 먼저 보여주고 예상 실결제가 계산기로 사용자가 본인의 혜택 조건을 따로 넣어 볼 수 있게 합니다.",
  },
  {
    slug: "glenfiddich",
    title: "글렌피딕 브랜드 소개",
    background:
      "글렌피딕은 싱글몰트 위스키 비교에서 자주 확인되는 브랜드입니다. 연산, 캐스크 표기, 용량에 따라 가격대가 달라지며, 면세점에서는 재고와 수령 공항 조건이 함께 중요합니다.",
    lineup:
      "12년, 15년, 18년 같은 기본 연산 제품과 특별 에디션이 대표적으로 비교됩니다. 700ml와 1L 면세 전용 용량이 섞일 수 있어 같은 상품인지 먼저 확인해야 합니다.",
    dutyFree:
      "주류는 도착지 반입 한도와 환승 국가 규정을 함께 봐야 합니다. DFMOA의 가격은 최근 확인 공개가 기준이며, 실제 구매 전 원본 면세점에서 항공편과 인도장 조건을 확인해야 합니다.",
  },
  {
    slug: "hibiki",
    title: "히비키 브랜드 소개",
    background:
      "히비키는 재패니즈 위스키 수요가 높은 브랜드로, 공개가와 재고 노출이 빠르게 바뀔 수 있습니다. 같은 이름으로 보여도 용량, 에디션, 병 표기가 다르면 비교 대상이 달라집니다.",
    lineup:
      "Japanese Harmony와 연산 표기 제품들이 주로 확인됩니다. 면세점 검색에서는 상품명이 한글, 영문, 약칭으로 섞일 수 있어 브랜드명과 용량을 함께 넣어 검색하는 편이 좋습니다.",
    dutyFree:
      "주류 면세 구매는 최저가보다 수령 가능 여부가 먼저입니다. DFMOA는 가격이 없는 상태도 숨기지 않고 원본 확인 링크와 검색 팁을 제공해 재고 변동을 사용자가 직접 확인할 수 있게 합니다.",
  },
  {
    slug: "gentle-monster",
    title: "젠틀몬스터 브랜드 소개",
    background:
      "젠틀몬스터는 국내외 여행객이 자주 확인하는 아이웨어 브랜드입니다. 선글라스와 안경테는 모델명, 컬러, 시즌 코드에 따라 가격과 구성품이 달라져 모델 코드 중심 비교가 필요합니다.",
    lineup:
      "Dear, Lilit, Her 같은 인기 모델군이 자주 검색되며, 같은 모델명이라도 렌즈 색상과 프레임 옵션이 다를 수 있습니다. 면세 검색에서는 영문 모델명과 컬러 코드를 함께 확인해야 합니다.",
    dutyFree:
      "아이웨어는 착용감과 교환 조건이 구매 판단에 중요합니다. DFMOA는 공개가가 잡히지 않는 경우에도 상품 코드, 국내가 참고 비교, 원본 면세점 확인 링크를 남겨 검증 흐름을 돕습니다.",
  },
  {
    slug: "ray-ban",
    title: "레이밴 브랜드 소개",
    background:
      "레이밴은 클래식 선글라스 모델 수요가 꾸준한 아이웨어 브랜드입니다. Wayfarer, Aviator 같은 라인명만으로는 같은 상품을 확정하기 어렵고, RB 모델 코드와 렌즈 옵션을 함께 봐야 합니다.",
    lineup:
      "Original Wayfarer RB2140, Aviator, Clubmaster 계열이 대표적으로 비교됩니다. 사이즈, 렌즈 색상, 편광 여부가 다르면 가격 차이가 생기므로 코드와 옵션을 함께 확인해야 합니다.",
    dutyFree:
      "면세점에서는 일부 색상이나 사이즈만 노출될 수 있습니다. DFMOA는 같은 코드 기준으로 보수적으로 비교하고, 국내가와 원본 면세점의 상품 옵션이 같은지 확인하도록 안내합니다.",
  },
  {
    slug: "diptyque",
    title: "딥티크 브랜드 소개",
    background:
      "딥티크는 니치 향수와 캔들 수요가 높은 브랜드입니다. 향 이름, EDT·EDP 표기, 용량이 가격 비교의 핵심이며, 같은 향이라도 제품군이 다르면 비교 대상이 달라집니다.",
    lineup:
      "Do Son, Philosykos, Eau Rose, Tam Dao 같은 향이 대표적으로 확인됩니다. 50ml, 75ml, 100ml 용량과 세트 여부를 분리해서 봐야 실제 최저가 판단이 가능합니다.",
    dutyFree:
      "면세점에서는 향수 재고와 증정 조건이 시점별로 바뀔 수 있습니다. DFMOA는 공개가가 확인된 항목과 원본 링크를 함께 제공하고, 액체류 수령과 환승 조건을 최종 확인하도록 안내합니다.",
  },
  {
    slug: "byredo",
    title: "바이레도 브랜드 소개",
    background:
      "바이레도는 향 이름과 브랜드 감도가 강한 니치 향수 브랜드입니다. 같은 향이라도 EDP, 헤어퍼퓸, 바디 제품이 함께 검색될 수 있어 제품군과 용량을 정확히 고정해야 합니다.",
    lineup:
      "Blanche, Bal d'Afrique, Mojave Ghost, Gypsy Water 같은 향이 대표적으로 비교됩니다. 50ml와 100ml 용량 차이가 크기 때문에 단순 가격보다 같은 용량 기준이 우선입니다.",
    dutyFree:
      "면세점 가격은 공개가, 쿠폰, 적립금, 카드 혜택이 분리되어 체감가가 달라집니다. DFMOA는 원본 확인 링크와 예상 실결제가 계산 진입점을 제공해 사용자가 본인 조건으로 다시 확인할 수 있게 합니다.",
  },
];

function formatBrandMarkdown(brand) {
  return `# ${brand.title}

## 브랜드 배경
${brand.background}

## 대표 라인업
${brand.lineup}

## 면세점에서 확인할 점
${brand.dutyFree}
`;
}

function writeFile(relativePath, content) {
  const filePath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

const noPriceProducts = products.filter((product) => !hasSnapshotPrice(product));
const customSlugs = new Set(noPriceProducts.slice(0, 20).map((product) => product.slug));

for (const product of noPriceProducts) {
  const isCustom = customSlugs.has(product.slug);
  const context = isCustom ? customProductContexts[product.slug] : buildTemplateProductContext(product);

  if (!context) {
    throw new Error(`Missing custom context for ${product.slug}`);
  }

  writeFile(`data/product-context/${product.slug}.md`, formatProductMarkdown(product, context));
}

for (const brand of brandContexts) {
  writeFile(`data/brand-context/${brand.slug}.md`, formatBrandMarkdown(brand));
}

console.log(`Generated product contexts: ${noPriceProducts.length}`);
console.log(`Custom product contexts: ${customSlugs.size}`);
console.log(`Template product contexts: ${noPriceProducts.length - customSlugs.size}`);
console.log(`Generated brand contexts: ${brandContexts.length}`);
