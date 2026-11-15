# 다국어 쇼핑 구매 정보 보강 및 검증

확인일 2026-11-16 KST. 로컬 작업본 ga4-search-release. 운영 배포 없음.

## 실제 변경
- 영어·일본어·간체의 기존 shopping-list URL과 10개 목록 유지.
- 영어 3개(마스크·설화수·차), 일본어 3개(마스크·쿠션·차), 간체 4개(마스크·설화수·쿠션·차)에 정확한 상품 규격과 공식 자료 링크, 출처 언어, 확인일, 구매 경로의 한계를 추가.
- 마스크·차·부산 기념품에서 기존 매장 안내로 이동하는 앵커를 추가. 기존 주소 복사·지도·공식 지점 링크 재사용.
- HERA 15g 리필과 본체+리필 15g×2를 구분. 글로벌 배송몰의 상품 규격 자료를 한국 지점 재고나 현장 가격으로 취급하지 않음.
- 설화수 140,000원은 과거 브랜드 출시 참고가로 표시. 기존 관찰가는 원래 관찰일을 유지. 환급·최저가 결론 추가 없음.
- 규격 확인 품목에 ‘포장 수량 미확인’이라는 일괄 안내가 나오던 부분을 수정.
- 외부 지도 이벤트에 interaction=external_map 추가. 기존 embed_load와 구분.
- 변경된 세 shopping-list URL만 사이트맵 수정일을 2026-11-16으로 갱신.

## 공식 자료
모두 2026-11-16 열람. 신규 사진은 가져오지 않았으며 기존 이미지와 권한 표기를 유지.
- MEDIHEAL Teatree Impact In Balancing Mask Sheet 10매, OLIVE YOUNG Global 영문 상품 자료
  https://global.oliveyoung.com/product/detail?prdtNo=GA210004743
- OSULLOC 삼다 꿀배 티 20입, 상자 69×80×122mm, 한국어 공식 상품 자료
  https://www.osulloc.com/kr/ko/shop/item/blended/15243
- Sulwhasoo First Care Activating Serum VI 90ml, 한국어 과거 출시 자료
  https://www.sulwhasoo.com/about-sulwhasoo/brand-news/archive/contents/2024/2024-first-care-activating-serum-vi-introduction.html
- HERA Black Cushion Foundation Refill 15g, Global AMORE MALL 영문 자료
  https://global.amoremall.com/products/refill-hera-black-cushion-foundation
- 신라 공식 주문 절차. 여행자 본인 이름 회원가입, 출국편 입력, 주문 교환증 안내
  https://m.shilladfs.com/comm/kr/en/shoppingGuideStep2
- 실제 이동 확인한 올리브영 명동 타운 공식 지점 페이지
  https://m.oliveyoung.co.kr/m/mtn/store/information/D176?language=KO&storeCode=D176&tabType=storeInfo

## 로컬 검증
- npm run build 및 postbuild 통과. 구조화 데이터 검사 488건 오류 0.
- international-offer-match 및 international-comparison 테스트 4건 통과.
- audit-language-links 237페이지, 언어 alternate 251개, 오류 0.
- 변경 TS/TSX ESLint 및 git diff --check 통과.
- Chrome 360×800 실제 렌더링. 세 언어 모두 콘텐츠 scrollWidth 345, viewport 360으로 가로 넘침 없음.
- 품목 정보 블록 영어3·일본어3·간체4, 기존 목록 유지.
- 매장 앵커 이동 및 주소 복사 성공 문구 영어 Copied·일본어 コピーしました·간체 已复制 확인.
- 영어 지도 iframe 생성 및 한글 지점명·주소 포함 URL 확인. 외부 지도 목적지 URL 확인. 세 언어의 모든 외부 지도 목적지를 각각 방문한 검사는 아님.
- 간체 모바일 메뉴 펼침과 비교기 이동 성공.
- 운영 페이지 광고 iframe과 실제 광고 콘텐츠 확인. 광고 클릭 없음. 로컬은 광고 자리표시자로 점검했으며 광고 채움률을 추정하지 않음.

