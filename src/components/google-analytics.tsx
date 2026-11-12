import { Suspense } from "react";
import Script from "next/script";
import { GoogleAnalyticsPageView } from "@/components/google-analytics-page-view";

type GoogleAnalyticsProps = {
  tagId?: string;
  measurementId?: string;
};

export function GoogleAnalytics({ tagId, measurementId }: GoogleAnalyticsProps) {
  if (!tagId || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        id="dfmoa-google-analytics-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView measurementId={measurementId} />
      </Suspense>
    </>
  );
}
