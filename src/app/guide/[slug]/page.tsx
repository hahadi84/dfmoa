import type { Metadata } from "next";
import Link from "@/components/app-link";
import { notFound } from "next/navigation";
import { buildBreadcrumbJsonLd, buildGuideArticleJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildSeoMetadata } from "@/lib/seo-metadata";
import { guides, getGuideBySlug } from "@/lib/site-data";

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildGuideReviewNotes(title: string) {
  return [
    {
      heading: "DFMOA 확인 기준",
      body: [
        `${title}는 실제 결제나 공항 수령을 대신 확정하는 문서가 아니라, 사용자가 원본 면세점에서 마지막 확인을 하기 전 체크해야 할 기준을 정리한 안내입니다. 가격은 공개 검색 결과와 최근 스냅샷을 기준으로 보며, 회원 등급, 쿠폰, 적립금, 카드 청구할인, 출국 정보 입력 여부에 따라 최종 금액과 수령 가능 상태가 달라질 수 있습니다.`,
        "특히 향수, 주류, 화장품 세트처럼 용량과 구성 차이가 큰 상품은 같은 브랜드라도 비교 결과가 쉽게 흔들립니다. DFMOA는 상품명, 용량, 모델 코드, 공항 수령 가능성, 원본 링크를 함께 확인하도록 유도해 단순 최저가보다 구매 전 검증 흐름을 우선합니다.",
      ],
    },
    {
      heading: "구매 전 마지막 점검",
      body: [
        "출국일과 항공편을 입력한 뒤 원본 면세점에서 재고, 인도장, 주문 마감 시간, 교환·환불 조건을 확인하세요. 주류와 액체류는 도착지와 환승 국가 규정이 다를 수 있으므로 관세청, 공항, 항공사 안내를 함께 보는 편이 안전합니다.",
      ],
      bullets: [
        "DFMOA의 가격은 참고 정보이며 실결제·수령 가능 여부를 보증하지 않습니다.",
        "국내가 비교 링크는 참고용입니다. 판매처, 옵션, 배송 조건이 다르면 같은 가격으로 보지 않습니다.",
        "원본 면세점의 최종 안내가 DFMOA의 최근 확인 스냅샷보다 우선합니다.",
      ],
    },
  ];
}

export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "가이드를 찾을 수 없음",
    };
  }

  return buildSeoMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guide/${guide.slug}`,
    image: {
      path: `/og/guide/${guide.slug}.png`,
      alt: guide.title,
    },
    type: "article",
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "가이드", path: "/guide/airport-duty-free-basics" },
    { name: guide.title, path: `/guide/${guide.slug}` },
  ]);
  const articleJsonLd = buildGuideArticleJsonLd(guide, `/guide/${guide.slug}`);
  const reviewNotes = buildGuideReviewNotes(guide.title);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd, articleJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>가이드</span>
          <span>/</span>
          <span>{guide.title}</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Guide
        </span>
        <h1 className="page-title">{guide.title}</h1>
        <p className="page-description">{guide.excerpt}</p>

        <div className="split-grid" style={{ marginTop: 28 }}>
          <article className="surface-card">
            <div className="guide-stack">
              {guide.sections.map((section) => (
                <section key={section.heading} className="guide-section">
                  <h2 className="card-title" style={{ fontSize: "1.25rem" }}>
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="section-copy">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
              {reviewNotes.map((section) => (
                <section key={section.heading} className="guide-section">
                  <h2 className="card-title" style={{ fontSize: "1.25rem" }}>
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="section-copy">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </article>

          <aside className="feature-panel">
            <p className="panel-title">다른 가이드</p>
            <div className="subgrid" style={{ marginTop: 18 }}>
              {guides
                .filter((item) => item.slug !== guide.slug)
                .map((item) => (
                  <Link key={item.slug} href={`/guide/${item.slug}`} className="list-item">
                    <span className="list-number">G</span>
                    <p className="list-copy">
                      <strong>{item.title}</strong>
                      {item.excerpt}
                    </p>
                  </Link>
                ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
