# 커스텀 도메인 이전 후 사용자 작업

## Google Search Console

1. https://search.google.com/search-console 접속
2. 속성 추가 -> `https://www.dfmoa.com/` (URL 접두어)
3. 소유 확인: 기존 HTML 파일(`google8a53e6b4aca13df8.html`)이 신규 도메인에도 존재하므로 자동 확인
4. 사이트맵 -> `sitemap.xml` 제출
5. URL 검사 -> `https://www.dfmoa.com/` -> 색인 생성 요청
6. 우선순위 페이지 2~3개도 색인 생성 요청

## 기존 `dfmoa.netlify.app` 속성

- 삭제하지 말 것. 301 리다이렉트 중인 상태로 몇 주 유지해 Google이 이전 신호를 학습하게 둔다.
- 3~6개월 뒤 색인 수가 0에 가까워지면 그때 삭제를 검토한다.

## 네이버 서치어드바이저

1. https://searchadvisor.naver.com 접속
2. 사이트 등록 -> `https://www.dfmoa.com`
3. 소유 확인: `naver094ed3a7784707b341fb98fc465e611f.html` 파일이 신규 도메인에도 존재하므로 자동 확인
4. 사이트맵 제출 -> `https://www.dfmoa.com/sitemap.xml`
5. RSS 제출 -> `https://www.dfmoa.com/feed.xml`

## GA4

- 기존 측정 ID `G-VXFLYV6T34` 유지 (도메인 변경과 무관)
- 관리 -> 데이터 스트림 -> 웹 -> 스트림 URL을 `https://www.dfmoa.com`으로 수정
- 기존 `dfmoa.netlify.app` 방문 데이터는 301 리다이렉트 체인으로 새 URL에 집계된다.

## 다음 세션 - 이메일 도메인 업그레이드 (선택)

현재: `dfmoa.contact@gmail.com`  
개선: `contact@dfmoa.com` (Cloudflare Email Routing 사용 시 무료로 Gmail에 전달 가능)

작업 시 변경 범위:

- `src/lib/site-operator.ts`
- 모든 법적 페이지 (`/privacy`, `/terms`, `/about`, `/contact`)
- 푸터
- JSON-LD Organization.email
- 시행일 및 최종 수정일 갱신
