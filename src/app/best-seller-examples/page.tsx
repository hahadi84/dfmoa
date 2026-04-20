import type { Metadata } from "next";
import Link from "@/components/app-link";
import {
  bestSellerExampleMethodology,
  bestSellerExampleNotice,
  bestSellerExampleUpdatedAt,
  storeBestSellerExamples,
} from "@/lib/best-seller-examples";

export const metadata: Metadata = {
  title: "면세점별 베스트10 추천 예시",
  description: "공식 판매량 순위가 아닌, 가격 비교를 시작하기 좋은 면세점별 추천 예시 TOP 10입니다.",
  alternates: {
    canonical: "/best-seller-examples",
  },
};

function getStoreBadgeLabel(storeName: string) {
  return storeName.replace(/면세점/g, "").trim().slice(0, 3);
}

export default function BestSellerExamplesPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>베스트10 추천 예시</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Recommendation Example
        </span>
        <h1 className="page-title">면세점별 판매량 베스트10 추천 예시</h1>
        <p className="page-description">
          공식 판매량 순위가 아니라 검색을 시작하기 좋은 대표 상품 예시입니다. 실제 구매 판단은 원본 면세점에서 확인해
          주세요.
        </p>

        <div className="recommendation-notice">
          <strong>추천 예시</strong>
          <span>{bestSellerExampleNotice}</span>
          <small>기준일 {bestSellerExampleUpdatedAt}</small>
        </div>

        <div className="best-store-grid">
          {storeBestSellerExamples.map((storeExample) => (
            <article key={storeExample.storeId} className="surface-card best-store-card">
              <div className="best-store-head">
                <span className="benefit-logo-frame" aria-hidden="true">
                  <span className="store-logo-fallback is-text-only">{getStoreBadgeLabel(storeExample.storeName)}</span>
                </span>
                <div>
                  <span className="chip is-soft">추천 예시 TOP 10</span>
                  <h2 className="card-title">{storeExample.storeName}</h2>
                  <p className="section-copy">{storeExample.summary}</p>
                </div>
              </div>

              <div className="best-rank-list">
                {storeExample.items.map((item) => (
                  <Link
                    key={`${storeExample.storeId}-${item.product.slug}`}
                    className="best-rank-item"
                    href={`/search?q=${encodeURIComponent(item.product.query)}`}
                  >
                    <span className="best-rank-number">{String(item.rank).padStart(2, "0")}</span>
                    <span className="best-rank-copy">
                      <strong>{item.product.displayName}</strong>
                      <small>{item.reason}</small>
                    </span>
                    <span className="best-rank-signal">{item.signal}</span>
                  </Link>
                ))}
              </div>
              <p className="form-fine-print">{storeExample.caution}</p>
            </article>
          ))}
        </div>

        <article className="surface-card benefit-notice-card">
          <h2 className="card-title" style={{ fontSize: "1rem" }}>
            추천 예시 기준
          </h2>
          <ul>
            {bestSellerExampleMethodology.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
