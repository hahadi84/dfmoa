import type { Metadata } from "next";
import Link from "@/components/app-link";

export const metadata: Metadata = {
  title: "콘텐츠 운영정책",
  description: "DFMOA 콘텐츠 작성 기준, 가격 출처, 이미지 사용, 수정 요청 절차입니다.",
  alternates: {
    canonical: "/editorial-policy",
  },
};

const policyItems = [
  {
    title: "고유 콘텐츠를 우선합니다",
    body: "DFMOA는 단순 링크 모음이 아니라 상품명·용량 매칭, 최근 확인 공개가 상태, 혜택 조건, 원본 확인 링크를 사용자가 이해하기 쉽게 정리합니다.",
  },
  {
    title: "가격 출처를 숨기지 않습니다",
    body: "면세점 공개가와 국내 판매가는 공개 페이지 또는 공식 링크 기준으로 안내하며, 최종 결제가는 쿠폰·회원 등급·결제수단에 따라 달라질 수 있음을 함께 표시합니다.",
  },
  {
    title: "오해를 부르는 표현을 피합니다",
    body: "확인되지 않은 확정가 표현, 무조건 구매 추천, 공식 인증처럼 사용자가 판매처와의 관계를 오해할 수 있는 문구를 사용하지 않습니다.",
  },
  {
    title: "이미지는 보조 정보로만 사용합니다",
    body: "외부 이미지를 권리 확인 없이 자체 저장하지 않으며, 이미지가 없거나 사용 권한이 불명확하면 카테고리별 자체 placeholder를 사용합니다.",
  },
  {
    title: "수정 요청을 반영할 수 있습니다",
    body: "상품 정보 오류, 가격 오류, 이미지 권리 문제, 정책 위반 가능성은 문의 페이지로 접수받고 원본 확인 후 수정·삭제·노출 제한을 검토합니다.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>콘텐츠 운영정책</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          Editorial Policy
        </span>
        <h1 className="page-title">콘텐츠 운영정책</h1>
        <p className="page-description">
          가격, 혜택, 공항 가이드, 브랜드 페이지를 만들 때 지키는 운영 기준입니다.
        </p>

        <div className="faq-stack" style={{ marginTop: 16 }}>
          {policyItems.map((item) => (
            <article key={item.title} className="faq-card">
              <h2 className="card-title" style={{ fontSize: "1rem" }}>
                {item.title}
              </h2>
              <p className="faq-answer">{item.body}</p>
            </article>
          ))}
        </div>

        <article className="surface-card" style={{ marginTop: 16 }}>
          <h2 className="card-title" style={{ fontSize: "1rem" }}>
            관련 페이지
          </h2>
          <div className="chip-row" style={{ marginTop: 12 }}>
            <Link className="chip is-soft" href="/data-source-policy">
              데이터 출처 정책
            </Link>
            <Link className="chip is-soft" href="/advertising-policy">
              광고 운영 원칙
            </Link>
            <Link className="chip is-soft" href="/privacy">
              개인정보처리방침
            </Link>
            <Link className="chip is-soft" href="/contact">
              문의하기
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
