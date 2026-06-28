# SEO 즉시 조치 체크리스트

## Google Search Console

- 다음 production 배포 후 `https://www.dfmoa.com/sitemap.xml`을 다시 제출합니다.
- 검색 결과에 남아 있는 `https://dfmoa.netlify.app` URL은 임시 삭제 또는 재크롤 정리를 요청합니다.
- 아래 대표 URL을 URL 검사로 확인하고 색인 생성을 요청합니다.
  - `https://www.dfmoa.com/`
  - `https://www.dfmoa.com/product/glenfiddich-15-700ml`
  - `https://www.dfmoa.com/product/jo-malone-english-pear-100ml`
  - `https://www.dfmoa.com/product/sulwhasoo-first-care-serum-90ml`
  - `https://www.dfmoa.com/product/sk2-pitera-essence-230ml`
  - `https://www.dfmoa.com/product/hibiki-harmony-700ml`
  - `https://www.dfmoa.com/category/perfume`
  - `https://www.dfmoa.com/category/liquor`
  - `https://www.dfmoa.com/brand/glenfiddich`
  - `https://www.dfmoa.com/deals`

## 검색어 우선순위

- Search Console에서 최근 3개월 검색어/페이지 데이터를 내보냅니다.
- 평균 순위가 8-20위이고 CTR이 1.5% 미만인 페이지를 먼저 다시 작성합니다.
- 이미 노출이 있는 상품명 검색어를 우선합니다. 특히 향수, 뷰티 세럼, 위스키 계열을 먼저 봅니다.
- 배포 후 7일/14일 단위로 노출, CTR, 평균 순위, 색인 URL 수를 비교합니다.

## 배포 후 검증

- `/deals`가 200으로 응답하고 자체 canonical URL을 사용하는지 확인합니다.
- 상품 구조화 데이터의 `priceValidUntil`이 신선한 가격 스냅샷에만 미래 날짜로 표시되는지 확인합니다.
- sitemap `lastmod`가 상품, 리포트, 고정 안내 페이지별로 다르게 나오는지 확인합니다.
