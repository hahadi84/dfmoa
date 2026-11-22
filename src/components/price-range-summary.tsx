import { getPriceDisplay } from "@/lib/price-display";
import { formatKrw, formatUsd, getStoreById } from "@/lib/site-data";
import type { LiveOffer, SearchPriceRangeSummary } from "@/lib/search-types";

type PriceRangeSummaryProps = {
  offers: LiveOffer[];
  summary: SearchPriceRangeSummary;
};

export function PriceRangeSummary({ summary, offers }: PriceRangeSummaryProps) {
  const { storeCount, representative } = getPriceDisplay(offers);
  if (storeCount === 1) {
    const store = getStoreById(representative.storeId);
    return (
      <div className="metric-card">
        <p className="metric-title">{store?.name ?? representative.storeId} 최근 확인가</p>
        <p className="metric-value">{formatKrw(representative.krwPrice)}</p>
        <p className="metric-copy">{formatUsd(representative.usdPrice)} · 확인 시각 {representative.updatedAt}</p>
        <p className="metric-copy">공개가를 확인한 면세점 1곳</p>
      </div>
    );
  }

  if (!storeCount || !summary.offerCount || !summary.lowestOffer || !summary.highestOffer) {
    return null;
  }

  const lowestStore = getStoreById(summary.lowestOffer.storeId);
  const highestStore = getStoreById(summary.highestOffer.storeId);

  return (
    <>
      <div className="price-range-grid">
        <div className="metric-card">
          <p className="metric-title">현재 최저가</p>
          <p className="metric-value" style={{ fontSize: "1.2rem" }}>
            {formatKrw(summary.lowestOffer.krwPrice)}
          </p>
          <p className="metric-copy">
            {lowestStore?.name ?? summary.lowestOffer.storeId} · {formatUsd(summary.lowestOffer.usdPrice)}
          </p>
        </div>

        <div className="metric-card">
          <p className="metric-title">최고 확인가</p>
          <p className="metric-value" style={{ fontSize: "1.2rem" }}>
            {formatKrw(summary.highestOffer.krwPrice)}
          </p>
          <p className="metric-copy">
            {highestStore?.name ?? summary.highestOffer.storeId} · {formatUsd(summary.highestOffer.usdPrice)}
          </p>
        </div>

        <div className="metric-card">
          <p className="metric-title">가격 차이</p>
          <p className="metric-value" style={{ fontSize: "1.2rem" }}>
            {summary.spreadKrwPrice !== null ? formatKrw(summary.spreadKrwPrice) : "확인 필요"}
          </p>
          <p className="metric-copy">{storeCount}개 운영사 기준</p>
        </div>
      </div>
      <p className="price-range-note">최근 확인 공개가 기준입니다. 최종 결제가는 면세점 원본에서 확인하세요.</p>
    </>
  );
}
