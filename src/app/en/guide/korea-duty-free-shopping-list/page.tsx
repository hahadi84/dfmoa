import { DutyFreeList, listMetadata } from "@/components/duty-free-list";
export const metadata = listMetadata("en");
export default function Page() { return <DutyFreeList locale="en"/>; }
