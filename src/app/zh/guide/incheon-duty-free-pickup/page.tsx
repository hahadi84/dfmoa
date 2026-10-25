import { TravelerGuide } from "@/components/traveler-pages";
import { travelerCopy } from "@/lib/traveler-locales";
import { localizedMetadata } from "@/lib/international";
const t=travelerCopy.zh;
export const metadata=localizedMetadata("zh",t.pickupTitle,t.pickupIntro,"/zh/guide/incheon-duty-free-pickup");
export default function Page(){return <TravelerGuide locale="zh"/>;}
