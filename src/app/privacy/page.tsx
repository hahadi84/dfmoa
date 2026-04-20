import type { Metadata } from "next";
import Link from "@/components/app-link";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "DFMOA 가격 알림, 주간 리포트, 문의 처리에 필요한 개인정보 처리 원칙입니다.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section className="page-section is-tight">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">홈</Link>
          <span>/</span>
          <span>개인정보처리방침</span>
        </div>

        <article className="surface-card policy-article">
          <span className="eyebrow">Privacy</span>
          <h1 className="page-title">개인정보처리방침</h1>
          <p className="page-description">
            DFMOA는 면세 가격 비교와 알림, 주간 리포트 제공에 필요한 최소 정보만 처리하는 것을 원칙으로 합니다.
          </p>

          <section>
            <h2>수집 항목과 목적</h2>
            <ul>
              <li>가격 알림: 이메일, 상품 식별자, 알림 기준 금액, 감시 면세점, 동의 시각, 동의 버전, 구독 경로</li>
              <li>예상 실결제가 알림: 사용자가 입력한 할인·적립금·환율 조건의 스냅샷</li>
              <li>주간 리포트: 이메일, 구독 상태, 동의 시각, 동의 버전, 구독 경로</li>
              <li>문의: 사용자가 입력한 연락처와 문의 내용</li>
            </ul>
          </section>

          <section>
            <h2>동의와 수신거부</h2>
            <p>
              가격 알림 동의와 주간 리포트 구독 동의는 분리해 관리합니다. 광고/제휴 링크가 포함될 수 있는 이메일은
              광고성 정보 수신동의를 별도로 받습니다. 모든 이메일에는 로그인 없이 사용할 수 있는 수신거부 링크를
              포함합니다.
            </p>
          </section>

          <section>
            <h2>보관 기간</h2>
            <p>
              알림과 구독 정보는 서비스 제공과 수신거부 이력 관리를 위해 필요한 기간 동안 보관할 수 있습니다. 수신거부
              후에는 발송 대상에서 제외하고, 중복 발송 방지 목적의 최소 이력만 보관할 수 있습니다.
            </p>
          </section>

          <section>
            <h2>오픈율·클릭률 측정</h2>
            <p>
              향후 이메일 서비스 연결 시 오픈율 또는 클릭률을 측정할 수 있습니다. 실제 측정을 시작하는 경우 이
              방침과 이메일 본문에 측정 목적과 수신거부 방법을 함께 안내합니다.
            </p>
          </section>

          <section>
            <h2>쿠키와 분석 도구</h2>
            <p>
              DFMOA는 서비스 개선을 위해 GA4 같은 분석 도구와 AdSense 같은 광고 도구를 사용할 수 있습니다. 이벤트
              측정에는 이메일, 전화번호, 토큰, 사용자 식별자 같은 개인정보를 넣지 않는 것을 원칙으로 합니다. 맞춤형
              광고 또는 리마케팅을 확대하는 경우 쿠키 동의 관리 UI 도입을 검토합니다.
            </p>
          </section>

          <section>
            <h2>운영자 TODO</h2>
            <ul>
              <li>실제 이메일 발송 서비스 연결 시 처리위탁 또는 제3자 제공 여부를 별도 확인해야 합니다.</li>
              <li>Search Console, Bing, 이메일 발송 서비스 등 외부 계정 등록은 운영자가 직접 수행해야 합니다.</li>
              <li>수신거부 처리 결과와 발송 실패 이력은 운영 로그에서 개인정보가 과도하게 노출되지 않도록 관리합니다.</li>
            </ul>
          </section>
        </article>
      </div>
    </section>
  );
}
