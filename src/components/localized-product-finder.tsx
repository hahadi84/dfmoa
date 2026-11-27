import { TravelerProductSearch } from "@/components/traveler-product-search";
import { internationalProductIds, shoppingPaths } from "@/lib/international";
import { products } from "@/lib/site-data";
import type { ShoppingLocale } from "@/lib/shopping-guides";

export function LocalizedProductFinder({ locale }: { locale: ShoppingLocale }) {
  const items = products.filter(product => internationalProductIds.includes(product.id)).map(product => {
    const serum = product.slug === "sulwhasoo-first-care-serum-90ml";
    return { slug: product.slug, name: product.displayName, koreanName: product.query, serum,
      href: serum ? `/${locale}${shoppingPaths.serum}` : `/${locale}/product/${product.slug}` };
  });
  return <TravelerProductSearch locale={locale} items={items}/>;
}
