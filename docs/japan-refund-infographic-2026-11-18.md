# 일본 면세 환급 콘텐츠·인포그래픽 보강

확인일: 2026-11-18 KST
대상: /guide/japan-tax-refund-2026 (한국어 일본 여행 가이드)

## 변경
- 직접 제작한 HTML/CSS 절차도: 세금 포함 결제 → 짐 위탁 전 반출 확인 → 출국과 판매처 환급을 각각 진행.
- 초록/빨강 판정은 색과 텍스트를 함께 표시. 실제 공항 지도·단말기 화면이 아님을 명시.
- 변경 전후 비교표, 저장하지 않는 준비 체크리스트 5개, 공식 공항 지도와 기존 엔화 계산기 연결.
- Visit Japan Web 지정 공항·전용 무선 LAN 조건, 국내선 환승, 소비한 물품, 고가품 증빙, 환급 문의처, 대기시간의 불확실성 보강.
- 공식 사진/커뮤니티 사진을 복제하지 않음. 절차도는 DFMOA 자체 제작.

## 공식 출처 (2026-11-18 내용 확인)
- 여행자 절차: https://www.mlit.go.jp/kankocho/tax-free/page01_000001_00021.html
- 상황별 FAQ: https://www.mlit.go.jp/kankocho/tax-free/page01_000001_00023.html
- 환급 FAQ: https://www.mlit.go.jp/kankocho/tax-free/page01_000001_00051.html
- 온라인 절차 다국어 안내: https://www.nta.go.jp/publication/pamph/shohi/menzei/201805/format/002/onlinetetsuzuki.htm
- 공항 지도: https://www.customs.go.jp/kaigairyoko/taxrefund/map.htm

## 검증
- 변경 TSX ESLint 통과, Next 빌드 250페이지 완료.
- 구조화 데이터 490개 검사, 오류 0.
- 정적 HTML 본문·인포그래픽 1회 렌더링, 자기 참조 canonical, 사이트맵 포함 확인.
- 360px viewport에서 문서 clientWidth/scrollWidth 모두 345px(스크롤바 제외), 가로 넘침 없음.
- 비교표 자체 321px 영역/490px 내용, 키보드 오른쪽 이동 scrollLeft 40 확인.
- 체크박스 checked=true 확인. 내부 계산기 링크 클릭 후 /japan#yen-calculator-title 및 대상 제목 확인.
- 최종 데스크톱 화면 확인 및 스크린샷 저장. 임시 viewport 해제.
- 이벤트 측정 코드는 변경하지 않았고 GA4 수신 재검증은 이번 작업 범위가 아님.

## 한계·배포
- 실제 공항 대기시간, 현장 체험, 개별 판매처의 지급 시점·수수료는 확인하지 않았으며 단정하지 않음.
- 공항별 상세 동선은 공식 지도 선택 화면으로 연결. 현장 사진·임의 입구 위치를 추가하지 않음.
- AGENTS.md 정기 배포 규칙에 따라 [skip netlify] 소스 저장. 운영/미리보기 배포 없음.
