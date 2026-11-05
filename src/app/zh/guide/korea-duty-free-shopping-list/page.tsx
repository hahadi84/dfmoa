import { DutyFreeList, listMetadata } from "@/components/duty-free-list";
export const metadata = listMetadata("zh");
export default function Page() { return <DutyFreeList locale="zh"/>; }
