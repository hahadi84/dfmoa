import type { Metadata } from "next";
import Link from "@/components/app-link";
import { buildBreadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { airportGuides } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "공항별 면세 수령 가이드",
  description: "인천 T1·T2, 김포, 제주, 김해 등 주요 공항별 면세품 수령 주의사항을 모아봅니다.",
  alternates: {
    canonical: "/airport",
  },
};

export default function AirportIndexPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "홈", path: "/" },
    { name: "공항 가이드", path: "/airport" },
  ]);

  return (
    <section className="page-section is-tight">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([breadcrumbJsonLd]) }}
      />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>공항 가이드</span>
        </div>

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Airport Guide
        </span>
        <h1 className="page-title">공항별 면세 수령 가이드</h1>
        <p className="page-description">
          출국 공항과 터미널에 따라 면세품 수령 위치, 마감 시간, 반입 확인 포인트가 달라질 수 있습니다.
        </p>

        <div className="airport-index-grid">
          {airportGuides.map((airport) => (
            <Link key={airport.slug} className="airport-index-card" href={`/airport/${airport.slug}`}>
              <span className="chip is-soft">{airport.terminal ?? airport.airportName}</span>
              <h2 className="card-title">{airport.title}</h2>
              <p className="section-copy">{airport.description}</p>
              <p className="airport-note-line">{airport.pickupNotes[0]}</p>
              <span className="text-link">수령 주의사항 보기</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
