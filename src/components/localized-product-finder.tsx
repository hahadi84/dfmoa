import { TravelerProductSearch } from "@/components/traveler-product-search";
import { internationalProductIds, shoppingPaths } from "@/lib/international";
import { getHomePriceList } from "@/lib/home-price-list";
import { SafeProductImage } from "@/components/product-image";
import { ShoppingActionLink } from "@/components/shopping-actions";
import { englishStores } from "@/lib/international";
import { travelerCopy } from "@/lib/traveler-locales";
import { products, stores } from "@/lib/site-data";
import type { ShoppingLocale } from "@/lib/shopping-guides";

export function LocalizedProductFinder({ locale }: { locale: ShoppingLocale }) {
  const items = products.map(product => {
    const serum = product.slug === "sulwhasoo-first-care-serum-90ml";
    return { slug: product.slug, name: product.displayName, koreanName: product.query, serum,
      koreanDetail: !internationalProductIds.includes(product.id),
      href: !internationalProductIds.includes(product.id) ? `/product/${product.slug}` : serum ? `/${locale}${shoppingPaths.serum}` : `/${locale}/product/${product.slug}` };
  });
  const { lowestPriceItems } = getHomePriceList();
  const labels = {
    en: ["Recently observed duty-free prices", "Korean storefront prices. Check your offer before ordering.", "Details in Korean"],
    ja: ["最近確認した免税店価格", "韓国語サイトで確認した価格です。注文前に適用価格をご確認ください。", "詳細は韓国語"],
    zh: ["近期采集的免税店价格", "价格来自韩文店铺页面，下单前请核对实际售价。", "韩文详情"],
  }[locale];
  return <div className="traveler-home-search"><TravelerProductSearch locale={locale} items={items}/>
    {lowestPriceItems.length > 0 && <section><h2>{labels[0]}</h2><p>{labels[1]}</p>
      <div className="traveler-price-rows">{lowestPriceItems.map(item => {
        const localized = internationalProductIds.includes(item.product.id);
        const store = stores.find(store => store.shortName === item.storeName);
        const storeName = store ? (locale === "en" ? englishStores : travelerCopy[locale].stores)[store.id].name : item.storeName;
        return <ShoppingActionLink key={item.product.id} locale={locale} source="home_recent_prices" kind="product" product={item.product.slug}
          href={`${localized ? "/" + locale : ""}/product/${item.product.slug}`}>
          <SafeProductImage src={item.imageUrl} alt="" categorySlug={item.product.categorySlug}/>
          <span>{item.product.displayName}<small>{storeName} · {item.timestamp} KST</small></span>
          <strong>₩{item.priceKrw.toLocaleString("en-US")}{!localized && <small>{labels[2]}</small>}</strong>
        </ShoppingActionLink>;
      })}</div></section>}
  </div>;
}
