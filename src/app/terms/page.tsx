import type { Metadata } from "next";
import Link from "@/components/app-link";
import { AFFILIATE_DISCLOSURE_TEXT } from "@/lib/affiliate";
import { SITE_OPERATOR } from "@/lib/site-operator";

export const metadata: Metadata = {
  title: "이용약관",
  description: "DFMOA 서비스 이용 조건, 운영자 정보, 책임 한계, 제휴 링크, 분쟁 해결 기준",
  alternates: {
    canonical: "/terms",
  },
};

const terms = [
  {
    title: "1. 목적 · 서비스 범위",
    body: "DFMOA는 공개 검색 결과와 저장된 가격 스냅샷을 바탕으로 공항면세점 공개가, 국내 판매가 참고 정보, 혜택 확인 링크를 정리하는 정보 제공 서비스입니다. DFMOA는 상품의 판매·결제·배송·중개 주체가 아니며, 실제 주문과 수령은 원본 면세점 또는 판매처의 정책을 따릅니다.",
  },
  {
    title: "2. 운영자 정보",
    body: `${SITE_OPERATOR.siteName}는 ${SITE_OPERATOR.operationType} 형태로 운영됩니다. 운영자 명의는 ${SITE_OPERATOR.name}이며, 문의와 권리 요청은 ${SITE_OPERATOR.email}로 접수합니다.`,
  },
  {
    title: "3. 이용자의 의무",
    body: "이용자는 허위 정보 입력, 타인의 이메일 무단 사용, 서비스 안정성을 해치는 자동화 요청, 크롤링 방해 우회, 비정상 트래픽 생성, 데이터 무단 대량 복제, 광고 클릭 조작, 권리 침해 행위를 해서는 안 됩니다.",
  },
  {
    title: "4. 면책 조항",
    body: "가격 정보는 수집 시점 기준이며 환율, 쿠폰, 회원 등급, 적립금, 카드 혜택, 재고, 옵션, 출국 정보 입력 여부에 따라 실제 결제가와 다를 수 있습니다. 최종 결제 금액과 수령 가능 여부는 반드시 원본 면세점에서 확인해야 합니다.",
  },
  {
    title: "5. 제휴 링크 고지",
    body: `${AFFILIATE_DISCLOSURE_TEXT} 제휴 링크 포함 여부는 상품 가격 비교 순위나 추천 순서에 영향을 주지 않습니다. 현재 운영 상태는 ${SITE_OPERATOR.incomeStatus}입니다.`,
  },
  {
    title: "6. 서비스 변경·중단",
    body: "DFMOA는 데이터 수집 가능 여부, 외부 사이트 정책 변경, 호스팅 장애, 보안 이슈, 운영상 필요에 따라 서비스 일부를 변경하거나 중단할 수 있습니다. 예측 가능한 변경은 사전 공지를 원칙으로 하며, 긴급한 경우 사후 공지할 수 있습니다.",
  },
  {
    title: "7. 분쟁 해결",
    body: "본 약관은 대한민국 법을 기준으로 해석합니다. 서비스 이용과 관련한 분쟁은 서로 협의해 해결하는 것을 우선하며, 협의가 어려운 경우 민사소송법이 정하는 관할 법원에 제기합니다.",
  },
  {
    title: "8. 시행일",
    body: "본 약관은 2026-04-20부터 시행합니다.",
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
        <p className="page-description">DFMOA 이용 조건과 책임 한계를 안내합니다.</p>

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
          시행일: 2026-04-20
        </p>
      </div>
    </section>
  );
}
