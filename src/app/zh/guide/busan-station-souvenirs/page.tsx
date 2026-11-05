import { BusanGuide, busanMetadata } from "@/components/busan-guide";

export const metadata = busanMetadata("zh", "station");
export default function Page() {
  return <BusanGuide locale="zh" topic="station"/>;
}
