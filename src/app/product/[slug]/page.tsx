import type { Metadata } from "next";
import Link from "@/components/app-link";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/product-page-client";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/json-ld";
import { buildSearchResultFromSnapshot } from "@/lib/price-snapshot-view";
import { readProductPriceSnapshot } from "@/lib/static-price-snapshots";
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
  products,
} from "@/lib/site-data";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "상품을 찾을 수 없음",
    };
  }

  return {
    title: product.displayName,
    description: `${product.displayName}의 최근 확인 공개가, 국내가 참고 비교, 공식 면세점 링크를 확인해보세요.`,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.categorySlug);
  const relatedProducts = getRelatedProducts(product.categorySlug, product.id);
  const priceSnapshot = readProductPriceSnapshot(product.id);
  const initialResult = buildSearchResultFromSnapshot(product, priceSnapshot);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: category?.name ?? product.categorySlug, path: `/category/${product.categorySlug}` },
    { name: product.displayName, path: `/product/${product.slug}` },
  ]);
  const productJsonLd = buildProductJsonLd(product);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, productJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}`}>{category?.name}</Link>
          <span>/</span>
          <span>{product.displayName}</span>
        </div>

        <ProductPageClient
          categoryName={category?.name}
          initialResult={initialResult}
          product={product}
          relatedProducts={relatedProducts}
        />
      </div>
    </section>
  );
}
