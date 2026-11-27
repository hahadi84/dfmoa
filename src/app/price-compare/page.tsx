import { PreservedPage } from "@/components/preserved-page";
import { PriceCompareProductLinks } from "@/components/price-compare-product-links";
import { preservedMetadata } from "@/lib/preserved-pages";
import Link from "@/components/app-link";
import { SearchForm } from "@/components/search-form";

export const metadata = preservedMetadata("/price-compare");

export default function PriceComparePage() {
  return <PriceCompareProductLinks>
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb"><Link href="/">홈</Link><span>/</span><span>면세점 가격 비교</span></div>
        <article className="surface-card content-hero-card">
          <h1 className="page-title">롯데·신라·신세계·현대 면세점 가격 비교</h1>
          <p className="page-description">상품명이나 브랜드를 입력하고 원하는 용량을 선택하세요. 최근 확인한 공개가와 판매처를 볼 수 있습니다.</p>
          <SearchForm fromPriceCompare />
          <div className="chip-row" style={{ marginTop: 16 }}>
            <Link className="chip is-soft" href="/product/bleu-de-chanel-edp-100ml">블루 드 샤넬 EDP 100ml 면세 가격</Link>
            <Link className="chip is-soft" href="/product/estee-lauder-anr-100ml">에스티로더 갈색병 100ml</Link>
            <Link className="chip is-soft" href="/product/creed-aventus-50ml">크리드 어벤투스 50ml</Link>
            <Link className="chip is-soft" href="/benefits">할인·적립금 조건 보기</Link>
          </div>
        </article>
      </div>
    </section>
    <PreservedPage path="/price-compare" />
  </PriceCompareProductLinks>;
}
