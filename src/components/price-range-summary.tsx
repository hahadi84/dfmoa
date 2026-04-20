import { formatKrw, formatUsd, getStoreById } from "@/lib/site-data";
import type { SearchPriceRangeSummary } from "@/lib/search-types";

type PriceRangeSummaryProps = {
  summary: SearchPriceRangeSummary;
};

export function PriceRangeSummary({ summary }: PriceRangeSummaryProps) {
  if (!summary.offerCount || !summary.lowestOffer || !summary.highestOffer) {
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
          <p className="metric-copy">{summary.offerCount}개 운영사 기준</p>
        </div>
      </div>
      <p className="price-range-note">최근 확인 공개가 기준입니다. 최종 결제가는 면세점 원본에서 확인하세요.</p>
    </>
  );
}
