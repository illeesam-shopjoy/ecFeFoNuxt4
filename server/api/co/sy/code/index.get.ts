import { beApi } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

interface BeCodeItem {
  codeId: string;
  codeGrp: string;
  codeValue: string;
  codeLabel: string;
}

/**
 * 공통 코드 전체 목록. ecBeBo GET /api/co/sy/code 프록시 (BFF, 2026-09 전환).
 * 로그인 불필요한 공개 엔드포인트 — 그룹 필터 없이 부르면 시스템 전체 코드(1200개+)가 오는데,
 * 기존 프론트가 "한 번에 다 받아서 grpCode로 클라이언트 그룹핑"하는 구조라(useCodeStore) 그대로 맞춤.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const rows = await beApi.get<BeCodeItem[]>("/co/sy/code");
  const out = rows.map((r) => ({ codeId: r.codeId, codeGrp: r.codeGrp, codeValue: r.codeValue, codeLabel: r.codeLabel }));

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
