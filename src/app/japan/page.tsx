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
    <p className="page-description">일본에서 본 가격이 원화로 얼마인지 바로 계산해 보세요. 카드 수수료와 확인된 예상 환급액을 입력하면 한국 면세점의 최종 결제액과 비교할 수 있습니다. 환급액이 불확실하면 0엔으로 두세요.</p>
    <div className="chip-row">
      <a className="button" href="#yen-calculator-title">엔화 가격 입력하기</a>
      <Link className="button is-secondary" href="/price-compare">한국 면세가 찾기</Link>
    </div>
    <div className="yen-reference"><strong>100엔 = {(rate.rate * 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원</strong><p>{rate.date} 기준 · ECB 참고 환율 · Frankfurter 제공</p><p>매일 갱신을 시도하며 휴일·제공 지연 시 마지막 기준일을 표시합니다. 실시간 시세나 은행·카드사의 실제 적용 환율이 아닙니다.</p><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">환율 출처</a></div>
    <YenComparisonCalculator initialRate={rate.rate * 100} />
    <section className="japan-next"><h2 className="section-title">비교할 상품과 가격부터 확인하기</h2><p className="section-copy">디올 소바쥬 100ml·SK-II 230ml의 일본 온라인 표시가와 히비키 700ml의 제조사 권장가격을 구분했습니다. 동일 규격의 한국 면세 결제액이 있어야 비교할 수 있습니다.</p><JapanShoppingLink href="/guide/japan-shopping-price-checklist#japan-price-examples-title" kind="product" source="japan">대표 상품 3개의 가격·규격 확인</JapanShoppingLink></section>
    <section className="japan-next"><h2 className="section-title">같은 상품의 면세 가격 확인</h2><p className="section-copy">모델·용량·수량을 맞춘 뒤 쿠폰 적용 후 최종가를 계산기에 입력하세요.</p><div className="chip-row"><Link className="button" href="/price-compare">면세 가격 비교하기</Link><Link className="button is-secondary" href="/category/perfume">향수</Link><Link className="button is-secondary" href="/category/beauty">화장품</Link><Link className="button is-secondary" href="/category/liquor">위스키·주류</Link></div></section>
    <section className="japan-next"><h2 className="section-title">일본 여행 전 읽어볼 가이드</h2><div className="japan-guide-list">{japanGuides.map(guide => <Link href={`/guide/${guide.slug}`} key={guide.slug}><h3>{guide.title}</h3><p>{guide.excerpt}</p><small>확인일 {guide.updatedAt}</small></Link>)}</div></section>
    <p className="section-copy"><Link href="/deals">이번 달 면세점 혜택</Link> · <Link href="/benefit-reports">주간 혜택 리포트</Link></p>
  </div></section>;
}
