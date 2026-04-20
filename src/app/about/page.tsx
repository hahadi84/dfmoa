import type { Metadata } from "next";
import Link from "@/components/app-link";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "DFMOA는 공항면세점 공개가와 국내 판매가를 한 화면에서 비교하는 정보 서비스입니다.",
};

export default function AboutPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>서비스 소개</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          About DFMOA
        </span>
        <h1 className="page-title">면세 가격 비교를 짧고 정확하게</h1>
        <p className="page-description">
          DFMOA는 면세점 공개가, 국내 판매가, 혜택 조건을 분리해 보여주는 비교 서비스입니다.
        </p>

        <div className="three-grid" style={{ marginTop: 24 }}>
          <article className="surface-card">
            <p className="panel-title">입력</p>
            <p className="section-copy" style={{ marginTop: 8 }}>
              브랜드·상품명·용량 중심으로 검색합니다.
            </p>
          </article>
          <article className="surface-card">
            <p className="panel-title">매칭</p>
            <p className="section-copy" style={{ marginTop: 8 }}>
              비슷한 상품보다 같은 상품을 우선합니다.
            </p>
          </article>
          <article className="surface-card">
            <p className="panel-title">비교</p>
            <p className="section-copy" style={{ marginTop: 8 }}>
              면세가·국내가·혜택 링크를 나란히 정리합니다.
            </p>
          </article>
        </div>

        <div className="split-grid" style={{ marginTop: 24 }}>
          <article className="surface-card">
            <p className="panel-title">브랜드 약속</p>
            <div className="guide-body" style={{ marginTop: 14 }}>
              <div className="guide-section">
                <h2 className="card-title" style={{ fontSize: "1rem" }}>
                  공개가와 혜택을 구분합니다
                </h2>
                <p className="section-copy">결제 조건이 필요한 쿠폰·적립금은 최저가와 섞지 않습니다.</p>
              </div>
              <div className="guide-section">
                <h2 className="card-title" style={{ fontSize: "1rem" }}>
                  원본 출처를 남깁니다
                </h2>
                <p className="section-copy">각 가격과 혜택은 확인 가능한 원본 링크를 함께 제공합니다.</p>
              </div>
              <div className="guide-section">
                <h2 className="card-title" style={{ fontSize: "1rem" }}>
                  동일 상품 기준을 강화합니다
                </h2>
                <p className="section-copy">용량, 모델명, 세트 구성을 확인해 다른 상품 유입을 줄입니다.</p>
              </div>
              <div className="guide-section">
                <h2 className="card-title" style={{ fontSize: "1rem" }}>
                  사용자가 최종 판단합니다
                </h2>
                <p className="section-copy">재고, 회원 등급, 결제수단은 원본 면세점에서 마지막으로 확인해야 합니다.</p>
              </div>
            </div>
          </article>

          <aside className="feature-panel">
            <p className="panel-title">다음 개선 방향</p>
            <div className="subgrid" style={{ marginTop: 14 }}>
              <div className="list-item">
                <span className="list-number">A</span>
                <p className="list-copy">
                  <strong>혜택 계산</strong>
                  쿠폰·적립금 조건을 룰로 분리
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">B</span>
                <p className="list-copy">
                  <strong>이력 강화</strong>
                  장기 수집으로 가격 흐름 정교화
                </p>
              </div>
              <div className="list-item">
                <span className="list-number">C</span>
                <p className="list-copy">
                  <strong>정확도 개선</strong>
                  모델·용량·세트 매칭 보강
                </p>
              </div>
              <Link className="ghost-button" href="/editorial-policy">
                운영정책 보기
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
