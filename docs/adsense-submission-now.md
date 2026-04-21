# 지금 당장 AdSense 심사 신청 단계

## 0. 준비 완료 확인

- [x] 커스텀 도메인 (`www.dfmoa.com`)
- [x] HTTPS
- [x] 법적 페이지 4종
- [x] sitemap / robots
- [x] GA4 (`G-SRSWS2FHS2`)
- [x] 쿠팡 제휴 `rel="sponsored nofollow"`

## 1. AdSense 계정 접속

1. https://www.google.com/adsense/
2. Google 계정 로그인 (GA4와 동일한 계정 권장)

## 2. 사이트 추가

3. 사이트 URL: `https://www.dfmoa.com`
4. 국가/지역: 대한민국
5. 결제 국가: 대한민국 (KRW)
6. 세금 정보 입력 (개인, 주민등록번호 필요)

## 3. AdSense 심사 코드 삽입

7. AdSense가 제공하는 `<script async src="...">` 코드 복사
8. 이 코드를 Codex에 전달 -> Codex가 `src/app/layout.tsx` `<head>`에 삽입
9. 배포 완료 후 AdSense UI에서 "검토 요청" 버튼 클릭

## 4. 대기

- 2일 ~ 2주 (평균 3~5일)
- 메일로 결과 수신
- 반려 시 사유 확인 -> 보완 후 재신청

## 5. 승인 후

- `public/ads.txt`에 `pub-XXXXXXXXXXXXXXXX` 실제 값 반영
- 광고 슬롯 배치 (`docs/adsense-plan.md` 참조)
- 최초 수익 확정 시 가족 사업자 등록 검토 (세금)
