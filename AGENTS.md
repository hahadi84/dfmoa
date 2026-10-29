<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
