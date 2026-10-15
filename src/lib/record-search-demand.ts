export function recordBrowserSearchDemand(query: string) {
  if (navigator.doNotTrack === "1" || !query.trim() || query.length > 200) return;
  try {
    const key = "dfmoa-search-tab";
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }
    void fetch("/api/search-demand", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, sessionId }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Search remains available when storage or anonymous measurement is disabled.
  }
}
