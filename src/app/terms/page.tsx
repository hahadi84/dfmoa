import type { Metadata } from "next";
import Link from "@/components/app-link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "DFMOA 서비스 이용 조건, 책임 한계, 외부 링크, 콘텐츠 사용 기준",
  alternates: {
    canonical: "/terms",
  },
};

const terms = [
  {
    title: "서비스 목적",
    body: "DFMOA는 한국에서 이용 가능한 공항면세점 상품 가격과 국내 공개 판매가를 한 화면에서 비교하도록 돕는 정보 서비스입니다. DFMOA는 상품을 직접 판매하거나 결제를 대행하지 않습니다.",
  },
  {
    title: "가격 정보의 한계",
    body: "화면에 표시되는 가격은 공개 검색 결과와 조회 시점의 수집 데이터에 기반합니다. 환율, 쿠폰, 회원 등급, 적립금, 배송비, 재고, 옵션, 판매처 정책에 따라 실제 결제 금액은 달라질 수 있습니다.",
  },
  {
    title: "사용자 확인 의무",
    body: "구매 전에는 반드시 원본 면세점 또는 판매처 페이지에서 최종 가격, 수령 가능 공항, 출국일 조건, 교환·환불 조건, 통관 및 면세 한도를 확인해야 합니다.",
  },
  {
    title: "외부 링크",
    body: "DFMOA는 비교 편의를 위해 외부 사이트 링크를 제공합니다. 외부 사이트의 상품, 결제, 개인정보 처리, 배송, 고객 응대는 해당 사이트의 약관과 정책을 따릅니다.",
  },
  {
    title: "금지된 이용",
    body: "서비스를 방해하는 자동화 요청, 비정상 트래픽 생성, 데이터 무단 대량 복제, 광고 클릭 조작, 허위 신고, 권리 침해 행위는 허용하지 않습니다.",
  },
  {
    title: "콘텐츠와 권리",
    body: "DFMOA가 작성한 가이드, 정책 문구, 비교 설명은 서비스 운영 목적의 자체 콘텐츠입니다. 상품명, 브랜드명, 이미지, 로고는 각 권리자에게 귀속될 수 있으며 비교와 식별 목적 범위에서 사용합니다.",
  },
  {
    title: "정책 변경",
    body: "서비스 범위, 수집 가능 사이트, 광고 정책, 개인정보 처리 기준이 바뀌면 관련 페이지를 갱신합니다. 중요한 변경은 시행일을 함께 표시합니다.",
  },
];

export default function TermsPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>이용약관</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Terms
        </span>
        <h1 className="page-title">이용약관</h1>
        <p className="page-description">
          DFMOA를 안전하고 투명하게 이용하기 위한 기본 조건을 안내합니다.
        </p>

        <div className="faq-stack" style={{ marginTop: 16 }}>
          {terms.map((term) => (
            <article key={term.title} className="faq-card">
              <h2 className="card-title" style={{ fontSize: "1rem" }}>
                {term.title}
              </h2>
              <p className="faq-answer">{term.body}</p>
            </article>
          ))}
        </div>

        <article className="surface-card" style={{ marginTop: 16 }}>
          <h2 className="card-title" style={{ fontSize: "1rem" }}>
            관련 정책
          </h2>
          <div className="chip-row" style={{ marginTop: 12 }}>
            <Link className="chip is-soft" href="/privacy">
              개인정보처리방침
            </Link>
            <Link className="chip is-soft" href="/advertising-policy">
              광고 운영 원칙
            </Link>
            <Link className="chip is-soft" href="/data-source-policy">
              데이터 출처 정책
            </Link>
            <Link className="chip is-soft" href="/editorial-policy">
              콘텐츠 운영정책
            </Link>
          </div>
        </article>

        <p className="section-copy" style={{ marginTop: 14 }}>
          시행일: 2026-04-19
        </p>
      </div>
    </section>
  );
}
