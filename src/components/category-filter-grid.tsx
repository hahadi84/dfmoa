"use client";

import { useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeaturedProductGrid } from "@/components/featured-product-grid";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/site-data";

type CategoryFilterGridProps = {
  products: Product[];
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

export function CategoryFilterGrid({ products }: CategoryFilterGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const brand = searchParams.get("brand") ?? "";
  const size = searchParams.get("size") ?? "";
  const sort = searchParams.get("sort") ?? "popular";
  const brands = useMemo(() => unique(products.map((product) => product.brand)), [products]);
  const sizes = useMemo(() => unique(products.map((product) => product.volume)), [products]);
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (brand && product.brand !== brand) {
        return false;
      }

      if (size && product.volume !== size) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sort === "brand") {
        return left.brand.localeCompare(right.brand);
      }

      if (sort === "name") {
        return left.displayName.localeCompare(right.displayName);
      }

      if (sort === "recent") {
        return right.id.localeCompare(left.id);
      }

      return 0;
    });
  }, [brand, products, size, sort]);

  function updateFilter(key: "brand" | "size" | "sort", value: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    startTransition(() => {
      router.replace(next.toString() ? `?${next.toString()}` : "?", { scroll: false });
    });
    trackEvent("category_filter_apply", {
      filter_key: key,
      has_value: Boolean(value),
      result_count: filteredProducts.length,
    });
  }

  function resetFilters() {
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  }

  return (
    <div className="category-filter-block">
      <details className="category-filter-panel" open>
        <summary>필터와 정렬</summary>
        <div className="category-filter-grid">
          <label>
            브랜드
            <select value={brand} onChange={(event) => updateFilter("brand", event.target.value)}>
              <option value="">전체 브랜드</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            용량/옵션
            <select value={size} onChange={(event) => updateFilter("size", event.target.value)}>
              <option value="">전체 용량</option>
              {sizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            정렬
            <select value={sort} onChange={(event) => updateFilter("sort", event.target.value)}>
              <option value="popular">인기순</option>
              <option value="recent">최근 업데이트순</option>
              <option value="brand">브랜드명순</option>
              <option value="name">상품명순</option>
            </select>
          </label>
          <button type="button" className="ghost-button" onClick={resetFilters}>
            초기화
          </button>
        </div>
        <p className="form-fine-print">
          필터 URL은 공유할 수 있지만 sitemap에는 포함하지 않습니다. 검색 수요가 검증된 조합만 별도 콘텐츠로 검토합니다.
        </p>
      </details>

      <p className="section-copy">
        {isPending ? "필터 적용 중" : `${filteredProducts.length}개 상품 표시`} · 가격 상태는 상품 상세의 source status를
        기준으로 확인합니다.
      </p>
      <FeaturedProductGrid products={filteredProducts} />
    </div>
  );
}
