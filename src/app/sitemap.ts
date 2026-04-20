import type { MetadataRoute } from "next";
import { benefitReports } from "@/lib/benefit-report-generator";
import { airportGuides, brandLandings, comparePages, monthlyDealReports } from "@/lib/seo-content";
import { categories, guides, products } from "@/lib/site-data";

const SITE_URL = "https://dfmoa.netlify.app";
const LAST_MODIFIED = new Date("2026-04-19");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/airport",
    "/best-seller-examples",
    "/benefits",
    "/benefit-reports",
    "/brand",
    "/category",
    "/deals",
    "/faq",
    "/privacy",
    "/terms",
    "/contact",
    "/editorial-policy",
    "/data-source-policy",
    "/advertising-policy",
  ];
  const categoryPages = categories.map((category) => `/category/${category.slug}`);
  const guidePages = guides.map((guide) => `/guide/${guide.slug}`);
  const productPages = products.map((product) => `/product/${product.slug}`);
  const benefitReportPages = benefitReports.map((report) => `/benefit-reports/${report.slug}`);
  const brandPages = brandLandings.map((brand) => `/brand/${brand.slug}`);
  const airportPages = airportGuides.map((airport) => `/airport/${airport.slug}`);
  const monthlyDealPages = monthlyDealReports.map((report) => `/deals/${report.slug}`);
  const comparePagePaths = comparePages.filter((page) => !page.noindex).map((page) => `/compare/${page.slug}`);

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
    lastModified: LAST_MODIFIED,
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
