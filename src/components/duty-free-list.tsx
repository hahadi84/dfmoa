import { ShoppingActionLink } from "@/components/shopping-actions";
import { shoppingCopy } from "@/lib/shopping-guides";
import { SafeProductImage } from "@/components/product-image";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { englishStores, internationalProductIds, internationalSources, localizedMetadata, shoppingPaths } from "@/lib/international";
import type { ShoppingLocale } from "@/lib/shopping-guides";

const groups = [["p3","p19","p24"],["p71","p81"],["p42","p67","p92"],["p10","p11"]];
const copy = {
 en: {
  title:"What to buy duty free in Korea: a shopping list for visitors",
  intro:"Compare skincare, red ginseng, boxed chocolates, accessories and fragrance before flying home. Start with the person you are buying for.",
  eligibility:"With a confirmed international departure, check your flight and passport details with the retailer. For online departure orders, confirm the item, your checkout price and the pickup airport before paying.",
  headings:["Skincare and makeup","Gifts to share or take home","Accessories and travel gear","Fragrance"],
  tips:["For a skincare gift, compare one 90ml serum with the same bottle in town. For a cushion, confirm the shade and whether a refill is included.","Check the number of sticks or chocolates per box before splitting a gift. Read the ingredient label and your destination’s food import rules.","Check the backpack colour and model, necklace finish or headphone model code before comparing prices.","Try the scent first if possible. Match the concentration and bottle size, then check liquid rules for any connecting flight."],
  observed:"Korean storefront observation", missing:"Matching price pending", details:"Product details", korean:"Product details in Korean", rules:"Official shopping eligibility", compare:"Compare duty free with a city store", pickup:"Gimhae pickup", incheon:"Incheon pickup",
 }, ja: {
  title:"韓国の免税店で何を買う？旅行者向け買い物リスト",
  intro:"雪花秀の美容液から紅参、箱入りチョコ、アクセサリー、香水まで。贈る相手に合わせて候補を選び、出国前に価格を確認できます。",
  eligibility:"国際線での出国が決まったら、販売店で便名と旅券情報を登録します。オンライン注文は商品ごとの決済額と出国空港での受取可否を確認してください。",
  headings:["スキンケアとメイク","配りやすいお土産","アクセサリーと旅行用品","香水"],
  tips:["美容液は市内の同じ90ml単品と比較。クッションは色番とリフィルの有無を確かめましょう。","配る人数に合わせて紅参スティックの本数やチョコの個数を確認。原材料と到着国の食品持込条件も確認しましょう。","バッグは色と型番、ネックレスは仕上げ、ヘッドホンはモデル番号を照合してください。","できれば先に試香し、濃度と容量をそろえて比較しましょう。乗継があれば液体の持込条件も確認してください。"],
  observed:"韓国語サイト掲載価格",missing:"同一商品の価格は確認待ち",details:"商品詳細",korean:"商品詳細（韓国語）",rules:"免税店の公式利用案内",compare:"市内購入と免税価格を比較",pickup:"金海空港での受取",incheon:"仁川空港での受取",
 }, zh: {
  title:"韩国免税店买什么？出境游客购物清单",
  intro:"从雪花秀精华、红参和盒装巧克力，到配饰和香水，按送礼对象挑选商品，再核对免税店价格。",
  eligibility:"确定国际出境行程后，请在免税店核对航班与护照信息。网上下单前，确认该商品的个人结账价及出境机场能否提货。",
  headings:["护肤和彩妆","适合分送的伴手礼","配饰和旅行用品","香水"],
  tips:["精华请与市区同款90ml单瓶比较；选气垫时核对色号及是否含替换芯。","按人数核对每盒红参条数或巧克力颗数。购买前请查看成分和目的地的食品入境规定。","背包看型号和颜色，项链看表面处理，耳机看完整型号，再比较同款价格。","有机会可先试香，再按相同浓度和容量比较。需要转机时，请核对液体携带要求。"],
  observed:"韩文网站采集价",missing:"同款价格待核实",details:"商品详情",korean:"商品详情（韩文）",rules:"免税店官方购物条件",compare:"比较市区和免税店价格",pickup:"金海机场提货",incheon:"仁川机场提货",
 },
};
export function listMetadata(locale: ShoppingLocale) {
 const t=copy[locale];
 return localizedMetadata(locale,t.title,t.intro,"/"+locale+shoppingPaths.list);
}
export function DutyFreeList({locale}:{locale:ShoppingLocale}) {
 const t=copy[locale];
 const items=getEnglishCatalog(groups.flat());
 return <article className="page-section"><div className="container intl-reading">
  <h1 className="page-title">{t.title}</h1><p className="page-description">{t.intro}</p>
  <p>{t.eligibility} <a href={internationalSources.eligibility}>{t.rules}</a></p>
  <nav className="intl-section-nav">{t.headings.map((heading,i)=><a key={heading} href={"#group-"+i}>{heading}</a>)}</nav>
  {groups.map((ids,i)=><section id={"group-"+i} key={ids[0]} className="intl-guide-section"><h2>{t.headings[i]}</h2><p>{t.tips[i]}</p>
   {items.filter(item=>ids.includes(item.id)).map(item=>{
    const offer=item.offers[0];
    const translated=internationalProductIds.includes(item.id);
    return <div key={item.id} className="intl-product-row"><div className="intl-item-summary">
     <SafeProductImage src={offer?.imageUrl} alt={item.name} className="intl-item-thumbnail" categorySlug={item.category}/>
     <div><h3 lang="en">{item.name}</h3>{offer ? <p>{t.observed} · {englishStores[offer.storeId].name} · KRW {offer.krw.toLocaleString(locale)} {offer.checkedAt && <time dateTime={offer.checkedAt}>{new Date(offer.checkedAt).toISOString().slice(0,16).replace("T"," ")} UTC</time>}</p> : <p>{t.missing}</p>}
     <p>{item.volume}</p>
     {offer && <p>{offer.discountRate != null && <>{shoppingCopy[locale].discount} {offer.discountRate}% · </>}{shoppingCopy[locale].dutyTerms} {offer.sourceUrl && <a href={offer.sourceUrl}>{shoppingCopy[locale].source}</a>}</p>}
     <ShoppingActionLink locale={locale} source="duty_free_list" kind="product" product={item.slug} href={(translated ? "/"+locale : "")+"/product/"+item.slug}>{translated?t.details:t.korean}</ShoppingActionLink></div></div></div>;
   })}</section>)}
  <nav className="intl-section-nav"><ShoppingActionLink locale={locale} source="duty_free_list" kind="compare" href={`/${locale}/compare`}>{t.compare}</ShoppingActionLink>
  <ShoppingActionLink locale={locale} source="duty_free_list" kind="pickup" href={`/${locale}/guide/incheon-duty-free-pickup`}>{t.incheon}</ShoppingActionLink><ShoppingActionLink locale={locale} source="duty_free_list" kind="pickup" href={"/"+locale+shoppingPaths.airport}>{t.pickup}</ShoppingActionLink></nav>
 </div></article>;
}
