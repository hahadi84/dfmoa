"use client";
import { AdBanner } from "@/components/ad-banner";
import { useState } from "react";
import Link from "@/components/app-link";
import { travelerCopy, type TravelerLocale } from "@/lib/traveler-locales";
import type { EnglishCatalogItem } from "@/lib/international-catalog";
import { compareShoppingCosts } from "@/lib/international-comparison";
import { trackEvent } from "@/lib/analytics";
import type { StoreId } from "@/lib/site-data";
import rate from "../../data/content/yen-rate.json";

export function TravelerCatalog({ items, locale }: { items: EnglishCatalogItem[]; locale: TravelerLocale }) {
 const t = travelerCopy[locale];
 const [category,setCategory] = useState("all");
 const [currency,setCurrency] = useState(locale === "ja" ? "JPY" : "KRW");
 return <section aria-labelledby="traveler-products"><h2 className="section-title" id="traveler-products">{items.length === 1 ? t.observed : t.products}</h2><p>{t.notice}</p>
 <div className="intl-filters">{items.length > 1 ? <label>{t.category}<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">{t.all}</option><option value="perfume">{t.perfume}</option><option value="beauty">{t.beauty}</option></select></label> : null}<label>{t.currency}<select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="KRW">{t.krw}</option><option value="USD">{t.usd}</option><option value="JPY">{t.jpy}</option></select></label></div>
 {currency === "JPY" ? <p className="section-copy">{t.fx} 1 JPY = {rate.rate} KRW · {rate.date} · ECB / Frankfurter</p> : null}
 <div className="intl-product-list">{items.filter(item=>category === "all" || item.category === category).map(item=>{
 const offer = item.offers[0]; const amount = !offer ? null : currency === "JPY" ? offer.krw/rate.rate : currency === "USD" ? offer.usd : offer.krw;
 const formatted = amount == null ? t.unconfirmed : new Intl.NumberFormat(t.format,{style:"currency",currency,currencyDisplay:"code",maximumFractionDigits:currency === "USD" ? 2 : 0}).format(amount);
 return <article className="intl-product-row" key={item.id}><div><p className="intl-brand">{item.brand}</p><h3><Link href={`/${locale}/product/${item.slug}`}><span lang="en">{item.name}</span></Link></h3><p>{offer ? `${t.stores[offer.storeId].name} · ${t.storefront}` : t.unconfirmed}</p></div><div className="intl-price"><strong>{currency === "JPY" && amount != null ? t.approx : ""}{formatted}</strong>{offer?.checkedAt ? <small>{t.time} {new Date(offer.checkedAt).toISOString().replace("T"," ").slice(0,16)} UTC</small> : null}<Link href={`/${locale}/product/${item.slug}`}>{t.details}</Link></div></article>;
 })}</div><p className="section-copy">{t.rankNote}</p></section>;
}
export function TravelerRetailerLink({locale,storeId,slug,price=0}:{locale:TravelerLocale;storeId:StoreId;slug:string;price?:number}) {
 const t=travelerCopy[locale],store=t.stores[storeId];
 return <a href={store.url} target="_blank" rel="noreferrer" onClick={()=>trackEvent("outbound_click_store",{store:storeId,product_slug:slug,price_krw:price,source_status:"localized_storefront_link",language:t.lang})}>{store.name} — {t.open}（{store.language}）</a>;
}
export function TravelerComparison({locale}:{locale:TravelerLocale}) {
 const t=travelerCopy[locale];const [values,setValues]=useState(["","","0","0","0"]);
 const complete=values.every(value=>value.trim()!=="");
 const result=complete?compareShoppingCosts(...values.map(Number) as [number,number,number,number,number]):null;
 const money=(value:number)=>new Intl.NumberFormat(t.format,{style:"currency",currency:"KRW",currencyDisplay:"code",maximumFractionDigits:0}).format(value);
 return <><section className="yen-calculator" aria-labelledby="localized-calculator"><h2 className="section-title" id="localized-calculator">{t.calcTitle}</h2><p>{t.calcIntro}</p><div className="yen-fields">{t.fields.map((label,i)=><label key={label}>{label}<input type="number" min="0" max={i>=3?100:undefined} step={i>=3?"0.1":"1"} value={values[i]} onChange={e=>setValues(values.map((value,index)=>i===index?e.target.value:value))}/></label>)}</div><div className="yen-result" aria-live="polite">{result?<><p>{t.dutyTotal}: <strong>{money(result.dutyTotal)}</strong></p><p>{t.storeTotal}: <strong>{money(result.storeTotal)}</strong></p><p>{Math.abs(result.difference)<0.5?t.equal:`${result.difference>0?t.duty:t.store}${t.lower}${money(Math.abs(result.difference))}`}</p></>:<p>{complete?t.invalid:t.enter}</p>}</div><p className="section-copy">{t.formula}</p></section>{result ? <AdBanner placement="results"/> : null}</>;
}
