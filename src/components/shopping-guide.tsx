import { ShoppingMap } from "@/components/shopping-map";
import { MyeongdongPhoto } from "@/components/shopping-photo";
import { busanCopy } from "@/lib/busan-guides";
import { SafeProductImage } from "@/components/product-image";
import Link from "@/components/app-link";
import { ShopActions } from "@/components/shopping-actions";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { englishStores, localizedMetadata, shoppingPaths } from "@/lib/international";
import { travelerCopy } from "@/lib/traveler-locales";
import { brandSource, shoppingCopy, shops, type ShoppingLocale } from "@/lib/shopping-guides";

type Guide = "serum" | "gifts";
export function shoppingMetadata(locale: ShoppingLocale, guide: Guide) {
  const t = shoppingCopy[locale];
  return localizedMetadata(locale, t[guide], guide === "serum" ? t.serumIntro : t.giftsIntro, "/" + locale + shoppingPaths[guide]);
}

export function ShoppingLinks({locale}: {locale: ShoppingLocale}) {
  const t = shoppingCopy[locale];
  return <><Link href={"/" + locale + shoppingPaths.list}>{{en:"What to buy in Korea",ja:"韓国で買うもの・お土産",zh:"韩国旅游购物清单"}[locale]}</Link>
    <Link href={"/" + locale + shoppingPaths.serum}>{t.menu[0]}</Link>
    <Link href={"/" + locale + shoppingPaths.gifts}>{t.menu[1]}</Link>
    <Link href={"/" + locale + shoppingPaths.station}>{busanCopy[locale].station}</Link>
    <Link href={"/" + locale + shoppingPaths.airport}>{busanCopy[locale].airport}</Link></>;
}

function Serum({locale}: {locale: ShoppingLocale}) {
  const t = shoppingCopy[locale];
  const product = getEnglishCatalog().find(item => item.id === "p3")!;
  return <><div className="intl-item-summary"><SafeProductImage src={product.offers[0]?.imageUrl} alt={product.name} categorySlug={product.category} className="intl-item-thumbnail"/><h2>{t.price}</h2></div><table><thead><tr>
    <th>{t.channel}</th><th>{t.amount}</th><th>{t.terms}</th>
  </tr></thead><tbody>
    {product.offers.map((offer,i) => <tr key={i}><th scope="row">
      {locale === "en" ? englishStores[offer.storeId].name : travelerCopy[locale].stores[offer.storeId].name}
      <small lang="ko">{offer.listingTitle}</small></th><td>KRW {offer.krw.toLocaleString(locale)}
      <small>{offer.checkedAt && new Date(offer.checkedAt).toISOString().replace("T"," ").slice(0,16) + " UTC"}</small></td>
      <td>{offer.discountRate != null && <strong>{t.discount} {offer.discountRate}% </strong>}{offer.regularUsd && offer.usd ? <small>USD {offer.regularUsd} → {offer.usd}</small> : null}{t.dutyTerms} {offer.sourceUrl && <a href={offer.sourceUrl}>{t.source}</a>}</td></tr>)}
    {!product.offers.length && <tr><td colSpan={3}>{t.missing}</td></tr>}
    <tr><th scope="row">{t.retail}</th><td>KRW 140,000<small>2026-11-05 08:39 KST</small></td><td>{t.retailTerms} <a href={brandSource}>{t.source}</a></td></tr>
  </tbody></table><h2>{t.decide}</h2><p>{t.advice}</p><nav className="intl-section-nav">
    <Link href={`/${locale}/product/${product.slug}`}>{t.details}</Link><Link href={`/${locale}/compare`}>{t.calc}</Link>
    <Link href={`/${locale}/guide/incheon-duty-free-pickup`}>{t.pickup}</Link></nav></>;
}

function Gifts({locale}: {locale: ShoppingLocale}) {
  const t = shoppingCopy[locale];
  return <><MyeongdongPhoto locale={locale}/><table><thead><tr><th>{t.gift}</th><th>{t.shop}</th></tr></thead>
    <tbody>{shops.map((shop,i)=><tr key={shop.id}><th scope="row">{t.items[i]}</th><td><a href={"#" + shop.id}>{t.names[i]}</a></td></tr>)}</tbody></table>
    {shops.map((shop,i)=><section id={shop.id} key={shop.id}><h2>{t.names[i]}</h2><p>{t.notes[i]}</p>
      <p lang="ko"><strong>{shop.name}</strong><br/>{shop.address}</p><ShopActions locale={locale} shop={shop}/><ShoppingMap locale={locale} name={shop.name} address={shop.address} store={shop.id}/></section>)}
    <p>{t.checked} · 2026-11-05</p><Link href={`/${locale}/compare`}>{t.calc}</Link></>;
}

export function ShoppingGuide({locale, guide}: {locale: ShoppingLocale; guide: Guide}) {
  const t = shoppingCopy[locale];
  return <article className="page-section"><div className="container intl-reading shopping-guide"><h1 className="page-title">{t[guide]}</h1>
    <p className="page-description">{guide === "serum" ? t.serumIntro : t.giftsIntro}</p>
    {guide === "serum" ? <Serum locale={locale}/> : <Gifts locale={locale}/>}</div></article>;
}
