import type { BrandLanding, MonthlyDealReport, ProductComparePage } from "@/lib/content-models";
import { getCategoryBySlug, products, type Guide, type Product } from "@/lib/site-data";

const SITE_URL = "https://dfmoa.netlify.app";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildProductJsonLd(product: Product) {
  const category = getCategoryBySlug(product.categorySlug);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.displayName,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    description: product.summary,
    category: category?.name,
    sku: product.slug,
    url: absoluteUrl(`/product/${product.slug}`),
  };
}

export function buildItemListJsonLd(items: Array<{ name: string; path: string }>, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function buildArticleJsonLd({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: "DFMOA",
    },
    publisher: {
      "@type": "Organization",
      name: "DFMOA",
      url: SITE_URL,
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function buildBrandJsonLd(brand: BrandLanding) {
  return buildItemListJsonLd(
    brand.representativeProductIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))
      .map((product) => ({
        name: product.displayName,
        path: `/product/${product.slug}`,
      })),
    `${brand.nameKo} 대표 상품`
  );
}

export function buildGuideArticleJsonLd(guide: Guide, path: string) {
  return buildArticleJsonLd({
    title: guide.title,
    description: guide.excerpt,
    path,
    publishedAt: "2026-04-19",
    updatedAt: "2026-04-19",
  });
}

export function buildMonthlyDealArticleJsonLd(report: MonthlyDealReport) {
  return buildArticleJsonLd({
    title: report.title,
    description: report.summary,
    path: `/deals/${report.slug}`,
    publishedAt: report.publishedAt,
    updatedAt: report.updatedAt,
  });
}

export function buildCompareItemListJsonLd(comparePage: ProductComparePage) {
  return buildItemListJsonLd(
    comparePage.productIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))
      .map((product) => ({
        name: product.displayName,
        path: `/product/${product.slug}`,
      })),
    comparePage.title
  );
}
