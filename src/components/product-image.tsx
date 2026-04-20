"use client";

import { useState } from "react";
import type { CategorySlug } from "@/lib/site-data";

type SafeProductImageProps = {
  src?: string | null;
  alt: string;
  categorySlug?: CategorySlug;
  className?: string;
  loading?: "eager" | "lazy";
};

const PLACEHOLDER_BY_CATEGORY: Record<CategorySlug, string> = {
  perfume: "/placeholders/perfume.svg",
  beauty: "/placeholders/beauty.svg",
  liquor: "/placeholders/liquor.svg",
  eyewear: "/placeholders/eyewear.svg",
  fashion: "/placeholders/fashion.svg",
  watch: "/placeholders/watch.svg",
  jewelry: "/placeholders/jewelry.svg",
  health: "/placeholders/health.svg",
  food: "/placeholders/food.svg",
  electronics: "/placeholders/electronics.svg",
};

function getPlaceholderSrc(categorySlug?: CategorySlug) {
  return categorySlug ? PLACEHOLDER_BY_CATEGORY[categorySlug] : PLACEHOLDER_BY_CATEGORY.fashion;
}

export function ProductImageFallback({
  alt,
  categorySlug,
  className = "",
}: {
  alt: string;
  categorySlug?: CategorySlug;
  className?: string;
}) {
  return (
    <span className={`product-image-fallback is-${categorySlug ?? "default"} ${className}`} role="img" aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={getPlaceholderSrc(categorySlug)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </span>
  );
}

export function SafeProductImage({
  src,
  alt,
  categorySlug,
  className = "",
  loading = "lazy",
}: SafeProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <ProductImageFallback alt={alt} categorySlug={categorySlug} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}
