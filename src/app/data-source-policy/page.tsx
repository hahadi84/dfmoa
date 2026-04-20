import type { Metadata } from "next";
import Link from "@/components/app-link";
import { dutyFreeSources, getSourceAccessLabel } from "@/lib/source-policy";

export const metadata: Metadata = {
  title: "데이터 출처 정책",
  description: "DFMOA 가격, 혜택, 환율, source status, 이미지 fallback 운영 원칙입니다.",
  alternates: {
    canonical: "/data-source-policy",
  },
};

export default function DataSourcePolicyPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>데이터 출처 정책</span>
        </div>

        <article className="surface-card policy-article">
          <span className="eyebrow">Data Source</span>
          <h1 className="page-title">데이터 출처 정책</h1>
          <p className="page-description">
            DFMOA는 공개 페이지와 공식 링크를 기준으로 정보를 정리합니다. 가격과 예상 실결제가는 참고값이며,
            최종 결제가는 원본 면세점 결제 단계에서 확인해야 합니다.
          </p>

          <section>
            <h2>가격과 예상 실결제가</h2>
            <ul>
              <li>가격은 실시간 보장값이 아니라 최근 확인 공개가일 수 있습니다.</li>
              <li>예상 실결제가는 공개가, 혜택 룰, 환율, 사용자 입력 조건을 조합한 참고 계산값입니다.</li>
              <li>카드 할인, 쿠폰, 적립금, 회원 등급, 출국 공항, 환율은 변경될 수 있습니다.</li>
              <li>low confidence 가격은 알림 발송과 구조화 데이터 Offer에서 보수적으로 제외합니다.</li>
            </ul>
          </section>

          <section>
            <h2>면세점별 source policy</h2>
            <div className="policy-source-grid">
              {dutyFreeSources.map((source) => (
                <div key={source.id} className="policy-source-card">
                  <strong>{source.name}</strong>
                  <span className="status-chip is-soft">{getSourceAccessLabel(source.accessPolicy)}</span>
                  <p>{source.policyNote}</p>
                  <small>robots 확인 기준일: {source.robotsCheckedAt ?? "확인 필요"}</small>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>수집과 캐시</h2>
            <p>
              공식 제휴/API, robots.txt와 운영 정책상 접근 가능한 공개 페이지, 공식 검색 링크 기반 수동 검수 데이터를
              우선합니다. 자동 수집이 제한되는 소스는 원본 링크 또는 수동 검수 정보만 제공할 수 있습니다. 서버 부하
              방지를 위해 캐시, 요청 제한, 수집 주기 제한을 사용합니다.
            </p>
            <ul>
              <li>가격 snapshot API는 CDN 캐시와 stale-while-revalidate를 활용할 수 있습니다.</li>
              <li>배치 수집은 1일 2~4회 또는 source policy에 맞는 간격을 우선 검토합니다.</li>
              <li>장애 시 이전 값을 보여줄 경우 “최근 확인가” 또는 “이전 확인가”로 표시합니다.</li>
              <li>모든 가격 카드에는 가격 기준 시각 또는 최근 확인 시각 없음 상태를 표시합니다.</li>
            </ul>
          </section>

          <section>
            <h2>이미지와 콘텐츠</h2>
            <p>
              외부 상품 이미지를 권리 확인 없이 자체 CDN에 복사 저장하지 않습니다. 이미지 사용 권한이 불명확하거나
              로딩에 실패하면 카테고리별 자체 SVG placeholder를 사용합니다.
            </p>
            <p>
              면세점 로고와 브랜드 자산은 권리 확인 전에는 텍스트명 또는 중립 라벨로 대체합니다. 로고를 사용하는
              경우에도 정보 식별 목적에 한정하며 공식 제휴로 오인될 수 있는 표현을 피합니다.
            </p>
          </section>

          <section>
            <h2>수정·삭제 요청</h2>
            <p>
              판매처, 권리자, 브랜드 관계자의 수정·삭제 요청은 문의 경로를 통해 접수할 수 있으며 운영 원칙에 따라
              검토 후 반영할 수 있습니다.
            </p>
          </section>
        </article>
      </div>
    </section>
  );
}
