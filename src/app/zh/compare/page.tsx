import { TravelerCompare } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.zh;
export const metadata=localizedMetadata("zh",t.compareTitle,t.compareIntro,"/zh/compare");
export default function Page(){return <TravelerCompare locale="zh"/>;}
