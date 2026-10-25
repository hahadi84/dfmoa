import type { Metadata } from "next";
import type { StoreId } from "@/lib/site-data";

export const INTERNATIONAL_UPDATED = "2026-10-25";
export const internationalProductIds = ["p1", "p3", "p10", "p11", "p12", "p14", "p15", "p17", "p18", "p24"];
export const englishStores: Record<StoreId, { name: string; url: string }> = {
  shilla: { name: "The Shilla Duty Free", url: "https://www.shilladfs.com/estore/kr/en/" },
  lotte: { name: "Lotte Duty Free", url: "https://eng.lottedfs.com/kr/" },
  hyundai: { name: "Hyundai Duty Free", url: "https://en.hddfs.com/" },
  shinsegae: { name: "Shinsegae Duty Free", url: "https://www.ssgdfs.com/en/main/initMain" },
};
export const internationalSources = {
  eligibility: "https://www.shilladfs.com/comm/kr/en/faqList",
  shopping: "https://m.shilladfs.com/comm/kr/en/shoppingGuideStep2",
  pickup: "https://en.hddfs.com/shop/om/consmCont/bcaInfo.do",
  refund: "https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=456&vcontsId=140736",
};
export function localizedMetadata(locale: "en" | "ja" | "zh", title: string, description: string, path: string, koreanPath?: string): Metadata {
 const suffix=path.replace(/^\/(en|ja|zh)(?=\/|$)/, "");
 const translated = suffix === "" || ["/compare", "/privacy", "/guide/incheon-duty-free-pickup"].includes(suffix) || suffix.startsWith("/product/");
 const languages={en:`/en${suffix}`,...(translated?{ja:`/ja${suffix}`,"zh-Hans":`/zh${suffix}`} : {}),...(koreanPath?{ko:koreanPath}:{})};
 const url=`https://www.dfmoa.com${path}`;
 return {title:{absolute:`${title} | DFMOA`},description,alternates:{canonical:path,languages},
 openGraph:{title,description,url,locale:{en:"en_US",ja:"ja_JP",zh:"zh_CN"}[locale],siteName:"DFMOA",type:"website",images:[{url:"https://www.dfmoa.com/og/default.png",width:1200,height:630,alt:"DFMOA"}]},
 twitter:{card:"summary_large_image",title,description,images:["https://www.dfmoa.com/og/default.png"]}};
}
export function englishMetadata(title: string, description: string, path: string, koreanPath?: string): Metadata {
 return localizedMetadata("en",title,description,path,koreanPath);
}
