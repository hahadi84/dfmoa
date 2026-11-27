import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "@/components/app-link";
import { notFound } from "next/navigation";
import { buildBreadcrumbJsonLd, buildGuideArticleJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { buildSeoMetadata, DEFAULT_OG_IMAGE } from "@/lib/seo-metadata";
import { guides, getGuideBySlug } from "@/lib/site-data";
import { JapanRefundVisual } from "@/components/japan-refund-visual";
import { JapanPriceExamples } from "@/components/japan-price-examples";
import { JapanShoppingLink } from "@/components/japan-shopping-link";
import styles from "./guide.module.css";

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

  const imagePath = `/og/guide/${guide.slug}.png`;
  return buildSeoMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/guide/${guide.slug}`,
    image: existsSync(join(process.cwd(), "public", imagePath))
      ? { path: imagePath, alt: guide.title }
      : { path: DEFAULT_OG_IMAGE, alt: "면세모아 DFMOA" },
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
      <div className={`container ${styles.container}`}>
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>가이드</span>
          <span>/</span>
          <span>{guide.title}</span>
        </div>

        <h1 className={styles.title}>{guide.title}</h1>
        <p className={styles.intro}>{guide.excerpt}</p>
        {["yen-rate-duty-free-comparison", "japan-shopping-price-checklist"].includes(slug) ? (
          <nav className={styles.quickLinks} aria-label="쇼핑 가격 비교 도구">
            <JapanShoppingLink href="/japan#yen-calculator-title" kind="compare" source={slug === "japan-shopping-price-checklist" ? "japan_shopping_checklist" : slug}>엔화 금액을 원화로 계산</JapanShoppingLink>
            <Link className="ghost-button" href="/price-compare">같은 상품의 면세 가격 확인</Link>
            {slug === "japan-shopping-price-checklist" && <Link className="ghost-button" href="#japan-liquid-baggage">기내·위탁 수하물 확인</Link>}
          </nav>
        ) : null}
        {slug === "japan-tax-refund-2026" ? (
          <nav className={styles.quickLinks} aria-label="환급 준비 도구">
            <Link className="button" href="#refund-airports">나리타·하네다·간사이 세관 지도</Link>
            <JapanShoppingLink href="/japan#yen-calculator-title" kind="compare" source={slug}>환급 예상액을 넣어 원화로 비교</JapanShoppingLink>
          </nav>
        ) : null}
        {guide.updatedAt ? <p className="section-copy">최종 확인: {guide.updatedAt} · <Link href="/japan">엔화 계산기와 일본 쇼핑 가이드</Link></p> : null}

        {slug === "japan-tax-refund-2026" ? <JapanRefundVisual /> : null}
        {slug === "japan-shopping-price-checklist" ? <JapanPriceExamples source="japan_shopping_checklist" /> : null}
        {slug === "yen-rate-duty-free-comparison" ? <p className="section-copy"><Link href="/guide/japan-shopping-price-checklist#japan-price-examples-title">디올·SK-II·히비키의 규격과 일본 가격 확인 자료 보기</Link></p> : null}
        <div className={styles.layout}>
          <nav className={styles.contents} aria-label="이 글의 목차">
            <h2>이 글에서 확인할 내용</h2>
            <ol>{guide.sections.map((section, index) => <li key={section.heading}><Link href={`#${section.anchor ?? `guide-section-${index + 1}`}`}>{section.heading}</Link></li>)}</ol>
          </nav>
          <article className={styles.article}>
            <div className={styles.stack}>
              {guide.sections.map((section, index) => (
                <section key={section.heading} id={section.anchor} className={styles.section}>
                  <h2 id={`guide-section-${index + 1}`} className={styles.heading}>
                    {section.heading}
                  </h2>
                  {section.maps && <nav className={styles.mapLinks} aria-label="일본 세관 공식 지도">
                    {section.maps.map(map => (
                      <JapanShoppingLink key={map.url} href={map.url} kind="map" source={slug} airport={map.airport} terminal={map.terminal}>
                        {map.label}
                      </JapanShoppingLink>
                    ))}
                  </nav>}
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
              {guide.sources?.length ? <section className={styles.section}><h2 className={styles.heading}>공식 출처</h2><ul>{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></section> : null}
              {(guide.updatedAt ? [] : reviewNotes).map((section, index) => (
                <section key={section.heading} className={styles.section}>
                  <h2 id={`review-section-${index + 1}`} className={styles.heading}>
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

          <aside className={styles.related} aria-labelledby="related-guides-title">
            <h2 id="related-guides-title">함께 읽을 가이드</h2>
            <div className={styles.relatedList}>
              {guides
                .filter((item) => item.slug !== guide.slug)
                .slice(0, 3)
                .map((item) => (
                  <Link key={item.slug} href={`/guide/${item.slug}`} className={styles.relatedLink}>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    {item.updatedAt ? <small>확인일 {item.updatedAt}</small> : null}
                  </Link>
                ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
