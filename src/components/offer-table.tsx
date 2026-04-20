"use client";

import {
  formatKrw,
  formatUsd,
  getStatusLabel,
  getStatusTone,
  getStoreById,
} from "@/lib/site-data";
import { SafeProductImage } from "@/components/product-image";
import { trackEvent } from "@/lib/analytics";
import type { LiveOffer } from "@/lib/search-types";

type OfferTableProps = {
  offers: LiveOffer[];
  productSlug?: string;
};

export function OfferTable({ offers, productSlug }: OfferTableProps) {
  if (!offers.length) {
    return <p className="empty-state">현재 확인된 공개가가 없습니다. 공식 면세점 링크에서 판매 여부를 확인해 주세요.</p>;
  }

  const lowestPrice = offers[0]?.krwPrice;

  return (
    <div className="table-wrap">
      <table className="offer-table">
        <thead>
          <tr>
            <th>면세점</th>
            <th>상품</th>
            <th>달러</th>
            <th>원화</th>
            <th>공항</th>
            <th>상태</th>
            <th>링크</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const store = getStoreById(offer.storeId);
            const isBest = offer.krwPrice === lowestPrice;

            return (
              <tr key={offer.id} data-best={isBest || undefined}>
                <td title={store?.name ?? offer.storeId}>
                  <div className="table-store">
                    <strong>{store?.name ?? offer.storeId}</strong>
                    <span>{offer.note}</span>
                    {offer.eventBadges.length ? (
                      <div className="table-badge-row">
                        {offer.eventBadges.map((badge) => (
                          <span key={`${offer.id}-${badge}`} className="event-badge">
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td title={`${offer.brand} ${offer.title}`}>
                  <div className="table-product">
                    <SafeProductImage src={offer.imageUrl} alt={`${offer.brand} ${offer.title}`} className="product-thumb" />
                    <div className="table-store">
                      <strong>{offer.brand}</strong>
                      <span>{offer.title}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="table-price">
                    <strong>{formatUsd(offer.usdPrice)}</strong>
                    <span>{offer.discountRate ? `${offer.discountRate}% 할인` : "공개가"}</span>
                  </div>
                </td>
                <td>
                  <div className="table-price">
                    <strong>{formatKrw(offer.krwPrice)}</strong>
                    <span>{offer.updatedAt}</span>
                    <span className="status-chip is-available offer-price-state">최근 확인가</span>
                  </div>
                </td>
                <td title={offer.pickupAirports.join(" · ")}>{offer.pickupAirports.join(" · ")}</td>
                <td>
                  <span className={`status-chip ${getStatusTone(offer.status)}`}>
                    {getStatusLabel(offer.status)}
                  </span>
                </td>
                <td>
                  <a
                    href={offer.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackEvent("outbound_click_store", {
                        store: offer.storeId,
                        product_slug: productSlug ?? "search",
                        price_krw: offer.krwPrice,
                        source_status: offer.status,
                      })
                    }
                  >
                    원본에서 확인
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
