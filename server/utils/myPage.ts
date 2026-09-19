import type { H3Event } from "h3";
import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 마이페이지 목록(주문/클레임/쿠폰/캐쉬/문의/채팅) 공통 프록시 (2026-09-19, ecFeBo foMyStore 이식).
 * 로그인 필요(FO_ONLY) — 클라이언트의 Authorization 헤더를 그대로 ecBeBo 로 전달한다. 사용자별 응답이라 CDN 캐시 금지.
 * 쿼리는 허용 목록(pageNo/pageSize/기간/상태 필터)만 백엔드로 넘긴다.
 */
const ALLOWED_KEYS = [
  "pageNo",
  "pageSize",
  "dateRangeType",
  "dateRangeStart",
  "dateRangeEnd",
  "orderStatusCd",
  "claimStatusCd",
  "claimTypeCd",
  "couponStatusCd",
  "status",
  "cacheTypeCd",
  "sort",
];

/** kind → ecBeBo 경로 (FoMyController /api/fo/my/{kind}/page, 채팅은 FoCmChattController) */
export const MY_PAGE_KINDS: Record<string, string> = {
  order: "/fo/my/order/page",
  claim: "/fo/my/claim/page",
  coupon: "/fo/my/coupon/page",
  inquiry: "/fo/my/inquiry/page",
  cash: "/fo/my/cash/page",
  chat: "/fo/my/chat/page",
};

export async function proxyMyPage(event: H3Event, kind: string) {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const bePath = MY_PAGE_KINDS[kind];
  if (!bePath) throw createError({ statusCode: 404, statusMessage: "지원하지 않는 조회 종류입니다." });

  const query = getQuery(event);
  const beQuery: Record<string, unknown> = { pageNo: query.pageNo ?? 1, pageSize: query.pageSize ?? 10 };
  for (const k of ALLOWED_KEYS) {
    if (k !== "pageNo" && k !== "pageSize" && query[k] !== undefined && query[k] !== "") beQuery[k] = query[k];
  }

  const data = await beApi.get<Record<string, unknown>>(bePath, beQuery, authHeaderFrom(event), 10000);
  logger.info("[api] ◀", method, url, kind);
  return data;
}
