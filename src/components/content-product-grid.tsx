import Link from "@/components/app-link";
import { FavoriteButton } from "@/components/product-actions";
import { SafeProductImage } from "@/components/product-image";
import { buildOfficialSearchUrl, dutyFreeSources, getSourceAccessLabel } from "@/lib/source-policy";
import { getCategoryBySlug, type Product } from "@/lib/site-data";

type ContentProductGridProps = {
  products: Product[];
  title?: string;
};

export function ContentProductGrid({ products, title = "대표 상품" }: ContentProductGridProps) {
  return (
    <div className="content-product-block">
      <div className="section-head">
        <div>
          <span className="eyebrow">Product List</span>
          <h2 className="section-title">{title}</h2>
          <p className="section-copy">
            각 상품은 최근 확인 공개가 또는 source status를 기준으로 안내하며, 예상 실결제가는 상품 상세에서 계산합니다.
          </p>
        </div>
      </div>

      <div className="content-product-grid">
        {products.map((product) => {
          const category = getCategoryBySlug(product.categorySlug);

          return (
            <article key={product.id} className="content-product-card">
              <div className="content-product-head">
                <SafeProductImage alt={`${product.displayName} 이미지`} categorySlug={product.categorySlug} />
                <div>
                  <span className="chip is-soft">{category?.name ?? product.categorySlug}</span>
                  <h3 className="card-title">{product.displayName}</h3>
                  <p className="section-copy">{product.brand} · {product.volume}</p>
                </div>
                <FavoriteButton product={product} />
              </div>

              <div className="source-status-mini-grid">
                {dutyFreeSources.map((source) => (
                  <span key={source.id} className="status-chip is-soft">
                    {source.name}: {getSourceAccessLabel(source.accessPolicy)}
                  </span>
                ))}
              </div>

              <p className="form-fine-print">
                가격 기준 시각은 상품 상세의 최근 확인 공개가 영역에서 확인하세요. 가격이 없으면 원본 링크를 제공합니다.
              </p>

              <div className="favorite-card-actions">
                <Link className="button" href={`/product/${product.slug}`}>
                  {product.brand} 예상 실결제가 계산
                </Link>
                <Link className="ghost-button" href={`/search?q=${encodeURIComponent(product.query)}`}>
                  국내가도 비교
                </Link>
                <a
                  className="ghost-button"
                  href={buildOfficialSearchUrl("shilla", product.query) ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  공식 면세점 확인
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
