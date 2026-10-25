"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_PUBLISHER, ADSENSE_SLOTS, isAdSenseHost, isAdContentPath, canRequestAd, markAdRequested } from "@/lib/adsense-policy.mjs";
import { loadAdSense } from "@/lib/adsense-browser";
const subscribe=()=>()=>{};
const clientMode=()=>isAdSenseHost(window.location.hostname)?"production":"preview";
export function AdBanner({placement="results",slot}:{placement?:"top"|"results";slot?:string}) {
 const pathname=usePathname();
 const mode=useSyncExternalStore(subscribe,clientMode,()=>"unknown");
 const element=useRef<HTMLModElement>(null);
 const box=useRef<HTMLDivElement>(null);
 const [dimensions,setDimensions]=useState({width:0,height:placement==="top"?100:280});
 const adSlot=slot??ADSENSE_SLOTS[placement];
 const eligible=isAdContentPath(pathname);
 useEffect(()=>{
  if(!eligible || !box.current)return;
  const update=()=>{if(box.current){const r=box.current.getBoundingClientRect();setDimensions({width:Math.round(r.width),height:Math.round(r.height)});}};
  update();const observer=new ResizeObserver(update);observer.observe(box.current);return()=>observer.disconnect();
 },[eligible]);
 useEffect(()=>{
  if(mode!=="production" || !eligible || !/^\d+$/.test(adSlot) || !element.current)return;
  let cancelled=false,near=placement==="top",loaded=false;
  const target=element.current;
  const push=()=>{
   if(cancelled || !near || !loaded || !target.isConnected || !canRequestAd(window.location.hostname,target))return;
   markAdRequested(target);
   try { (window.adsbygoogle=window.adsbygoogle||([] as Record<string,never>[])).push({}); } catch { /* Do not retry or refresh a submitted slot. */ }
  };
  const size=new ResizeObserver(push);size.observe(target);
  const visibility=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){near=true;push();}},{rootMargin:"150px"});visibility.observe(target);
  loadAdSense().then(()=>{loaded=true;push();}).catch(()=>{});
  return()=>{cancelled=true;size.disconnect();visibility.disconnect();};
 },[mode,eligible,adSlot,placement]);
 if(!eligible)return null;
 return <aside className={`ad-banner ad-banner--${placement}`} aria-label="Advertisement"><span className="ad-banner__label">ADVERTISEMENT · 광고</span><div ref={box} className="ad-banner__space">
 {mode==="production" && adSlot ? <ins ref={element} className="adsbygoogle dfmoa-manual-ad" style={{display:"block",width:"100%",height:dimensions.height,minHeight:placement==="top"?90:280}} data-ad-client={ADSENSE_PUBLISHER} data-ad-slot={adSlot}/> : <div className="ad-banner__placeholder">AdSense 영역 ({dimensions.width||"가로"}×{dimensions.height})</div>}
 </div></aside>;
}
export function TopAdBanner(){const path=usePathname();if(path==="/search")return null;return <div className="container"><AdBanner key={path} placement="top"/></div>;}
