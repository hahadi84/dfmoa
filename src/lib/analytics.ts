export type AnalyticsEventName =
  | "outbound_click_store"
  | "outbound_dutyfree_click"
  | "affiliate_domestic_click"
  | "favorite_add"
  | "favorite_remove"
  | "price_alert_submit"
  | "effective_price_calculate"
  | "weekly_report_subscribe"
  | "newsletter_subscribe_submit"
  | "search_submit"
  | "search_suggestion_select"
  | "category_filter_apply"
  | "web_vital";

type AnalyticsValue = string | number | boolean | null | undefined;

export type GAEvent =
  | {
      name: "outbound_click_store";
      params: {
        store: "shilla" | "lotte" | "shinsegae" | "hyundai";
        product_slug: string;
        price_krw: number;
        source_status: string;
      };
    }
  | { name: "favorite_add"; params: { product_slug: string; source_page: string } }
  | { name: "favorite_remove"; params: { product_slug: string; source_page: string } }
  | {
      name: "price_alert_submit";
      params: {
        product_slug: string;
        threshold_krw: number;
        trigger_mode: "public_price" | "estimated_price";
      };
    }
  | { name: "weekly_report_subscribe"; params: { source_page: string; ad_consent: boolean } }
  | { name: "search_submit"; params: { query: string; results_count?: number } };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      targetIdOrEventName: string | Date,
      params?: Record<string, AnalyticsValue>
    ) => void;
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

function shouldUseDebugMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("debug_mode") === "1";
}

export function trackEvent(eventName: AnalyticsEventName, params: Record<string, AnalyticsValue> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, sanitizeParams({ ...params, debug_mode: shouldUseDebugMode() || undefined }));
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
