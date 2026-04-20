import type { Metadata } from "next";
import Link from "@/components/app-link";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { brandLandings } from "@/lib/seo-content";
import { readPriceSnapshotsByProductId } from "@/lib/static-price-snapshots";
import { getLowestPriceSummary } from "@/lib/snapshot-summaries";
import { products } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "브랜드별 면세 가격 비교",
  description: "DFMOA에 등록된 면세점 비교 브랜드를 대표 상품 수와 현재 최저가 상품 기준으로 모아봅니다.",
  alternates: {
    canonical: "/brand",
  },
};

function getBrandInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.at(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function BrandIndexPage() {
  const priceSnapshotsByProductId = readPriceSnapshotsByProductId(products);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "브랜드", path: "/brand" },
  ]);
  const brandCards = brandLandings.map((brand) => {
    const brandProducts = brand.representativeProductIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is (typeof products)[number] => Boolean(product));
    const lowestItem = brandProducts
      .flatMap((product) => {
        const item = getLowestPriceSummary(product, priceSnapshotsByProductId[product.id]);
        return item ? [item] : [];
      })
      .sort((left, right) => left.priceKrw - right.priceKrw)[0];

    return {
      brand,
      brandProducts,
      lowestItem,
    };
  });

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>브랜드</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Brand Index
        </span>
        <h1 className="page-title">브랜드별 면세 가격 비교</h1>
        <p className="page-description">
          대표 상품이 등록된 브랜드를 한곳에 모았습니다. 가격이 확인된 브랜드는 현재 최저가 상품을 함께 표시합니다.
        </p>

        <div className="brand-index-grid">
          {brandCards.map(({ brand, brandProducts, lowestItem }) => (
            <Link key={brand.slug} className="brand-index-card" href={`/brand/${brand.slug}`}>
              <span className="brand-logo-placeholder" aria-hidden="true">
                {getBrandInitials(brand.nameEn ?? brand.nameKo)}
              </span>
              <span className="chip is-soft">{brandProducts.length}개 대표 상품</span>
              <h2 className="card-title">{brand.nameKo}</h2>
              <p className="section-copy">{brand.description}</p>
              <div className="brand-lowest-line">
                {lowestItem ? (
                  <>
                    <strong>{lowestItem.product.displayName}</strong>
                    <span>
                      {lowestItem.storeName} · {lowestItem.priceLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <strong>가격 확인 준비 중</strong>
                    <span>상세 페이지에서 원본 면세점 확인 링크를 제공합니다.</span>
                  </>
                )}
              </div>
              <span className="text-link">브랜드 보기</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
