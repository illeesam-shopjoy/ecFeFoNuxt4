import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

export interface BeMemberAddrItem {
  memberAddrId: string;
  addrNm?: string;
  recvNm?: string;
  recvPhone?: string;
  zipCode?: string;
  addr?: string;
  addrDetail?: string;
  defaultYn?: "Y" | "N" | string;
}

/**
 * 2026-09-15(요청사항: "로그인사용자의 기본주소 있으면 넣어주면되") — 체크아웃 페이지에서
 * 로그인 회원의 기본 배송지를 미리 채워주기 위한 조회. ecBeBo GET /api/fo/ec/my/addr
 * (FoMyPageController) 프록시. 로그인 필요 — 비로그인이면 401을 그대로 흘려보낸다
 * (호출부인 checkout.vue가 비로그인 시엔 아예 호출하지 않음).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const list = await beApi.get<BeMemberAddrItem[]>("/fo/ec/my/addr", undefined, authHeaderFrom(event));

  logger.info("[api] ◀", method, url, "count=" + (list?.length ?? 0));
  return list ?? [];
});
