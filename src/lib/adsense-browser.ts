import { ADSENSE_PUBLISHER, isAdSenseHost } from "@/lib/adsense-policy.mjs";
declare global { interface Window { adsbygoogle?: { push: (value: Record<string, never>) => unknown }; } }
let scriptReady: Promise<void> | null = null;
export function loadAdSense(): Promise<void> {
 if (typeof window === "undefined" || !isAdSenseHost(window.location.hostname)) return Promise.reject(new Error("AdSense is disabled on this host"));
 if (scriptReady) return scriptReady;
 scriptReady = new Promise((resolve,reject) => {
   const existing=document.querySelector<HTMLScriptElement>('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
   if(existing){ resolve(); return; }
   const script=document.createElement("script");
   script.id="dfmoa-adsense-script";script.async=true;script.crossOrigin="anonymous";
   script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER}`;
   script.onload=()=>resolve();script.onerror=()=>reject(new Error("AdSense script unavailable"));
   document.head.appendChild(script);
 });
 return scriptReady;
}
