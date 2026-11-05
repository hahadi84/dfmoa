import { ShoppingGuide, shoppingMetadata } from "@/components/shopping-guide";

export const metadata = shoppingMetadata("zh", "gifts");
export default function Page() {
  return <ShoppingGuide locale="zh" guide="gifts"/>;
}
