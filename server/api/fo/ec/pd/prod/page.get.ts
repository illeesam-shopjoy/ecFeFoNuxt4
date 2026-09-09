import { beApi, type BePage } from "~~/server/utils/beApi";
import { mapProduct, type BeProdItem } from "~~/server/utils/mapProduct";
import { logger } from "~~/server/utils/logger";

/**
 * 상품 목록. ecBeBo GET /api/fo/ec/pd/prod/page 프록시 (BFF, 2026-09 전환 — DB 직접조회 없음).
 * pageSize를 크게 잡아 "전체 목록"처럼 한 번에 받는다 — 기존 프론트가 클라이언트 사이드
 * 필터/정렬(useProductsStore)을 전제로 짜여 있어(app/store/useProductsStore.ts), 구조를
 * 그대로 유지하기 위함. 카탈로그가 커지면 서버 페이징으로 전환 필요.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const page = await beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { pageSize: 1000, useYn: "Y" });
  const out = page.pageList.map((p) => mapProduct(p));

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
