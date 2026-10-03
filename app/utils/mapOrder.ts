/** mapOrder.ts — 주문 생성 요청 본문 조립 + 검증 (svc 는 전송만). */
import type { OdOrderCreateType } from "~/types/od/odOrderCreateType";
import type { OdOrderCreateRawType, OdOrderCreateResType } from "~/types/od/odOrderCreateResType";
import { badRequest } from "~/utils/svcInput";

/** POST /fo/order/create 본문 */
export function buildOrderCreatePayload(body: OdOrderCreateType): Record<string, unknown> {
  if (!body?.payAmt || body.payAmt < 1) badRequest("결제 금액이 필요합니다.");
  if (!body.items?.length) badRequest("주문 품목이 필요합니다.");
  return {
    totalAmt: body.totalAmt ?? body.payAmt,
    payAmt: body.payAmt,
    ordererEmail: body.ordererEmail,
    accessChannelCd: body.accessChannelCd ?? "WEB_PC",
    items: body.items,
    ...(body.couponId ? { couponId: body.couponId } : {}),
    // od.13 보완 — 값이 있을 때만 보낸다(없으면 백엔드 null 유지)
    ...(body.payMethodCd ? { payMethodCd: body.payMethodCd } : {}),
    ...(body.outboundShippingFee != null ? { outboundShippingFee: body.outboundShippingFee } : {}),
    ...(body.couponDiscountAmt != null ? { couponDiscountAmt: body.couponDiscountAmt } : {}),
    ...(body.cacheUseAmt != null ? { cacheUseAmt: body.cacheUseAmt } : {}),
  };
}

/** POST /fo/order/create 응답 → { success, orderId } */
export const mapOrderCreateRes = (raw?: OdOrderCreateRawType): OdOrderCreateResType => ({ success: true, orderId: raw?.data?.orderId });
