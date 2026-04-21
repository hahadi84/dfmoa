import type { Metadata } from "next";
import Link from "@/components/app-link";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/product-page-client";
import { readProductContext } from "@/lib/context-content";
import { buildBreadcrumbJsonLd, buildProductJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildSearchResultFromSnapshot } from "@/lib/price-snapshot-view";
import { readProductPriceSnapshot } from "@/lib/static-price-snapshots";
import { buildProductMetadata } from "@/lib/seo-metadata";
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

  const priceSnapshot = readProductPriceSnapshot(product.id);

  return buildProductMetadata(product, priceSnapshot);
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
  const productContext = readProductContext(product.slug);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: category?.name ?? product.categorySlug, path: `/category/${product.categorySlug}` },
    { name: product.displayName, path: `/product/${product.slug}` },
  ]);
  const productJsonLd = buildProductJsonLd(product, priceSnapshot);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, productJsonLd]) }}
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
          productContext={productContext}
          relatedProducts={relatedProducts}
        />
      </div>
    </section>
  );
}
