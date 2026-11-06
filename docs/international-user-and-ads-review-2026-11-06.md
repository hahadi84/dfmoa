# 외국어 사용자 경험·광고 검토 및 수정 — 2026-11-06

## 운영에서 확인한 사실
동일한 로컬Chrome(headless),1360×900에서한국홈,/en,/ja,/zh,/en/guide/korea-duty-free-shopping-list를각1회씩열고6초관찰. 광고클릭/새로고침반복/계정설정변경은하지않음.
모두adsbygoogle스크립트1개,수동상단ins1개,높이90px·너비970px,처리상태done 및 data-ad-status=unfill-optimized. pageerror/consoleerror없음. 프레임수는한국홈4·외국어각1. 프레임수가채워진광고수/수익을의미하지는않음. 기록 international-ads-live-before-20261106.json.
외국어경로는광고정책함수에서이미허용되고있으며지원언어여부로막는조건없음. 영·일·간체의스크립트누락이원인이라는증거는없음. 길어진외국어홈·신규가이드에본문수동광고가없고상단만있던배치차이를확인. Google의광고미충족상태는별도요인.

## 사용자관점의문제와수정
- 쇼핑홈/가이드에서한국에서살것10개목록을전역메뉴로바로찾기어려움:3언어헤더·푸터에쇼핑리스트링크추가,홈링크도실제목적에맞게표기.
- 긴목록을읽으며광고기회가상단에만집중:21개홈·핵심가이드에본문수동광고1개추가. 국가목록은4번째품목뒤전체너비,다른가이드는본문단락사이/끝. 지도버튼·복사버튼·입력폼에겹치거나광고와이동버튼을혼동시키지않게별도aside유지. 기존상품·계산기의광고는중복추가하지않음.
- 외국어페이지의광고라벨/로컬광고자리표시가한국어혼용:Advertisement/広告/广告/광고 및lang속성적용.
- processed로만보였던unfill-optimized를optimized로진단구분. 실제filled와구분하며광고가채워졌다고집계하지않음.
- 확정unfilled에서빈100/280px영역이남는현상:Google공식지원방식에따라확정unfilled의aside만숨김. 최초예약공간·filled·optimized유지. 요청재시도/광고새로고침은추가하지않음.

## 공식근거확인(2026-11-06)
- https://support.google.com/adsense/answer/10762946?hl=en : filled/unfilled/unfill-optimized의의미,unfilled숨김방법,처음부터광고를숨기지말라는안내.
- https://support.google.com/adsense/answer/16302564?hl=en : 빈공간최적화에서관련추천을표시할수있음. unfill-optimized는일반광고반환의증거가아님.
- https://support.google.com/adsense/answer/9727?hl=en : 지원언어정책. 이번언어별분기는광고차단조건이아님.
계정정책센터/URL별coverage/국가별광고수요/지역동의영향/자동광고배제설정은이번에확인하지않았음. 광고를강제충전할수있다는주장을하지않음.

## 검증
- 타입검사·변경파일ESLint통과.
- 광고로더·상태진단·상품안전성테스트12개통과. optimized보존,라벨언어,resize시재push금지회귀검사포함.
- 최신원격소스별도clone에서246정적페이지프로덕션빌드통과.
- 360px실제브라우저검사21페이지:상단1+본문1,광고스크립트1회,각슬롯1회요청,크기변경후중복없음,가로넘침없음.
- 실제광고노출을발생시키지않도록production호스트를로컬빌드로라우팅하고Google스크립트를스텁으로대체. filled/unfilled/optimized가시성,광고없는개인정보페이지,일본어모바일메뉴펼침/Escape검사통과. 기록international-ads-local-audit-20261106.json. 이검사는실제광고충족이나AdSense서버수익검증이아님.
- 광고클릭은실행하지않음. 지도·상품기존구조재사용. 신규서버수집/색인보장없음.

## 상태와남은확인
수정은로컬검증본,추가운영배포없음. AGENTS.md의주1회공개및별도추가배포지시규칙을유지.
공개후에는새본문슬롯이실제처리되는지와AdSense coverage를언어URL별로확인해야함. unfill-optimized가지속되면일반광고가보이지않는현상은남을수있음. 사진중품목참고사진/미확인개별상품사진을구분한기존안내는유지.
