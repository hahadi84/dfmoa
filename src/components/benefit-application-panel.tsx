import Link from "@/components/app-link";
import { dutyFreeBenefitStores } from "@/lib/duty-free-benefits";
import { formatKrw, getStoreById } from "@/lib/site-data";
import type { LiveOffer } from "@/lib/search-types";

type BenefitApplicationPanelProps = {
  offers: LiveOffer[];
};

type BenefitKind = "sale" | "coupon" | "reward" | "card" | "gift" | "event";

const benefitLabels: Record<BenefitKind, string> = {
  sale: "공개 할인",
  coupon: "쿠폰",
  reward: "적립금",
  card: "카드",
  gift: "사은품",
  event: "이벤트",
};

const benefitTone: Record<BenefitKind, string> = {
  sale: "is-discount",
  coupon: "is-discount",
  reward: "is-reward",
  card: "is-card",
  gift: "is-benefit",
  event: "is-event",
};

function formatStoreName(name: string) {
  return name.replace(/면세점/g, "").replace(/\s+/g, "").trim();
}

function getPublicDiscountKrw(offer: LiveOffer) {
  if (offer.regularUsdPrice && offer.regularUsdPrice > offer.usdPrice && offer.usdPrice > 0) {
    const exchangeRate = offer.krwPrice / offer.usdPrice;
    return Math.max(Math.round(offer.regularUsdPrice * exchangeRate) - offer.krwPrice, 0);
  }

  if (offer.discountRate && offer.discountRate > 0 && offer.discountRate < 100) {
    const regularKrwPrice = Math.round(offer.krwPrice / (1 - offer.discountRate / 100));
    return Math.max(regularKrwPrice - offer.krwPrice, 0);
  }

  return 0;
}

function classifyBadge(value: string): BenefitKind {
  const normalized = value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");

  if (normalized.includes("쿠폰") || normalized.includes("coupon")) {
    return "coupon";
  }

  if (
    normalized.includes("적립") ||
    normalized.includes("포인트") ||
    normalized.includes("point") ||
    normalized.includes("h.oney") ||
    normalized.includes("honey")
  ) {
    return "reward";
  }

  if (normalized.includes("카드") || normalized.includes("card")) {
    return "card";
  }

  if (normalized.includes("사은") || normalized.includes("증정") || normalized.includes("gift")) {
    return "gift";
  }

  if (normalized.includes("세일") || normalized.includes("할인") || normalized.includes("sale")) {
    return "sale";
  }

  return "event";
}

function getBenefitKinds(offer: LiveOffer) {
  const kinds = new Set<BenefitKind>();

  if (getPublicDiscountKrw(offer) > 0 || offer.discountRate) {
    kinds.add("sale");
  }

  for (const badge of offer.eventBadges) {
    kinds.add(classifyBadge(badge));
  }

  return Array.from(kinds);
}

function getBenefitHomeUrl(offer: LiveOffer) {
  return dutyFreeBenefitStores.find((store) => store.storeId === offer.storeId)?.benefitHomeUrl ?? offer.sourceUrl;
}

export function BenefitApplicationPanel({ offers }: BenefitApplicationPanelProps) {
  if (!offers.length) {
    return null;
  }

  const visibleOffers = offers.slice(0, 4);
  const bestOffer = offers[0];
  const bestStore = getStoreById(bestOffer.storeId);
  const maxPublicDiscountKrw = Math.max(...offers.map((offer) => getPublicDiscountKrw(offer)));
  const storesWithBenefitSignals = offers.filter((offer) => getBenefitKinds(offer).length > 0).length;

  return (
    <div className="benefit-application-panel">
      <div className="benefit-application-head">
        <div>
          <span className="eyebrow">Benefit Check</span>
          <h3 className="card-title">이 상품 혜택 적용 예상</h3>
          <p className="section-copy">
            공개 가격에 반영된 할인과 추가 확인이 필요한 쿠폰·적립금을 분리했습니다.
          </p>
        </div>
        <div className="benefit-application-summary">
          <span>{bestStore ? formatStoreName(bestStore.name) : bestOffer.storeId} 최저</span>
          <strong>{formatKrw(bestOffer.krwPrice)}</strong>
        </div>
      </div>

      <div className="benefit-application-metrics">
        <div>
          <span>공개 할인 반영</span>
          <strong>{maxPublicDiscountKrw > 0 ? formatKrw(maxPublicDiscountKrw) : "없음"}</strong>
        </div>
        <div>
          <span>혜택 신호</span>
          <strong>{storesWithBenefitSignals}개 운영사</strong>
        </div>
        <div>
          <span>확정 기준</span>
          <strong>원본 결제 전 확인</strong>
        </div>
      </div>

      <div className="benefit-application-grid">
        {visibleOffers.map((offer) => {
          const store = getStoreById(offer.storeId);
          const kinds = getBenefitKinds(offer);
          const publicDiscountKrw = getPublicDiscountKrw(offer);

          return (
            <article key={`${offer.id}-benefit`} className="benefit-application-card">
              <div className="benefit-application-card-head">
                <strong>{store ? formatStoreName(store.name) : offer.storeId}</strong>
                <span>{formatKrw(offer.krwPrice)}</span>
              </div>
              <div className="benefit-application-row">
                <span>가격 할인</span>
                <strong>{publicDiscountKrw > 0 ? `${formatKrw(publicDiscountKrw)} 반영` : "공개가"}</strong>
              </div>
              <div className="benefit-chip-list">
                {kinds.length ? (
                  kinds.map((kind) => (
                    <span key={`${offer.id}-${kind}`} className={`benefit-action-button ${benefitTone[kind]}`}>
                      {benefitLabels[kind]}
                    </span>
                  ))
                ) : (
                  <span className="benefit-action-button is-benefit">추가 혜택 확인</span>
                )}
              </div>
              <p className="benefit-application-note">
                {kinds.some((kind) => kind === "coupon" || kind === "reward" || kind === "card")
                  ? "회원등급·출국일·결제수단 조건 확인 필요"
                  : "현재 수집가 기준으로 비교 가능"}
              </p>
              <div className="benefit-application-links">
                <a href={offer.sourceUrl} target="_blank" rel="noreferrer">
                  상품 원본
                </a>
                <a href={getBenefitHomeUrl(offer)} target="_blank" rel="noreferrer">
                  혜택 원본
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <p className="benefit-application-disclaimer">
        쿠폰·적립금·카드 할인은 로그인, 회원등급, 출국일, 결제수단에 따라 달라져 확정 결제가로 합산하지 않습니다.
      </p>

      <Link className="ghost-button benefit-application-more" href="/benefits">
        면세점별 혜택 전체 보기
      </Link>
    </div>
  );
}
