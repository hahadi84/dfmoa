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
import { shoppingCopy, shops, type ShoppingLocale } from "@/lib/shopping-guides";
import { busanCopy, busanSources, stationShop } from "@/lib/busan-guides";
import { BusanStationStop } from "@/components/busan-station-stop";

export function CountryShoppingList({locale}: {locale:ShoppingLocale}) {
 const t=countrySelectionCopy[locale];
 const catalog=getEnglishCatalog(["p3","p19","p7","p71"]);
 const routes={mask:shoppingPaths.gifts,tea:shoppingPaths.gifts,busan:shoppingPaths.station,craft:shoppingPaths.station,serum:shoppingPaths.serum};
 const listHeading = <><h2>{t.title}</h2><p>{t.intro}</p></>;
 return <section className="intl-guide-section country-shopping" id="country-shopping">
 {locale !== "ja" && listHeading}
 <nav className={locale === "ja" ? "intl-section-nav shopping-route-choices" : "intl-section-nav"} aria-label={{en:"Choose your shopping route",ja:"買い方を選ぶ",zh:"选择购买方式"}[locale]}>
  <ShoppingActionLink locale={locale} source="country_shopping" kind="shop_guide" href="#shopping-stops">{{en:"Find city gift shops",ja:"明洞のお店と地図を見る",zh:"查找市区礼品门店"}[locale]}</ShoppingActionLink>
  <ShoppingActionLink locale={locale} source="country_shopping" kind="compare" href={`/${locale}/compare`}>{{en:"Compare your checkout prices",ja:"市内と免税店の支払額を比べる",zh:"比较实际结账价"}[locale]}</ShoppingActionLink>
  <ShoppingActionLink locale={locale} source="country_shopping" kind="pickup" href={`/${locale}/guide/incheon-duty-free-pickup`}>{{en:"Check departure pickup",ja:"仁川空港の受け取り方",zh:"确认离境提货流程"}[locale]}</ShoppingActionLink>
  {locale === "ja" && <ShoppingActionLink locale={locale} source="country_shopping" kind="pickup" href={`/${locale}${shoppingPaths.airport}`}>金海空港の受け取り方</ShoppingActionLink>}
 </nav>
 {locale === "ja" && listHeading}
 <section aria-labelledby="purchase-start-title">
 <h3 id="purchase-start-title">{{en:"Start with a gift you can identify",ja:"商品と買い方を決める",zh:"先确定具体礼品与购买方式"}[locale]}</h3>
 <p>{{en:"Choose a recipient, then check the exact pack and buying route. These are editorial suggestions, not sales rankings. A global delivery listing does not confirm Korean store stock.",ja:"贈る相手から選び、容量・セット内容・購入経路を確認しましょう。販売ランキングではなく編集部の提案です。海外配送の商品掲載は韓国店舗の在庫を保証しません。",zh:"先按收礼人选择，再核对容量、包装和购买渠道。以下为编辑推荐，不是销量排名。国际商城商品页不能证明韩国门店有货。"}[locale]}</p>
 <div className="country-purchase-table" tabIndex={0} role="region" aria-label={{en:"Gift and buying route comparison",ja:"ギフトと購入経路の比較",zh:"礼品与购买渠道比较"}[locale]}>
 <table><thead><tr><th scope="col">{{en:"Gift / exact pack",ja:"ギフト・内容量",zh:"礼品与规格"}[locale]}</th><th scope="col">{{en:"Who it suits / what to verify",ja:"贈る相手・確認すること",zh:"适合谁与待确认事项"}[locale]}</th><th scope="col">{{en:"Next step",ja:"次の行動",zh:"下一步"}[locale]}</th></tr></thead>
 <tbody>{countrySelections[locale].filter(id => id in purchaseFacts).map(id => {
 const fact = purchaseFacts[id as keyof typeof purchaseFacts]; const index = countrySelections[locale].findIndex(candidate => candidate === id);
 return <tr key={id}><th scope="row">{fact.name}<nav className="mobile-purchase-actions">
 <ShoppingActionLink locale={locale} source="country_shopping" kind="shop_guide" product={id} href={id === "tea" ? `#shop-${shops[1].id}` : id === "mask" ? `#shop-${shops[0].id}` : "#shopping-stops"}>{{en:"Find shops",ja:"店舗を探す",zh:"查找门店"}[locale]}<span className="sr-only"> ({fact.name})</span></ShoppingActionLink>
 <ShoppingActionLink href={`/${locale}/compare`} locale={locale} source="country_shopping" kind="compare" product={id}>{{en:"Enter prices to compare",ja:"価格を入力して比較",zh:"输入价格进行比较"}[locale]}<span className="sr-only"> ({fact.name})</span></ShoppingActionLink>
 </nav></th><td>{t.reasons[index]}<br/>{id === "tea" ? {en:"Korean online price: KRW 8,800 / box, observed 23 Nov. Shipping and conditions below; branch price unverified.",ja:"韓国通販：1箱8,800ウォン、11月23日観察。送料・条件は下記。店頭価格は未確認。",zh:"韩国网店：每盒8,800韩元，11月23日观察。运费及条件见下方，门店价未核实。"}[locale] : {en:"Current Korean checkout price unverified. Check the exact pack before buying.",ja:"韓国の現在の決済価格は未確認。購入前に同じ構成か確認。",zh:"韩国当前实付价未核实，购买前须核对相同配置。"}[locale]}</td><td><a href={`#pick-${id}`}>{{en:"Check pack, seller and route",ja:"仕様・販売元・買い方を確認",zh:"查看规格、销售方及渠道"}[locale]}</a></td></tr>;
 })}</tbody></table></div></section>
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
    <img src={image.src} alt={`${t.photo} ${t.labels[i]}`} width="640" height="480" loading="lazy" className="country-shopping-image"/>
    <figcaption>{pickMedia[id]==="craft" ? t.historic : t.photo} <a href={image.source}>{image.author}</a> · <a href={image.licenseUrl}>{image.license}</a></figcaption>
   </figure>}
   <p><strong>{t.who}: </strong>{t.reasons[i]}</p><p><strong>{t.check}: </strong>{t.checks[i]}</p>
   {fact && <div className="shopping-purchase-facts"><p><strong>{fact.name}</strong></p><p>{fact[locale]}</p><p>{fact.seller} · <time dateTime={fact.checkedAt}>{fact.checkedAt}</time> · <ShoppingActionLink locale={locale} source="country_shopping" kind="official" product={id} href={fact.url}>{{en:"Official product specifications",ja:"公式の商品仕様",zh:"官方商品规格"}[locale]}</ShoppingActionLink></p>{"priceNote" in fact && <p>{fact.priceNote[locale]}</p>}</div>}
   {offer ? <p>{product!.name} · {englishStores[offer.storeId].name} · KRW {offer.krw.toLocaleString(locale)} · <time dateTime={offer.checkedAt??undefined}>{offer.checkedAt}</time> · {{en:"Korean storefront observation; verify your checkout conditions.",ja:"韓国語サイトの観察価格。決済条件を再確認してください。",zh:"韩文网站采集价，请核对个人结账条件。"}[locale]} <a href={offer.sourceUrl}>{t.source}</a></p> : <p>{fact ? {en:"Current Korean branch price unverified; confirm your checkout price and conditions with the seller.",ja:"韓国での現在の販売価格は未確認。決済価格と条件を販売店で確認してください。",zh:"韩国当前销售价格未核实，请向销售方确认结账价及条件。"}[locale] : t.price}</p>}
   <nav className="intl-section-nav">
    {shop && <ShoppingActionLink locale={locale} source="country_shopping" kind="shop_guide" product={id} href={`#shop-${shop.id}`}>{id === "busan"
      ? {en:"Check the shop’s opening notice",ja:"店舗の開店案内を確認",zh:"查看门店开业公告"}[locale]
      : {en:"Find this shopping stop",ja:"店舗の場所を確認",zh:"查看购物地点"}[locale]}</ShoppingActionLink>}
    {route && <Link href={`/${locale}${route}`}>{t.next}</Link>}
    {product && <ShoppingActionLink locale={locale} source="country_shopping" kind="product" product={product.slug} href={`${internationalProductIds.includes(product.id)?`/${locale}`:""}/product/${product.slug}`}>{product.name}{!internationalProductIds.includes(product.id) && <> · {{en:"Korean",ja:"韓国語",zh:"韩文"}[locale]}</>}</ShoppingActionLink>}
    <a href={id==="tea"?shops[1].url:id==="busan"?busanSources.visit:id==="craft"?selectionSources.crafts:selectionSources.tourism}>{t.source}</a>
   </nav>
  </section>{i===3 && <div className="country-shopping-ad"><AdBanner placement="results"/></div>}</Fragment>;
 })}</div>
 <p><a href={{en:"https://www.aphis.usda.gov/traveling-with-ag-products/another-country",ja:"https://www.maff.go.jp/pps/j/trip/keikouhin.html",zh:"https://online.customs.gov.cn/static/pages/guides/000629014002/000629014002.html"}[locale]}>{ {en:"Check US food and agricultural entry rules before choosing edible gifts",ja:"食品を選ぶ前に日本の検疫条件を確認",zh:"选择食品礼品前查看目的地海关条件"}[locale]}</a></p>
 <h2 id="shopping-stops">{t.map}</h2><p>{t.mapNote}</p>
 {shops.map((shop, index) => (
   <section className="country-shop" id={`shop-${shop.id}`} key={shop.id} lang={locale === "zh" ? "zh-Hans" : locale}>
     <h3>{shoppingCopy[locale].names[index]}</h3>
     <p lang="ko"><strong>{shop.name}</strong><br/>{shop.address}</p>
     <ShopActions locale={locale} shop={shop} source="country_shopping"/>
     <ShoppingMap locale={locale} name={shop.name} address={shop.address} store={shop.id} source="country_shopping"/>
   </section>
 ))}
 <section className="country-shop" id={`shop-${stationShop.id}`}>
   <h3>{busanCopy[locale].stationQ}</h3>
   <BusanStationStop locale={locale} source="country_shopping"/>
 </section>
 <p>{{en:"Editorial review",ja:"編集確認",zh:"编辑核对"}[locale]} · <time dateTime="2026-11-23">2026-11-23</time></p>
 </section>;
}
