import { ShoppingGuide, shoppingMetadata } from "@/components/shopping-guide";

export const metadata = shoppingMetadata("en", "gifts");
export default function Page() {
  return <ShoppingGuide locale="en" guide="gifts"/>;
}
