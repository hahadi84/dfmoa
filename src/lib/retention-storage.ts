import type { Product } from "@/lib/site-data";

export const FAVORITES_STORAGE_KEY = "dfmoa:favorites";
export const RECENT_PRODUCTS_STORAGE_KEY = "dfmoa:recent-products";
export const EFFECTIVE_PRICE_PREFERENCES_KEY = "dfmoa:effective-price-preferences";
export const STORAGE_EVENT_NAME = "dfmoa-storage-change";
export const MAX_RECENT_PRODUCTS = 20;

export type FavoriteProduct = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  volume?: string;
  category?: string;
  imageUrl?: string | null;
  addedAt: string;
};

export type RecentProduct = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  volume?: string;
  category?: string;
  imageUrl?: string | null;
  viewedAt: string;
};

export type StoredRetentionProduct = FavoriteProduct | RecentProduct;

function nowIso() {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toFavoriteProduct(value: unknown): FavoriteProduct | null {
  if (!isRecord(value)) {
    return null;
  }

  const slug = getString(value.slug);
  const productId = getString(value.productId) ?? getString(value.id);
  const brand = getString(value.brand);
  const name = getString(value.name) ?? getString(value.displayName) ?? getString(value.query);

  if (!slug || !productId || !brand || !name) {
    return null;
  }

  return {
    productId,
    slug,
    brand,
    name,
    volume: getString(value.volume),
    category: getString(value.category) ?? getString(value.categorySlug),
    imageUrl: getString(value.imageUrl) ?? null,
    addedAt: getString(value.addedAt) ?? nowIso(),
  };
}

function toRecentProduct(value: unknown): RecentProduct | null {
  if (!isRecord(value)) {
    return null;
  }

  const slug = getString(value.slug);
  const productId = getString(value.productId) ?? getString(value.id);
  const brand = getString(value.brand);
  const name = getString(value.name) ?? getString(value.displayName) ?? getString(value.query);

  if (!slug || !productId || !brand || !name) {
    return null;
  }

  return {
    productId,
    slug,
    brand,
    name,
    volume: getString(value.volume),
    category: getString(value.category) ?? getString(value.categorySlug),
    imageUrl: getString(value.imageUrl) ?? null,
    viewedAt: getString(value.viewedAt) ?? nowIso(),
  };
}

export function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function emitRetentionStorageChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
  }
}

export function getRawStorageSnapshot(key: string) {
  if (!canUseLocalStorage()) {
    return "[]";
  }

  try {
    return window.localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

function safeParseArray(value: string | null) {
  try {
    const parsed = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readFavoriteProducts(): FavoriteProduct[] {
  return safeParseArray(getRawStorageSnapshot(FAVORITES_STORAGE_KEY))
    .map(toFavoriteProduct)
    .filter((item): item is FavoriteProduct => Boolean(item));
}

export function readRecentProducts(): RecentProduct[] {
  return safeParseArray(getRawStorageSnapshot(RECENT_PRODUCTS_STORAGE_KEY))
    .map(toRecentProduct)
    .filter((item): item is RecentProduct => Boolean(item))
    .slice(0, MAX_RECENT_PRODUCTS);
}

export function writeFavoriteProducts(products: FavoriteProduct[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const deduped = Array.from(new Map(products.map((product) => [product.slug, product])).values());
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(deduped));
    emitRetentionStorageChange();
  } catch {
    // Ignore storage quota/private mode errors. The UI can continue without persistence.
  }
}

export function writeRecentProducts(products: RecentProduct[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const deduped = Array.from(new Map(products.map((product) => [product.slug, product])).values()).slice(
      0,
      MAX_RECENT_PRODUCTS
    );
    window.localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, JSON.stringify(deduped));
    emitRetentionStorageChange();
  } catch {
    // Ignore storage quota/private mode errors. The UI can continue without persistence.
  }
}

export function productToFavorite(product: Product, addedAt = nowIso()): FavoriteProduct {
  return {
    productId: product.id,
    slug: product.slug,
    brand: product.brand,
    name: product.displayName,
    volume: product.volume,
    category: product.categorySlug,
    imageUrl: null,
    addedAt,
  };
}

export function productToRecent(product: Product, viewedAt = nowIso()): RecentProduct {
  return {
    productId: product.id,
    slug: product.slug,
    brand: product.brand,
    name: product.displayName,
    volume: product.volume,
    category: product.categorySlug,
    imageUrl: null,
    viewedAt,
  };
}

export function toggleFavoriteProduct(product: Product) {
  const current = readFavoriteProducts();
  const exists = current.some((item) => item.slug === product.slug);
  const next = exists
    ? current.filter((item) => item.slug !== product.slug)
    : [productToFavorite(product), ...current.filter((item) => item.slug !== product.slug)];

  writeFavoriteProducts(next);

  return !exists;
}

export function addRecentProduct(product: Product) {
  const current = readRecentProducts();
  writeRecentProducts([productToRecent(product), ...current.filter((item) => item.slug !== product.slug)]);
}
