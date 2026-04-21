import type { Metadata } from "next";
import Link from "@/components/app-link";
import { AFFILIATE_DISCLOSURE_TEXT } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "광고 운영 원칙",
  description: "DFMOA의 광고, 제휴 링크, 뉴스레터 광고성 정보 수신동의 운영 원칙입니다.",
  alternates: {
    canonical: "/advertising-policy",
  },
};

export default function AdvertisingPolicyPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>광고 운영 원칙</span>
        </div>

        <article className="surface-card policy-article">
          <span className="eyebrow">Advertising</span>
          <h1 className="page-title">광고 운영 원칙</h1>
          <p className="page-description">
            DFMOA는 공개가 비교, 예상 실결제가 계산, 원본 확인 링크가 먼저 보이도록 광고와 제휴 링크를 배치합니다.
          </p>

          <section>
            <h2>제휴 링크</h2>
            <p>
              일부 국내가 참고 비교 링크, 리포트 링크, 뉴스레터 링크에는 제휴 링크가 포함될 수 있습니다. 제휴 여부는 가격
              순위나 추천 순서에 영향을 주지 않는 것을 운영 원칙으로 합니다.
            </p>
            <p>{AFFILIATE_DISCLOSURE_TEXT}</p>
            <p>
              쿠팡 파트너스 링크가 있는 경우 링크 근처에 고지 문구를 실제 DOM 텍스트로 표시하고,
              <code>rel=&quot;sponsored nofollow&quot;</code> 계열 속성을 사용합니다. 새 탭 외부 링크에는
              <code>noopener noreferrer</code>도 함께 적용합니다.
            </p>
          </section>

          <section>
            <h2>Google AdSense 준비 상태</h2>
            <p>
              DFMOA는 향후 Google AdSense 심사를 신청할 예정입니다. 심사 전에는 광고 슬롯을 본문에 배치하지 않으며,
              승인 후에도 가격 비교, 원본 확인, 예상 실결제가 계산 흐름을 방해하지 않는 위치에만 제한적으로 노출합니다.
            </p>
            <p>
              사용자는 광고 차단기를 사용할 수 있습니다. 광고 차단 여부는 상품 가격 비교, 검색 결과, 즐겨찾기, 알림 기능
              이용에 영향을 주지 않습니다.
            </p>
          </section>

          <section>
            <h2>순위 독립성</h2>
            <p>
              DFMOA는 광고 노출·클릭이 상품 가격 비교 순위에 영향을 주지 않습니다. 상품 카드와 상세 페이지의 가격
              노출은 최근 확인 공개가, 원본 링크, 상품 매칭 기준을 우선하며 광고 성과와 분리해 운영합니다.
            </p>
          </section>

          <section>
            <h2>뉴스레터와 광고성 정보</h2>
            <p>
              주간 리포트에는 할인, 적립금 이벤트, 제휴 링크, 광고 안내가 포함될 수 있습니다. 광고성 정보 수신동의는
              개인정보 수집·이용 동의와 별도로 받으며, 모든 이메일에는 수신거부 경로를 제공합니다.
            </p>
          </section>

          <section>
            <h2>광고 노출 제한</h2>
            <ul>
              <li>검색 결과 없음, 오류, 로딩 상태에는 광고를 과도하게 노출하지 않습니다.</li>
              <li>가격 데이터가 전혀 없는 상품 상세에서는 광고를 숨기거나 하단으로 제한합니다.</li>
              <li>원본 확인, 국내가 비교, 가격 알림 같은 핵심 CTA 바로 옆에는 광고를 배치하지 않습니다.</li>
              <li>정책, 개인정보, 문의 성격의 페이지에서는 본문보다 광고가 먼저 보이지 않게 합니다.</li>
            </ul>
          </section>
        </article>
      </div>
    </section>
  );
}
