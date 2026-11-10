import Link from '@/components/app-link';
import { BenefitCollectionStatus } from '@/components/benefit-collection-status';
import { BenefitEventList } from '@/components/benefit-event-list';
import latest from '../../../data/content/benefit-latest.json';
import sources from '@/lib/benefit-sources.json';

type Props = {
  topic: 'discounts' | 'points';
  title: string;
  description: string;
  checks: ReadonlyArray<readonly [label: string, explanation: string]>;
};

export function BenefitTopicPage({ topic, title, description, checks }: Props) {
  const isPoints = topic === 'points';
  const matches = isPoints ? /적립|포인트|마일리지|H\.oney/i : /할인|쿠폰|특가|세일/;
  const events = latest.benefits.filter(event =>
    event.category !== '여행·제휴' &&
    !/렌트|렌터카|렌탈|로밍/.test(event.title) &&
    matches.test(event.title)
  );

  return (
    <section className="page-section is-tight benefit-current-page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link><span>/</span>
          <Link href="/benefits">할인·적립금</Link><span>/</span>
          <span>{isPoints ? '적립금' : '할인'}</span>
        </div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
        <nav className="chip-row" aria-label="관련 혜택 안내">
          <Link className="ghost-button" href="/benefits">전체 혜택 비교</Link>
          <Link className="ghost-button" href={isPoints ? '/benefits/discounts' : '/benefits/points'}>
            {isPoints ? '면세점 할인' : '면세점 적립금'}
          </Link>
          <Link className="ghost-button" href="/price-compare">상품 가격 비교</Link>
        </nav>

        <section className="guide-section">
          <h2 className="section-title">{isPoints ? '적립금을 받거나 쓰기 전 확인할 조건' : '할인 적용 전에 확인할 조건'}</h2>
          <ul>{checks.map(([label, explanation]) => (
            <li key={label}><strong>{label}</strong> {explanation}</li>
          ))}</ul>
        </section>

        <section className="report-section">
          <h2 className="section-title">{isPoints ? '면세점별 적립금·포인트 행사' : '면세점별 쿠폰·카드 할인 행사'}</h2>
          <p className="section-copy">
            {latest.checkedAt} 수집 기준 {events.length}개. 공식 목록에서 행사명과 기간을 확인한 항목입니다.
            혜택 금액, 적용 자격, 변경·종료 여부는 공식 상세 페이지에서 확인하세요.
          </p>
          {sources.map(source => {
            const offers = events.filter(event => event.storeId === source.storeId);
            const failed = latest.coverage.find(item => item.storeId === source.storeId)?.status === 'error';
            return (
              <details key={source.storeId} className="guide-section">
                <summary>
                  {source.name} · {failed ? '확인 실패' : `${offers.length}개 확인`}
                </summary>
                {offers.length ? (
                  <BenefitEventList benefits={offers.map(event => ({
                    title: event.title,
                    type: isPoints ? '적립금·포인트' : /카드|페이|결제/.test(event.title) ? '카드·결제 할인' : '할인·쿠폰',
                    url: event.url,
                    description: `${event.startDate} ~ ${event.endDate} · ${event.checkedAt} 목록 확인`,
                  }))} />
                ) : <p className="section-copy">공식 혜택 목록에서 적용 가능한 행사를 확인하세요.</p>}
                <a className="text-link" href={source.url} target="_blank" rel="noreferrer">{source.name} 공식 혜택 목록</a>
              </details>
            );
          })}
          <p className="section-copy">아래 확인 범위는 할인·적립금 외 행사를 포함한 전체 수집 내역입니다.</p>
          <BenefitCollectionStatus coverage={latest.coverage} />
        </section>
      </div>
    </section>
  );
}
