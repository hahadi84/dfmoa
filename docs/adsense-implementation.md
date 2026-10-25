# DFMOA AdSense 적용 가이드 (2026-10-25)

운영 환경은 Next.js 정적 내보내기와 Netlify이며, 아래 코드는 프로젝트에 직접 적용되어 있습니다.

## 파일과 사용법

- `src/lib/adsense-policy.mjs`: 허용 호스트, 게시자 ID, 실제 슬롯 ID, 광고 대상 경로와 중복 요청 검사.
- `src/lib/adsense-browser.ts`: 호스트 검사를 통과한 경우에만 공통 광고 스크립트를 한 번 생성합니다.
- `src/components/ad-banner.tsx`: 재사용 광고 컴포넌트와 상단 배너. `data-adsbygoogle-status`, `data-ad-status`, WeakSet으로 같은 요소의 중복 push를 막습니다. 양수 너비/높이를 확인하고 결과 광고는 화면 근처에 올 때 요청합니다.
- `src/app/adsense.css`: 폭 100%, 상단 최대 970px와 높이 90px(모바일 100px), 결과 높이 280px, 광고 전후 24px 여백, 광고 라벨. 자리 크기를 미리 예약합니다.
- `src/app/layout.tsx`: 헤더 다음의 상단 배너. 기존 무조건 실행하던 공통 스크립트는 제거했습니다.

```tsx
import { AdBanner } from "@/components/ad-banner";
// 비교 결과가 있을 때 결과표 아래에 한 번 배치합니다.
{result && <AdBanner placement="results" />}
// 별도 실제 광고 단위를 사용하는 경우:
<AdBanner placement="results" slot="실제숫자슬롯ID" />
```

게시자: `ca-pub-2271072565444318`.
상단: `9746388185` (DFMOA_Top_Responsive).
결과: `2607098911` (DFMOA_Result_Responsive).
위 두 광고 단위는 실제 계정에서 생성했습니다. 재발급하지 않고 유지하십시오.

정확히 `dfmoa.com`, `www.dfmoa.com`만 실제 광고를 요청합니다. `localhost`, `127.0.0.1`, 배포 미리보기 및 다른 서브도메인은 회색 `AdSense 영역 (가로×세로)` 박스만 표시합니다. 게시자 확인 메타 태그는 광고 요청이 아닙니다. 차단 확장 프로그램, 동의 상태, 광고 재고, 계정 상태에 따라 운영 사이트에서도 광고가 채워지지 않을 수 있습니다. 임의 새로고침, 강제 재요청, 자기 광고 클릭으로 시험하지 마십시오.

자동 광고가 켜져 있으면 수동 슬롯 외의 위치에 광고를 삽입할 수 있습니다. 배치 통제를 위해 DFMOA의 자동 광고 설정을 별도로 확인하십시오. 여백과 라벨은 오클릭 위험을 줄이는 조치이며 정책 준수나 계정 제재 방지를 보장하지 않습니다.

## ads.txt와 배포

원본은 `public/ads.txt`입니다. Next.js 빌드가 `out/ads.txt`로 복사하고 Netlify의 `publish = "out"`으로 배포합니다.

```txt
google.com, pub-2271072565444318, DIRECT, f08c47fec0942fa0
```

`npm run build` 후 파일 내용을 확인하고 공개 `https://www.dfmoa.com/ads.txt`가 200 응답, 텍스트 본문인지 확인합니다. 루트 도메인의 www 리디렉션도 확인합니다. HTML 대체 페이지나 인증 화면이면 안 됩니다. Google의 상태 갱신은 배포와 별개입니다.

## 검증과 지표

`node --test scripts/*.test.mjs`, `npm run lint`, `npm run build`, `node scripts/audit-language-links.mjs`, `node scripts/audit-search-pages.mjs --local`.

개발 화면: 광고 스크립트 0개, 실제 ins 0개, 회색 박스와 크기 표시. 운영 화면: 공통 스크립트 1개, 각 슬롯은 최대 한 번 제출, 버튼과 광고 사이 24px 이상. 화면 이동 후 중복 push 오류와 너비 0 오류가 없는지 확인합니다.

향후 28일은 국가·기기별 페이지뷰, 광고 요청, 노출, Active View 측정 가능률/조회 가능률, CTR, 수익을 구분해 비교합니다. Active View는 광고가 실제 보였는지에 관한 지표이며 페이지뷰나 광고 노출수와 같은 뜻이 아닙니다. CTR 상승을 보장하거나 클릭을 유도하지 않습니다. 검색은 발견, 색인, 노출, 클릭을 각각 관찰합니다.

공식 참고: https://support.google.com/adsense/answer/9183363?hl=en · https://support.google.com/adsense/answer/9183362?hl=en · https://support.google.com/adsense/answer/1346295?hl=en · https://support.google.com/adsense/answer/4510652?hl=en
