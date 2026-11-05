import { ShoppingGuide, shoppingMetadata } from "@/components/shopping-guide";

export const metadata = shoppingMetadata("en", "serum");
export default function Page() {
  return <ShoppingGuide locale="en" guide="serum"/>;
}
