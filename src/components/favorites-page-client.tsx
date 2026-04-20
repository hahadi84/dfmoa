"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "@/components/app-link";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { PriceAlertForm } from "@/components/price-alert-form";
import { FavoriteButton, useFavoriteProducts, useRecentProducts } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { SearchForm } from "@/components/search-form";
import { brandLandings } from "@/lib/seo-content";
import { buildSearchApiPath } from "@/lib/search-api-url";
import { buildSourcePrices, formatDisplayTimestamp, getAggregatePriceStatus, getComparableSourcePrices, getPriceStatusLabel, getPriceStatusTone } from "@/lib/source-policy";
import { categories, formatKrw, getCategoryBySlug, getStoreById, products, type Product, type StoreId } from "@/lib/site-data";
import type { SearchApiResponse, SourcePrice } from "@/lib/search-types";

type FavoriteInsight = {
  productSlug: string;
  result: SearchApiResponse | null;
  error: string | null;
  isLoading: boolean;
};

type FavoritesPageClientProps = {
  popularProducts: Product[];
};

export function FavoritesPageClient({ popularProducts }: FavoritesPageClientProps) {
  const favorites = useFavoriteProducts();
  const recentProducts = useRecentProducts();
  const productBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product])), []);
  const favoriteProducts = useMemo(
    () =>
      favorites
        .map((favorite) => productBySlug.get(favorite.slug))
        .filter((product): product is Product => Boolean(product)),
    [favorites, productBySlug]
  );
  const recentKnownProducts = useMemo(
    () =>
      recentProducts
        .map((recent) => productBySlug.get(recent.slug))
        .filter((product): product is Product => Boolean(product))
        .slice(0, 8),
    [productBySlug, recentProducts]
  );
  const [insights, setInsights] = useState<Record<string, FavoriteInsight>>({});

  useEffect(() => {
    const targets = favoriteProducts.slice(0, 12);
    const controller = new AbortController();

    if (!targets.length) {
      return () => controller.abort();
    }

    startTransition(() => {
      setInsights((current) => {
        const next = { ...current };

        for (const product of targets) {
          next[product.slug] = {
            productSlug: product.slug,
            result: current[product.slug]?.result ?? null,
            error: null,
            isLoading: true,
          };
        }

        return next;
      });
    });

    targets.forEach(async (product) => {
      try {
        const response = await fetch(buildSearchApiPath(product.query, { productId: product.slug }), {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = (await response.json()) as SearchApiResponse;

        startTransition(() => {
          setInsights((current) => ({
            ...current,
            [product.slug]: {
              productSlug: product.slug,
              result,
              error: null,
              isLoading: false,
            },
          }));
        });
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        startTransition(() => {
          setInsights((current) => ({
            ...current,
            [product.slug]: {
              productSlug: product.slug,
              result: null,
              error: fetchError instanceof Error ? fetchError.message : "가격 상태를 확인하지 못했습니다.",
              isLoading: false,
            },
          }));
        });
      }
    });

    return () => controller.abort();
  }, [favoriteProducts]);

  return (
    <div className="favorites-page">
      <div className="favorites-hero surface-card">
        <span className="eyebrow">Retention</span>
        <h1 className="page-title">관심상품</h1>
        <p className="page-description">
          다시 확인할 상품의 최근 확인 공개가, 면세점별 source status, 가격 기준 시각, 예상 실결제가 계산 진입점을
          한곳에 모았습니다.
        </p>
        <SearchForm compact />
      </div>

      {favoriteProducts.length ? (
        <div className="favorite-insight-grid">
          {favoriteProducts.map((product) => (
            <FavoriteInsightCard
              key={product.slug}
              product={product}
              insight={insights[product.slug]}
            />
          ))}
        </div>
      ) : (
        <EmptyFavoritesState recentProducts={recentKnownProducts} popularProducts={popularProducts} />
      )}

      <div className="split-grid" style={{ marginTop: 12 }}>
        <article className="surface-card">
          <span className="eyebrow">Recently Viewed</span>
          <h2 className="card-title">최근 본 상품</h2>
          {recentKnownProducts.length ? (
            <div className="compact-product-list">
              {recentKnownProducts.map((product) => (
                <Link key={product.slug} className="compact-product-row" href={`/product/${product.slug}`}>
                  <SafeProductImage alt={`${product.displayName} 이미지`} categorySlug={product.categorySlug} />
                  <span>
                    <strong>{product.displayName}</strong>
                    <small>{product.brand} · {product.volume}</small>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="section-copy">최근 본 상품이 쌓이면 이곳에서 이어서 확인할 수 있습니다.</p>
          )}
        </article>

        <NewsletterSignupForm source="favorite_page" />
      </div>
    </div>
  );
}

function FavoriteInsightCard({
  product,
  insight,
}: {
  product: Product;
  insight?: FavoriteInsight;
}) {
  const sourcePrices = insight?.result
    ? buildSourcePrices({
        offers: insight.result.offers,
        statuses: insight.result.statuses,
        query: product.query,
      })
    : [];
  const comparablePrices = getComparableSourcePrices(sourcePrices);
  const lowestPrice = comparablePrices.sort((left, right) => (left.price ?? 0) - (right.price ?? 0))[0];
  const aggregateStatus = sourcePrices.length ? getAggregatePriceStatus(sourcePrices) : "unavailable";
  const category = getCategoryBySlug(product.categorySlug);
  const timestamp = formatDisplayTimestamp(lowestPrice?.fetchedAt);

  return (
    <article className="surface-card favorite-insight-card">
      <div className="favorite-card-head">
        <div className="favorite-product-visual">
          <SafeProductImage alt={`${product.displayName} 이미지`} categorySlug={product.categorySlug} />
        </div>
        <div>
          <span className="chip is-soft">{category?.name ?? product.categorySlug}</span>
          <h2 className="card-title">{product.displayName}</h2>
          <p className="section-copy">{product.brand} · {product.volume}</p>
        </div>
        <FavoriteButton product={product} />
      </div>

      <div className="favorite-price-row">
        <div>
          <span className={`status-chip ${getPriceStatusTone(aggregateStatus)}`}>
            {insight?.isLoading ? "가격 확인 중" : getPriceStatusLabel(aggregateStatus)}
          </span>
          <strong>{lowestPrice?.price ? formatKrw(lowestPrice.price) : "원본 확인 필요"}</strong>
          <small>
            {lowestPrice?.sourceName ? `${lowestPrice.sourceName} · ` : ""}
            {timestamp ? `가격 기준 시각: ${timestamp}` : "최근 확인 시각 없음"}
          </small>
        </div>
        <Link className="ghost-button" href={`/product/${product.slug}`}>
          예상 실결제가 계산
        </Link>
      </div>

      <SourceStatusSummary sourcePrices={sourcePrices} />

      {insight?.error ? <p className="form-message is-error">가격 상태를 불러오지 못했습니다. 원본 링크로 확인해 주세요.</p> : null}

      <div className="favorite-card-actions">
        <Link className="button" href={`/product/${product.slug}`}>
          상세 비교 보기
        </Link>
        <Link className="ghost-button" href={`/search?q=${encodeURIComponent(product.query)}`}>
          국내가도 비교
        </Link>
        {lowestPrice?.sourceUrl || lowestPrice?.searchUrl ? (
          <a className="ghost-button" href={(lowestPrice.sourceUrl || lowestPrice.searchUrl) ?? "#"} target="_blank" rel="noreferrer">
            원본에서 확인
          </a>
        ) : null}
      </div>

      <details className="favorite-alert-details">
        <summary>가격 알림 등록</summary>
        <PriceAlertForm product={product} source="favorite_page" compact />
      </details>
    </article>
  );
}

function SourceStatusSummary({ sourcePrices }: { sourcePrices: SourcePrice[] }) {
  if (!sourcePrices.length) {
    return <p className="section-copy">면세점별 source status를 확인하는 중입니다.</p>;
  }

  return (
    <div className="source-status-mini-grid">
      {sourcePrices.map((sourcePrice) => {
        const store = getStoreById(sourcePrice.sourceId as StoreId);

        return (
          <span key={sourcePrice.sourceId} className={`status-chip ${getPriceStatusTone(sourcePrice.status)}`}>
            {store?.shortName ?? sourcePrice.sourceName}: {getPriceStatusLabel(sourcePrice.status)}
          </span>
        );
      })}
    </div>
  );
}

function EmptyFavoritesState({
  recentProducts,
  popularProducts,
}: {
  recentProducts: Product[];
  popularProducts: Product[];
}) {
  return (
    <article className="surface-card empty-favorites-state">
      <span className="eyebrow">Start Here</span>
      <h2 className="card-title">아직 관심상품이 없습니다.</h2>
      <p className="section-copy">
        인기 상품이나 최근 본 상품에서 관심상품을 추가하면 가격 기준 시각, source status, 예상 실결제가 계산을
        빠르게 다시 확인할 수 있습니다.
      </p>

      <div className="chip-row">
        {brandLandings.slice(0, 6).map((brand) => (
          <Link key={brand.slug} className="chip is-soft" href={`/brand/${brand.slug}`}>
            {brand.nameKo} 면세 가격 비교
          </Link>
        ))}
        {categories.slice(0, 5).map((category) => (
          <Link key={category.slug} className="chip is-soft" href={`/category/${category.slug}`}>
            {category.name}
          </Link>
        ))}
      </div>

      <div className="compact-product-list">
        {[...recentProducts, ...popularProducts].slice(0, 8).map((product) => (
          <Link key={product.slug} className="compact-product-row" href={`/product/${product.slug}`}>
            <SafeProductImage alt={`${product.displayName} 이미지`} categorySlug={product.categorySlug} />
            <span>
              <strong>{product.displayName}</strong>
              <small>{product.brand} · {product.volume}</small>
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}
