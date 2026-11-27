<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- 2026-11-15 사용자 “지금 배포” 요청: 검증된 검색 페이지·공식몰 GA4 측정 개선 `release(requested-search-analytics): 2026-11-15` 운영 공개 1회 승인. 날짜·운영 환경·중복 방지 검사를 유지한다. 기존 11월 16일 대기 건은 이미 반영된 커밋을 중복 적용하지 않는다.

## 운영 배포 주기 (사용자 지시, 2026-10-27)
- 2026-10-29 혜택 4사 수정 완료 후 사용자가 별도로 “배포”를 지시했다. `release(requested-benefits): 2026-10-29` 공개 1회를 추가 승인하며, 해당 날짜·운영 환경·중복 방지 검사를 유지한다. 정기 정책은 변경하지 않는다.
- 2026-10-29 사용자 직접 지시 “오늘 배포하자”에 따라 이날 1회 `release(requested): 2026-10-29` 공개를 허용한다. 해당 한국 날짜에만 유효하며, 이후 월요일 정기 정책은 유지한다. 같은 요청 커밋의 반복 공개는 금지한다.
- 변경 사항을 미리 배포하지 않는다. 미리보기 배포도 생성하지 않고 로컬에서 검증한다.
- 운영 배포는 매주 월요일 09:00 KST 정기 점검 때 주 1회만 한다. 다음 정기일은 2026-11-02다.
- 평일 소스/일일 수집 커밋에는 `[skip netlify]`를 붙이고 build hook을 호출하지 않는다.
- 정기 점검에서 이번 한국 시간 주에 이미 공개한 배포가 없는지 Netlify 배포 이력을 확인한다. 확인할 수 없으면 추가 배포하지 않는다.
- 테스트와 빌드를 통과한 변경만 `release(weekly): YYYY-MM-DD`(해당 월요일) 커밋으로 공개한다. 재시도·추가 공개는 사용자의 별도 지시 없이 하지 않는다.
- 일일 데이터 수집과 주간 정적 공개를 구분한다. 실제 관측일을 유지하고 최신 가격을 보장한다고 표현하지 않는다.
- 정기 공개 커밋 준비는 `scripts/prepare-weekly-release.mjs --confirmed-no-published-release`를 사용한다. 이력 확인·로컬 주간 잠금·Netlify 마지막 빌드 검사 중 하나라도 확인할 수 없으면 공개를 보류한다. 잠금을 임의 삭제하거나 우회 배포하지 않는다.
`n- 2026-10-30 사용자 “배포” 요청: release(requested-ads): 2026-10-30 공개 1회 승인. 정기 주기는 유지한다.
- 2026-10-31 사용자 배포 요청: release(requested-airport): 2026-10-31 홈페이지 공항 디자인 공개 1회 승인. 정기 주기는 유지한다.
- 2026-11-01 사용자 배포 요청: release(requested-search-ad): 2026-11-01 비교 결과 상단 배너 공개 1회 승인. 정기 주기는 유지한다.

- 2026-11-02 사용자 “전체 페이지 적용되었으면 배포” 요청: release(requested-airport-all): 2026-11-02 전체 공항 디자인 공개 1회 승인. 이번 주 정기 점검은 이 공개 이력을 확인하여 중복 배포하지 않는다.

- 2026-11-02 첫 전체 디자인 배포의 Google 글꼴 처리 실패 후 사용자 “계속” 지시: 글꼴 의존성 수정본 release(requested-airport-font-fix): 2026-11-02 재배포 1회 승인.
- 2026-11-05 사용자 “seo 검색 최적화 및 배포” 요청에 따라 release(requested-shopping-seo): 2026-11-05 운영 공개 1회를 허용한다. 날짜·운영 환경·중복 방지 검사를 유지한다.
- 2026-11-05 별도 배포 요청으로 쇼핑리스트·상품 이미지 공개 1회(release(requested-shopping-list): 2026-11-05)를 허용한다.

- 2026-11-05 사용자 추가 “배포” 요청: 검증된 다국어 쇼핑 연결·측정 보강본 release(requested-shopping-actions): 2026-11-05 운영 공개 1회 허용. 중복 방지와 정기 정책은 유지한다.

- 2026-11-06 사용자 “검토내용 반영 수정해서 배포” 요청: release(requested-market-shopping): 2026-11-06 다국어 쇼핑·사진·지도·수령 검색 개선 운영 공개 1회 승인. 날짜·중복·production 제한을 유지한다.

- 2026-11-06 사용자 추가 “배포” 요청: release(requested-international-ads): 2026-11-06 외국어 본문 광고·탐색 개선 공개 1회 허용. 날짜·중복·production 제한 유지.

- 2026-11-07 사용자 인증 파일 배포 승인: release(requested-naver-verification): 2026-11-07 운영 공개 1회 허용. 날짜·중복·production 제한 유지.

## 구조화 데이터·스니펫 검사 (사용자 지시, 2026-11-07)
- 페이지·상품·가격·리뷰·템플릿 수정 시 JSON-LD와 실제 표시 내용의 일치를 반드시 확인한다.
- Product는 검증된 현재 offers 또는 실제 review/aggregateRating 요건을 충족할 때만 사용한다. 과거 가격·가격 미확인 안내는 WebPage로 표현한다. 가짜 가격·평점·리뷰·재고·유효기간을 만들지 않는다.
- 배포 전 npm run build에 포함된 check-structured-data 검사를 통과해야 한다. 실패를 무시하거나 검사를 제거해 공개하지 않는다.
- 구조화 데이터 변경 시 대표 URL의 Google 리치 결과 테스트와 Search Console 상세 오류를 확인한다. 권장사항과 필수 오류를 구분하고, 자동검사가 Google의 전체 요건/사실성을 보장한다고 표현하지 않는다.
- 배포 후 실제 HTML과 canonical·탐색경로를 확인하고, 해당 오류에 유효성 검사를 요청한다. 보고서 갱신은 재수집 후 확인한다.

- 2026-11-07 사용자 구조화 데이터 수정 및 재발 방지 배포 승인: release(requested-structured-data): 2026-11-07 운영 공개 1회 허용. 날짜·중복·production 제한 유지.

- 2026-11-11 사용자 “배포” 요청에 따라 할인·적립금 콘텐츠 카테고리 공개 1회(release(requested-benefit-topics): 2026-11-11)를 승인한다. 날짜·운영 환경·중복 방지 검사를 유지한다.

- 2026-11-11 사용자 “거기까지 수정해서 배포해줘” 요청으로 대표 브랜드 100개·관측가 상태·면세점별 검색 개편 공개 1회(release(requested-brand-directory): 2026-11-11)를 승인한다. 날짜·운영 환경·중복 방지 검사를 유지한다.

- 2026-11-12 사용자 “배포” 요청에 따라 의존성 보안 업데이트 공개 1회(release(requested-security): 2026-11-12)를 승인한다. 날짜·운영 환경·중복 방지 검사를 유지하며 정기 정책은 변경하지 않는다.

- 2026-11-13 당일 수집 완료 후 사용자 “배포” 요청에 따라 검증된 수집 데이터 공개 1회(release(requested-collection): 2026-11-13)를 승인한다. 해당 한국 날짜·운영 환경·중복 방지 검사를 유지하며 정기 정책은 변경하지 않는다.

- 2026-11-16 사용자 “이번 주 배포 이력 확인하고 수정한 내용 배포해줘” 요청으로 다국어 쇼핑 정보 보강 공개 1회(release(requested-shopping-facts): 2026-11-16)를 승인한다. 주간 이력 확인, 날짜·production·중복 방지 제한을 유지한다. 이번 주 정기 점검은 이 배포를 포함해 중복 공개하지 않는다.

- 2026-11-18 사용자 “최신 검색 실적·재색인 확인과 모바일·이벤트 검증까지 마무리하고 배포” 요청으로 검증된 쇼핑 탐색 개선 공개 1회(release(requested-shopping-routing): 2026-11-18)를 승인한다. 이번 주 11월 16일 공개 이력을 확인했으며 이번 별도 요청에 한해 추가 공개한다. 날짜·production·중복 방지 제한과 정기 정책은 유지한다.

- 2026-11-18 사용자 후속 요청 “운영 사이트에서 GA4 이벤트가 수신되지 않는 원인까지 확인하고, 필요한 수정과 검증”에 따라 초기 페이지 조회 경로 보강본 공개 1회(release(requested-analytics-receipt): 2026-11-18)를 수행한다. 같은 주 11월 16일·18일 이력을 확인했으며 이 후속 수정에만 적용한다. 날짜·production·중복 방지와 정기 배포 제한을 유지한다.

- 2026-11-18 사용자 추가 “배포” 요청으로 일본 환급 인포그래픽·마운자로 여행 안내 공개 1회(release(requested-japan-travel): 2026-11-18)를 승인한다. Netlify에서 이번 주 11월 16일 및 18일 두 차례 공개 이력을 확인했으며, 이번 별도 요청에 한해 추가 공개한다. 날짜·production·중복 방지와 정기 정책은 유지한다.

- 2026-11-18 일본 여행 콘텐츠 배포 후 운영 검증에서 발견한 환급 가이드 OG 이미지 404를 보완한다. 같은 배포 요청의 검증 완료를 위한 release(requested-japan-travel-assets-fix): 2026-11-18 수정 공개 1회이며, 날짜·production·중복 방지는 유지한다.

- 2026-11-18 사용자 “재배포” 요청에 따라 검증된 가이드 본문·목차·관련 글 레이아웃 수정본 공개 1회(release(requested-guide-layout): 2026-11-18)를 승인한다. 현재 운영 0c5114ca와 이번 주 기존 공개 이력을 Netlify에서 확인했다. 날짜·production·중복 방지와 정기 정책을 유지한다.

- 2026-11-18 사용자 “배포” 요청으로 일본 여행 제목·검색 설명·사이트맵 수정본 공개 1회(release(requested-japan-snippets): 2026-11-18)를 승인한다. 현재 운영6688f246 및 이번 주 이력을 Netlify에서 확인했다. 날짜·production·중복 방지를 유지한다.

- 2026-11-18 사용자 “배포하고 운영 사이트에서 GA4 이벤트가 실제 수신되는지까지 확인” 요청으로 엔화 계산기 측정·대표 상품 정보 공개 1회(release(requested-yen-products): 2026-11-18)를 승인한다. Netlify에서 현재 운영 f9224b63 및 이번 주 11월 16일·18일 공개 이력을 확인했다. 날짜·production·중복 제한과 정기 정책을 유지한다.

- 2026-11-18 사용자 추가 “배포” 요청으로 한국 면세 가격 대조 보강본 공개 1회(release(requested-korea-prices): 2026-11-18)를 승인한다. Netlify에서 현재 운영 e4c360fb 및 이번 주 11월 16일·18일 공개 이력을 확인했다. 날짜·production·중복 제한과 정기 정책을 유지한다.

- 2026-11-23 사용자 “배포” 요청: 검증된 구매 정보·엔화 계산 예시·다국어 행동 측정 보강본 release(requested-purchase-info): 2026-11-23 운영 공개 1회 승인. Netlify 최신 공개가 11월 22일 fb17d034이며 이번 주 선행 공개가 없음을 확인했다. 날짜·production·중복 제한과 정기 정책을 유지한다.

- 2026-11-25 사용자 요청으로 엔화 단독 환산·모바일 쇼핑 버튼 공개 1회(release(requested-mobile-yen): 2026-11-25)를 승인한다. 기존 운영 17565af2 및 날짜·중복 검사를 확인한다.

- 2026-11-25 사용자 추가 요청으로 엔화 환산·매장 이동 측정과 검증한 안내 개선 release(requested-shopping-events): 2026-11-25 운영 배포 1회 승인.

- 2026-11-27 사용자 요청에 따라 로컬 검증 개선 묶음 release(requested-verified-updates): 2026-11-27 운영 배포 1회를 승인한다.

- 2026-11-27 사용자 추가 요청으로 한국어 및 다국어 상품 검색 개선 release(requested-product-search): 2026-11-27 공개 1회를 승인한다.

- 2026-11-27 사용자 요청으로 네 언어 홈 검색·가격 목록 통일본 release(requested-home-prices): 2026-11-27 운영 공개 1회를 승인한다.
