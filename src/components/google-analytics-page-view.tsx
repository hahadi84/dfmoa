"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GoogleAnalyticsPageViewProps = {
  measurementId: string;
};

export function GoogleAnalyticsPageView({ measurementId }: GoogleAnalyticsPageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    if (!hasMounted.current) {
      hasMounted.current = true;
      previousPath.current = pagePath;
      return;
    }

    if (previousPath.current === pagePath || typeof window.gtag !== "function") {
      return;
    }

    previousPath.current = pagePath;
    window.gtag("config", measurementId, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      debug_mode: searchParams.get("debug_mode") === "1",
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}
