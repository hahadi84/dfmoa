import { Fragment } from "react";
import { AdBanner } from "@/components/ad-banner";
import Link from "@/components/app-link";
import { SafeProductImage } from "@/components/product-image";
import { ShoppingActionLink, ShopActions } from "@/components/shopping-actions";
import { ShoppingMap } from "@/components/shopping-map";
import { countrySelections, countrySelectionCopy, selectionSources, pickMedia, pickProduct } from "@/lib/country-shopping";
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
  return <Fragment key={id}><section className="country-shopping-item" id={`pick-${id}`} key={id}>
   <h3>{t.labels[i]}</h3>
   {offer?.imageUrl ? <SafeProductImage src={offer.imageUrl} alt={product!.name} className="country-shopping-image" categorySlug={product!.category}/> : image && <figure>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={image.src} alt={`${t.photo} ${image.title}`} width="640" height="480" loading="lazy" className="country-shopping-image"/>
    <figcaption>{pickMedia[id]==="craft" ? t.historic : t.photo} <a href={image.source}>{image.author}</a> · <a href={image.licenseUrl}>{image.license}</a></figcaption>
   </figure>}
   <p><strong>{t.who}: </strong>{t.reasons[i]}</p><p><strong>{t.check}: </strong>{t.checks[i]}</p>
   {offer ? <p>{product!.name} · {englishStores[offer.storeId].name} · KRW {offer.krw.toLocaleString(locale)} · <time dateTime={offer.checkedAt??undefined}>{offer.checkedAt}</time> · {{en:"Korean storefront observation; verify your checkout conditions.",ja:"韓国語サイトの観察価格。決済条件を再確認してください。",zh:"韩文网站采集价，请核对个人结账条件。"}[locale]} <a href={offer.sourceUrl}>{t.source}</a></p> : <p>{t.price}</p>}
   <nav className="intl-section-nav">
    {route && <Link href={`/${locale}${route}`}>{t.next}</Link>}
    {product && <ShoppingActionLink locale={locale} source="country_shopping" kind="product" product={product.slug} href={`${internationalProductIds.includes(product.id)?`/${locale}`:""}/product/${product.slug}`}>{product.name}{!internationalProductIds.includes(product.id) && <> · {{en:"Korean",ja:"韓国語",zh:"韩文"}[locale]}</>}</ShoppingActionLink>}
    <a href={id==="tea"?shops[1].url:id==="busan"?stationShop.url:id==="craft"?selectionSources.crafts:selectionSources.tourism}>{t.source}</a>
   </nav>
  </section>{i===3 && <div className="country-shopping-ad"><AdBanner placement="results"/></div>}</Fragment>;
 })}</div>
 <p><a href={{en:"https://www.aphis.usda.gov/traveling-with-ag-products/another-country",ja:"https://www.maff.go.jp/pps/j/trip/keikouhin.html",zh:"https://online.customs.gov.cn/static/pages/guides/000629014002/000629014002.html"}[locale]}>{ {en:"Check US food and agricultural entry rules before choosing edible gifts",ja:"食品を選ぶ前に日本の検疫条件を確認",zh:"选择食品礼品前查看目的地海关条件"}[locale]}</a></p>
 <h2>{t.map}</h2><p>{t.mapNote}</p>
 {[...shops,stationShop].map(shop=><section className="country-shop" key={shop.id}><h3 lang="ko">{shop.name}</h3><p lang="ko">{shop.address}</p><ShopActions locale={locale} shop={shop}/><ShoppingMap locale={locale} name={shop.name} address={shop.address} store={shop.id}/></section>)}
 <p>{{en:"Editorial review",ja:"編集確認",zh:"编辑核对"}[locale]} · <time dateTime="2026-11-06">2026-11-06</time></p>
 </section>;
}
