import { BusanGuide, busanMetadata } from "@/components/busan-guide";

export const metadata = busanMetadata("en", "airport");
export default function Page() {
  return <BusanGuide locale="en" topic="airport"/>;
}
