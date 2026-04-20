import type { Metadata } from "next";
import Link from "@/components/app-link";
import { latestBenefitReport } from "@/lib/benefit-report-generator";
import { dutyFreeBenefitStores, dutyFreeBenefitUpdatedAt } from "@/lib/duty-free-benefits";
import { getStoreById } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "면세점 할인·적립금 이벤트",
  description: "롯데, 현대, 신라, 신세계면세점의 쿠폰, 적립금, 카드 할인, 브랜드 이벤트 바로가기입니다.",
  alternates: {
    canonical: "/benefits",
  },
};

export default function BenefitsPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>할인·적립금 이벤트</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Duty-Free Benefits
        </span>
        <h1 className="page-title">면세점 할인·적립금 이벤트</h1>
        <p className="page-description">
          각 면세점 공홈의 쿠폰, 적립금, 카드 할인, 브랜드 행사를 원본 링크 중심으로 정리했습니다.
        </p>

        <article className="surface-card report-feature-card">
          <div>
            <span className="chip is-soft">주간 업데이트</span>
            <h2 className="card-title">{latestBenefitReport.title}</h2>
            <p className="section-copy">
              혜택 링크를 단순 나열하지 않고 출국일, 회원 등급, 결제수단별 확인 포인트까지 함께 정리합니다.
            </p>
          </div>
          <Link className="button" href={`/benefit-reports/${latestBenefitReport.slug}`}>
            혜택 리포트 보기
          </Link>
        </article>

        <div className="benefit-summary-grid">
          <article className="metric-card">
            <p className="metric-title">운영사</p>
            <p className="metric-value">{dutyFreeBenefitStores.length}</p>
            <p className="metric-copy">공홈 혜택 링크</p>
          </article>
          <article className="metric-card">
            <p className="metric-title">혜택 유형</p>
            <p className="metric-value" style={{ fontSize: "1.15rem" }}>
              쿠폰·적립금
            </p>
            <p className="metric-copy">카드·브랜드 행사 포함</p>
          </article>
          <article className="metric-card">
            <p className="metric-title">기준일</p>
            <p className="metric-value" style={{ fontSize: "1.05rem" }}>
              {dutyFreeBenefitUpdatedAt}
            </p>
            <p className="metric-copy">공개 페이지 확인 기준</p>
          </article>
        </div>

        <div className="benefit-store-grid">
          {dutyFreeBenefitStores.map((benefitStore) => {
            const store = getStoreById(benefitStore.storeId);

            if (!store) {
              return null;
            }

            return (
              <article key={benefitStore.storeId} className="surface-card benefit-store-card">
                <div className="benefit-store-head">
                  <span className="benefit-logo-frame" aria-hidden="true">
                    <span className="store-logo-fallback is-text-only">{store.shortName}</span>
                  </span>
                  <div>
                    <h2 className="card-title" style={{ fontSize: "1.05rem" }}>
                      {store.name}
                    </h2>
                    <p className="section-copy">{benefitStore.summary}</p>
                  </div>
                  <a className="text-link" href={benefitStore.benefitHomeUrl} target="_blank" rel="noopener noreferrer">
                    공홈
                  </a>
                </div>

                <div className="chip-row benefit-chip-row">
                  {benefitStore.highlights.map((highlight) => (
                    <span key={highlight} className="chip is-soft">
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="benefit-link-list">
                  {benefitStore.eventLinks.map((eventLink) => (
                    <a
                      key={`${benefitStore.storeId}-${eventLink.title}`}
                      className="benefit-link-item"
                      href={eventLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="benefit-link-copy">
                        <span className="benefit-link-title-line">
                          <strong>{eventLink.title}</strong>
                          <span className="benefit-action-button is-benefit">{eventLink.type}</span>
                        </span>
                        <small>{eventLink.description}</small>
                      </span>
                      <span className="text-link">원본</span>
                    </a>
                  ))}
                </div>

                <div className="benefit-check-card">
                  <p className="panel-title">확인할 점</p>
                  <ul>
                    {benefitStore.checkPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <article className="surface-card benefit-notice-card">
          <h2 className="card-title" style={{ fontSize: "1rem" }}>
            이용 전 안내
          </h2>
          <p className="section-copy" style={{ marginTop: 8 }}>
            이벤트와 적립금은 공홈 로그인 상태, 출국일, 회원 등급, 결제수단, 브랜드 정책, 재고 상황에 따라 달라질 수
            있습니다. DFMOA는 원본 링크와 비교 기준을 정리하며, 최종 적용 여부는 각 면세점 공홈에서 확인해야 합니다.
          </p>
          <div className="chip-row" style={{ marginTop: 12 }}>
            <Link className="chip is-soft" href="/data-source-policy">
              데이터 출처 정책
            </Link>
            <Link className="chip is-soft" href="/advertising-policy">
              광고 운영 원칙
            </Link>
            <Link className="chip is-soft" href="/contact">
              오류 제보
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
