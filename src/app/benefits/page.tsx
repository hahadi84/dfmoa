import type { Metadata } from 'next';
import Link from '@/components/app-link';
import { BenefitCollectionStatus } from '@/components/benefit-collection-status';
import { BenefitEventList } from '@/components/benefit-event-list';
import latest from '../../../data/content/benefit-latest.json';
import sources from '@/lib/benefit-sources.json';
import { latestBenefitReport } from '@/lib/benefit-report-generator';
export const metadata: Metadata = {
  title:'면세점 할인·적립금 이벤트',
  description:'롯데·신라·신세계·현대면세점의 기간 확인 행사와 쿠폰·결제·여행 제휴 혜택을 회사별로 정리합니다. 실제 확인일과 원본 상세 조건을 확인하세요.',
  alternates:{canonical:'/benefits'},
};
export default function BenefitsPage() {
  return <section className="page-section is-tight benefit-current-page"><div className="container">
    <div className="breadcrumb"><Link href="/">홈</Link><span>/</span><span>할인·적립금 이벤트</span></div>
    <h1 className="page-title">면세점 할인·적립금 이벤트</h1>
    <p className="page-description">롯데·신라·신세계·현대의 공식 목록에서 기간이 확인된 행사를 정리했습니다. 실제 적용 조건과 종료 여부는 각 면세점에서 확인하세요.</p>
    <p className="section-copy">최근 점검: {latest.checkedAt} · {new Set(latest.benefits.map(b=>b.storeId)).size}사 {latest.benefits.length}개 기간 확인 행사 · 회사별 실제 확인일은 아래 표를 확인하세요.</p>
    <BenefitCollectionStatus coverage={latest.coverage} />
    <nav aria-label="면세점별 혜택 바로가기" className="chip-row">
      {sources.map(source=><a key={source.storeId} className="text-link" href={'#benefits-'+source.storeId}>{source.name} ({latest.benefits.filter(b=>b.storeId===source.storeId).length}개)</a>)}
    </nav>
    {sources.map(source=>{
      const benefits=latest.benefits.filter(b=>b.storeId===source.storeId);
      return <details key={source.storeId} id={'benefits-'+source.storeId} className="surface-card" style={{marginTop:16,padding:20}}>
        <summary style={{cursor:'pointer',fontWeight:600}}>{source.name} · {benefits.length}개 기간 확인 행사</summary>
        {benefits.length?<BenefitEventList benefits={benefits.map(b=>({title:b.title,type:b.category,url:b.url,description:b.startDate+' ~ '+b.endDate+' · '+b.checkedAt+' 목록 확인 · '+b.description}))} />:<p className="section-copy">현재 확인된 행사가 없습니다. 위 확인 상태와 공식 목록을 확인하세요.</p>}
        <a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.name} 공식 혜택 목록</a>
      </details>;
    })}
    <p className="section-copy" style={{marginTop:24}}>회원·신규 가입·웨딩·항공권·통신사 등 대상 조건이 다릅니다. 할인율이나 최대 금액을 모든 구매에 적용하지 않으며, 적립금과 카드 할인은 중복 사용 및 제외 브랜드를 확인하세요.</p>
    <div className="chip-row"><Link className="text-link" href="/price-compare">상품 가격 비교</Link><Link className="text-link" href="/deals">월간 기록</Link><Link className="text-link" href={'/benefit-reports/'+latestBenefitReport.slug}>주간 기록</Link></div>
  </div></section>;
}
