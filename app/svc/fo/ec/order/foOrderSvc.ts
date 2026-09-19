/**
 * foOrderSvc.ts — 주문 생성 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoOrderController(POST /api/fo/order/create, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 * 결제(Toss) 승인 성공 후 checkout/success.vue, 타임딜 구매(timedeal)에서 호출한다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";

export interface FoOrderCreateItem {
  prodId: string;
  prodSkuId?: string;
  prodNm?: string;
  unitPrice?: number;
  orderQty: number;
  rsPoolId?: string; // 타임딜(이벤트/기획전) 구매 시 세팅
}

export interface FoOrderCreateBody {
  payAmt: number;
  totalAmt: number;
  items: FoOrderCreateItem[];
  ordererEmail?: string;
  accessChannelCd?: string;
}

/** 백엔드 호출 전 검증 실패를 소비처(e.data.statusMessage)가 읽는 모양으로 던진다 */
function badRequest(message: string): never {
  throw Object.assign(new Error(message), { statusCode: 400, statusMessage: message, data: { message, statusMessage: message } });
}

export const foOrderSvc = {
  /** POST /fo/order/create — 주문 생성. 응답 { success, orderId } */
  createOrder: async (body: FoOrderCreateBody): Promise<{ success: boolean; orderId?: string }> => {
    if (!body?.payAmt || body.payAmt < 1) badRequest("결제 금액이 필요합니다.");
    if (!body.items?.length) badRequest("주문 품목이 필요합니다.");
    const created = (
      await axiosCsr.post<{ data?: { orderId?: string } }>(
        "/fo/order/create",
        {
          totalAmt: body.totalAmt ?? body.payAmt,
          payAmt: body.payAmt,
          ordererEmail: body.ordererEmail,
          accessChannelCd: body.accessChannelCd ?? "WEB_PC",
          items: body.items,
        },
        { headers: useAuthHeaders() }
      )
    ).data;
    return { success: true, orderId: created?.data?.orderId };
  },
};
