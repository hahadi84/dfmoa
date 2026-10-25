"use client";
import { useState } from "react";
import Link from "@/components/app-link";
import type { EnglishCatalogItem } from "@/lib/international-catalog";
import { englishStores } from "@/lib/international";
import rate from "../../data/content/yen-rate.json";

export function InternationalCatalog({ items }: { items: EnglishCatalogItem[] }) {
  const [category, setCategory] = useState("all");
  const [currency, setCurrency] = useState("KRW");
  const visible = items.filter(item => category === "all" || item.category === category);
  return <section aria-labelledby="english-products"><div className="section-head"><div><h2 id="english-products" className="section-title">{items.length === 1 ? "Observed price" : "Compare selected products"}</h2><p className="section-copy">Observed Korean-storefront prices. English-storefront checkout prices and promotions may differ.</p></div></div>
    <div className="intl-filters">{items.length > 1 ? <label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option value="all">All products</option><option value="perfume">Fragrance</option><option value="beauty">Skincare & makeup</option></select></label> : null}<label>Price display<select value={currency} onChange={e => setCurrency(e.target.value)}><option value="KRW">KRW — observed price</option><option value="USD">USD — source-listed price</option><option value="JPY">JPY — estimated conversion</option></select></label></div>
    {currency === "JPY" ? <p className="section-copy">JPY estimates use KRW ÷ {rate.rate}, dated {rate.date} (ECB via Frankfurter). Card fees and the retailer’s exchange rate are excluded.</p> : null}
    <div className="intl-product-list">{visible.map(item => { const offer = item.offers[0];
      const amount = !offer ? null : currency === "JPY" ? offer.krw / rate.rate : currency === "USD" ? offer.usd : offer.krw;
      const formatted = amount == null ? "Price not confirmed" : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 }).format(amount);
      return <article className="intl-product-row" key={item.id}><div><p className="intl-brand">{item.brand}</p><h3><Link href={`/en/product/${item.slug}`}>{item.name}</Link></h3><p className="section-copy">{offer ? `${englishStores[offer.storeId].name} · Korean storefront` : "Check the retailer for availability"}</p></div><div className="intl-price"><strong>{currency === "JPY" && amount != null ? "Approx. " : ""}{formatted}</strong>{offer?.checkedAt ? <small>Observed {new Date(offer.checkedAt).toISOString().replace("T", " ").slice(0,16)} UTC</small> : null}<Link href={`/en/product/${item.slug}`}>View price details</Link></div></article>;
    })}</div><p className="section-copy">Selection for comparison, not a sales ranking. Prices are not a stock or checkout guarantee.</p>
  </section>;
}
