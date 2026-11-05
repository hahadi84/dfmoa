import { ShoppingGuide, shoppingMetadata } from "@/components/shopping-guide";

export const metadata = shoppingMetadata("ja", "gifts");
export default function Page() {
  return <ShoppingGuide locale="ja" guide="gifts"/>;
}
