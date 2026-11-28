import { buildSeoMetadata } from '@/lib/seo-metadata';
import Link from '@/components/app-link';
import { YenComparisonCalculator } from '@/components/yen-comparison-calculator';
import { JapanShoppingLink } from '@/components/japan-shopping-link';
import { japanGuides } from '@/lib/japan-guides';
import { buildBreadcrumbJsonLd, serializeJsonLd } from '@/lib/json-ld';
import rate from '../../../data/content/yen-rate.json';

export const metadata = buildSeoMetadata({
  title: '엔화 환율 계산기 | 일본 쇼핑 금액을 원화로',
  description: '일본에서 본 엔화 가격, 원화로 얼마일까요? 엔화 금액을 입력해 원화로 환산하고 카드 수수료·확인된 예상 환급액을 반영해 한국 면세점 결제액과 비교하세요. 적용 환율의 기준일도 확인할 수 있습니다.',
  path: '/japan',
  image: { path: '/og/default.png', alt: '면세모아 DFMOA' },
});

export default function JapanPage() {
  return <section className="page-section is-tight japan-page"><div className="container">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([buildBreadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '일본 여행 쇼핑', path: '/japan' }])]) }} />
    <div className="breadcrumb"><Link href="/">홈</Link><span>/</span><span>일본 여행 쇼핑</span></div>
    <h1 className="page-title">엔화 환율 계산기: 일본 쇼핑 금액을 원화로</h1>
    <p className="page-description"><span lang="ja">税込</span>(세금 포함) 금액을 입력하세요. 환산액은 카드 수수료·환급 적용 전 금액입니다. <Link href="/guide/yen-rate-duty-free-comparison#japan-price-tag">가격표 읽는 예시</Link></p>
    <YenComparisonCalculator initialRate={rate.rate * 100} rateDate={rate.date} />
    <section className="japan-next">
      <h2 className="section-title">쇼핑 전에 가격과 귀국편 수하물 확인하기</h2>
      <p className="section-copy">히비키 재패니즈 하모니 700ml는 11월 26일 일본 배송몰과 부산면세점이 표시한 한 병 가격을 대조했습니다. 디올 향수와 SK-II 에센스는 11월 18일에 확인한 가격과 규격을 볼 수 있습니다.</p>
      <div className="chip-row">
        <JapanShoppingLink href="/guide/japan-shopping-price-checklist#example-p6" kind="product" source="japan" product="hibiki-harmony-700ml">히비키 700ml의 일본·한국 표시가 확인</JapanShoppingLink>
        <JapanShoppingLink href="/guide/japan-shopping-price-checklist#japan-price-examples-title" kind="product" source="japan">대표 상품 3개의 가격·규격 확인</JapanShoppingLink>
        <Link className="ghost-button" href="/guide/japan-shopping-price-checklist#japan-liquid-baggage">향수·화장품·위스키 짐 싸는 법</Link>
      </div>
    </section>
    <section className="japan-next"><h2 className="section-title">같은 상품의 면세 가격 확인</h2><p className="section-copy">모델·용량·수량을 맞춘 뒤 쿠폰 적용 후 최종가를 계산기에 입력하세요.</p><div className="chip-row"><Link className="button" href="/price-compare">면세 가격 비교하기</Link><Link className="button is-secondary" href="/category/perfume">향수</Link><Link className="button is-secondary" href="/category/beauty">화장품</Link><Link className="button is-secondary" href="/category/liquor">위스키·주류</Link></div></section>
    <section className="japan-next">
      <h2 className="section-title">일본 여행 중 병원·처방약 안내</h2>
      <div className="japan-guide-list">
        <Link href="/japan/clinics"><h3>일본 병원 찾기</h3><p>지역과 진료 분야별로 병원을 찾고 언어 지원과 방문 조건을 확인하세요.</p></Link>
        <Link href="/japan/clinics/mounjaro"><h3>일본 마운자로 처방 병원·가격</h3><p>지역별 상담 기관과 초진료·서류비를 포함한 견적을 확인하세요.</p></Link>
        <Link href="/guide/japan-mounjaro-travel-checklist"><h3>마운자로 처방·한국 반입 준비</h3><p>출발 전 확인할 증빙 서류와 보관·항공 운송 조건을 살펴보세요.</p><small>DFMOA 여행 가이드</small></Link>
      </div>
    </section>
    <section className="japan-next"><h2 className="section-title">일본 여행 전 읽어볼 가이드</h2><div className="japan-guide-list">{japanGuides.filter(guide => guide.slug !== "japan-mounjaro-travel-checklist").map(guide => <Link href={`/guide/${guide.slug}`} key={guide.slug}><h3>{guide.title}</h3><p>{guide.excerpt}</p><small>확인일 {guide.updatedAt}</small></Link>)}</div></section>
    <p className="section-copy"><Link href="/deals">이번 달 면세점 혜택</Link> · <Link href="/benefit-reports">주간 혜택 리포트</Link></p>
  </div></section>;
}
