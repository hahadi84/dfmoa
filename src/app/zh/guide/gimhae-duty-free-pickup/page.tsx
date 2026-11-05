import { BusanGuide, busanMetadata } from "@/components/busan-guide";

export const metadata = busanMetadata("zh", "airport");
export default function Page() {
  return <BusanGuide locale="zh" topic="airport"/>;
}
