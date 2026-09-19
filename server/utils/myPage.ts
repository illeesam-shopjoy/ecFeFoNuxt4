import type { H3Event } from "h3";
import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 마이페이지(주문/클레임/쿠폰/캐쉬/문의/채팅/알림) 조회 공통 프록시 (2026-09-19, ecFeBo foMyStore/foApiSvc 이식).
 * 로그인 필요(FO_ONLY) — 클라이언트의 Authorization 헤더를 그대로 ecBeBo 로 전달한다. 사용자별 응답이라 CDN 캐시 금지.
 * 쿼리는 허용 목록(페이징/기간/상태 필터)만 백엔드로 넘긴다.
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
  "readYn",
  "notiTypeCd",
  "sort",
];

/** kind → ecBeBo 페이지 조회 경로 (FoMyController /api/fo/my/{kind}/page, 채팅은 FoCmChattController) */
export const MY_PAGE_KINDS: Record<string, string> = {
  order: "/fo/my/order/page",
  claim: "/fo/my/claim/page",
  coupon: "/fo/my/coupon/page",
  inquiry: "/fo/my/inquiry/page",
  cash: "/fo/my/cash/page",
  chat: "/fo/my/chat/page",
  noti: "/fo/my/noti/page",
};

/** kind → ecBeBo 전체 목록 조회 경로 (페이징 없는 list). 채팅 목록은 chat/index.get.ts, 알림 목록은 noti/index.get.ts 가 따로 처리 */
export const MY_LIST_KINDS: Record<string, string> = {
  order: "/fo/my/order/list",
  claim: "/fo/my/claim/list",
  coupon: "/fo/my/coupon/list",
  inquiry: "/fo/my/inquiry/list",
};

/** 로그인 헤더를 붙여 ecBeBo GET 을 호출하는 공통 본체 — 허용된 쿼리 키만 전달 */
export async function proxyMyGet<T = unknown>(event: H3Event, bePath: string, defaults: Record<string, unknown> = {}): Promise<T> {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const beQuery: Record<string, unknown> = { ...defaults };
  for (const k of ALLOWED_KEYS) {
    if (query[k] !== undefined && query[k] !== "") beQuery[k] = query[k];
  }
  const data = await beApi.get<T>(bePath, Object.keys(beQuery).length ? beQuery : undefined, authHeaderFrom(event), 10000);
  logger.info("[api] ◀", method, url);
  return data;
}

/** kind 로 골라 쓰는 페이지 조회 (기본 pageNo=1, pageSize=10) */
export function proxyMyPage(event: H3Event, kind: string) {
  const bePath = MY_PAGE_KINDS[kind];
  if (!bePath) throw createError({ statusCode: 404, statusMessage: "지원하지 않는 조회 종류입니다." });
  return proxyMyGet(event, bePath, { pageNo: 1, pageSize: 10 });
}

/** kind 로 골라 쓰는 전체 목록 조회 */
export function proxyMyList(event: H3Event, kind: string) {
  const bePath = MY_LIST_KINDS[kind];
  if (!bePath) throw createError({ statusCode: 404, statusMessage: "지원하지 않는 조회 종류입니다." });
  return proxyMyGet(event, bePath);
}
