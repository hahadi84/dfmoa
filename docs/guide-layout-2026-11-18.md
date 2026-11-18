# 가이드 읽기 화면 개선 (2026-11-18)

- 대상: /guide/[slug] 공통 템플릿. 특히 마운자로·일본 환급 가이드의 좁은 본문과 잘린 관련 글 수정.
- 기존 2열 split-grid를 단일 본문으로 변경. 본문 최대 860px, 문단 실제 영역은 안쪽 여백 제외.
- 큰 제목의 어두운 배경 제거, 제목 크기 조정, 중첩 테두리 제거, 문단과 구분선 정리.
- 목차 및 소제목 앵커 추가. 관련 가이드 3개를 본문 하단에 설명·확인일과 함께 배치.
- CSS Module로 범위 제한. 기존 데이터·metadata·JSON-LD·공식 링크 재사용.
- 변경 TSX ESLint, 251페이지 빌드, 구조화 데이터 492개 오류 0.
- PC viewport 1280(스크롤바 제외1265): 본문860px, document scrollWidth1265.
- 모바일360(스크롤바 제외345): 본문332px, document scrollWidth345. 관련 링크 각각332px, 가로 넘침 없음.
- Chrome 실제 목차 클릭 후 #guide-section-6 URL 변경 확인. IAB 클릭은 같은 문서 앵커 이동이 반영되지 않아 Chrome에서 확인.
- 일본 환급 절차도1회 렌더링·PC 가로 넘침 없음 확인.
- 이미지: guide-layout-desktop-2026-11-18.jpg, guide-layout-mobile-2026-11-18.jpg (로컬 검증 화면).
- 운영 배포 없음. AGENTS 정기 배포 규칙에 따라 [skip netlify] 저장.
