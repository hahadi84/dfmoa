"use client";

import { AFFILIATE_DISCLOSURE_TEXT, getAffiliateLinkForProduct } from "@/lib/affiliate";
import { trackEvent } from "@/lib/analytics";
import { formatKrw, getStoreById, type Product } from "@/lib/site-data";
import { PriceLoadingCard } from "@/components/price-loading-card";
import { SafeProductImage } from "@/components/product-image";
import type { DomesticPriceResult } from "@/lib/domestic-price-types";
import type { LiveOffer } from "@/lib/search-types";

type DomesticPricePanelProps = {
  domestic: DomesticPriceResult | null;
  dutyFreeLowestOffer?: LiveOffer;
  error?: string | null;
  isLoading?: boolean;
  product?: Product;
  query: string;
};

function getSavingCopy(dutyFreePrice: number | undefined, domesticPrice: number | null) {
  if (!dutyFreePrice || !domesticPrice) {
    return {
      label: "비교 대기",
      value: "확인 필요",
      detail: "면세 공개가 확인 후 계산",
      tone: "is-neutral",
    };
  }

  const saving = domesticPrice - dutyFreePrice;
  const rate = Math.abs((saving / domesticPrice) * 100).toFixed(1);

  if (saving > 0) {
    return {
      label: "면세가 참고 우위",
      value: formatKrw(saving),
      detail: `국내 최저 후보 대비 ${rate}% 낮음`,
      tone: "is-good",
    };
  }

  if (saving < 0) {
    return {
      label: "국내가 참고 우위",
      value: formatKrw(Math.abs(saving)),
      detail: `면세 확인가보다 ${rate}% 낮음`,
      tone: "is-warn",
    };
  }

  return {
    label: "차이 없음",
    value: "동일",
    detail: "국내 최저 후보와 동일",
    tone: "is-neutral",
  };
}