## 실제 분석 수신
GA4 속성 533927864의 DebugView를 직접 확인.
- 운영 영어 쇼핑리스트에서 첫 주소 복사 1회와 지도 삽입 열기 1회 실행 후 shopping_address_copy 1, shopping_map_open 1 수신.
- 주소 복사 재시험 후 shopping_address_copy 2로 증가. 이는 의도적으로 두 차례 실행한 테스트이며 중복 전송 증거가 아님.
- page_view, session_start, user_engagement도 표시.
- 공식 매장 이동은 성공했으나 shopping_branch_open의 DebugView 수신은 이번 확인 시점에 확정하지 못함.
- 상품 비교·수령 이동 및 계산기 이벤트 모두에 대한 운영 GA 수신 검증은 미완료. 일반 이벤트 전송 요청의 네트워크 원문과 모든 매개변수를 캡처하지 못했으므로 전송 계층 전체 검증 완료로 표현하지 않음.
- 테스트 유입은 디버그 접속이며 관광객 성과가 아님. 내부 필터·주요 이벤트 설정 변경 없음.

## 최신 실적과 한계
GA4 홈의 2026-11-09~15 표시값은 활성 사용자212(-1.9%), 조회수726(-27.0%), Organic Search160세션. 전주 대비는 화면 표시 기준. 이전 11/1~7 스크린샷과 혼용하지 않음.
페이지 제목 변경으로 이전 영어 제목 행의 조회수가 줄 수 있으므로 그 행만으로 영어 전체 유입 감소를 판정하지 않음.
Search Console 탐색은 브라우저 응답 시간 초과로 완료되지 않음. 최신 28일 비교·페이지별 노출·CTR·색인·Google canonical은 미확인. GA의 언어별 28일 랜딩 세션 분석도 이번 범위에서 수치 확보하지 못함.

## 취재 필요 및 발행 조건
- 한국 지점의 현재 실구매가, 외국인 계정 결제 조건, 포장·재고, 쿠폰 적용과 환급은 추가 확인 필요. 글로벌 사이트 가격을 국내 지점 가격으로 전용하지 않음.
- 차의 개별 봉투 여부와 각 지점의 정확한 동일 SKU 취급 여부를 방문 전 재확인해야 함.
- 지점 위치·영업시간의 기존 출처 날짜를 이번 상품 규격 확인일로 덮어쓰지 않음.
- 신규 페이지 발행 없음. 미확인 가격·재고·절약액 추가 공개는 보류.
- AGENTS.md는 ‘이번 한국 시간 주에 이미 공개한 배포가 없는지 Netlify 배포 이력을 확인한다. 확인할 수 없으면 추가 배포하지 않는다’고 규정함. 이번 작업은 로컬 검증까지이며 배포 이력 검증 및 정기 배포는 실행하지 않음.

## 공개 후 28일 평가
공개일과 이벤트 측정 수정일을 기록하고 완결된 28일과 직전 28일을 비교한다.
언어·국가·랜딩 경로별 자연검색 세션, Search Console 비브랜드 클릭·노출·CTR·색인 상태를 확인한다.
행동률은 해당 쇼핑 페이지로 유입한 자연검색 세션 중 상품 비교·지도·공식 링크 행동이 발생한 세션 수 / 해당 자연검색 랜딩 세션 수로 정의한다. 이벤트 횟수를 방문자 수로 대체하지 않는다.
외부 지도 열기와 지도 삽입 열기는 interaction 속성별로 분리한다. 디버그 및 내부 테스트의 식별 범위를 확인한다.
기준값과 전체 이벤트 수신 확인 전에는 수치 목표를 제안하지 않는다.

## 배포 요청 후 준비
사용자가 2026-11-16 배포를 명시적으로 요청했다. Netlify REST API에서 최신 30건을 확인했으며 2026-11-16 00:00 KST 이후 운영 공개 0건이었다. 마지막 운영 공개는 2026-11-15 20:08:29 KST, 커밋 7637547b57516385bd212545c0fa57ae397e6c30, 배포 6af9927dbdea2bae09a9a409이다.
최신 origin/main 777365fc 기반으로 수정분을 충돌 없이 반영했다. 보안 업데이트와 최신 수집 데이터를 유지했다. npm ci 취약점 0건. 날짜 한정 requested-shopping-facts 릴리스 예외와 중복·production 제한 테스트를 추가했다.
