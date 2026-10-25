import { TravelerPrivacy } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.zh;
export const metadata=localizedMetadata("zh",t.privacyTitle,t.privacyBody,"/zh/privacy");
export default function Page(){return <TravelerPrivacy locale="zh"/>;}