export function DomesticPricePanel({
  domestic,
  dutyFreeLowestOffer,
  error,
  isLoading = false,
  product,
  query,
}: DomesticPricePanelProps) {
  const domesticLowest = domestic?.summary.lowestOffer ?? null;
  const domesticHighest = domestic?.summary.highestOffer ?? null;
  const saving = getSavingCopy(dutyFreeLowestOffer?.krwPrice, domesticLowest?.krwPrice ?? null);
  const dutyFreeStore = dutyFreeLowestOffer ? getStoreById(dutyFreeLowestOffer.storeId) : undefined;
  const affiliateLink = product ? getAffiliateLinkForProduct(product) : null;

  return (
    <article className="surface-card domestic-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">Local Market</span>
          <h2 className="card-title" style={{ fontSize: "1.1rem" }}>
            국내가 참고 비교
          </h2>
          <p className="section-copy" style={{ marginTop: 6 }}>
            면세점 공개가 비교와 분리해 국내 공개 검색가를 참고용으로 함께 봅니다.
          </p>
        </div>
        <span className={`status-chip domestic-verdict ${saving.tone}`}>{saving.label}</span>
      </div>

      <div className="affiliate-disclosure-card">
        <div>
          <strong>쿠팡 파트너스 링크</strong>
          <p>
            국내가는 배송비, 병행수입, 구성품, 카드할인, 판매자 조건 차이가 있을 수 있습니다. 제휴 여부는 면세점
            가격 순위에 영향을 주지 않습니다.
          </p>
          <small>{affiliateLink ? affiliateLink.disclosureText : "국내가 제휴 링크 준비 중입니다."}</small>
        </div>
        {affiliateLink ? (
          <a
            className="ghost-button"
            href={affiliateLink.url}
            target="_blank"
            rel={affiliateLink.rel}
            onClick={() =>
              trackEvent("affiliate_domestic_click", {
                product_id: product?.id,
                product_slug: product?.slug,
                affiliate_network: affiliateLink.network,
                page_type: "product",
                cta_type: "domestic_price",
              })
            }
          >
            {affiliateLink.label}
          </a>
        ) : null}
      </div>

      {isLoading ? (
        <PriceLoadingCard
          title="국내 판매가 확인 중"
          description="공개 검색 결과에서 같은 상품 후보를 보수적으로 확인하고 있습니다."
        />
      ) : null}
      {error ? <p className="empty-state">{error}</p> : null}

      {!isLoading && !error && domestic && domestic.offers.length ? (
        <>
          <div className="price-range-grid domestic-summary-grid">
            <div className="metric-card">
              <p className="metric-title">면세 확인가</p>
              <p className="metric-value" style={{ fontSize: "1.2rem" }}>
                {dutyFreeLowestOffer ? formatKrw(dutyFreeLowestOffer.krwPrice) : "원본 확인"}
              </p>
              <p className="metric-copy">{dutyFreeStore?.name ?? "면세점 공개가 확인 필요"}</p>
            </div>

            <div className="metric-card">
              <p className="metric-title">국내 최저 후보</p>
              <p className="metric-value" style={{ fontSize: "1.2rem" }}>
                {domesticLowest ? formatKrw(domesticLowest.krwPrice) : "확인 필요"}
              </p>
              <p className="metric-copy">
                {domesticLowest?.sourceName ?? "국내 공개 검색"} · {domestic.summary.offerCount}건
              </p>
            </div>

            <div className="metric-card">
              <p className="metric-title">{saving.label}</p>
              <p className="metric-value" style={{ fontSize: "1.2rem" }}>
                {saving.value}
              </p>
              <p className="metric-copy">{saving.detail}</p>
            </div>
          </div>

          <div className="domestic-range-row">
            <span>국내 중앙값 {domestic.summary.medianKrwPrice ? formatKrw(domestic.summary.medianKrwPrice) : "-"}</span>
            <span>국내 최고 후보 {domesticHighest ? formatKrw(domesticHighest.krwPrice) : "-"}</span>
            <span>조회 {domestic.searchedAt}</span>
          </div>

          <div className="table-wrap">
            <table className="offer-table domestic-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>상품</th>
                  <th>국내가</th>
                  <th>면세 대비</th>
                  <th>링크</th>
                </tr>
              </thead>
              <tbody>
                {domestic.offers.slice(0, 6).map((offer) => {
                  const diff = dutyFreeLowestOffer ? offer.krwPrice - dutyFreeLowestOffer.krwPrice : null;

                  return (
                    <tr key={`${offer.sourceId}-${offer.id}`}>
                      <td title={offer.sourceName}>
                        <div className="table-store">
                          <strong>{offer.sourceName}</strong>
                          <span>{offer.note}</span>
                        </div>
                      </td>
                      <td title={offer.title}>
                        <div className="table-product">
                          {offer.imageUrl ? (
                            <SafeProductImage
                              src={offer.imageUrl}
                              alt={`${offer.brand || offer.title} 국내 판매 이미지`}
                              className="product-thumb"
                            />
                          ) : (
                            <SafeProductImage alt={`${query} 국내 판매 이미지`} className="product-thumb" />
                          )}
                          <div className="table-store">
                            <strong>{offer.brand || offer.title}</strong>
                            <span>{offer.brand ? offer.title : query}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-price">
                          <strong>{formatKrw(offer.krwPrice)}</strong>
                          <span>{offer.discountRate ? `${offer.discountRate}% 할인` : "공개 판매가"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-chip ${diff && diff > 0 ? "is-available" : "is-limited"}`}>
                          {diff === null
                            ? "-"
                            : diff > 0
                              ? `면세 ${formatKrw(diff)} 참고 우위`
                              : `국내 ${formatKrw(Math.abs(diff))} 참고 우위`}
                        </span>
                      </td>
                      <td>
                        <a href={offer.sourceUrl} target="_blank" rel="noopener noreferrer">
                          원본 확인
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="featured-product-source">
            {AFFILIATE_DISCLOSURE_TEXT} 국내가는 공개 검색 결과 기준이며 배송비, 쿠폰, 병행수입, 옵션 구성에 따라 실제
            결제 금액이 달라질 수 있습니다.
          </p>
        </>
      ) : null}

      {!isLoading && !error && domestic && !domestic.offers.length ? (
        <p className="empty-state">국내 공개 검색에서 같은 상품 후보를 찾지 못했습니다.</p>
      ) : null}
    </article>
  );
}
