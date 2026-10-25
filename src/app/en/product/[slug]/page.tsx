import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { InternationalCatalog } from "@/components/international-catalog";
import { InternationalRetailerLink } from "@/components/international-retailer-link";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { englishMetadata, englishStores } from "@/lib/international";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getEnglishCatalog().map(item => ({ slug: item.slug })); }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params; const item = getEnglishCatalog().find(item => item.slug === slug);
  return item ? englishMetadata(`${item.name} Korea duty-free price`, `Check observed prices for ${item.name}, compare exact size and open official English retailer websites. Passport and international departure required.`, `/en/product/${slug}`, `/product/${slug}`) : {};
}
export default async function EnglishProduct({ params }: Props) {
  const { slug } = await params; const item = getEnglishCatalog().find(item => item.slug === slug); if (!item) notFound();
  return <section className="page-section"><div className="container"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBreadcrumbJsonLd([{ name: "Korea duty-free comparison", path: "/en" }, { name: item.name, path: `/en/product/${slug}` }])) }} />
    <div className="breadcrumb"><Link href="/en">Compare products</Link><span>/</span><span>{item.brand}</span></div><h1 className="page-title">{item.name} duty-free price</h1>
    <p className="page-description">Compare the same {item.volume} item and confirm your eligible price before paying.</p>
    <InternationalCatalog items={[item]} />
    <section className="intl-guide-section"><h2 className="section-title">Observed prices by retailer</h2><p>These observations come from Korean storefronts. They do not confirm a price or promotion available on an English storefront.</p>{item.offers.length ? <div className="intl-product-list">{item.offers.map((offer,index) => <article className="intl-product-row" key={`${offer.storeId}-${index}`}><div><h3>{englishStores[offer.storeId].name}</h3><p>KRW {offer.krw.toLocaleString("en-US")}{offer.usd ? ` · source-listed USD ${offer.usd.toFixed(2)}` : ""}</p><p>Retailer listing: <span lang={/[가-힣]/.test(offer.listingTitle) ? "ko" : "en"}>{offer.listingTitle}</span></p><p className="section-copy">{offer.checkedAt ? `Observed ${new Date(offer.checkedAt).toISOString().replace("T"," ").slice(0,16)} UTC` : "Observation time unavailable"}</p>{offer.sourceUrl ? <a href={offer.sourceUrl} target="_blank" rel="noreferrer">View Korean price source</a> : null}</div><InternationalRetailerLink storeId={offer.storeId} slug={slug} price={offer.krw} /></article>)}</div> : <p>No price has been confirmed. Use the official websites below.</p>}</section>
    <section className="intl-guide-section"><h2 className="section-title">Check all four English retailers</h2><p>Search for “{item.name}”. Links open the retailer’s English site, not a confirmed product listing. Unlisted prices mean unconfirmed, not sold out.</p><ul>{Object.keys(englishStores).map(id => <li key={id}><InternationalRetailerLink storeId={id as keyof typeof englishStores} slug={slug} /></li>)}</ul></section>
    <section className="intl-note"><h2>Check the exact product</h2><p>Use the full product name and size. Fragrance concentration, refill status, cosmetic shade, gift sets and travel-exclusive packaging can change the comparison. Coupons, membership benefits, payment fees and pickup eligibility must be checked at checkout.</p><p>Prices are observations, not real-time quotes. Availability and the final amount may change.</p></section>
    <nav className="intl-section-nav" aria-label="Next steps"><Link href="/en/guide/incheon-duty-free-pickup">Airport pickup instructions</Link><Link href="/en/compare">Compare with a tax-refund store</Link><Link href={`/product/${slug}`} lang="ko">한국어 상품 페이지</Link></nav>
  </div></section>;
}
