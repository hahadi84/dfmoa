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

  if (!best) {
    return {
      title: `${product.query} 면세점 가격 · 공식 판매처 확인`,
      description: `${product.query}의 면세 가격을 확인할 수 있는 공식 판매처 링크와 구매 전 확인 사항을 정리했습니다. 현재 공개 가격이 없어 판매처에서 용량·재고·최종 결제액을 확인하세요.`,
      imagePath: `/og/product/${product.slug}.png`,
      hasPrice: false,
    };
  }

  const store = getStoreById(best.sourceId);
  const priceKrw = Number(best.item.priceKrw ?? 0);
  const fetchedAt = best.source.fetchedAt ?? best.item.fetchedAt ?? snapshot?.fetchedAt ?? "";
  const dateLabel = formatSnapshotTimestamp(fetchedAt).slice(0, 10) || "최근";
  const storeName = store?.shortName ?? best.sourceId;

  return {
    title: `${product.query} 면세점 가격 비교`,
    description: `${product.query} 면세 공개가 ${formatKrw(priceKrw)} (${storeName}, ${dateLabel} 확인). 면세점별 공식 링크와 할인 조건을 비교하고, 재고와 최종 결제액은 판매처에서 확인하세요.`,
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
