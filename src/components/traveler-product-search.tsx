"use client";

import { useState } from "react";
import { ShoppingActionLink } from "@/components/shopping-actions";
import type { ShoppingLocale } from "@/lib/shopping-guides";

const copy = {
  en: ["Search duty-free products", "Try Sulwhasoo 90ml", "No matching product. Try a brand or check the size."],
  ja: ["免税品を検索", "例：雪花秀 ユンジョエッセンス 90ml", "該当する商品がありません。ブランド名や容量を確認してください。"],
  zh: ["搜索免税商品", "例如：雪花秀润燥精华 90ml", "没有匹配的商品。请试试品牌名称，或确认容量。"],
};
const serumNames = {
  en: "Sulwhasoo First Care Activating Serum 90ml",
  ja: "雪花秀 ユンジョエッセンス 90ml",
  zh: "雪花秀润致焕活肌底精华露 90ml",
};
function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/毫升/g, "ml");
}
export function TravelerProductSearch({ locale, items }: {
  locale: ShoppingLocale;
  items: {slug: string; name: string; koreanName: string; href: string; serum: boolean}[];
}) {
  const [query, setQuery] = useState("");
  const [label, example, empty] = copy[locale];
  const tokens = normalize(query).replace(/(\d+(?:\.\d+)?)\s*ml/g, " $1ml ").trim().split(/\s+/).filter(Boolean);
  const matches = tokens.length ? items.filter(item => {
    const names = [item.name, item.koreanName];
    if (item.serum) names.push(...Object.values(serumNames), "ソルファス 導入美容液 雪花秀润燥精华");
    const searchable = normalize(names.join(" ")).replace(/\s/g, "");
    const sizes = normalize(item.name).match(/\d+(?:\.\d+)?\s*ml/g)?.map(size => size.replace(/\s/g, ""));
    return tokens.every(token => /^\d+(?:\.\d+)?ml$/.test(token) ? sizes?.includes(token) : searchable.includes(token));
  }) : [];
  return <section className="intl-guide-section" role="search" aria-label={label}>
    <label htmlFor="traveler-product-search">{label}</label>
    <input className="search-input" id="traveler-product-search" type="search" placeholder={example}
      value={query} onChange={event => setQuery(event.target.value)} />
    {matches.length > 0 && <ul>{matches.map(item => <li key={item.slug}>
      <ShoppingActionLink locale={locale} source="traveler_home_search" kind="product" product={item.slug} href={item.href}>
        {item.serum ? serumNames[locale] : item.name}
      </ShoppingActionLink>
    </li>)}</ul>}
    <div role="status">{tokens.length > 0 && matches.length === 0 ? empty : ""}</div>
  </section>;
}
