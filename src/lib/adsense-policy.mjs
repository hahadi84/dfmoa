export const ADSENSE_PUBLISHER = "ca-pub-2271072565444318";
export const ADSENSE_SLOTS = { top: "9746388185", results: "2607098911" };
export function isAdSenseHost(hostname) { return hostname === "dfmoa.com" || hostname === "www.dfmoa.com"; }
export function isAdContentPath(pathname) {
 const path = pathname.replace(/^\/(en|ja|zh)(?=\/|$)/, "") || "/";
 return path === "/" || /^\/(product|category|brand|guide|airport|benefit-reports|deals)(\/|$)/.test(path) || ["/search","/price-compare","/compare","/japan","/travelers","/best-seller-examples"].includes(path);
}
const requested = new WeakSet();
export function canRequestAd(hostname, element) {
 return isAdSenseHost(hostname) && Boolean(element) && !requested.has(element) && !element.getAttribute("data-adsbygoogle-status") && !element.getAttribute("data-ad-status") && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0;
}
export function markAdRequested(element) { requested.add(element); }
