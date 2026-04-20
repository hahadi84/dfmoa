import { formatKrw } from "@/lib/site-data";
import type { SearchHistorySummary } from "@/lib/search-types";

type PriceHistoryPanelProps = {
  history?: SearchHistorySummary;
};

function parseKstDate(value: string) {
  const date = new Date(`${value.replace(" ", "T")}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRecentValidPoints(history?: SearchHistorySummary) {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;

  return (history?.points ?? [])
    .filter((point) => typeof point.bestKrwPrice === "number")
    .filter((point) => {
      const date = parseKstDate(point.searchedAt);
      return date ? date.getTime() >= cutoff : true;
    })
    .map((point) => ({
      searchedAt: point.searchedAt,
      price: point.bestKrwPrice ?? 0,
    }));
}

export function PriceHistoryPanel({ history }: PriceHistoryPanelProps) {
  const points = getRecentValidPoints(history);
  const prices = points.map((point) => point.price);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const currentPrice = points.at(-1)?.price ?? null;
  const canDrawChart = points.length >= 7 && minPrice !== null && maxPrice !== null;
  const isNinetyDayLow = currentPrice !== null && minPrice !== null && currentPrice <= minPrice;
  const range = maxPrice !== null && minPrice !== null ? Math.max(maxPrice - minPrice, 1) : 1;
  const polyline = canDrawChart
    ? points
        .map((point, index) => {
          const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
          const y = 88 - ((point.price - (minPrice ?? 0)) / range) * 72;
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ")
    : "";

  return (
    <article className="surface-card history-lite-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">Price Trend</span>
          <h2 className="card-title">가격 추이</h2>
          <p className="section-copy">
            최근 90일 기준 유효 가격 포인트가 7개 이상이면 차트를 표시합니다.
          </p>
        </div>
        {isNinetyDayLow ? <span className="status-chip is-available">최근 90일 저점</span> : null}
      </div>

      {canDrawChart ? (
        <div className="history-lite-chart">
          <svg viewBox="0 0 100 100" role="img" aria-label="최근 90일 가격 추이">
            <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div className="history-lite-axis">
            <span>{minPrice ? formatKrw(minPrice) : "확인 필요"}</span>
            <span>{maxPrice ? formatKrw(maxPrice) : "확인 필요"}</span>
          </div>
        </div>
      ) : (
        <div className="empty-state history-lite-empty">
          <strong>가격 추이 준비 중</strong>
          <span>
            현재 {points.length}개 기록이 있습니다. 최소 7개 이상 쌓이면 최근 30일/90일 흐름을 표시합니다.
          </span>
        </div>
      )}

      <p className="featured-product-source">
        마지막 기록: {history?.lastRecordedAt ?? "최근 확인 시각 없음"}
      </p>
    </article>
  );
}

