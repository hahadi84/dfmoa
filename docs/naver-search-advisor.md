# 네이버 서치어드바이저 등록 체크리스트

DFMOA의 네이버 검색 노출을 위해 사이트 소유 확인, 사이트맵, RSS, 수집 요청을 순서대로 처리합니다.

## 1. 사이트 등록

네이버 서치어드바이저에서 다음 URL을 등록합니다.

```txt
https://www.dfmoa.com
```

`dfmoa.com`은 `www.dfmoa.com`으로 리다이렉트되므로, 실제 canonical 기준인 `www` 주소를 등록합니다.

## 2. 소유 확인

현재 HTML 확인 파일이 배포되어 있습니다.

```txt
https://www.dfmoa.com/naver094ed3a7784707b341fb98fc465e611f.html
```

루트 레이아웃에도 `naver-site-verification` 메타 태그가 포함되어 있습니다. 둘 중 하나로 확인되면 됩니다.

## 3. 수집 설정 제출

서치어드바이저의 요청 메뉴에서 아래 항목을 제출합니다.

```txt
사이트맵: https://www.dfmoa.com/sitemap.xml
RSS: https://www.dfmoa.com/feed.xml
```

`robots.txt`는 네이버 검색로봇 `Yeti`를 명시 허용하고, 사이트맵 위치를 안내합니다.

```txt
https://www.dfmoa.com/robots.txt
```

## 4. 수집 요청 우선순위

처음에는 모든 URL을 한 번에 밀어넣기보다 아래 페이지부터 수집 요청합니다.

1. `https://www.dfmoa.com/`
2. `https://www.dfmoa.com/about`
3. `https://www.dfmoa.com/category/perfume`
4. `https://www.dfmoa.com/category/beauty`
5. `https://www.dfmoa.com/category/liquor`
6. 가격이 확인된 대표 상품 페이지 3~5개

## 5. 반영 확인

네이버 검색 반영은 즉시 되지 않을 수 있습니다. 소유 확인과 사이트맵 제출 후 며칠 간격으로 수집 현황, 색인 현황, robots 진단 결과를 확인합니다.
