/**
 * beProducts.ts — ecBeBo GET /fo/ec/pd/prod/page(pageSize=1000)의 캐시된 공용 호출.
 *
 * 2026-09-13: 이 "전체 상품 1000건" 호출이 (a) pd/prod/page.get.ts, (b) pd/category-tree.get.ts
 * 두 군데서 각각 독립적으로 호출되고 있었다 — 홈 화면 한 번 렌더에 같은 무거운 쿼리가
 * 자택 NAS 백엔드에 중복으로 두 번 나가는 셈이라 동시부하를 키우는 요인이었다.
 * cachedCall로 묶어 두 라우트가 같은 결과를 공유하게 한다.
 */
import { beApi, type BePage } from "~~/server/utils/beApi";
import { type BeProdItem } from "~~/server/utils/mapProduct";
import { cachedCall } from "~~/server/utils/cache";

const TTL_MS = 300_000; // 5분(2026-09-13 재조정: 1분→5분) — 상품 정보가 자주 바뀌는 편이 아니라 넉넉히 잡음

// 2026-09-17: 상품이 631건까지 늘면서 이 "전체 1000건" 조회 자체가 실측 약 15~16초까지
// 걸리기 시작했다(직접 curl로 확인) — beApi 기본 5초 타임아웃에 매번 걸려 502로 실패,
// 홈 화면 인기상품/할인/배너 섹션이 전부 비어 보이던 원인이었다. 이 호출만 넉넉히
// 25초로 늘려서 우선 통과시킨다(근본적으로는 홈 화면이 굳이 전체 카탈로그를 받을 필요가
// 없는 게 문제 — TrendingProducts.vue는 이미 페이징 API로 분리함, 참고).
export function getAllProdPage(): Promise<BePage<BeProdItem>> {
  return cachedCall("be:prod:page:all", TTL_MS, () => beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { pageSize: 1000, useYn: "Y" }, undefined, 25_000));
}
