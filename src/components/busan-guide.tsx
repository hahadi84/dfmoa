import { ShopActions, BusanCatalogLink } from "@/components/shopping-actions";
import { busanCopy, busanSources, stationShop } from "@/lib/busan-guides";
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
  const columns = station ? t.labels : t.cols;
  const rows = station ? t.goods.map(row => [...row, t.unknown]) : t.rows;
  return <article className="page-section"><div className="container intl-reading shopping-guide">
    <h1 className="page-title">{t[topic]}</h1>
    <h2>{station ? t.stationQ : t.airportQ}</h2><p>{station ? t.intro : t.flight}</p>
    <table><thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map(([name,detail,note]) => <tr key={name}><th scope="row">{name}</th><td>{detail}</td><td>{note}</td></tr>)}</tbody></table>
    {station ? <><p>{t.stock}</p><h2>{t.route}</h2>
      <p lang="ko">{stationShop.name}<br/>{stationShop.address}</p>
      <ShopActions locale={locale} shop={stationShop}/></> :
      <><p>{t.distinction}</p><nav className="intl-section-nav"><BusanCatalogLink locale={locale}>{t.compare}</BusanCatalogLink></nav></>}
    <p>{t.sources} · <time dateTime="2026-11-05">2026-11-05</time></p>
    <ul>{(station ? [
      ["Visit Busan", busanSources.visit], ["VISITKOREA", busanSources.tourism], ["Daily Busan", busanSources.city],
    ] : [["Korea Airports Corporation", busanSources.airport], ["Shilla · FAQ", busanSources.shillaTime],
      ["Shilla · Pickup", busanSources.shilla], ["Lotte · Pickup", busanSources.lotte]]).map(([label,url]) =>
        <li key={url}><a href={url}>{label}</a></li>)}</ul>
  </div></article>;
}
