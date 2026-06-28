import type { Metadata } from "next";
import { getSnapshotBestItem, formatSnapshotTimestamp } from "@/lib/price-snapshot-view";
import { SITE_OPERATOR } from "@/lib/site-operator";
import { formatKrw, getStoreById, type Category, type Product } from "@/lib/site-data";
import type { ProductPriceSnapshot } from "@/lib/price-snapshot-types";

export const SITE_URL = SITE_OPERATOR.serviceUrl;
export const DEFAULT_OG_IMAGE = "/og/default.png";
export const HOME_OG_IMAGE = "/og/home.png";

type SeoImage = {
  path: string;
  alt: string;
};

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image: SeoImage;
  type?: "website" | "article";
};

function normalizeSeoText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function limitSeoText(value: string, maxLength: number) {
  const normalized = normalizeSeoText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
}

function getProductSearchLabel(product: Product) {
  return normalizeSeoText(product.query || product.displayName);
}

export function absoluteSiteUrl(path: string) {
  if (path.startsWith("https://") || path.startsWith("http://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildSeoMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: BuildMetadataInput): Metadata {
  const url = absoluteSiteUrl(path);
  const imageUrl = absoluteSiteUrl(image.path);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_OPERATOR.siteName,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: image.alt }],
      locale: "ko_KR",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function getProductSeoSummary(product: Product, snapshot?: ProductPriceSnapshot | null) {
  const best = getSnapshotBestItem(snapshot);
  const searchLabel = getProductSearchLabel(product);

  if (!best) {
    const title = `${searchLabel} 면세점 가격 비교｜공식몰 확인`;

    return {
      title: limitSeoText(title, 58),
      description: `${searchLabel} 면세점 가격 비교용 공식몰 확인 페이지입니다. 롯데·현대·신라·신세계 공개가, 수령 공항, 쿠폰·적립금, 원본 확인 포인트를 정리했습니다.`,
      imagePath: `/og/product/${product.slug}.png`,
      hasPrice: false,
    };
  }

  const store = getStoreById(best.sourceId);
  const priceKrw = Number(best.item.priceKrw ?? 0);
  const fetchedAt = best.source.fetchedAt ?? best.item.fetchedAt ?? snapshot?.fetchedAt ?? "";
  const dateLabel = formatSnapshotTimestamp(fetchedAt).slice(0, 10) || "최근";
  const storeName = store?.shortName ?? best.sourceId;
  const priceLabel = formatKrw(priceKrw);
  const title = `${searchLabel} 면세점 가격 비교｜${storeName} ${priceLabel}`;

  return {
    title: limitSeoText(title, 58),
    description: `${searchLabel} 최근 확인가 ${priceLabel}(${storeName}, ${dateLabel}). 롯데·현대·신라·신세계 공개가, 수령 공항, 쿠폰·적립금, 원본 확인 링크를 함께 정리했습니다.`,
    imagePath: `/og/product/${product.slug}.png`,
    hasPrice: true,
  };
}

export function buildProductMetadata(product: Product, snapshot?: ProductPriceSnapshot | null) {
  const seo = getProductSeoSummary(product, snapshot);

  return buildSeoMetadata({
    title: seo.title,
    description: seo.description,
    path: `/product/${product.slug}`,
    image: {
      path: seo.imagePath,
      alt: `${product.displayName} 면세 가격 비교`,
    },
  });
}

export function buildCategoryMetadata(category: Category) {
  const brandText = category.keywords.slice(0, 3).join(" · ");

  return buildSeoMetadata({
    title: `${category.name} 면세 가격 비교 · ${brandText} 등 대표 상품`,
    description: `${category.name} 대표 상품의 면세 공개가, 국내가 참고 비교, 대표 브랜드, 수령 공항과 혜택 확인 포인트를 한 번에 정리합니다.`,
    path: `/category/${category.slug}`,
    image: {
      path: `/og/category/${category.slug}.png`,
      alt: `${category.name} 면세 가격 비교`,
    },
  });
}

export function buildBrandMetadata({
  slug,
  nameKo,
  nameEn,
  productCount,
  description,
}: {
  slug: string;
  nameKo: string;
  nameEn?: string;
  productCount: number;
  description: string;
}) {
  const label = nameEn && nameEn !== nameKo ? `${nameKo} ${nameEn}` : nameKo;

  return buildSeoMetadata({
    title: `${label} 면세 가격 비교 · 대표 상품 ${productCount}개`,
    description,
    path: `/brand/${slug}`,
    image: {
      path: `/og/brand/${slug}.png`,
      alt: `${label} 면세 가격 비교`,
    },
  });
}
