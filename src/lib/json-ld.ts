import type { BrandLanding, MonthlyDealReport, ProductComparePage } from "@/lib/content-models";
import { SITE_OPERATOR } from "@/lib/site-operator";
import { products, type Guide, type Product } from "@/lib/site-data";
import { type StoreId } from "@/lib/site-data";
import type { ProductPriceSnapshot, SnapshotPriceItem, SnapshotSourceRecord } from "@/lib/price-snapshot-types";
import { getProductSeoSummary } from "@/lib/seo-metadata";

const SITE_URL = SITE_OPERATOR.serviceUrl;

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

function getSnapshotOfferEntries(snapshot?: ProductPriceSnapshot | null) {
  return Object.entries(snapshot?.sources ?? {}).flatMap(([sourceId, source]) =>
    source.items
      .filter((item) => Number(item.priceKrw) > 0)
      .map((item) => ({
        sourceId: sourceId as StoreId,
        source: source as SnapshotSourceRecord,
        item: item as SnapshotPriceItem,
      }))
  );
}

export function buildProductPageJsonLd(product: Product, snapshot?: ProductPriceSnapshot | null) {
  const seo = getProductSeoSummary(product, snapshot);
  // These pages explain historical observations, not executable checkout offers.
  // Use WebPage until verified current offers or genuine reviews are available.
  const image = getSnapshotOfferEntries(snapshot).find(({ item }) => item.imageUrl)?.item.imageUrl;
  const url = absoluteUrl(`/product/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name: `${product.query} | 면세모아`,
    description: seo.description,
    image: image || absoluteUrl(`/og/product/${product.slug}.png`),
    url,
    about: {
      "@type": "Thing",
      name: product.query,
      alternateName: product.displayName,
      identifier: product.slug,
    },
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
      name: SITE_OPERATOR.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_OPERATOR.siteName,
      url: SITE_URL,
    },
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function buildFaqPageJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_OPERATOR.siteName,
    alternateName: "DFMOA",
    url: SITE_URL,
    email: SITE_OPERATOR.email,
    description: `한국 공항면세점 공개가 비교 서비스 (${SITE_OPERATOR.operationType} 운영)`,
    logo: absoluteUrl("/icon.svg"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SITE_OPERATOR.email,
      url: absoluteUrl("/contact"),
      availableLanguage: ["ko"],
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_OPERATOR.siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function serializeJsonLd(input: unknown) {
  return JSON.stringify(input).replace(/</g, "\\u003c");
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
    publishedAt: guide.updatedAt ?? "2026-04-19",
    updatedAt: guide.updatedAt ?? "2026-04-19",
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
