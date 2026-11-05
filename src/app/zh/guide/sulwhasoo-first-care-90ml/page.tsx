import { ShoppingGuide, shoppingMetadata } from "@/components/shopping-guide";

export const metadata = shoppingMetadata("zh", "serum");
export default function Page() {
  return <ShoppingGuide locale="zh" guide="serum"/>;
}
