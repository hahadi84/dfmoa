import type { Metadata } from "next";
import Link from "@/components/app-link";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildSeoMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "FAQ · 면세모아 가격 비교와 데이터 기준",
    description: "DFMOA 면세점 가격 비교, 국내 판매가 비교, 광고와 데이터 정책, 오류 신고 절차와 개인정보 기준을 질문과 답변으로 정리했습니다.",
    path: "/faq",
    image: {
      path: "/og/faq.png",
      alt: "면세모아 FAQ",
    },
  }),
};

const compactFaqs = [
  {
    question: "DFMOA에서 바로 구매할 수 있나요?",
    answer: "아니요. DFMOA는 가격 비교와 원본 링크 안내 서비스입니다. 구매와 결제는 각 면세점 또는 국내 판매처의 원본 페이지에서 진행됩니다.",
  },
  {
    question: "표시된 가격이 최종 결제금액인가요?",
    answer: "아닙니다. 회원 등급, 쿠폰, 적립금, 배송비, 재고, 옵션 구성에 따라 최종 결제금액은 달라질 수 있습니다.",
  },
  {
    question: "국내 판매가는 어디서 가져오나요?",
    answer: "국내 판매가는 다나와와 SSG.COM 등 공개 검색 결과를 참고합니다. 실제 구매 전에는 판매자, 배송비, 병행수입 여부를 원본 페이지에서 확인해야 합니다.",
  },
  {
    question: "면세점 가격은 어떤 기준으로 비교하나요?",
    answer: "롯데면세점, 현대면세점, 신라면세점, 신세계면세점의 공개 검색 결과와 노출 정보를 기준으로 상품명, 브랜드, 용량, 모델 코드를 맞춰 비교합니다.",
  },
  {
    question: "광고가 비교 순위에 영향을 주나요?",
    answer: "일반 비교 결과는 공개 가격과 상품 일치도를 기준으로 정리합니다. 광고나 후원 콘텐츠가 생기면 별도 표기를 통해 일반 결과와 구분합니다.",
  },
  {
    question: "가격이나 이미지 오류는 어떻게 신고하나요?",
    answer: "문의 페이지에서 오류가 있는 URL, 상품명, 수정 사유를 남기면 원본 확인 후 수정, 삭제, 노출 제한을 검토합니다.",
  },
  {
    question: "AdSense 광고 클릭을 요청하나요?",
    answer: "아니요. DFMOA는 광고 클릭을 요청하거나 보상하지 않으며, 무효 트래픽을 만드는 자동화 요청과 클릭 조작을 허용하지 않습니다.",
  },
  {
    question: "개인정보는 어떻게 처리하나요?",
    answer: "회원가입 없이 이용할 수 있으며, 검색 품질과 보안 점검에 필요한 최소한의 기술 정보만 처리합니다. 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.",
  },
];

export default function FaqPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "FAQ", path: "/faq" },
  ]);
  const faqJsonLd = buildFaqPageJsonLd(compactFaqs);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, faqJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>FAQ</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 20 }}>
          FAQ
        </span>
        <h1 className="page-title">FAQ</h1>
        <p className="page-description">
          가격 비교 기준, 국내 판매가, 광고 운영, 오류 신고 절차를 간결하게 정리했습니다.
        </p>

        <div className="faq-stack" style={{ marginTop: 16 }}>
          {compactFaqs.map((faq) => (
            <article key={faq.question} className="faq-card">
              <details>
                <summary>{faq.question}</summary>
                <p className="faq-answer">{faq.answer}</p>
              </details>
            </article>
          ))}
        </div>

        <article className="surface-card" style={{ marginTop: 16 }}>
          <h2 className="card-title" style={{ fontSize: "1rem" }}>
            더 자세한 운영 기준
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
