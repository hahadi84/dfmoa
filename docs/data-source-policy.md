# 데이터 출처 정책 운영 메모

## 신세계면세점 수집 상태

- robots.txt: `User-agent: *` 기준 `Allow: /`
- 검색 문서 URL: `https://www.ssgdfs.com/kr/search/resultsTotal?...`
- 브라우저/서버 재현 결과: 검색 결과 문서는 `406 Not Acceptable` 후 `/_fec_sbu/` 보안 스크립트를 반환하고, 관련 XHR은 `FECU` 세션 토큰을 요구한다.
- 현재 처리: `disabled_by_policy` 상태와 `cookie_or_login_required` 사유로 자동 수집 제외
- 향후 계획: 공식 API, 파트너십, 또는 명시적으로 허용되는 수집 경로가 확인될 때 재도입

DFMOA는 신세계 검색 경로를 우회하지 않으며, 가격이 확인되지 않는 상품에는 원본 검색 링크와 source status를 우선 제공한다.
