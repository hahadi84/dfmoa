"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GoogleAnalyticsPageViewProps = {
  measurementId: string;
};

export function GoogleAnalyticsPageView({ measurementId }: GoogleAnalyticsPageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSentPath = useRef<string | null>(null);

  useEffect(() => {
    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    if (lastSentPath.current === pagePath) {
      return;
    }

    let attempts = 0;
    let timeoutId: number | undefined;
    let cancelled = false;

    const sendPageView = () => {
      if (cancelled) {
        return;
      }

      if (typeof window.gtag !== "function") {
        attempts += 1;
        if (attempts <= 20) {
          timeoutId = window.setTimeout(sendPageView, 250);
        }
        return;
      }

      lastSentPath.current = pagePath;
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
        send_to: measurementId,
        debug_mode: searchParams.get("debug_mode") === "1",
      });
    };

    timeoutId = window.setTimeout(sendPageView, 0);

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [measurementId, pathname, searchParams]);

  return null;
}
