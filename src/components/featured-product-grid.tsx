"use client";

import { useMemo, useState } from "react";
import Link from "@/components/app-link";
import { FavoriteButton } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { getSnapshotPriceLine } from "@/lib/price-snapshot-view";
import type { ProductPriceSnapshot } from "@/lib/price-snapshot-types";
import type { Product } from "@/lib/site-data";

const STEP_SIZE = 12;

type FeaturedProductGridProps = {
  products: Product[];
  priceSnapshotsByProductId?: Record<string, ProductPriceSnapshot | null>;
};

function hasSnapshotPrice(snapshot?: ProductPriceSnapshot | null) {
  return Object.values(snapshot?.sources ?? {}).some((source) =>
    source?.items?.some((item) => Number(item.priceKrw) > 0 || Number(item.priceUsd) > 0)
  );
}

export function FeaturedProductGrid({ products, priceSnapshotsByProductId = {} }: FeaturedProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(STEP_SIZE);
  const [showFailedProducts, setShowFailedProducts] = useState(false);
  const { successfulProducts, failedProducts } = useMemo(() => {
    const successful: Product[] = [];
    const failed: Product[] = [];

    for (const product of products) {
      if (hasSnapshotPrice(priceSnapshotsByProductId[product.id])) {
        successful.push(product);
      } else {
        failed.push(product);
      }
    }

    return {
      successfulProducts: successful,
      failedProducts: failed,
    };
  }, [priceSnapshotsByProductId, products]);
  const visibleSuccessfulProducts = successfulProducts.slice(0, visibleCount);
  const visibleFailedProducts = failedProducts.length >= 3 && !showFailedProducts ? [] : failedProducts;
  const visibleProducts = [...visibleSuccessfulProducts, ...visibleFailedProducts];
  const hasMoreSuccessProducts = visibleCount < successfulProducts.length;
  const hasHiddenFailedProducts = failedProducts.length >= 3 && !showFailedProducts;

  return (
    <div className="featured-products">
      <div className="featured-product-grid">
        {visibleProducts.map((product) => {
          const priceLine = getSnapshotPriceLine(priceSnapshotsByProductId[product.id]);

          return (
            <article
              key={product.id}
              className="product-card featured-product-card"
            >
              <div className="featured-product-card-head">
                <span className="chip is-soft">{product.badge}</span>
                <FavoriteButton product={product} className="product-card-favorite" />
              </div>
              <Link href={`/product/${product.slug}`} className="featured-product-link">
                <div className="featured-product-image">
                  <SafeProductImage
                    src={priceLine.imageUrl}
                    alt={`${product.brand} ${product.name} ${product.volume}`}
                    categorySlug={product.categorySlug}
                  />
                </div>
                <div className="featured-product-copy">
                  <h3 className="card-title">{product.query}</h3>
                  <p className="section-copy">{product.displayName}</p>
                  <p className={`featured-product-price${priceLine.isStale ? " is-stale" : ""}`}>
                    {priceLine.text}
                  </p>
                </div>
              </Link>
              <div className="product-card-actions">
                <Link className="text-link" href={`/product/${product.slug}`}>
                  상세 비교 보기
                </Link>
                <Link className="text-link" href={`/search?q=${encodeURIComponent(product.query)}`}>
                  국내가도 비교
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <p className="featured-product-source">
        가격 확인 성공 상품을 먼저 표시하고, 최근 수집 실패 상품은 뒤로 정리합니다.
      </p>

      <div className="featured-product-more-row">
        {hasMoreSuccessProducts ? (
          <button
            type="button"
            className="ghost-button featured-product-more"
            onClick={() => setVisibleCount((current) => Math.min(current + STEP_SIZE, successfulProducts.length))}
          >
            더보기 12개
          </button>
        ) : null}

        {hasHiddenFailedProducts ? (
          <button
            type="button"
            className="ghost-button featured-product-more"
            onClick={() => setShowFailedProducts(true)}
          >
            최근 수집 실패 {failedProducts.length}개 더보기
          </button>
        ) : null}
      </div>
    </div>
  );
}
