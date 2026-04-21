import type { Metadata } from "next";
import Link from "@/components/app-link";
import { buildOrganizationJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { SITE_OPERATOR } from "@/lib/site-operator";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "DFMOA 운영 방식, 데이터 출처, 수익 구조, 면세점과의 관계, 연락처 안내",
  alternates: {
    canonical: "/about",
  },
};

const aboutSections = [
  {
    title: "서비스 소개",
    body: "DFMOA는 한국 공항면세점 공개 검색 결과와 국내 판매가 참고 정보를 한 화면에서 비교하도록 돕는 정보 제공 서비스입니다. 상품 판매, 결제, 배송, 재고 보장, 공항 수령 확정은 제공하지 않으며, 최종 구매 조건은 원본 면세점에서 확인해야 합니다.",
  },
  {
    title: "운영 방식",
    body: `현재 DFMOA는 ${SITE_OPERATOR.name}가 ${SITE_OPERATOR.operationType} 목적으로 운영합니다. 서비스 개선과 법적 고지 정확성을 위해 운영자 정보는 사이트 전역에서 동일하게 관리합니다.`,
  },
  {
    title: "데이터 출처",
    body: "가격과 상품 상태는 롯데면세점, 신라면세점, 신세계면세점, 현대면세점의 공개 검색 결과와 저장된 스냅샷을 기반으로 정리합니다. 실시간 결제 데이터가 아니며, 자동 수집 시점과 원본 사이트 정책에 따라 누락이나 지연이 생길 수 있습니다.",
  },
  {
    title: "수익 구조",
    body: `현재 상태는 ${SITE_OPERATOR.incomeStatus}입니다. 일부 국내가 참고 링크에는 쿠팡 파트너스 제휴 링크가 포함될 수 있고, 구매가 이루어질 경우 수수료가 지급될 수 있습니다. 향후 Google AdSense 신청을 검토하되, 승인 전에는 광고 슬롯을 운영하지 않습니다.`,
  },
  {
    title: "면세점과의 관계",
    body: "DFMOA는 롯데·신라·신세계·현대면세점과 제휴 관계가 없는 독립 정보 서비스입니다. 각 면세점의 로고, 상품명, 브랜드명은 비교와 식별을 위한 범위에서만 사용하며, 원본 면세점의 정책과 안내가 최종 기준입니다.",
  },
  {
    title: "연락",
    body: `데이터 수정 요청, 개인정보 관련 요청, 제휴 제안, 기타 문의는 ${SITE_OPERATOR.email}로 접수합니다. 전화나 주소 항목은 운영하지 않습니다.`,
  },
];

export default function AboutPage() {
  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildOrganizationJsonLd()) }}
      />
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
          DFMOA가 하는 일, 하지 않는 일, 운영 방식과 연락처를 투명하게 안내합니다.
        </p>

        <div className="faq-stack" style={{ marginTop: 20 }}>
          {aboutSections.map((section) => (
            <article key={section.title} className="faq-card">
              <h2 className="card-title" style={{ fontSize: "1rem" }}>
                {section.title}
              </h2>
              <p className="faq-answer">{section.body}</p>
            </article>
          ))}
        </div>

        <article className="surface-card" style={{ marginTop: 16 }}>
          <h2 className="card-title" style={{ fontSize: "1rem" }}>
            빠른 연락
          </h2>
          <p className="section-copy" style={{ marginTop: 8 }}>
            <a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a>
          </p>
          <div className="chip-row" style={{ marginTop: 12 }}>
            <Link className="chip is-soft" href="/contact">
              문의 페이지
            </Link>
            <Link className="chip is-soft" href="/privacy">
              개인정보처리방침
            </Link>
            <Link className="chip is-soft" href="/terms">
              이용약관
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
