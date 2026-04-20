import type { BrandLanding, MonthlyDealReport, ProductComparePage } from "@/lib/content-models";
import { getCategoryBySlug, products, type Guide, type Product } from "@/lib/site-data";
import { getStoreById, type StoreId } from "@/lib/site-data";
import type { ProductPriceSnapshot, SnapshotPriceItem, SnapshotSourceRecord } from "@/lib/price-snapshot-types";
import { getProductSeoSummary } from "@/lib/seo-metadata";

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

function addHours(value: string | null | undefined, hours: number) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  parsed.setHours(parsed.getHours() + hours);
  return parsed.toISOString();
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

export function buildProductJsonLd(product: Product, snapshot?: ProductPriceSnapshot | null) {
  const category = getCategoryBySlug(product.categorySlug);
  const seo = getProductSeoSummary(product, snapshot);
  const offers = getSnapshotOfferEntries(snapshot)
    .sort((left, right) => Number(left.item.priceKrw) - Number(right.item.priceKrw))
    .map(({ sourceId, source, item }) => {
      const store = getStoreById(sourceId);
      const fetchedAt = item.fetchedAt ?? source.fetchedAt ?? snapshot?.fetchedAt;

      return {
        "@type": "Offer",
        price: String(Math.round(Number(item.priceKrw))),
        priceCurrency: "KRW",
        seller: {
          "@type": "Organization",
          name: store?.name ?? source.store,
        },
        url: item.url || source.searchUrl || absoluteUrl(`/product/${product.slug}`),
        availability: "https://schema.org/InStock",
        priceValidUntil: addHours(fetchedAt, 24),
      };
    });
  const image = getSnapshotOfferEntries(snapshot).find(({ item }) => item.imageUrl)?.item.imageUrl;
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.displayName,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    image: image || absoluteUrl(`/og/product/${product.slug}.png`),
    description: seo.description,
    category: category?.name,
    sku: product.slug,
    url: absoluteUrl(`/product/${product.slug}`),
  };

  if (offers.length === 1) {
    productJsonLd.offers = offers;
  }

  if (offers.length > 1) {
    const prices = offers.map((offer) => Number(offer.price));

    productJsonLd.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "KRW",
      lowPrice: String(Math.min(...prices)),
      highPrice: String(Math.max(...prices)),
      offerCount: offers.length,
      offers,
    };
  }

  return productJsonLd;
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
    name: "면세모아 DFMOA",
    alternateName: "DFMOA",
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl("/contact"),
      availableLanguage: ["ko"],
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "면세모아 DFMOA",
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
