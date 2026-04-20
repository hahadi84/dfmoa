import type { CategorySlug } from "@/lib/site-data";

const categoryNotices: Record<CategorySlug, string[]> = {
  perfume: [
    "향수는 용량과 수량에 따라 반입·면세 기준 확인이 필요합니다.",
    "최종 구매 전 항공사와 세관 안내를 함께 확인하세요.",
  ],
  beauty: [
    "액체류와 세트 구성은 기내 반입 규정과 수령 공항 조건을 확인하세요.",
    "사은품 포함 여부에 따라 실제 구성과 가격 판단이 달라질 수 있습니다.",
  ],
  liquor: [
    "주류는 연령, 수량, 용량, 세관 신고 기준을 반드시 확인해야 합니다.",
    "상품별 수령 가능 공항과 재고는 출국정보 입력 후 원본에서 확인하세요.",
  ],
  eyewear: [
    "선글라스와 안경은 모델 코드, 색상, 렌즈 구성이 다르면 다른 상품일 수 있습니다.",
    "원본 상품 상세에서 색상 코드와 구성품을 확인하세요.",
  ],
  fashion: ["모델명, 색상, 소재, 시즌 코드가 가격 비교의 핵심입니다.", "구성품과 교환 조건은 원본에서 확인하세요."],
  watch: ["레퍼런스 번호와 스트랩 구성을 확인하세요.", "보증 조건과 수령 가능 지점은 원본에서 확인하세요."],
  jewelry: ["소재, 사이즈, 세트 여부에 따라 가격 차이가 큽니다.", "상품명과 옵션을 원본에서 다시 확인하세요."],
  health: ["건강식품은 수량, 정제 수, 성분 기준을 확인하세요.", "국가별 반입 제한 가능성은 공식 안내를 참고하세요."],
  food: ["식품은 중량, 묶음 구성, 유통기한 조건을 확인하세요.", "반입 제한 품목 여부를 출국·입국 전 확인하세요."],
  electronics: ["모델 코드, 세대, 플러그, 보증 조건을 확인하세요.", "국내가와 비교할 때 구성품 차이를 함께 보세요."],
};

export function CategoryTravelNotice({ categorySlug }: { categorySlug: CategorySlug }) {
  return (
    <article className="surface-card travel-notice-card">
      <span className="eyebrow">Airport Note</span>
      <h2 className="card-title">공항·수령 주의 정보</h2>
      <div className="guide-body" style={{ marginTop: 8 }}>
        {categoryNotices[categorySlug].map((notice, index) => (
          <div key={notice} className="list-item">
            <span className="list-number">{index + 1}</span>
            <p className="list-copy">{notice}</p>
          </div>
        ))}
      </div>
      <p className="featured-product-source">
        실제 재고와 수령 가능 여부는 원본 면세점에서 출국정보 입력 후 확인 필요
      </p>
    </article>
  );
}

