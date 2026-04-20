import type { CategorySlug } from "@/lib/site-data";

export type BrandLanding = {
  slug: string;
  nameKo: string;
  nameEn?: string;
  description: string;
  categoryIds: CategorySlug[];
  representativeProductIds: string[];
  relatedGuideSlugs?: string[];
  relatedDealSlugs?: string[];
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type AirportGuide = {
  slug: string;
  title: string;
  airportName: string;
  terminal?: string;
  description: string;
  pickupNotes: string[];
  categoryWarnings: {
    category: string;
    warnings: string[];
  }[];
  officialLinks: {
    label: string;
    url: string;
  }[];
  relatedProductIds?: string[];
  relatedGuideSlugs?: string[];
  updatedAt: string;
};

export type MonthlyDealReport = {
  slug: string;
  year: number;
  month: number;
  title: string;
  summary: string;
  benefitRuleIds: string[];
  sourceLinks: {
    sourceName: string;
    url: string;
    lastVerifiedAt: string;
  }[];
  relatedProductIds?: string[];
  publishedAt: string;
  updatedAt: string;
};

export type ProductComparePage = {
  slug: string;
  productIds: string[];
  categoryId: CategorySlug;
  title: string;
  comparisonSummary: string;
  createdReason: "curated" | "search_demand" | "popular_pair";
  relatedGuideSlugs?: string[];
  updatedAt: string;
  noindex?: boolean;
};
