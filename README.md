# DFMOA — 면세점 가격 비교

한국 공항면세점(롯데·신라·신세계·현대) 공개가를 비교하는 정보 서비스.

- 사이트: https://www.dfmoa.com
- 운영 형태: 개인 · 비영리
- 문의: dfmoa.contact@gmail.com

## 기술 스택

- Next.js (Netlify 배포)
- 신라 공개 검색 수집, 신세계 검색 경로 접근성 감지 및 상태 분류
- GitHub Actions/수동 실행 기반 가격 스냅샷
- GA4 분석, Open Graph, JSON-LD 구조화 데이터

## 로컬 개발

```bash
npm ci
npm run dev
```

## 스냅샷 수동 실행

```bash
npm run snapshot
```

## 커버리지 감사

```bash
node scripts/report-coverage.mjs
```

## AdSense 준비 감사

```bash
node scripts/adsense-readiness-audit.mjs
```
