import { Fragment } from "react";
import { AdBanner } from "@/components/ad-banner";
import Link from "@/components/app-link";
import { SafeProductImage } from "@/components/product-image";
import { ShoppingActionLink, ShopActions } from "@/components/shopping-actions";
import { ShoppingMap } from "@/components/shopping-map";
import { countrySelections, countrySelectionCopy, selectionSources, pickMedia, pickProduct } from "@/lib/country-shopping";
import purchaseFacts from "@/lib/shopping-purchase-facts.json";
import images from "@/lib/shopping-category-images.json";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { englishStores, internationalProductIds, shoppingPaths } from "@/lib/international";
import { shops, type ShoppingLocale } from "@/lib/shopping-guides";
import { stationShop } from "@/lib/busan-guides";

export function CountryShoppingList({locale}: {locale:ShoppingLocale}) {
 const t=countrySelectionCopy[locale];
 const catalog=getEnglishCatalog(["p3","p19","p7","p71"]);
 const routes={mask:shoppingPaths.gifts,tea:shoppingPaths.gifts,busan:shoppingPaths.station,craft:shoppingPaths.station,serum:shoppingPaths.serum};
 return <section className="intl-guide-section country-shopping" id="country-shopping">
 <h2>{t.title}</h2><p>{t.intro}</p>
 <nav className="intl-section-nav">{countrySelections[locale].map((id,i)=><a key={id} href={`#pick-${id}`}>{t.labels[i]}</a>)}</nav>
 <div className="country-shopping-grid">{countrySelections[locale].map((id,i)=>{
  const product=catalog.find(p=>p.id===pickProduct[id]); const offer=product?.offers[0];
  const image=id==="ginseng" ? null : images[pickMedia[id] as keyof typeof images];
  const route=routes[id as keyof typeof routes];
  const fact=purchaseFacts[id as keyof typeof purchaseFacts];
  const shop = id === "mask" ? shops[0] : id === "tea" ? shops[1] : id === "busan" ? stationShop : undefined;
  return <Fragment key={id}><section className="country-shopping-item" id={`pick-${id}`} key={id}>
   <h3>{t.labels[i]}</h3>
   {offer?.imageUrl ? <SafeProductImage src={offer.imageUrl} alt={product!.name} className="country-shopping-image" categorySlug={product!.category}/> : image && <figure>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={image.src} alt={`${t.photo} ${image.title}`} width="640" height="480" loading="lazy" className="country-shopping-image"/>
    <figcaption>{pickMedia[id]==="craft" ? t.historic : t.photo} <a href={image.source}>{image.author}</a> · <a href={image.licenseUrl}>{image.license}</a></figcaption>
   </figure>}
   <p><strong>{t.who}: </strong>{t.reasons[i]}</p><p><strong>{t.check}: </strong>{t.checks[i]}</p>
   {fact && <div className="shopping-purchase-facts"><p><strong>{fact.name}</strong></p><p>{fact[locale]}</p><p>{fact.seller} · <time dateTime="2026-11-16">2026-11-16</time> · <a href={fact.url}>{{en:"Official product specifications",ja:"公式の商品仕様",zh:"官方商品规格"}[locale]}</a></p></div>}
   {offer ? <p>{product!.name} · {englishStores[offer.storeId].name} · KRW {offer.krw.toLocaleString(locale)} · <time dateTime={offer.checkedAt??undefined}>{offer.checkedAt}</time> · {{en:"Korean storefront observation; verify your checkout conditions.",ja:"韓国語サイトの観察価格。決済条件を再確認してください。",zh:"韩文网站采集价，请核对个人结账条件。"}[locale]} <a href={offer.sourceUrl}>{t.source}</a></p> : <p>{fact ? {en:"Current Korean shop price unverified; confirm your checkout price and conditions with the seller.",ja:"韓国での現在の販売価格は未確認。決済価格と条件を販売店で確認してください。",zh:"韩国当前销售价格未核实，请向销售方确认结账价及条件。"}[locale] : t.price}</p>}
   <nav className="intl-section-nav">
    {shop && <a href={`#shop-${shop.id}`}>{{en:"Find this shopping stop",ja:"店舗の場所を確認",zh:"查看购物地点"}[locale]}</a>}
    {route && <Link href={`/${locale}${route}`}>{t.next}</Link>}
    {product && <ShoppingActionLink locale={locale} source="country_shopping" kind="product" product={product.slug} href={`${internationalProductIds.includes(product.id)?`/${locale}`:""}/product/${product.slug}`}>{product.name}{!internationalProductIds.includes(product.id) && <> · {{en:"Korean",ja:"韓国語",zh:"韩文"}[locale]}</>}</ShoppingActionLink>}
    <a href={id==="tea"?shops[1].url:id==="busan"?stationShop.url:id==="craft"?selectionSources.crafts:selectionSources.tourism}>{t.source}</a>
   </nav>
  </section>{i===3 && <div className="country-shopping-ad"><AdBanner placement="results"/></div>}</Fragment>;
 })}</div>
 <p><a href={{en:"https://www.aphis.usda.gov/traveling-with-ag-products/another-country",ja:"https://www.maff.go.jp/pps/j/trip/keikouhin.html",zh:"https://online.customs.gov.cn/static/pages/guides/000629014002/000629014002.html"}[locale]}>{ {en:"Check US food and agricultural entry rules before choosing edible gifts",ja:"食品を選ぶ前に日本の検疫条件を確認",zh:"选择食品礼品前查看目的地海关条件"}[locale]}</a></p>
 <h2>{t.map}</h2><p>{t.mapNote}</p>
 {[...shops,stationShop].map(shop=><section className="country-shop" id={`shop-${shop.id}`} key={shop.id}><h3 lang="ko">{shop.name}</h3><p lang="ko">{shop.address}</p><ShopActions locale={locale} shop={shop}/><ShoppingMap locale={locale} name={shop.name} address={shop.address} store={shop.id}/></section>)}
 <p>{{en:"Editorial review",ja:"編集確認",zh:"编辑核对"}[locale]} · <time dateTime="2026-11-16">2026-11-16</time></p>
 </section>;
}
