# DFMOA

한국 공항면세점 가격 비교 서비스를 위한 Next.js MVP입니다.

`moajung.com`의 정보 구조를 참고해 홈-검색-카테고리-가이드-FAQ 흐름을 만들고, Apple 사이트처럼 큰 타이포와 넓은 여백을 사용하는 프리미엄 톤으로 화면을 구성했습니다.

## Included pages

- `/` 홈 랜딩
- `/search?q=` 검색 결과
- `/product/[slug]` 상품 상세 비교
- `/category/[slug]` 카테고리 랜딩
- `/guide/[slug]` 가이드 상세
- `/faq`
- `/about`

## Tech stack

- Next.js 16 App Router
- TypeScript
- CSS only styling
- Netlify Functions + Netlify Blobs
- Live + external snapshot data layer for stores

## Run locally

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 됩니다.

## Important note about scripts

작업 경로에 한글이 포함되어 있을 때 Next 16의 Turbopack이 Windows에서 빌드 오류를 내는 경우가 있어,
현재 `dev`와 `build` 스크립트는 모두 `--webpack` 옵션으로 고정했습니다.

```bash
npm run lint
npm run build
```

## Price snapshot refresh

P1 가격 스냅샷은 수동으로 갱신합니다. 배포 전 또는 하루 2회 아래 명령을 실행해 `data/prices/*.json`을 갱신하세요.

```bash
npm run snapshot
```

수집 실패 상품은 이전 유효 가격을 유지하고, 유효 가격이 없으면 화면에 `최근 수집 실패 — 원본 면세점 확인` 상태와 공식 검색 링크가 표시됩니다.

## External collector for Shinsegae

신세계면세점은 `2026-04-18` 기준 공식 검색 경로가 서버 요청과 헤드리스 브라우저에서 차단됩니다.
그래서 현재 구조는 외부 브라우저 수집기가 가격을 모아 `/api/external-store-snapshot` 으로 넣고,
검색 API가 그 최신 스냅샷을 읽어 비교표에 섞는 방식으로 준비되어 있습니다.

### 1. Netlify env

- `EXTERNAL_STORE_SYNC_TOKEN`
- `EXTERNAL_SNAPSHOT_MAX_AGE_HOURS`

토큰이 없으면 로컬/비프로덕션에서는 인증 없이 테스트할 수 있습니다.

### 2. Local collector

```bash
npm run collect:shinsegae -- "Sulwhasoo"
```

제출까지 하려면:

```bash
$env:DFMOA_EXTERNAL_SYNC_URL="https://dfmoa.netlify.app/api/external-store-snapshot"
$env:DFMOA_EXTERNAL_TOKEN="your-token"
npm run collect:shinsegae -- "Sulwhasoo" --submit
```

스크립트는 영속 브라우저 프로필을 `.collector/shinsegae-profile` 에 저장합니다.
차단 화면이 뜨면 브라우저에서 로그인/인증을 마친 뒤 Enter를 누르면 다시 시도합니다.
파싱에 실패하면 `.collector/shinsegae-last.html` 에 마지막 HTML을 저장합니다.

## Data model

현재는 `src/lib/site-data.ts`에 샘플 데이터를 두고 있습니다.

- stores: 면세점 운영사 정보
- categories: 카테고리 랜딩 정보
- products: 내부 상품 기준 정보
- offers: 운영사별 가격 정보
- guides / faqs: 콘텐츠 페이지 정보

이 구조는 나중에 크롤러나 DB를 붙일 때 그대로 확장할 수 있도록 잡아둔 형태입니다.

## Next steps

- 실데이터 수집기 연결
- 동일 상품 매칭 관리자 화면 추가
- 가격 이력 저장 및 차트 추가
- 공항/출국일 필터 고도화
- 목표가 알림 기능 추가
