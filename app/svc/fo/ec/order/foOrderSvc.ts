/**
 * foOrderSvc.ts — 주문 생성 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoOrderController(POST /api/fo/order/create, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * 결제(Toss) 승인 성공 후 checkout/success.vue, 타임딜 구매(timedeal)에서 호출한다. 입력 검증·본문 조립은 utils/mapOrder.ts.
 */
import { authCfg, csrPost } from "~/utils/svcHttp";
import { buildOrderCreatePayload, mapOrderCreateRes } from "~/utils/mapOrder";
import type { OdOrderCreateRawType, OdOrderCreateResType } from "~/types/od/odOrderCreateResType";
import type { OdOrderCreateType } from "~/types/od/odOrderCreateType";

export const foOrderSvc = {
  /** POST /fo/order/create — 주문 생성. 응답 { success, orderId } */
  createOrder: (body: OdOrderCreateType): Promise<OdOrderCreateResType> =>
    csrPost<OdOrderCreateRawType>("/fo/order/create", buildOrderCreatePayload(body), authCfg()).then(mapOrderCreateRes),
};
