import type { Metadata } from "next";
import Link from "@/components/app-link";
import {
  bestSellerExampleMethodology,
  bestSellerExampleNotice,
  bestSellerExampleUpdatedAt,
  storeBestSellerExamples,
} from "@/lib/best-seller-examples";
import { latestBenefitReport } from "@/lib/benefit-report-generator";

export const metadata: Metadata = {
  title: "관리자 메모",
  robots: {
    index: false,
    follow: false,
  },
};

const verificationChecklist = [
  "Google Search Console에서 https://dfmoa.netlify.app 속성을 등록하고 sitemap.xml을 제출합니다.",
  "Bing Webmaster Tools에서도 동일한 sitemap URL을 제출합니다.",
  "HTML meta verification이 필요하면 app/layout.tsx의 metadata.other 또는 <head> 위치에 운영자가 발급받은 값을 추가합니다.",
  "DNS verification은 도메인 DNS 관리 화면에서 운영자가 직접 설정해야 합니다.",
  "Rich Results Test는 대표 상품 상세, 브랜드 페이지, 월간 혜택 페이지를 운영자가 직접 확인합니다.",
];

export default function AdminPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <span className="eyebrow" style={{ marginTop: 20 }}>
          Admin
        </span>
        <h1 className="page-title">관리자 메모</h1>
        <p className="page-description">
          공개 페이지에는 노출하지 않을 운영 메모입니다. 검색 등록, 리포트 자동화, 추천 예시 기준을 확인합니다.
        </p>

        <div className="admin-grid">
          <article className="surface-card admin-card">
            <h2 className="card-title">베스트10 추천 예시 운영 기준</h2>
            <p className="section-copy">{bestSellerExampleNotice}</p>
            <div className="admin-meta-row">
              <span>기준일 {bestSellerExampleUpdatedAt}</span>
              <span>{storeBestSellerExamples.length}개 면세점</span>
              <span>{storeBestSellerExamples.reduce((sum, store) => sum + store.items.length, 0)}개 추천 예시</span>
            </div>
            <ul className="admin-list">
              {bestSellerExampleMethodology.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="surface-card admin-card">
            <h2 className="card-title">혜택 리포트 자동화</h2>
            <p className="section-copy">{latestBenefitReport.automationNote}</p>
            <div className="admin-meta-row">
              <span>{latestBenefitReport.storeCount}개 면세점</span>
              <span>{latestBenefitReport.sourceCount}개 혜택 링크</span>
              <span>{latestBenefitReport.periodLabel}</span>
            </div>
            <ul className="admin-list">
              {latestBenefitReport.methodology.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <article className="surface-card admin-card">
          <h2 className="card-title">Search Console / Bing 등록 체크리스트</h2>
          <ul className="admin-list">
            {verificationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="chip-row" style={{ marginTop: 12 }}>
            <Link className="chip is-soft" href="/sitemap.xml">
              sitemap.xml
            </Link>
            <Link className="chip is-soft" href="/feed.xml">
              feed.xml
            </Link>
            <Link className="chip is-soft" href="/robots.txt">
              robots.txt
            </Link>
          </div>
        </article>

        <article className="surface-card admin-card">
          <h2 className="card-title">운영 링크</h2>
          <div className="chip-row">
            <Link className="chip is-soft" href="/best-seller-examples">
              공개 베스트10 예시
            </Link>
            <Link className="chip is-soft" href={`/benefit-reports/${latestBenefitReport.slug}`}>
              공개 혜택 리포트
            </Link>
            <Link className="chip is-soft" href="/api/benefit-report-drafts?limit=3">
              리포트 초안 API
            </Link>
            <Link className="chip is-soft" href="/deals/2026-04">
              월간 혜택 페이지
            </Link>
          </div>
          <p className="section-copy" style={{ marginTop: 12 }}>
            실제 이메일 발송, Search Console 등록, Bing 등록, Rich Results Test 실행은 외부 계정 권한이 필요한 운영자
            작업입니다.
          </p>
        </article>
      </div>
    </section>
  );
}
