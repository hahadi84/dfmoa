"use client";
import Link from "@/components/app-link";
import { useState, useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { shoppingCopy, type ShoppingLocale, shops } from "@/lib/shopping-guides";

export function useComparisonMeasurement(valid: boolean, language: string) {
  const sent = useRef(false);
  useEffect(() => {
    if (valid && !sent.current) {
      trackEvent("effective_price_calculate", {language, source_page: "traveler_compare"});
      sent.current = true;
    }
  }, [valid, language]);
}

export function BusanCatalogLink({locale, children}: {locale: ShoppingLocale; children: string}) {
  const anchor = locale === "en" ? "english-products" : "traveler-products";
  return <Link href={`/${locale}#${anchor}`} onClick={()=>trackEvent("shopping_catalog_open", {language:locale, source_page:"gimhae_pickup"})}>{children}</Link>;
}

export function ShopActions({locale, shop}: {locale: ShoppingLocale; shop: typeof shops[number]}) {
  const t = shoppingCopy[locale];
  const [status, setStatus] = useState("");
  const address = shop.name + " " + shop.address;
  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setStatus(t.copied);
    } catch {
      setStatus(t.fallback);
    }
  }
  const params = {language:locale, store:shop.id};
  return <><nav className="intl-section-nav">
    <button type="button" onClick={copyAddress}>{t.copy}</button>
    <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address)} onClick={()=>trackEvent("shopping_map_open", params)}>{t.map}</a>
    <a href={shop.url} onClick={()=>trackEvent("shopping_branch_open", params)}>{t.official}</a>
  </nav><span role="status">{status}</span></>;
}
