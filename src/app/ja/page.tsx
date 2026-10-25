import { TravelerHome } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.ja;
export const metadata=localizedMetadata("ja",t.homeTitle,t.intro,"/ja","/");
export default function Page(){return <TravelerHome locale="ja"/>;}
