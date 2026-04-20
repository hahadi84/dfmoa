import { getStoreById, type StoreId } from "@/lib/site-data";
import type { SourceHealth } from "@/lib/search-types";

function getHealthLabel(status: SourceHealth["status"]) {
  switch (status) {
    case "ok":
      return "정상";
    case "degraded":
      return "부분 확인";
    case "blocked":
      return "제한";
    case "error":
      return "오류";
    default:
      return "대기";
  }
}

function getHealthTone(status: SourceHealth["status"]) {
  switch (status) {
    case "ok":
      return "is-available";
    case "degraded":
      return "is-limited";
    case "blocked":
      return "is-soft";
    case "error":
      return "is-soldout";
    default:
      return "is-soft";
  }
}

export function SourceHealthPanel({ sourceHealth }: { sourceHealth: SourceHealth[] }) {
  if (!sourceHealth.length) {
    return null;
  }

  return (
    <article className="surface-card source-health-panel">
      <span className="eyebrow">Source Health</span>
      <h2 className="card-title">데이터 기준 시각</h2>
      <div className="source-health-grid">
        {sourceHealth.map((health) => {
          const store = getStoreById(health.sourceId as StoreId);

          return (
            <div key={health.sourceId} className="source-health-item">
              <strong>{store?.shortName ?? health.sourceId}</strong>
              <span className={`status-chip ${getHealthTone(health.status)}`}>{getHealthLabel(health.status)}</span>
              <small>{health.lastSuccessAt ? `성공 ${health.lastSuccessAt}` : `시도 ${health.lastAttemptedAt}`}</small>
              <small>{health.errorReason ? `원인 ${health.errorReason}` : health.note}</small>
            </div>
          );
        })}
      </div>
    </article>
  );
}

