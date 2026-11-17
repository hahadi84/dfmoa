# 운영 GA4 수신 점검 — 2026-11-18 KST

## 확인 범위

- 운영 도메인: https://www.dfmoa.com
- GA4 속성 533927864 / 웹 스트림 14408191791 / 측정 ID G-VXFLYV6T34.
- 기존 Google 태그 G-SRSWS2FHS2에는 위 웹 스트림이 연결되어 있다. 두 ID가 다르다는 이유만으로 잘못된 연결이라고 판단하지 않는다.
- 변경 전 운영 커밋: 2d32e746de457d6d27a6ddbed3b96c0f0197f840.
- 수정 커밋: ac3284842e98ed20e666df6e4a04596b66f91a2f.

## 확인한 증거와 구분

1. Tag Assistant를 운영 영어 쇼핑리스트에 연결하고 실제 비교 링크를 활성화했다. `shopping_compare_open`의 발송 조회에 G-VXFLYV6T34, 운영 page_location, source_page=country_shopping, content_market=US, _dbg=1이 표시됐다.
2. 운영 영어 비교기에 100000/120000을 입력하면 계산 결과가 표시되고 `effective_price_calculate` 발송 조회가 생성된다. Tag Assistant의 발송 표시는 GA4 서버 수신을 보장하지 않는다.
3. 운영 Tag Assistant에서 Config의 send_page_view=false와 DOM/창 로드를 확인했지만 `page_view` API 호출은 목록에 없었다. 처음에는 초기 조회 누락을 의심했으나, 01:15 KST 로컬 대조 실험에서도 목록에는 없던 첫 조회가 GA4에 수신됐다. 따라서 목록의 부재를 실행 누락 또는 원인으로 확정한 중간 판단을 철회한다. 배포한 코드는 첫 조회를 Suspense 마운트와 분리하는 방어적 보강이며, 운영 미수신을 해결했다고 보고하지 않는다.
4. GA4 실시간 보고서의 주소 복사 이벤트 4건을 page_location까지 확인했다. 네 URL 모두 127.0.0.1이었다. 이를 운영 사이트 수신으로 잘못 보고하지 않았다.
5. GA4 이벤트 수정 규칙 없음. Internal Traffic 필터는 제외/테스트 상태로, 활성 제외 필터가 아니다. Google 태그의 행동 분석 데이터 전송 방지·진단 데이터 전송 방지는 꺼져 있었다. 설정을 변경하지 않았다.
6. Tag Assistant 동의 화면은 '기본 동의 상태가 아직 설정되지 않았습니다'였다. 동의 거부가 원인이라고 단정하거나 강제 허용하지 않았다.
7. 운영 HTML HTTP 200, CSP 응답 헤더 없음. 운영 JS와 HTML에 현재 측정 ID 및 page_view 컴포넌트가 포함돼 있었다. 코드 포함과 실행/수신을 구분한다.

## 수정

- `src/lib/analytics-bootstrap.ts`: Google 태그 초기화 직후 첫 page_view를 큐에 등록한다. 외부 Google 스크립트 로드나 Suspense 마운트 완료를 기다리지 않는다.
- `src/app/layout.tsx`: 기존 초기화 코드 대신 위 생성 함수를 사용한다. 기존 태그·측정 ID와 debug_mode 조건을 유지한다.
- `src/components/google-analytics-page-view.tsx`: 초기 큐 등록 URL과 현재 URL을 비교하여 hydration 중복 전송을 막고 이후 클라이언트 경로 변경을 계속 측정한다.
- `src/lib/analytics.ts`: 마지막 조회 URL 마커의 타입만 추가한다. 기존 쇼핑 이벤트 이름·send_to·개인정보 필터는 변경하지 않는다.
- `scripts/analytics-page-view.test.mjs`: 첫 큐 등록, 초기 중복, 경로·쿼리 변경, 뒤로 가기, 취소된 효과, 스크립트 문자열 탈출을 검증한다.

## 검증 및 배포

- 이벤트 회귀 테스트 4/4 통과. 배포 정책 테스트 포함 17/17 통과.
- 변경 TS/TSX ESLint 통과. npm run build 통과: 정적 페이지 250개, 구조화 데이터 검사 490개/오류 0.
- 로컬 수정본 첫 page_view: GA4 DebugView 01:10:01 KST, page_location=http://127.0.0.1:41892/en/compare/?debug_mode=1 수신 확인. 같은 초기화에서 첫 조회가 두 번 발생하지 않음.
- 이번 주 기존 공개: 11월 16일 쇼핑 정보, 11월 18일 00:46 KST 쇼핑 탐색 개선. 사용자 후속 운영 측정 수정 요청에 한해 별도 날짜·production·중복 제한을 둔 공개 커밋을 사용한다. 미리보기 배포 없음.
- 신규 운영 배포 ID: 6afc7cb309d1193b5dd65b1e. 최종 공개 상태와 운영 수신 결과는 아래 후속 결과에 기록한다.

## 후속 결과

- Netlify ready/published 확인: 2026-11-18 01:12:47.855 KST, 위 커밋·배포 ID 일치.
- 영어·일본어·간체 비교기 운영 URL 모두 HTTP 200, 자기 참조 canonical, 초기 조회 등록 코드와 측정 ID 반영 확인.
- 공개 후 운영 영어 비교기 실제 입력 결과 및 계산 이벤트 발송 조회 재확인. 운영 page_location의 GA4 DebugView 수신은 01:16 KST까지 확인하지 못함.
- 01:15:33 KST 로컬 Tag Assistant 대조 실험: 초기 page_view가 Tag Assistant 이벤트 목록에는 없었지만 GA4에 수신됨. page_location은 127.0.0.1:41892/en/compare/?debug_mode=1&gtm_debug=...로 확인. 초기 이벤트 목록만으로 실행을 판정할 수 없음.
- 실제 운영자의 별도 휴대폰에서 debug_mode=1 비교기를 열어 100000/120000을 입력하는 대조 테스트를 요청했고 응답 대기 중. 자동 테스트 환경의 전달 제한과 일반 방문자의 수집 문제를 구분하기 위한 단계다.
- 최종 원인은 미확정. 측정 ID/라우팅 누락, 활성 내부 필터, 이벤트 수정 규칙, 명시적인 동의 거부가 원인이라는 증거는 발견하지 못했다. 네트워크 전달 실패와 GA4 처리 단계 중 어디에서 막히는지 아직 구분할 수 없다.
- 브라우저 자동 승인 검토가 chrome://inspect 내부 진단 접근을 거부했다. 우회하지 않고 공개 Tag Assistant와 GA4 UI로 대체했으며, HTTP collect 응답 상태는 확인하지 못했다.
- Tag Assistant 진단 세션을 종료했다. GA4 DebugView는 휴대폰 테스트 후 후속 확인을 위해 유지했다. GA4 설정 변경 없음.
- 이 작업은 원인 규명 및 운영 수신 검증 완료로 분류하지 않는다.

## 참고

- https://support.google.com/analytics/answer/7201382 — DebugView 및 동의/개인정보 설정에 따른 표시 제한.
- https://developers.google.com/tag-platform/gtagjs/reference/parameters — send_to 매개변수.
- 확인일: 2026-11-18 KST.
- 운영자 테스트이며 여행자의 전환·구매 성과에 포함해서 해석하지 않는다. 수신 확인을 위해 주요 이벤트 지정 또는 내부 필터 활성화를 변경하지 않았다.
