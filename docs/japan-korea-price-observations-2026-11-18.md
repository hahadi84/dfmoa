# 한국 면세 가격 대조 (2026-11-18)

## 확인 및 반영
- 소바쥬 EDP 100ml: 롯데 상세 화면의 100ML 선택, REF F078524009, 정상가 USD135 / KRW180225 확인 (18:06 KST). 한국어, 로그인 전 공개가, 사이트 환율 USD1=KRW1335. 회원가는 로그인 뒤 확인하므로 적용하지 않음. 수령 공항 표시 인천. 재고나 최종 구매 가능성은 보장하지 않음.
- 공식 URL: https://kor.lottedfs.com/kr/product/productDetail?prdNo=20000501205&prdOptNo=20000566678&adltPrdYn=N
- 일본 DEPACO EDP100ml JPY22110 (세금 포함): https://depaco.daimaru-matsuzakaya.jp/shop/g/g3348901368247/ (17:46 KST 관찰 기록 재사용).
- 참고 환율: data/content/yen-rate.json, 2026-11-17 ECB via Frankfurter, JPY1=KRW8.3882. JPY22110=KRW185463.102, 공개 면세가와 차이 KRW5238.102. 정수 반올림. 환급·카드 수수료·배송·회원 할인 미반영. 최저가 또는 최종 결제액 우열 아님.
- 환율 출처: https://api.frankfurter.dev/v2/rate/JPY/KRW?providers=ECB (현재 호출값과 역사적 기록 구분).

## 비교 보류
- SK-II 일반230ml: 롯데 검색에는 맨230ml/듀오, 신라 검색에는 일반250ml/330ml 및 맨230ml. 다른 용량·제품을 230ml 가격으로 대체하지 않음. 검색 결과만으로 전체 판매 여부 또는 품절을 단정하지 않음.
- https://www.shilladfs.com/estore/kr/ko/search?text=SK-II
- 일본230ml 실제 가격 출처: https://shop.odakyu-dept.co.jp/product/detail/s/4979006070064
- 히비키 JAPANESE HARMONY700ml: 신세계 결과의 마스터즈 셀렉트 스페셜 에디션700ml는 다른 에디션. 롯데·신라에서도 동일 상품 공개가 미확보. 연령 확인이나 로그인 우회하지 않음.
- https://www.ssgdfs.com/kr/search/resultsTotal?query=히비키
- https://products.suntory.co.jp/d/4901777270688/ 일본8000엔은 세전 권장가이며 실판매가가 아님.
- 두 품목은 정확히 일치하는 한국 면세 상세가, 히비키는 일본 판매점 실판매가 추가 취재 필요.

## 변경 범위
- src/lib/japan-price-examples.ts: 수동 관찰 자료·규격 대조·보류 이유 추가. 자동 가격 수집 파일을 덮어쓰지 않음.
- src/components/japan-price-examples.tsx: 비교표·조건·한국 공식 출처 링크. 기존 shopping_branch_open 재사용.
- src/app/japan/page.tsx: 현재 비교 가능 범위 설명.
- scripts/audit-japan-shopping.mjs: 정상가·환산 차이·보류 표시·롯데 링크 존재 회귀 검사 추가.

## 배포
이번 수정은 로컬 검증본이며 운영 재배포하지 않음. 기존 정기 배포 정책 유지.

## 검증 결과
- npm run build 통과: 251 페이지, 구조화 데이터 492개 오류 0.
- node scripts/audit-japan-shopping.mjs 통과: 360px/1280px 문서 넘침 없음, 표 내부 스크롤, 3개 상품 HTTP 200, 비교 산식 및 중복 이벤트 방지.
- 이벤트는 로컬 호출 검증이며 이번 테스트의 GA4 실제 수신 검증은 아님. 수집 요청 차단으로 QA 유입 제외.

