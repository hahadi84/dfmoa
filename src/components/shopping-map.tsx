"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ShoppingLocale } from "@/lib/shopping-guides";

export function ShoppingMap({locale, name, address, store}: {locale:ShoppingLocale; name:string; address:string; store:string}) {
 const [open,setOpen]=useState(false);
 const t={en:{title:"Find this shop on the map",load:"Load Google Maps",note:"Loading the map connects to Google. Search results may vary; use the Korean name and address above to check the location."},ja:{title:"地図で売り場を確認",load:"Google マップを表示",note:"地図を表示するとGoogleに接続します。検索結果が異なる場合は上の韓国語名と住所を照合してください。"},zh:{title:"在地图上查找门店",load:"加载 Google 地图",note:"加载地图会连接至Google。搜索结果可能不同，请核对上方韩文名称与地址。"}}[locale];
 return <section className="shopping-map"><h3>{t.title}</h3><p>{t.note}</p>{open ? <iframe title={`${t.title}: ${name}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(name+' '+address)}&hl=${locale==='zh'?'zh-CN':locale}&output=embed`} width="800" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/> : <button type="button" onClick={()=>{setOpen(true);trackEvent("shopping_map_open",{language:locale,store,interaction:"embed_load"})}}>{t.load}</button>}</section>;
}
