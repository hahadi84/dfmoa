import { BusanGuide, busanMetadata } from "@/components/busan-guide";

export const metadata = busanMetadata("ja", "station");
export default function Page() {
  return <BusanGuide locale="ja" topic="station"/>;
}
