import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/app-link";
import { ContentProductGrid } from "@/components/content-product-grid";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { buildBrandJsonLd, buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildBrandMetadata } from "@/lib/seo-metadata";
import {
  brandLandings,
  getBrandLandingBySlug,
  getCategoryLinks,
  getRelatedGuides,
  monthlyDealReports,
} from "@/lib/seo-content";
import { dutyFreeSources } from "@/lib/source-policy";
import { products } from "@/lib/site-data";

type BrandPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return brandLandings.map((brand) => ({
    slug: brand.slug,
  }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandLandingBySlug(slug);

  if (!brand) {
    return {
      title: "브랜드를 찾을 수 없습니다",
      robots: { index: false, follow: true },
    };
  }

  const productCount = brand.representativeProductIds.length;

  return buildBrandMetadata({
    slug: brand.slug,
    nameKo: brand.nameKo,
    nameEn: brand.nameEn,
    productCount,
    description:
      brand.seoDescription ??
      `${brand.nameKo} 대표 상품 ${productCount}개의 최근 확인 공개가, source status, 예상 실결제가 계산 진입점과 공식 면세점 확인 링크를 제공합니다.`,
  });
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getBrandLandingBySlug(slug);

  if (!brand) {
    notFound();
  }

  const brandProducts = brand.representativeProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const categoryLinks = getCategoryLinks(brand.categoryIds);
  const relatedGuides = getRelatedGuides(brand.relatedGuideSlugs);
  const relatedDeals = monthlyDealReports.filter((report) => brand.relatedDealSlugs?.includes(report.slug));
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "브랜드", path: "/brand" },
    { name: brand.nameKo, path: `/brand/${brand.slug}` },
  ]);
  const itemListJsonLd = buildBrandJsonLd(brand);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, itemListJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/brand">브랜드</Link>
          <span>/</span>
          <span>{brand.nameKo}</span>
        </div>

        <article className="surface-card content-hero-card">
          <span className="eyebrow">Brand Landing</span>
          <h1 className="page-title">{brand.nameKo} 면세 가격 비교</h1>
          <p className="page-description">{brand.description}</p>
          <div className="report-meta-row">
            <span>업데이트: {brand.updatedAt}</span>
            <span>대표 상품 {brandProducts.length}개</span>
            <span>최종 결제가는 원본 면세점에서 확인</span>
          </div>
        </article>

        <ContentProductGrid products={brandProducts} title={`${brand.nameKo} 대표 상품`} />

        <div className="split-grid" style={{ marginTop: 12 }}>
          <article className="surface-card">
            <h2 className="card-title">공식 면세점 확인 링크</h2>
            <p className="section-copy">
              가격이 없거나 source status가 제한적인 경우에도 원본 면세점에서 현재 판매 여부와 최종 결제 금액을 확인할
              수 있습니다.
            </p>
            <div className="official-link-row" style={{ marginTop: 10 }}>
              {dutyFreeSources.map((source) => (
                <a key={source.id} className="official-link-button" href={source.homepageUrl} target="_blank" rel="noreferrer">
                  {source.name} 공식몰
                </a>
              ))}
            </div>
          </article>

          <NewsletterSignupForm source="benefit_reports" />
        </div>

        <div className="split-grid" style={{ marginTop: 12 }}>
          <article className="surface-card">
            <h2 className="card-title">관련 카테고리와 가이드</h2>
            <div className="chip-row" style={{ marginTop: 10 }}>
              {categoryLinks.map((category) => (
                <Link key={category.slug} className="chip is-soft" href={`/category/${category.slug}`}>
                  {category.name} 비교
                </Link>
              ))}
              {relatedGuides.map((guide) => (
                <Link key={guide.slug} className="chip is-soft" href={`/guide/${guide.slug}`}>
                  {guide.title}
                </Link>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <h2 className="card-title">관련 혜택 리포트</h2>
            <div className="chip-row" style={{ marginTop: 10 }}>
              {relatedDeals.map((deal) => (
                <Link key={deal.slug} className="chip is-soft" href={`/deals/${deal.slug}`}>
                  {deal.title}
                </Link>
              ))}
              <Link className="chip is-soft" href="/benefit-reports">
                주간 면세 리포트
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
