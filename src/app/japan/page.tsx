import type { Metadata } from 'next';
import Link from '@/components/app-link';
import { YenComparisonCalculator } from '@/components/yen-comparison-calculator';
import { japanGuides } from '@/lib/japan-guides';
import { buildBreadcrumbJsonLd, serializeJsonLd } from '@/lib/json-ld';
import rate from '../../../data/content/yen-rate.json';

export const metadata: Metadata = {
  title: '엔화 환율 계산기 · 일본 여행 쇼핑과 면세 가격 비교',
  description: '100엔당 원화 참고 환율과 일본 쇼핑 계산기로 현지 구매 비용을 계산하세요. 향수·화장품·위스키 면세가 비교, 2026년 일본 면세 환급 변경까지 안내합니다.',
  alternates: { canonical: '/japan' },
};

export default function JapanPage() {
  return <section className="page-section is-tight japan-page"><div className="container">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([buildBreadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '일본 여행 쇼핑', path: '/japan' }])]) }} />
    <div className="breadcrumb"><Link href="/">홈</Link><span>/</span><span>일본 여행 쇼핑</span></div>
    <h1 className="page-title">일본 쇼핑, 환율부터 비교하세요</h1>
    <p className="page-description">엔화 환산 비용과 국내 면세점 최종가를 같은 기준으로 비교하세요. 수수료와 환급까지 계산하면 여행 쇼핑 예산을 정하기 쉽습니다.</p>
    <div className="yen-reference"><strong>100엔 = {(rate.rate * 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원</strong><p>{rate.date} 기준 · ECB 참고 환율 · Frankfurter 제공</p><p>매일 갱신을 시도하며 휴일·제공 지연 시 마지막 기준일을 표시합니다. 실시간 시세나 은행·카드사의 실제 적용 환율이 아닙니다.</p><a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">환율 출처</a></div>
    <YenComparisonCalculator initialRate={rate.rate * 100} />
    <section className="japan-next"><h2 className="section-title">같은 상품의 면세 가격 확인</h2><p className="section-copy">모델·용량·수량을 맞춘 뒤 쿠폰 적용 후 최종가를 계산기에 입력하세요.</p><div className="chip-row"><Link className="button" href="/price-compare">면세 가격 비교하기</Link><Link className="button is-secondary" href="/category/perfume">향수</Link><Link className="button is-secondary" href="/category/beauty">화장품</Link><Link className="button is-secondary" href="/category/liquor">위스키·주류</Link></div></section>
    <section className="japan-next"><h2 className="section-title">일본 여행 전 읽어볼 가이드</h2><div className="japan-guide-list">{japanGuides.map(guide => <Link href={`/guide/${guide.slug}`} key={guide.slug}><h3>{guide.title}</h3><p>{guide.excerpt}</p><small>확인일 {guide.updatedAt}</small></Link>)}</div></section>
    <p className="section-copy"><Link href="/deals">이번 달 면세점 혜택</Link> · <Link href="/benefit-reports">주간 혜택 리포트</Link></p>
  </div></section>;
}
