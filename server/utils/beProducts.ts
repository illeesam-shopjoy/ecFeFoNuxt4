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

const TTL_MS = 60_000; // 1분 — 상품 정보가 자주 바뀌는 편이 아니라 넉넉히 잡음

export function getAllProdPage(): Promise<BePage<BeProdItem>> {
  return cachedCall("be:prod:page:all", TTL_MS, () => beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { pageSize: 1000, useYn: "Y" }));
}
