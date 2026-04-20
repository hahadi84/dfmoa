import { products } from "@/lib/site-data";
import { dutyFreeSources } from "@/lib/source-policy";
import type { SourceHealthErrorReason } from "@/lib/search-types";

export const sourceHealthErrorReasons: SourceHealthErrorReason[] = [
  "network_error",
  "parse_error",
  "function_timeout",
  "cors_or_403",
  "cookie_or_login_required",
  "robots_or_terms_restricted",
  "product_match_failed",
  "low_confidence_match",
  "frontend_state_error",
  "unknown_error",
];

export const collectionPriority = [
  "공식 제휴/API",
  "robots.txt와 약관상 접근 가능한 공개 페이지",
  "공식 검색 링크 기반 수동/반자동 검수 데이터",
  "자동 수집 제한 소스는 가격 대신 원본 링크와 source status 제공",
] as const;

export const snapshotStoragePlan = {
  preferredStore: "Netlify Blobs",
  historyStoreName: "dfmoa-history",
  healthStoreName: "dfmoa-source-health",
  cadence: "1일 2~4회 배치 스냅샷 권장",
  frontendReadModel: "프론트는 외부 사이트 직접 호출보다 캐시된 snapshot 또는 함수 응답을 읽습니다.",
  note: "runtime function이 배포된 정적 파일에 영구 저장하지 않도록 Netlify Blobs 또는 외부 KV를 사용합니다.",
};

export const representativeSnapshotTargets = products.slice(0, 20).map((product) => ({
  productId: product.slug,
  query: product.query,
  categorySlug: product.categorySlug,
  sources: dutyFreeSources.map((source) => ({
    sourceId: source.id,
    accessPolicy: source.accessPolicy,
    crawlDelaySeconds: source.crawlDelaySeconds,
  })),
}));

