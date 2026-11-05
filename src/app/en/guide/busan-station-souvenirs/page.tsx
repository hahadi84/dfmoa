import { BusanGuide, busanMetadata } from "@/components/busan-guide";

export const metadata = busanMetadata("en", "station");
export default function Page() {
  return <BusanGuide locale="en" topic="station"/>;
}
