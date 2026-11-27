"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

export function PriceCompareProductLinks({ children, homePlacement, className }: {
  children: ReactNode;
  homePlacement?: "search" | "hero" | "recent_prices";
  className?: string;
}) {
  return <div className={className} onClick={event => {
    if (!(event.target instanceof Element)) return;
    const href = event.target.closest("a")?.getAttribute("href");
    const match = href?.match(/^\/product\/([a-z0-9-]+)\/?$/);
    if (!match || (homePlacement && match[1] !== "royal-salute-21-700ml")) return;
    trackEvent("shopping_product_open", {
      language: "ko", source_page: homePlacement ? "home" : "price_compare",
      ...(homePlacement && { placement: homePlacement }),
      product_slug: match[1],
    });
  }}>{children}</div>;
}
