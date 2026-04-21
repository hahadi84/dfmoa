"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "@/components/app-link";
import { trackEvent } from "@/lib/analytics";
import {
  addRecentProduct,
  FAVORITES_STORAGE_KEY,
  getRawStorageSnapshot,
  readFavoriteProducts,
  readRecentProducts,
  STORAGE_EVENT_NAME,
  toggleFavoriteProduct,
  type FavoriteProduct,
  type RecentProduct,
} from "@/lib/retention-storage";
import type { Product } from "@/lib/site-data";

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT_NAME, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT_NAME, callback);
  };
}

export function useFavoriteProducts() {
  const snapshot = useSyncExternalStore(
    subscribeStorage,
    () => getRawStorageSnapshot(FAVORITES_STORAGE_KEY),
    () => "[]"
  );

  return useMemo(() => {
    void snapshot;
    return readFavoriteProducts();
  }, [snapshot]);
}

export function useRecentProducts() {
  const snapshot = useSyncExternalStore(
    subscribeStorage,
    () => getRawStorageSnapshot("dfmoa:recent-products"),
    () => "[]"
  );

  return useMemo(() => {
    void snapshot;
    return readRecentProducts();
  }, [snapshot]);
}

export function FavoriteButton({
  product,
  className = "",
  sourcePage = "product",
}: {
  product: Product;
  className?: string;
  sourcePage?: string;
}) {
  const favorites = useFavoriteProducts();
  const isFavorite = favorites.some((item) => item.slug === product.slug);

  return (
    <button
      type="button"
      className={`favorite-button ${isFavorite ? "is-active" : ""} ${className}`}
      aria-pressed={isFavorite}
      aria-label={`${product.displayName} 관심상품 ${isFavorite ? "해제" : "추가"}`}
      title="관심상품으로 저장"
      onClick={() => {
        const nextIsFavorite = toggleFavoriteProduct(product);
        trackEvent(nextIsFavorite ? "favorite_add" : "favorite_remove", {
          product_id: product.id,
          product_slug: product.slug,
          source_page: sourcePage,
        });
      }}
    >
      <svg
        aria-hidden="true"
        className="favorite-button-icon"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d="m12 3.5 2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.5Z" />
      </svg>
    </button>
  );
}

export function RecentProductsTracker({ product }: { product: Product }) {
  useEffect(() => {
    addRecentProduct(product);
  }, [product]);

  return null;
}

export function SavedProductsPanel({ products }: { products: Product[] }) {
  const favorites = useFavoriteProducts();
  const recentProducts = useRecentProducts();
  const productBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);
  const favoriteItems = favorites
    .map((item) => productBySlug.get(item.slug) ?? item)
    .filter(Boolean)
    .slice(0, 6);
  const recentItems = recentProducts
    .map((item) => productBySlug.get(item.slug) ?? item)
    .filter(Boolean)
    .slice(0, 6);

  if (!favoriteItems.length && !recentItems.length) {
    return null;
  }

  return (
    <section className="page-section is-compact">
      <div className="container">
        <article className="surface-card saved-products-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">Retention</span>
              <h2 className="section-title">다시 확인할 상품</h2>
              <p className="section-copy">
                관심상품과 최근 본 상품에서 공개가 상태, 예상 실결제가, 원본 링크를 이어서 확인할 수 있습니다.
              </p>
            </div>
            <Link className="ghost-button" href="/favorites">
              관심상품 전체 보기
            </Link>
          </div>

          <div className="saved-products-grid">
            <SavedProductList title="관심상품" items={favoriteItems} />
            <SavedProductList title="최근 본 상품" items={recentItems} />
          </div>
        </article>
      </div>
    </section>
  );
}

function getItemName(item: Product | FavoriteProduct | RecentProduct) {
  return "displayName" in item ? item.displayName : item.name;
}

function SavedProductList({
  title,
  items,
}: {
  title: string;
  items: Array<Product | FavoriteProduct | RecentProduct>;
}) {
  return (
    <div className="saved-products-list">
      <strong>{title}</strong>
      {items.length ? (
        <div className="chip-row">
          {items.map((item) => (
            <Link key={item.slug} className="chip is-soft" href={`/product/${item.slug}`}>
              {getItemName(item)}
            </Link>
          ))}
        </div>
      ) : (
        <span className="subtle-copy">아직 저장된 상품이 없습니다.</span>
      )}
    </div>
  );
}
