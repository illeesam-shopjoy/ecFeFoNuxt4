import { beApi } from "~~/server/utils/beApi";
import { cachedCall } from "~~/server/utils/cache";
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
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  // 2026-09-13: 1200개+ 전체 코드 조회는 무겁고 자주 바뀌지 않아 캐시로 NAS 부하 완화.
  // (재조정: 5분→30분 — 코드 테이블은 배포 단위로만 바뀌는 성격이라 더 길게 잡아도 안전하다.)
  const rows = await cachedCall("be:sy:code:all", 1_800_000, () => beApi.get<BeCodeItem[]>("/co/sy/code"));
  const out = rows.map((r) => ({ codeId: r.codeId, codeGrp: r.codeGrp, codeValue: r.codeValue, codeLabel: r.codeLabel }));

  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
