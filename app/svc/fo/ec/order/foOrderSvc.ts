/**
 * foOrderSvc.ts — 주문 생성 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoOrderController(POST /api/fo/order/create, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 * 결제(Toss) 승인 성공 후 checkout/success.vue, 타임딜 구매(timedeal)에서 호출한다. 입력 검증·본문 조립은 utils/mapOrder.ts.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { buildOrderCreatePayload } from "~/utils/mapOrder";
import type { OdOrderCreateType } from "~/types/od/odOrderCreateType";

export const foOrderSvc = {
  /** POST /fo/order/create — 주문 생성. 응답 { success, orderId } */
  createOrder: async (body: OdOrderCreateType): Promise<{ success: boolean; orderId?: string }> => {
    const created = (await axiosCsr.post<{ data?: { orderId?: string } }>("/fo/order/create", buildOrderCreatePayload(body), { headers: useAuthHeaders() })).data;
    return { success: true, orderId: created?.data?.orderId };
  },
};
