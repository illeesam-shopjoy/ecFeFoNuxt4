import { beApi, type BePage } from "~~/server/utils/beApi";
import type { BeProdItem } from "~~/server/utils/mapProduct";
import { cachedCall } from "~~/server/utils/cache";
import { logger } from "~~/server/utils/logger";
import type { CoBrandType } from "~/types/coBrandType";

/**
 * 브랜드 목록. categories.get.ts와 같은 이유로 상품 목록에서 distinct 재구성한다 —
 * `/api/base/sy/brand`는 인증 필요(401 확인함, 2026-09)라 공개 BFF에서 못 씀.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  // 2026-09-13: 브랜드 목록 뽑겠다고 매번 상품 1000건을 새로 받아오던 문제 완화 — 10분 캐시.
  const page = await cachedCall("be:brand:from-prod-page", 600_000, () => beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { pageSize: 1000, useYn: "Y" }));
  const seen = new Map<string, CoBrandType>();
  for (const p of page.pageList) {
    if (p.brandId && !seen.has(p.brandId)) {
      seen.set(p.brandId, { brandId: p.brandId, brandCode: p.brandId, brandNm: p.brandNm ?? "" });
    }
  }
  const out = [...seen.values()];

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
