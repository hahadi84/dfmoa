import { AdBanner } from "@/components/ad-banner";
import { BusanStationStop } from "@/components/busan-station-stop";
import { BusanCatalogLink, ShopOfficialLink, ShoppingNextSteps } from "@/components/shopping-actions";
import { busanCopy, busanSources, jaGimhaePickup, stationStatusCheckedAt } from "@/lib/busan-guides";
import { localizedMetadata, shoppingPaths } from "@/lib/international";
import type { ShoppingLocale } from "@/lib/shopping-guides";

type Topic = "station" | "airport";
export function busanMetadata(locale: ShoppingLocale, topic: Topic) {
  const t = busanCopy[locale];
  return localizedMetadata(locale, t[topic], topic === "station" ? t.stationDesc : t.airportDesc, "/" + locale + shoppingPaths[topic]);
}

export function BusanGuide({locale, topic}: {locale: ShoppingLocale; topic: Topic}) {
  const t = busanCopy[locale];
  const station = topic === "station";
  const japanesePickup = locale === "ja" && topic === "airport";
  const columns = station ? t.labels : t.cols;
  const rows = station ? t.goods.map(row => [...row, t.unknown]) : t.rows;
  const checkedAt = station ? stationStatusCheckedAt : japanesePickup ? jaGimhaePickup.checkedAt : "2026-11-05";
  const catalogLink = <BusanCatalogLink locale={locale}>{t.compare}</BusanCatalogLink>;
  const sources = station ? [["Visit Busan", busanSources.visit]]
    : japanesePickup ? [["韓国空港公社の空港売店案内（韓国語）", busanSources.airport]]
    : [["Korea Airports Corporation", busanSources.airport], ["Shilla · FAQ", busanSources.shillaTime],
      ["Shilla · Pickup", busanSources.shilla], ["Lotte · Pickup", busanSources.lotte]];
  return <article className="page-section"><div className="container intl-reading shopping-guide">
    <h1 className="page-title">{t[topic]}</h1>
    {japanesePickup ? <>
      <p>{t.flight}</p>
      <nav className="intl-section-nav pickup-guide-links" aria-label="免税店の公式案内">
        <ShopOfficialLink locale={locale} shop={{id: "shilla", url: jaGimhaePickup.shillaPickup}} source="gimhae_pickup" label="新羅の引渡場を確認"/>
        <ShopOfficialLink locale={locale} shop={{id: "lotte", url: jaGimhaePickup.lotteHelp}} source="gimhae_pickup" label="ロッテの受取・注文締切の案内"/>
      </nav>
      <h2>{t.airportQ}</h2>
    </> : <>
      <h2>{station ? t.stationQ : t.airportQ}</h2>
      {station ? <BusanStationStop locale={locale} source="shopping_guide"/> : <>
        <p>{t.flight}</p>
        <nav className="intl-section-nav">{catalogLink}</nav>
      </>}
    </>}
    <table><thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map(([name,detail,note]) => <tr key={name}><th scope="row">{name}</th><td>{detail}</td><td>{note}</td></tr>)}</tbody></table>
    {japanesePickup && <nav className="intl-section-nav pickup-guide-links" aria-label="注文前の確認と価格比較">
      <ShopOfficialLink locale={locale} shop={{id: "shilla", url: jaGimhaePickup.shillaOrder}} source="gimhae_order_deadline" label="新羅の注文手順を確認"/>
      {catalogLink}
    </nav>}
    <AdBanner placement="results"/>
    <p>{station ? t.stock : t.distinction}</p>
    <p>{t.sources} · <time dateTime={checkedAt}>{checkedAt}</time></p>
    <ul>{sources.map(([label,url]) =>
        <li key={url}><a href={url}>{label}</a></li>)}</ul>
  <ShoppingNextSteps locale={locale}/></div></article>;
}
