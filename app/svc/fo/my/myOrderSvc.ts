/**
 * myOrderSvc.ts — 마이페이지 주문 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(/api/fo/my/order/list|page, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * 주문 "생성"은 foOrderSvc.createOrder.
 */
import { myListApi } from "~/utils/svcHttp";
import type { OdOrderType } from "~/types/od/odOrderType";

/** GET /fo/my/order/list · /fo/my/order/page — 내 주문 목록(전체 / 페이징, 기본 1페이지 10건) */
export const myOrderSvc = myListApi<OdOrderType>("/fo/my/order");
