import { TravelerGuide } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.ja;
export const metadata=localizedMetadata("ja",t.pickupTitle,t.pickupIntro,"/ja/guide/incheon-duty-free-pickup");
export default function Page(){return <TravelerGuide locale="ja"/>;}
