import type { Metadata } from "next";
import Link from "@/components/app-link";
import { SITE_OPERATOR } from "@/lib/site-operator";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "DFMOA 개인정보 처리 항목, 이용 목적, 보유 기간, 쿠키, 권리 행사 방법 안내",
  alternates: {
    canonical: "/privacy",
  },
};

const effectiveDate = "2026-04-20";
const updatedDate = "2026-04-20 (초판)";

const collectionRows = [
  ["필수", "이메일 주소", "주간 리포트 구독, 가격 알림 등록 시"],
  ["자동수집", "IP 주소, 쿠키, User-Agent, 브라우저 종류, 방문일시, 방문 페이지, 유입 경로, 클릭 행동", "사이트 이용 전 과정"],
  ["없음", "주민등록번호, 카드정보, 계좌정보 등", "수집 안 함"],
];

const processorRows = [
  [SITE_OPERATOR.hostingProvider.replace(" (미국)", ""), "웹사이트 호스팅·정적 자산 전달", "미국"],
  [SITE_OPERATOR.analyticsProvider.replace(" (미국)", ""), "방문 분석(Google Analytics 4, 측정 ID G-VXFLYV6T34)", "미국"],
  [SITE_OPERATOR.analyticsProvider.replace(" (미국)", ""), "(향후) Google AdSense 광고 제공 - 승인 시 적용", "미국"],
  [SITE_OPERATOR.affiliatePartner, "쿠팡 파트너스 제휴 링크 트래킹", "대한민국"],
];

const cookieRows = [
  [
    "_ga, _ga_*",
    "Google Analytics 4 방문 분석 (측정 ID G-VXFLYV6T34)",
    "최장 2년",
    "브라우저 설정 또는 Google Analytics 차단 부가기능",
  ],
  ["AdSense 관련", "(향후) 맞춤형 광고 노출", "Google 정책에 따름", "Google 광고 설정"],
];

function PolicyTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="policy-table-wrap">
      <table className="policy-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
            {SITE_OPERATOR.siteName}는 개인정보보호법 제30조에 따라 개인정보 처리 기준과 이용자 권리 행사 방법을
            안내합니다.
          </p>

          <div className="policy-highlight">
            <strong>현재 DFMOA는 개인이 비영리 목적으로 운영 중이며, 쿠팡 파트너스 제휴 링크 외 영업 수익이 발생하지 않는 상태입니다.</strong>{" "}
            수익 구조 또는 운영 주체가 변경되는 경우 본 방침을 갱신해 공지합니다.
          </div>

          <p className="section-copy">
            시행일: {effectiveDate}
            <br />
            최종 수정일: {updatedDate}
          </p>

          <section>
            <h2>1. 총칙</h2>
            <p>
              본 방침은 {SITE_OPERATOR.serviceUrl}에서 제공하는 면세 가격 비교, 주간 리포트, 가격 알림, 문의 접수
              기능에 적용됩니다. DFMOA는 {SITE_OPERATOR.operationType} 운영 서비스이며, 운영자 정보는 아래 방침과
              푸터에 표시된 내용을 기준으로 합니다.
            </p>
          </section>

          <section>
            <h2>2. 수집하는 개인정보 항목 및 수집 방법</h2>
            <PolicyTable headers={["구분", "항목", "수집 시점"]} rows={collectionRows} />
            <p>
              DFMOA는 결제 기능을 제공하지 않으며 주민등록번호, 카드정보, 계좌정보를 수집하지 않습니다. 문의 양식에
              사용자가 직접 입력한 이름 또는 닉네임, 회신 이메일, 문의 내용은 문의 처리 목적으로만 확인합니다.
            </p>
          </section>

          <section>
            <h2>3. 개인정보의 수집·이용 목적</h2>
            <ul>
              <li>이메일: 주간 면세 리포트 발송, 가격 알림 전송, 수신거부 처리</li>
              <li>자동수집 정보: 서비스 품질 개선, 방문 분석, 보안 목적, 향후 맞춤형 광고 제공(AdSense 승인 시)</li>
              <li>문의 정보: 데이터 오류 확인, 권리자 요청 처리, 서비스 개선 의견 회신</li>
            </ul>
          </section>

          <section>
            <h2>4. 개인정보의 보유 및 이용 기간</h2>
            <ul>
              <li>이메일: 구독 해지 즉시 파기. 단, 수신거부 중복 방지용 해시값은 해지 후 30일 보관</li>
              <li>접속 로그: 3개월 보관 후 자동 삭제(통신비밀보호법 제15조의2)</li>
              <li>분석용 쿠키(GA4): Google 정책에 따라 최장 14개월</li>
              <li>문의 내용: 처리 완료 후 1년 이내 파기. 권리 분쟁 대응이 필요한 경우 필요한 범위에서 보관</li>
            </ul>
          </section>

          <section>
            <h2>5. 개인정보의 파기 절차 및 방법</h2>
            <p>
              보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구 불가 방법으로
              영구 삭제하며, Netlify 배포 환경 특성상 반영 가능한 범위에서 즉시 삭제 상태를 반영합니다. 출력물은
              운영하지 않으므로 별도 파기 대상이 없습니다.
            </p>
          </section>

          <section>
            <h2>6. 개인정보의 제3자 제공</h2>
            <p>
              DFMOA는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만 법령에 따른 수사, 재판, 행정기관
              요청에 협조해야 하는 경우 필요한 범위에서 제공할 수 있습니다.
            </p>
          </section>

          <section>
            <h2>7. 개인정보 처리 위탁</h2>
            <PolicyTable headers={["수탁자", "위탁 업무", "보관 국가"]} rows={processorRows} />
            <p>
              위탁 업무는 서비스 운영에 필요한 범위로 제한합니다. Google AdSense 항목은 승인 후 광고 기능을 실제 적용할
              때부터 해당됩니다.
            </p>
          </section>

          <section>
            <h2>8. 국외 이전</h2>
            <p>
              Netlify와 Google 서비스 이용 과정에서 국외 이전이 발생할 수 있습니다. 이전 국가는 미국, 이전 시점은 접속
              즉시, 이전 방법은 HTTPS로 암호화된 네트워크 전송입니다. 국외 이전을 원하지 않는 경우 서비스 이용을 중단할
              수 있으나, 호스팅과 분석 도구의 특성상 부분 거부는 기술적으로 어렵습니다.
            </p>
          </section>

          <section>
            <h2>9. 이용자 및 법정대리인의 권리와 행사 방법</h2>
            <p>
              이용자는 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 권리 행사는{" "}
              <a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a>로 요청할 수 있으며, DFMOA는 본인 확인과
              요청 범위 확인 후 14일 이내 조치합니다.
            </p>
          </section>

          <section>
            <h2>10. 자동 수집 장치(쿠키)의 설치·운영 및 거부</h2>
            <PolicyTable headers={["쿠키명", "목적", "유효 기간", "거부 방법"]} rows={cookieRows} />
            <p>
              Google Analytics 차단 부가기능은{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                tools.google.com/dlpage/gaoptout
              </a>
              에서 확인할 수 있습니다. 맞춤형 광고 설정은{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                Google 광고 설정
              </a>
              에서 변경할 수 있습니다.
            </p>
          </section>

          <section>
            <h2>11. 개인정보 보호책임자 및 담당부서</h2>
            <ul>
              <li>이름: {SITE_OPERATOR.privacyOfficer.name}</li>
              <li>역할: {SITE_OPERATOR.privacyOfficer.role}</li>
              <li>
                이메일: <a href={`mailto:${SITE_OPERATOR.privacyOfficer.email}`}>{SITE_OPERATOR.privacyOfficer.email}</a>
              </li>
              <li>현재 개인 비영리 운영 단계로 별도 전화 연락처는 운영하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2>12. 개인정보 열람청구 접수·처리 부서</h2>
            <p>
              DFMOA는 별도 담당부서를 두지 않고 개인정보 보호책임자가 직접 열람청구를 접수·처리합니다. 접수 이메일은{" "}
              <a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a>이며, 회신은 영업일 기준 14일 이내를
              원칙으로 합니다.
            </p>
          </section>

          <section>
            <h2>13. 권익침해 구제 방법</h2>
            <ul>
              <li>
                {SITE_OPERATOR.krDisputeMediation[0].name}: {SITE_OPERATOR.krDisputeMediation[0].phone} /{" "}
                <a href={SITE_OPERATOR.krDisputeMediation[0].url} target="_blank" rel="noopener noreferrer">
                  kopico.go.kr
                </a>
              </li>
              <li>
                {SITE_OPERATOR.krPrivacyAuthority.name}: {SITE_OPERATOR.krPrivacyAuthority.phone} /{" "}
                <a href={SITE_OPERATOR.krPrivacyAuthority.url} target="_blank" rel="noopener noreferrer">
                  privacy.go.kr
                </a>
              </li>
              {SITE_OPERATOR.krDisputeMediation.slice(1).map((agency) => (
                <li key={agency.name}>
                  {agency.name}: {agency.phone} /{" "}
                  <a href={agency.url} target="_blank" rel="noopener noreferrer">
                    {agency.url.replace("https://", "")}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>14. 방침 변경에 관한 사항</h2>
            <p>
              본 방침의 중요한 변경은 시행 최소 7일 전 사이트를 통해 공지합니다. 이용자의 권리·의무에 중대한 영향을 주는
              변경은 시행 최소 30일 전 사전 공지합니다.
            </p>
            <p>
              시행일: {effectiveDate}
              <br />
              최종 수정일: {updatedDate}
            </p>
          </section>
        </article>
      </div>
    </section>
  );
}
