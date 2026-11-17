// Queue the first view before a client-only Suspense boundary can delay it.
// The route observer shares this marker so hydration never sends it twice.
export function analyticsBootstrap(tagId: string, measurementId: string) {
  const literal = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");
  return `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    var analyticsDebug = new URLSearchParams(window.location.search).get('debug_mode') === '1';
    window.gtag('config', ${literal(tagId)}, {
      send_page_view: false,
      ...(analyticsDebug ? {debug_mode: true} : {})
    });
    if (window.__dfmoaPageViewLocation !== window.location.href) {
      window.gtag('event', 'page_view', {
        page_path: window.location.pathname + window.location.search,
        page_location: window.location.href,
        page_title: document.title,
        send_to: ${literal(measurementId)},
        ...(analyticsDebug ? {debug_mode: true} : {})
      });
      window.__dfmoaPageViewLocation = window.location.href;
    }
  `;
}
