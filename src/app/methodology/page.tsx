import { PreservedPage } from "@/components/preserved-page";
import { preservedMetadata } from "@/lib/preserved-pages";

export const metadata = preservedMetadata("/methodology");

export default function MethodologyPage() {
  return <PreservedPage path="/methodology" />;
}
