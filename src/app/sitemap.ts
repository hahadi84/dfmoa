import type { MetadataRoute } from "next";
import { getBenefitReportsByMonth, indexableBenefitReports } from "@/lib/benefit-report-generator";
import { airportGuides, brandLandings, comparePages, monthlyDealReports } from "@/lib/seo-content";
import { SITE_OPERATOR } from "@/lib/site-operator";
import { categories, guides, products } from "@/lib/site-data";
import { readProductPriceSnapshot } from "@/lib/static-price-snapshots";

const SITE_URL = SITE_OPERATOR.serviceUrl;
const CONTENT_UPDATED_AT = new Date("2026-04-19T00:00:00+09:00");

export const dynamic = "force-static";

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const input = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+09:00` : value;
  const date = new Date(input);

  return Number.isNaN(date.getTime()) ? null : date;
}

function latestDate(values: Array<Date | string | null | undefined>) {
  return values
    .map((value) => (value instanceof Date ? value : parseDate(value)))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? CONTENT_UPDATED_AT;
}

function getProductLastModified(productId: string) {
  const snapshot = readProductPriceSnapshot(productId);
  const sourceDates = Object.values(snapshot?.sources ?? {}).flatMap((source) => [
    source.fetchedAt,
    ...source.items.map((item) => item.fetchedAt),
  ]);

  return latestDate([snapshot?.fetchedAt, ...sourceDates, CONTENT_UPDATED_AT]);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const productLastModified = new Map(products.map((product) => [product.id, getProductLastModified(product.id)]));
  const latestProductDate = latestDate([...productLastModified.values()]);
  const latestBenefitReportDate = latestDate(indexableBenefitReports.map((report) => report.updatedAt));
  const latestMonthlyDealDate = latestDate(monthlyDealReports.map((report) => report.updatedAt));
  const latestBrandDate = latestDate(brandLandings.map((brand) => brand.updatedAt));
  const latestAirportDate = latestDate(airportGuides.map((airport) => airport.updatedAt));
  const staticPages = [
    "",
    "/about",
    "/airport",
    "/benefits",
    "/benefit-reports",
    "/brand",
    "/category",
    "/deals",
    "/faq",
    "/privacy",
    "/terms",
    "/contact",
    "/price-compare",
    "/editorial-policy",
    "/data-source-policy",
    "/advertising-policy",
  ];
  const categoryPages = categories.map((category) => `/category/${category.slug}`);
  const guidePages = guides.map((guide) => `/guide/${guide.slug}`);
  const productPages = products.map((product) => `/product/${product.slug}`);
  const benefitReportPages = indexableBenefitReports.map((report) => `/benefit-reports/${report.slug}`);
  const brandPages = brandLandings.map((brand) => `/brand/${brand.slug}`);
  const airportPages = airportGuides.map((airport) => `/airport/${airport.slug}`);
  const monthlyDealPages = monthlyDealReports.map((report) => `/deals/${report.slug}`);
  const comparePagePaths = comparePages.filter((page) => !page.noindex).map((page) => `/compare/${page.slug}`);

  function getLastModified(path: string) {
    if (path === "") {
      return latestDate([latestProductDate, latestBenefitReportDate, latestMonthlyDealDate]);
    }

    if (path.startsWith("/product/")) {
      const product = products.find((item) => path === `/product/${item.slug}`);
      return product ? productLastModified.get(product.id) ?? CONTENT_UPDATED_AT : CONTENT_UPDATED_AT;
    }

    if (path.startsWith("/category/")) {
      const categorySlug = path.replace("/category/", "");
      return latestDate(
        products
          .filter((product) => product.categorySlug === categorySlug)
          .map((product) => productLastModified.get(product.id))
      );
    }

    if (path === "/category") {
      return latestProductDate;
    }

    if (path.startsWith("/brand/")) {
      const brand = brandLandings.find((item) => path === `/brand/${item.slug}`);
      return latestDate([brand?.updatedAt, CONTENT_UPDATED_AT]);
    }

    if (path === "/brand") {
      return latestBrandDate;
    }

    if (path.startsWith("/airport/")) {
      const airport = airportGuides.find((item) => path === `/airport/${item.slug}`);
      return latestDate([airport?.updatedAt, CONTENT_UPDATED_AT]);
    }

    if (path === "/airport") {
      return latestAirportDate;
    }

    if (path.startsWith("/benefit-reports/")) {
      const report = indexableBenefitReports.find((item) => path === `/benefit-reports/${item.slug}`);
      return latestDate([report?.updatedAt, report?.publishedAt, CONTENT_UPDATED_AT]);
    }

    if (path === "/benefit-reports") {
      return latestBenefitReportDate;
    }

    if (path.startsWith("/deals/")) {
      const report = monthlyDealReports.find((item) => path === `/deals/${item.slug}`);
      const weeklyReportDates = report ? getBenefitReportsByMonth(report.slug).map((item) => item.updatedAt) : [];
      return latestDate([report?.updatedAt, report?.publishedAt, ...weeklyReportDates, CONTENT_UPDATED_AT]);
    }

    if (path === "/deals") {
      return latestMonthlyDealDate;
    }

    if (path.startsWith("/compare/")) {
      const page = comparePages.find((item) => path === `/compare/${item.slug}`);
      const comparedProductDates =
        page?.productIds.map((productId) => productLastModified.get(productId)) ?? [];

      return latestDate([page?.updatedAt, ...comparedProductDates, CONTENT_UPDATED_AT]);
    }

    return CONTENT_UPDATED_AT;
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...guidePages,
    ...productPages,
    ...benefitReportPages,
    ...brandPages,
    ...airportPages,
    ...monthlyDealPages,
    ...comparePagePaths,
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: getLastModified(path),
    changeFrequency:
      path.startsWith("/product") || path.startsWith("/benefit-reports") || path.startsWith("/deals")
        ? "weekly"
        : "monthly",
    priority:
      path === ""
        ? 1
        : path.startsWith("/category") ||
            path.startsWith("/benefit-reports") ||
            path.startsWith("/brand") ||
            path.startsWith("/airport")
          ? 0.8
          : 0.6,
  }));
}
