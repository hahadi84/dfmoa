import type { ShoppingLocale } from "@/lib/shopping-guides";
export const selectionSources = {
 tourism:"https://english.visitkorea.or.kr/svc/contents/infoBscView.do?vcontsId=140738",
 crafts:"https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=929&vcontsId=250604",
};
export const countrySelections = {
 en: ["mask","serum","tea","gim","snack","stationery","socks","craft","sunglasses","busan"],
 ja: ["mask","cushion","lip","tea","gim","snack","socks","stationery","ramyeon","busan"],
 zh: ["serum","cushion","mask","lip","tea","ginseng","sunglasses","craft","snack","busan"],
} as const;
export type ShoppingPick = typeof countrySelections[ShoppingLocale][number];
// Descriptions explain editorial suitability, not observed national purchasing ranks.
export const countrySelectionCopy = {
 en: {
 title:"10 Korea shopping ideas for travelers from the US",
 intro:"Choose a gift you can pack comfortably for the journey home. These are editorial picks based on gift use and shopping routes, not a ranking of what Americans buy.",
 who:"Our reason to consider it", check:"Before buying", source:"Official background", next:"Shopping details", price:"Price and pack size unverified; check the selected item with the seller.",
 photo:"Category reference photo; not the exact item offered by a store. Resized and converted to WebP.",historic:"Historic Korean lacquer box: design reference, not a souvenir on sale.",
 map:"Confirmed shopping stops",mapNote:"The branches below are starting points for masks, tea and Busan-themed gifts. A map pin does not confirm that every item on this list is sold there.",
 labels:["Sheet masks","Sulwhasoo serum, 90ml","Individually wrapped tea bags","Packaged gim (seaweed)","Yakgwa sweets","Notebooks and pens","Socks","Korean motif crafts","Sunglasses","Busan-themed keepsakes"],
 reasons:["For friends who enjoy trying skincare; decide how many individual masks you need.","For a skincare enthusiast who already knows the product. Use our same-size comparison before spending more on a gift.","For a tea drinker; individual bags make it easier to divide a box.","For someone interested in Korean pantry ingredients; small sealed packs are a possible starting point.","For a sweet-toothed friend; look for a pack that protects the pieces during travel.","For a student or journal keeper; choose by paper size and the pen they use.","For several small gifts; choose a design and size for each recipient.","For someone who values a place-related keepsake; consider a small piece over a bulky box.","For yourself; try the fit rather than buying a frame only for its appearance.","For a reminder of a Busan visit; use the station guide before your KTX trip."],
 checks:["Ingredients, individual packaging and the actual number of masks.","Same edition, one90ml bottle and any included extras; a city checkout quote is still needed.","Ingredients, bag count, expiry and destination food rules.","Ingredients and customs guidance for the exact food; do not assume every flavour has the same conditions.","Ingredients, allergens, expiry and return-home food rules.","Paper format, ink compatibility and Korean-language text inside.","Size, fibre label and country of manufacture on the label.","Material, maker, fragility and a protective travel box.","Model, lens specification and fit; a specific shop and price need confirmation.","The shop is outside the KTX station; current stock and prices are unverified."],
 },
 ja: {
 title:"日本へ持ち帰る韓国のお土産・買い物候補10選",
 intro:"配る人数、荷物の大きさ、使う相手から選ぶ編集部の候補です。日本人の購入順位を示すランキングではありません。",
 who:"編集部のおすすめ理由",check:"買う前に確認",source:"公式の参考資料",next:"買い物の詳細",price:"価格・入数は未確認。選んだ商品の表示を店舗で確認してください。",
 photo:"品目の参考写真です。店舗の販売商品そのものではありません。縮小・WebP変換。",historic:"歴史的な韓国の漆箱。意匠の参考であり、販売品ではありません。",
 map:"確認済みの買い物スポット",mapNote:"下記店舗はマスク・お茶・釜山モチーフの品を探す出発点です。全10品の取扱いや在庫を保証する地図ではありません。",
 labels:["シートマスク","クッションファンデ","リップメイク","個包装ティーバッグ","個包装の韓国海苔","薬菓（ヤックァ）","靴下","ノート・ペン","袋入りラーメン","釜山モチーフの記念品"],
 reasons:["友人に少しずつ渡すコスメ候補。配る人数から必要枚数を決めましょう。","自分用のメイク候補。HERA15gなど既存の比較対象は色番をそろえて検討できます。","色を選ぶ楽しみのある自分用ギフト。店頭で色や仕上がりを確認してから。","職場や家族に分けたいときに。箱の中が個包装か確かめましょう。","料理好きの人へ。かさばり方と小分け袋の数で選びましょう。","甘いお土産を探す人へ。個別に配れる包装を選ぶと渡しやすくなります。","小さな実用品を贈りたいときに。相手のサイズと柄の好みから。","文具好きの人へ。ページの罫線やサイズを選ぶ楽しみがあります。","旅行中に気になった味の候補。荷物の余裕と持込条件を先に確認。","KTX前に釜山らしい記念品を探す人へ。駅周辺の店舗ガイドへ進んでください。"],
 checks:["1袋の枚数、原材料、個包装の有無。","色番、容量、本体とリフィルの構成。","色番、仕上がり、開封していない販売品の表示。","原材料、入り数、期限、日本への持込条件。","味付けの原材料、包装数、持込条件。","アレルギー表示、期限、包装数。","サイズ、素材、製造国表示。","用紙・罫線・表記言語。","スープや具材の肉成分など、商品の原材料と持込条件。","KTX駅舎の外です。当日の在庫・価格は未確認。"],
 },
 zh: {
 title:"回中国大陆前买什么？韩国购物候选10项",
 intro:"按送礼对象、规格核对和购买路线整理的编辑清单，不是中国游客购买量前十名。先挑选，再确认个人结账价和提货条件。",
 who:"编辑推荐理由",check:"购买前核对",source:"官方参考资料",next:"查看购物详情",price:"价格与包装数量未核实，请向销售方确认具体商品。",
 photo:"品类参考图，并非门店正在销售的具体商品。已缩小并转换为WebP。",historic:"历史上的韩国漆盒，仅供了解设计元素，并非在售纪念品。",
 map:"已确认的购物地点",mapNote:"下列门店用于查找面膜、茶和釜山主题礼品，不代表十项候选都在这些店有售或有库存。",
 labels:["雪花秀精华90ml","气垫粉底","片状面膜","唇妆","独立包装茶包","正官庄红参条","太阳镜","韩国纹样工艺品","药菓点心","釜山主题纪念品"],
 reasons:["送给已了解这款护肤品的人。先使用同容量比较，再决定是否下单。","给自己选底妆；按色号和替换芯配置比较，避免只看折扣。","给喜欢尝试护肤的朋友；按人数考虑独立包装。","适合自己挑选颜色；在门店核对色号与妆效。","送给喜欢喝茶的人；可按收礼人数选择单袋装。","仅在收礼人本来就使用此类产品时考虑；不作功效推荐。","给自己挑配饰；试戴并核对型号，再比较购买渠道。","给重视旅行纪念意义的人；选择便于保护的小件。","送给喜欢甜食的人；先挑适合分送的包装。","KTX出发前寻找旅行记忆；先查看站外门店位置。"],
 checks:["同代际90ml单瓶、赠品和折扣条件；市区实付价仍待确认。","色号、克重、主盒与替换芯数量。","原料、每包片数和独立包装。","色号、质地及销售包装标识。","原料、茶包数量、保质期和目的地入境条件。","具体配方、每条容量、30条装规格及目的地条件；不以此替代专业建议。","型号、镜片规格和试戴效果；具体门店与价格需另行确认。","材质、制作者、易碎程度及保护包装。","配料、过敏原、保质期与入境条件。","门店位于KTX站房外；当天库存和价格未核实。"],
 },
};
export const pickMedia: Record<ShoppingPick,string>={mask:"beauty",serum:"beauty",cushion:"beauty",lip:"beauty",tea:"tea",gim:"gim",snack:"snack",stationery:"stationery",socks:"socks",craft:"craft",sunglasses:"sunglasses",ramyeon:"ramyeon",ginseng:"beauty",busan:"craft"};
export const pickProduct: Partial<Record<ShoppingPick,string>>={serum:"p3",cushion:"p19",sunglasses:"p7",ginseng:"p71"};
