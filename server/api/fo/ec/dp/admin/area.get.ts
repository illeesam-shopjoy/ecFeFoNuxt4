import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

export interface BeDpArea {
  areaId: string;
  uiId: string;
  areaCd: string;
  areaNm: string;
  areaTypeCd?: string | null;
  areaDesc?: string | null;
  useYn?: string | null;
}

/**
 * 전시패널관리(어드민) — 영역 목록. ecBeBo GET /api/fo/ec/dp/admin/area 프록시(FO_ONLY).
 * 2026-09-13 신설 — 로그인한 FO 회원만 접근 가능(진짜 BO 권한분리는 프론트에 BO 로그인 흐름이
 * 생긴 뒤 /api/bo/ec/dp/** 로 교체할 것, FoSyNoticeController 와 동일한 임시 조치).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const list = await beApi.get<BeDpArea[]>("/fo/ec/dp/admin/area", {}, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "list size=" + (list?.length ?? 0));
  return list ?? [];
});
