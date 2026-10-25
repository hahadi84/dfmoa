import { TravelerCompare } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.ja;
export const metadata=localizedMetadata("ja",t.compareTitle,t.compareIntro,"/ja/compare");
export default function Page(){return <TravelerCompare locale="ja"/>;}
