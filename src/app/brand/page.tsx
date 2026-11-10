import type { Metadata } from "next";
import { BrandDirectory } from "@/components/brand-directory";
import Link from "@/components/app-link";
import { brandNameKey, directoryBrands } from "@/lib/brand-directory";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { brandLandings } from "@/lib/seo-content";
import { buildOfficialSearchUrl, dutyFreeSources } from "@/lib/source-policy";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";
import { getLowestPriceSummary } from "@/lib/snapshot-summaries";
import { categories, formatKrw, products } from "@/lib/site-data";
import "./brand-directory.css";

const initialTime = Date.now();

export const metadata: Metadata = {
  title: "브랜드별 면세 가격 비교 | 대표 브랜드 100개",
  description: "향수, 화장품, 주류 등 면세 쇼핑 브랜드 100개를 한국어·영문 이름과 카테고리로 찾고, 등록 상품의 관측가와 공식몰을 확인하세요.",
  alternates: { canonical: "/brand" },
};

export default function BrandIndexPage() {
  const snapshots = readPriceSnapshotsByProductId(products);
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" }, { name: "브랜드", path: "/brand" },
  ]);
  const entries = directoryBrands.map(brand => {
    const key = brandNameKey(brand.nameEn);
    const matching = products.filter(product => brandNameKey(product.brand) === key);
    const landing = brandLandings.find(item => brandNameKey(item.nameEn ?? item.nameKo) === key);
    const observations = matching.flatMap(product => {
      const snapshot = snapshots[product.id];
      if (!snapshot) return [];
      return Object.entries(snapshot.sources).flatMap(([sourceId, source]) => {
        const summary = getLowestPriceSummary(product, { ...snapshot, sources: { [sourceId]: source } });
        return summary?.observedAt ? [{
          name: product.displayName,
          store: summary.storeName,
          price: formatKrw(summary.priceKrw),
          time: summary.timestamp,
          observedAt: summary.observedAt,
          path: `/product/${product.slug}`,
        }] : [];
      });
    });
    return {
      ...brand,
      categoryName: categories.find(category => category.slug === brand.category)?.name ?? brand.category,
      count: matching.length,
      detailPath: landing && `/brand/${landing.slug}`,
      productPath: matching[0] && `/product/${matching[0].slug}`,
      officialLinks: dutyFreeSources.map(source => ({
        name: source.name,
        url: buildOfficialSearchUrl(source.id, brand.nameKo) ?? source.homepageUrl,
      })),
      observations,
    };
  });
  return <section className="page-section is-tight">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbs]) }} />
    <div className="container">
      <div className="breadcrumb"><Link href="/">홈</Link><span>/</span><span>브랜드</span></div>
      <h1 className="page-title">브랜드별 면세 가격 비교</h1>
      <p className="page-description">한국 여행객의 면세 쇼핑을 위한 대표 브랜드 {entries.length}개를 모았습니다. 등록 상품의 확인 가격과 관측일을 함께 볼 수 있습니다.</p>
      <p className="section-copy">최근 관측가는 3일 이내 확인한 가격입니다. 공식몰 검색에서 판매 여부와 최종 결제 조건을 확인하세요.</p>
      <BrandDirectory entries={entries} initialTime={initialTime} />
    </div>
  </section>;
}
