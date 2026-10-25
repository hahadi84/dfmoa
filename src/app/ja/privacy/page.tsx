import { TravelerPrivacy } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.ja;
export const metadata=localizedMetadata("ja",t.privacyTitle,t.privacyBody,"/ja/privacy");
export default function Page(){return <TravelerPrivacy locale="ja"/>;}
