import { AdBanner } from "@/components/ad-banner";
import Link from "@/components/app-link";
import { ShopOfficialLink, ShoppingNextSteps } from "@/components/shopping-actions";
import { EN_INCHEON_PICKUP_CHECKED, englishMetadata, internationalSources } from "@/lib/international";
export const metadata = englishMetadata("Incheon Airport duty-free pickup: documents, T1 and T2", "How to collect online duty-free orders before departing Incheon: documents, terminal checks, collection counters and official retailer instructions.", "/en/guide/incheon-duty-free-pickup");
export default function PickupGuide() {
 return <article className="page-section"><div className="container intl-reading">
   <Link href="/en">Korea duty-free comparison</Link>
   <h1 className="page-title">Incheon Airport duty-free pickup</h1>
   <p className="page-description">
     For an online or downtown duty-free order, check your order confirmation for the departure terminal and pickup counter.
     After departure checks, take your passport, boarding pass and the voucher or collection reference your retailer requests to that counter.
   </p>
   <nav className="intl-section-nav pickup-guide-links" aria-label="Official retailer pickup guides">
     <ShopOfficialLink locale="en" source="incheon_pickup_intro"
       shop={{id: "shilla", url: internationalSources.shopping}} label="How to find your Shilla pickup voucher" />
     <ShopOfficialLink locale="en" source="incheon_pickup_intro"
       shop={{id: "hyundai", url: internationalSources.pickup}} label="Hyundai pickup counter maps for T1 and T2" />
   </nav>
   <p className="section-copy">Retailer pickup guides checked <time dateTime={EN_INCHEON_PICKUP_CHECKED}>{EN_INCHEON_PICKUP_CHECKED}</time>.</p>
 <section className="intl-guide-section"><h2 className="section-title">1. Confirm your departure details</h2><p>Check your airline’s departure terminal, flight number and date before ordering. Your name and passport details must match the traveler’s documents. Confirm the retailer’s ordering deadline for your flight; there is no single deadline for every retailer or product.</p><p>If you are only transferring through Korea, contact the retailer before paying to confirm whether you can order and reach its collection counter.</p></section>
 <section className="intl-guide-section"><h2 className="section-title">2. Bring your collection documents</h2><ul><li>Your passport.</li><li>Your boarding pass.</li><li>The retailer’s exchange voucher, order barcode or collection reference, as instructed on your order.</li></ul>
   <p>For a Shilla online order, open <strong>My Order History</strong> in My Shilla to find your exchange voucher. Shilla recommends reaching its pickup counter 1–2 hours before departure.</p>
   <ShopOfficialLink locale="en" source="incheon_pickup_documents"
     shop={{id: "shilla", url: internationalSources.eligibility}} label="Shilla’s official collection FAQ" />
 </section>
 <section className="intl-guide-section">
   <h2 className="section-title">3. Find the counter for your order</h2>
   <p>For a Hyundai order, match the counter on your voucher to the locations below. If you ordered from another retailer, follow the directions on that retailer’s confirmation.</p>
   <div className="intl-location-list">
     <section><h3>Terminal 1</h3><p>Hyundai lists a west counter on 4F opposite Gate 43 and a concourse counter on 4F near Gate 119.</p></section>
     <section><h3>Terminal 2</h3><p>Hyundai lists west and east pickup areas on 2F, reached near Gates 225 and 274 respectively.</p></section>
   </div>
   <p>Airport shops serve walk-in shoppers. For a prepaid order, ask staff for the pickup counter on your voucher before moving between areas.</p>
 </section>
 <section className="intl-guide-section"><h2 className="section-title">4. Check your items before leaving</h2><p>Verify the product, quantity and condition at collection. Ask the retailer immediately if anything is wrong. Check your airline’s and transit airport’s rules for liquids and sealed duty-free bags, and your destination’s customs rules. A Korean duty-free purchase does not automatically remove destination-country taxes.</p></section>
 <section className="intl-note"><h2>If your plans change</h2><p>Contact the retailer about flight changes, missed pickup or cancellation. DFMOA cannot amend orders or hold goods. Keep your order reference and retailer contact details accessible.</p></section><p><Link href="/en/travelers">Check arrival-country rules for Australia and Canada</Link></p><Link href="/en">Back to product comparison</Link>
 <AdBanner placement="results"/><ShoppingNextSteps locale="en" includePickup={false}/></div></article>;
}
