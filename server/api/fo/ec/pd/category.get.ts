import { beApi, type BePage } from "~~/server/utils/beApi";
import type { BeProdItem } from "~~/server/utils/mapProduct";
import { logger } from "~~/server/utils/logger";
import type { CoCategoryType } from "~/types/coCategoryType";

/**
 * 카테고리 목록. ecBeBo에 공개(FO/비로그인) 카테고리 API가 없다 — 카테고리 CRUD는
 * `/api/base/ec/pd/category`뿐인데 이건 인증 필요(401 확인함, 2026-09). 대신 상품 목록
 * 응답에 categoryId/cateNm/parentCategoryId가 이미 조인되어 내려오므로, 그걸 모아
 * distinct 처리해서 BFF가 카테고리 목록을 재구성한다 — DB 직접조회 없이, 공개 API만으로.
 * (카테고리 개수가 늘면 캐싱 고려할 것 — 지금은 매 요청마다 상품 1000건을 다시 훑는다.)
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const page = await beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { pageSize: 1000, useYn: "Y" });
  const seen = new Map<string, CoCategoryType>();
  for (const p of page.pageList) {
    if (p.categoryId && !seen.has(p.categoryId)) {
      seen.set(p.categoryId, {
        categoryId: p.categoryId,
        categoryNm: p.cateNm ?? "",
        categoryDepth: p.parentCategoryId ? 2 : 1,
        parentCategoryId: p.parentCategoryId ?? undefined,
      });
    }
  }
  const out = [...seen.values()];

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
