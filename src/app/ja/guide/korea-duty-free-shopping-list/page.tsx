import { DutyFreeList, listMetadata } from "@/components/duty-free-list";
export const metadata = listMetadata("ja");
export default function Page() { return <DutyFreeList locale="ja"/>; }
