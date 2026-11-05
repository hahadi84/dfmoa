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
      trackEvent("shopping_address_copy", {language:locale, store:shop.id});
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

export function ShoppingActionLink({href, locale, source, kind, product, children}: {
  href: string; locale: ShoppingLocale; source: string;
  kind: "product" | "compare" | "pickup"; product?: string; children: React.ReactNode;
}) {
  const events = {product:"shopping_product_open", compare:"shopping_compare_open", pickup:"shopping_pickup_open"} as const;
  return <Link href={href} onClick={()=>trackEvent(events[kind], {language:locale, source_page:source, product_slug:product})}>{children}</Link>;
}

export function ShoppingNextSteps({locale}: {locale: ShoppingLocale}) {
  const labels = {
    en:["Plan your shopping before ordering", "What to buy duty free in Korea", "Compare your checkout prices", "Check Incheon pickup conditions"],
    ja:["注文前に買い物を計画する", "韓国免税店で買うもの", "決済価格を比較する", "仁川空港の受取条件を確認"],
    zh:["下单前规划购物", "韩国免税店买什么", "比较实际结账价", "查看仁川机场提货条件"],
  }[locale];
  return <section className="intl-guide-section"><h2>{labels[0]}</h2><nav className="intl-section-nav">
    <Link href={`/${locale}/guide/korea-duty-free-shopping-list`}>{labels[1]}</Link>
    <ShoppingActionLink locale={locale} source="guide_next_steps" kind="compare" href={`/${locale}/compare`}>{labels[2]}</ShoppingActionLink>
    <ShoppingActionLink locale={locale} source="guide_next_steps" kind="pickup" href={`/${locale}/guide/incheon-duty-free-pickup`}>{labels[3]}</ShoppingActionLink>
  </nav></section>;
}
