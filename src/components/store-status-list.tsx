import type { StoreSearchStatus } from "@/lib/search-types";

export type StoreStatusListItem = {
  key: string;
  href: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  accent?: string;
  description: string;
  state: StoreSearchStatus["state"];
  count: number;
  eventBadges?: string[];
};

type StoreStatusListProps = {
  items: StoreStatusListItem[];
};

function getSignalLabel(state: StoreSearchStatus["state"]) {
  switch (state) {
    case "live":
      return "확인 가능";
    case "blocked":
      return "원본 확인 필요";
    case "error":
      return "오류";
    default:
      return state;
  }
}

function formatStoreName(name: string) {
  return name.replace(/면세점/g, "").replace(/\s+/g, "").trim();
}

function formatCount(count: number) {
  if (!Number.isFinite(count) || count < 0) {
    return "0";
  }

  if (count > 99) {
    return "99+";
  }

  return String(count);
}

function getCompactDescription(item: StoreStatusListItem) {
  if (item.state === "live") {
    return item.count > 0 ? "확인" : "없음";
  }

  if (item.state === "blocked") {
    return "원본";
  }

  return "오류";
}

export function StoreStatusList({ items }: StoreStatusListProps) {
  return (
    <div className="status-list">
      {items.map((item) => {
        const displayName = formatStoreName(item.name);
        const title = [item.description, ...(item.eventBadges ?? [])].filter(Boolean).join(" · ");

        return (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="status-list-item"
            title={title}
          >
            <span className="store-logo-frame" aria-hidden="true">
              <span className="store-logo-fallback is-text-only" style={{ borderColor: item.accent }}>
                {item.shortName}
              </span>
            </span>

            <p className="status-copy">
              <strong className="status-name">{displayName}</strong>
              <span className="status-text">{getCompactDescription(item)}</span>
            </p>

            <span className="status-signal" aria-label={`${displayName} ${getSignalLabel(item.state)} ${item.count}건`}>
              <span className={`status-count ${item.count === 0 ? "is-zero" : ""}`}>{formatCount(item.count)}</span>
              <span className={`traffic-light is-${item.state}`} aria-hidden="true" />
            </span>
          </a>
        );
      })}
    </div>
  );
}
