export type AnalyticsEventName =
  | "outbound_dutyfree_click"
  | "affiliate_domestic_click"
  | "favorite_add"
  | "favorite_remove"
  | "price_alert_submit"
  | "effective_price_calculate"
  | "newsletter_subscribe_submit"
  | "search_suggestion_select"
  | "category_filter_apply"
  | "web_vital";

type AnalyticsValue = string | number | boolean | null | undefined;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params: Record<string, AnalyticsValue>) => void;
  }
}

const BLOCKED_PARAM_KEYS = new Set(["email", "phone", "token", "unsubscribe_token", "url", "href", "user_id"]);

function sanitizeParams(params: Record<string, AnalyticsValue>) {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (BLOCKED_PARAM_KEYS.has(key.toLowerCase())) {
        return false;
      }

      if (typeof value === "string" && value.includes("@")) {
        return false;
      }

      return true;
    })
  );
}

export function trackEvent(eventName: AnalyticsEventName, params: Record<string, AnalyticsValue> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, sanitizeParams(params));
}

export type WebVitalMetric = {
  name: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  pageType?: string;
};

export function trackWebVital(metric: WebVitalMetric) {
  trackEvent("web_vital", {
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 100) / 100,
    metric_rating: metric.rating,
    page_type: metric.pageType,
  });
}
