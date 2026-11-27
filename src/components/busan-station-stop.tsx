import { ShopActions, ShopOfficialLink } from "@/components/shopping-actions";
import { ShoppingMap } from "@/components/shopping-map";
import { busanCopy, stationShop } from "@/lib/busan-guides";
import type { ShoppingLocale } from "@/lib/shopping-guides";

export function BusanStationStop({locale, source}: {locale: ShoppingLocale; source: string}) {
  const t = busanCopy[locale];
  return <>
    <p>{t.intro}</p>
    <nav className="intl-section-nav">
      <ShopOfficialLink locale={locale} shop={stationShop} source={source} label={t.operator}/>
    </nav>
    <details>
      <summary>{t.route}</summary>
      <p lang="ko">{stationShop.name}<br/>{stationShop.address}</p>
      <ShopActions locale={locale} shop={stationShop} source={source} showOfficialLink={false}/>
      <ShoppingMap locale={locale} name={stationShop.name} address={stationShop.address} store={stationShop.id} source={source}/>
    </details>
  </>;
}
