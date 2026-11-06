import type { ShoppingLocale } from "@/lib/shopping-guides";
export function MyeongdongPhoto({locale}: {locale:ShoppingLocale}) {
 const t={en:{alt:"Pedestrians and shop signs along a Myeongdong shopping street",caption:"Myeongdong street · photographed 25 June 2026. Area photo; not a verified entrance photo of the branches below.",edit:"Resized and converted to WebP."},ja:{alt:"明洞の商店街を歩く人々と店舗の看板",caption:"明洞の通り・2026年6月25日撮影。周辺の参考写真です。下記店舗の入口写真ではありません。",edit:"縮小・WebP変換。"},zh:{alt:"明洞购物街上的行人与店铺招牌",caption:"明洞街景，摄于2026年6月25日。用于介绍周边环境，并非下列门店的已核实入口照片。",edit:"已缩小并转换为WebP。"}}[locale];
 return <figure className="shopping-photo">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src="/images/shopping/myeongdong-street.webp" alt={t.alt} width="960" height="1280" loading="lazy"/>
 <figcaption>{t.caption} <a href="https://commons.wikimedia.org/wiki/File:Myeongdong_street.jpg">Izzatfikry99 / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · {t.edit}</figcaption></figure>;
}
