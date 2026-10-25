import type { MetadataRoute } from "next";
import { countryGuides, COUNTRY_GUIDANCE_CHECKED } from "@/lib/english-country-guides";
import { internationalProductIds, INTERNATIONAL_UPDATED } from "@/lib/international";
import { benefitReports } from "@/lib/benefit-report-generator";
import { airportGuides, brandLandings, comparePages, monthlyDealReports } from "@/lib/seo-content";
import { SITE_OPERATOR } from "@/lib/site-operator";
import { categories, guides, products } from "@/lib/site-data";
import { preservedPages } from "@/lib/preserved-pages";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";
import yenRate from '../../data/content/yen-rate.json';

const SITE_URL = SITE_OPERATOR.serviceUrl;
// Actual date of the title/content revision; never substitute the build clock.
const SEO_UPDATED_AT = "2026-10-25T00:00:00+09:00";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/en",
    "/en/guide/incheon-duty-free-pickup",
    "/en/compare",
    "/en/privacy",
    "/en/travelers",
    ...countryGuides.map(guide => `/en/guide/${guide.slug}`),
    ...["ja", "zh"].flatMap(locale => [`/${locale}`, `/${locale}/compare`, `/${locale}/privacy`, `/${locale}/guide/incheon-duty-free-pickup`]),
    "/airport",
    "/best-seller-examples",
    "/benefits",
    "/benefit-reports",
    "/brand",
    "/category",
    "/deals",
    "/japan",
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
  const englishProductPages = products.filter(product => internationalProductIds.includes(product.id)).map(product => `/en/product/${product.slug}`);
  const translatedProductPages = ["ja", "zh"].flatMap(locale => products.filter(product => internationalProductIds.includes(product.id)).map(product => `/${locale}/product/${product.slug}`));
  const benefitReportPages = benefitReports.map((report) => `/benefit-reports/${report.slug}`);
  const brandPages = brandLandings.map((brand) => `/brand/${brand.slug}`);
  const airportPages = airportGuides.map((airport) => `/airport/${airport.slug}`);
  const monthlyDealPages = monthlyDealReports.map((report) => `/deals/${report.slug}`);
  const comparePagePaths = comparePages.filter((page) => !page.noindex).map((page) => `/compare/${page.slug}`);

  const modified = new Map<string, string>([
    ...guides.filter(guide => guide.updatedAt).map(guide => [`/guide/${guide.slug}`, guide.updatedAt!] as [string, string]),
    ...benefitReports.map(report => [`/benefit-reports/${report.slug}`, report.updatedAt] as [string, string]),
    ...monthlyDealReports.map(report => [`/deals/${report.slug}`, report.updatedAt] as [string, string]),
    ['/japan', yenRate.date],
    ['/deals', monthlyDealReports[0].updatedAt],
    ['/benefit-reports', benefitReports[0].updatedAt],
  ]);
  const snapshots = readPriceSnapshotsByProductId(products);
  const latest = (values: string[]) => values.filter(value => Number.isFinite(Date.parse(value)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  for (const product of products) {
    const dates = Object.values(snapshots[product.id]?.sources ?? {})
      .filter(source => source.items.some(item => Number(item.priceKrw) > 0))
      .flatMap(source => [source.fetchedAt ?? "", ...source.items.map(item => item.fetchedAt ?? "")]);
    modified.set(`/product/${product.slug}`, latest([SEO_UPDATED_AT, ...dates]));
  }
  const productDate = (id: string) => {
    const product = products.find(item => item.id === id);
    return product ? modified.get(`/product/${product.slug}`) ?? "" : "";
  };
  modified.set("", latest(products.map(product => productDate(product.id))));
  modified.set("/deals", latest([SEO_UPDATED_AT, ...monthlyDealReports.map(report => report.updatedAt)]));
  for (const category of categories) {
    modified.set(`/category/${category.slug}`, latest(products.filter(product => product.categorySlug === category.slug).map(product => productDate(product.id))));
  }
  for (const brand of brandLandings) {
    modified.set(`/brand/${brand.slug}`, latest(brand.representativeProductIds.map(productDate)));
  }
  for (const path of [...staticPages.filter(path => path.startsWith("/en")), ...englishProductPages]) modified.set(path, INTERNATIONAL_UPDATED);
  for (const product of products.filter(product => internationalProductIds.includes(product.id))) modified.set(`/en/product/${product.slug}`, modified.get(`/product/${product.slug}`)!);
  modified.set("/en", latest([INTERNATIONAL_UPDATED, ...products.filter(product => internationalProductIds.includes(product.id)).map(product => modified.get(`/product/${product.slug}`) ?? "")]));
  for (const locale of ["ja", "zh"]) {
    for (const path of staticPages.filter(path => path.startsWith(`/${locale}`))) modified.set(path, INTERNATIONAL_UPDATED);
    for (const product of products.filter(product => internationalProductIds.includes(product.id))) modified.set(`/${locale}/product/${product.slug}`, modified.get(`/en/product/${product.slug}`)!);
    modified.set(`/${locale}`, modified.get("/en")!);
  }
  for (const path of ["/en/travelers", ...countryGuides.map(guide => `/en/guide/${guide.slug}`)]) modified.set(path, COUNTRY_GUIDANCE_CHECKED);
  return [...new Set([
    ...preservedPages.map((page) => page.path),
    ...staticPages,
    ...categoryPages,
    ...guidePages,
    ...productPages,
    ...englishProductPages,
    ...translatedProductPages,
    ...benefitReportPages,
    ...brandPages,
    ...airportPages,
    ...monthlyDealPages,
    ...comparePagePaths,
  ])].map((path) => ({
    url: `${SITE_URL}${path}`,
    ...(modified.get(path) ? { lastModified: new Date(modified.get(path)!) } : {}),
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
