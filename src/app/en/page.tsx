import { EnglishTravelLinks } from "@/components/english-travel-links";
import Link from "@/components/app-link";
import { InternationalCatalog } from "@/components/international-catalog";
import { getEnglishCatalog } from "@/lib/international-catalog";
import { englishMetadata, internationalSources, INTERNATIONAL_UPDATED } from "@/lib/international";
export const metadata = englishMetadata("Korea duty-free price comparison for travelers", "Compare observed Korean duty-free prices, find English retailer websites and plan airport pickup before leaving Korea.", "/en", "/");
export default function EnglishHome() {
  return <section className="page-section"><div className="container">
    <h1 className="page-title">Plan your Korea duty-free shopping</h1><p className="page-description">Compare prices before you leave Korea. Find English retailer websites and understand airport pickup.</p>
    <nav className="intl-section-nav" aria-label="Shopping tools"><a href="#english-products">Compare 10 products</a><Link href="/en/guide/incheon-duty-free-pickup">Airport pickup guide</Link><Link href="/en/compare">Duty free vs tax refund</Link></nav>
    <section className="intl-note"><h2>Can visitors shop duty free?</h2><p>Yes, travelers with a confirmed international departure can shop. Register and order in the traveling person’s name, enter the correct passport and departure details, and follow the retailer’s collection instructions.</p><p>These pages cover purchases collected when leaving Korea. Do not assume an airside transfer or a domestic flight qualifies.</p><a href={internationalSources.shopping} target="_blank" rel="noreferrer">Official shopping instructions</a></section>
    <InternationalCatalog items={getEnglishCatalog()} />
    <section className="intl-guide-section"><h2 className="section-title">Before you place an order</h2><ol><li>Match the exact size, concentration, shade and set contents.</li><li>Search the English retailer site for the product. Confirm eligibility, stock and the price available to your account.</li><li>Check your departure terminal, order deadline and pickup location on the retailer’s order confirmation.</li><li>Check the rules of your destination and any transit airport before purchasing liquids or restricted goods.</li></ol><p>DFMOA compares information; purchases and customer service are handled by the retailer. We do not collect passport or flight details.</p><Link href="/en/guide/incheon-duty-free-pickup">Read the Incheon pickup guide</Link></section>
    <EnglishTravelLinks />
    <p className="section-copy">Shopping guidance checked {INTERNATIONAL_UPDATED}. Prices show their individual observation times.</p>
  </div></section>;
}
