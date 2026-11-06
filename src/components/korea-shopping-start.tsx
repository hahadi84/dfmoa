import { ShoppingActionLink } from "@/components/shopping-actions";
import { SafeProductImage } from "@/components/product-image";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { MyeongdongPhoto } from "@/components/shopping-photo";
import Link from "@/components/app-link";
import { internationalProductIds, shoppingPaths } from "@/lib/international";
import type { ShoppingLocale } from "@/lib/shopping-guides";

const copy = {
  en: {
    title: "Start your Korea shopping list",
    question: "What should I buy, and where should I go?",
    note: "Our editorial starting points are gift suitability, pack size and a purchase route you can check. Sulwhasoo and HERA are options for a beauty shortlist; international brands elsewhere on this page are price-comparison options. A listing here does not establish Korean manufacture or an item exclusive to Korea.",
    rows: [
      ["For a beauty lover", "Start with the Sulwhasoo 90ml comparison. Match the edition and bottle size; for makeup, confirm the shade and refill contents.", "Compare Sulwhasoo 90ml", shoppingPaths.serum],
      ["Small gifts for friends or colleagues", "Use the Myeongdong guide to find branches for sheet masks or individually wrapped tea bags. Check pack counts and ingredients before choosing.", "Find gifts and shops in Myeongdong", shoppingPaths.gifts],
      ["A Busan-themed keepsake before your train", "Check the Busan Station guide for Dongbaek Store’s location outside the station and documented gift categories. Prices and current stock need confirmation.", "Find the Busan Station gift stop", shoppingPaths.station],
    ],
    list: "10 Korea shopping ideas for US travelers",
    decision: "Choose a gift first, then compare the exact item and check how you can buy it. For something you need during your trip, use a city shop; departure pickup requires a qualifying flight and retailer confirmation.",
  },
  ja: {
    title: "韓国で買うものを、贈る相手から選ぶ",
    question: "韓国のお土産、何をどこで買う？",
    note: "贈る相手、内容量、確認できる購入先を基準にした編集部の候補です。コスメは雪花秀・HERAから検討できます。このページの海外ブランドは価格比較用の候補です。掲載だけで韓国製・韓国限定を意味するものではありません。",
    rows: [
      ["コスメ好きへの贈り物", "雪花秀90mlの比較から。同じ世代・容量をそろえ、メイク用品は色番とリフィルの有無を確認しましょう。", "雪花秀90mlの価格を確認", shoppingPaths.serum],
      ["友人や職場に配るお土産", "明洞ガイドでシートマスクや個包装ティーバッグを探せる店舗を確認。入り数と原材料を見て選びましょう。", "明洞のお土産と店舗を探す", shoppingPaths.gifts],
      ["KTXに乗る前に釜山らしい記念品", "釜山駅ガイドで、駅舎の外にある東栢商会の場所と取扱根拠のある品目を確認。価格・在庫は店舗への確認が必要です。", "釜山駅周辺の売り場を確認", shoppingPaths.station],
    ],
    list: "日本へ持ち帰る買い物候補10選を見る",
    decision: "まず贈るものを決め、同一商品の価格と買い方を確認しましょう。旅行中に使うものは市内店舗へ。出国時の受取は対象便や販売店の条件確認が必要です。",
  },
  zh: {
    title: "按送礼对象整理韩国购物清单",
    question: "来韩国买什么，去哪里买？",
    note: "编辑按送礼用途、包装规格和可核实的购买渠道整理候选。美妆可从雪花秀、HERA开始比较；本页其他国际品牌用于价格比较。收录不代表韩国制造或韩国限定。",
    rows: [
      ["送给喜欢美妆的人", "先看雪花秀90ml价格比较，核对代际和容量；选彩妆时确认色号及替换芯配置。", "比较雪花秀90ml", shoppingPaths.serum],
      ["分送朋友或同事的小礼物", "用明洞指南查找面膜、独立包装茶包的门店，按人数核对包装数量和配料。", "查找明洞伴手礼与门店", shoppingPaths.gifts],
      ["坐KTX前挑一件釜山主题纪念品", "釜山站指南说明站外东柏商会的位置及有资料支持的商品类别；价格和当天库存需向门店确认。", "查看釜山站购物地点", shoppingPaths.station],
    ],
    list: "查看回中国大陆前的10项购物候选",
    decision: "先决定送什么，再比较同款价格和购买方式。旅行途中就要用的商品可去市区门店；出境提货则需先确认航班与销售方条件。",
  },
};

export function KoreaShoppingStart({locale, context}: {locale: ShoppingLocale; context: "home" | "list"}) {
  const t = copy[locale];
  const beauty=getEnglishCatalog(["p3","p19","p24"]);
  return <section className="intl-guide-section">
    <h2>{context === "home" ? t.title : t.question}</h2>
    <p>{t.decision}</p>
    <div className="shopping-product-gallery">{beauty.map(item=><ShoppingActionLink key={item.id} locale={locale} source="shopping_gallery" kind="product" product={item.slug} href={`${internationalProductIds.includes(item.id)?`/${locale}`:""}/product/${item.slug}`}><SafeProductImage src={item.offers[0]?.imageUrl} alt={item.name} categorySlug={item.category} className="shopping-product-image"/><span>{item.name}{!internationalProductIds.includes(item.id) && <> · {{en:"Details in Korean",ja:"詳細は韓国語",zh:"韩文详情"}[locale]}</>}</span></ShoppingActionLink>)}</div>
    <ul>{t.rows.map(([title, body, label, route]) => <li key={route}>
      <h3>{title}</h3><p>{body}</p><Link href={`/${locale}${route}`}>{label}</Link>
    </li>)}</ul>
    <MyeongdongPhoto locale={locale}/>
    <p className="section-copy">{t.note}</p>
    {context === "home" && <Link href={`/${locale}${shoppingPaths.list}`}>{t.list}</Link>}
  </section>;
}
