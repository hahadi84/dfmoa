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

  const encodedMeasurementId = JSON.stringify(measurementId);

  return (
    <>
      <Script
        id="dfmoa-google-analytics-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
        strategy="afterInteractive"
      />
      <Script
        id="dfmoa-google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${encodedMeasurementId}, {
              send_page_view: false,
              debug_mode: new URLSearchParams(window.location.search).get('debug_mode') === '1'
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView measurementId={measurementId} />
      </Suspense>
    </>
  );
}
