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

export type BenefitCoverage = {
  storeId: string;
  sourceUrl: string;
  checkedAt: string;
  lastVerifiedAt?: string;
  status: string;
  count: number;
  scannedCount?: number;
  note: string;
  error?: string;
};

export type MonthlyDealReport = {
  slug: string;
  year: number;
  month: number;
  title: string;
  summary: string;
  benefitRuleIds: string[];
  benefits?: { id?: string; storeId?: string; category?: string; title: string; description: string; url: string; startDate: string; endDate: string; checkedAt: string }[];
  coverage?: BenefitCoverage[];
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
