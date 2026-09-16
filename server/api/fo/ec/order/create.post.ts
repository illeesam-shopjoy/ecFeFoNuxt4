import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

/**
 * 주문 생성. ecBeBo POST /api/fo/order/create 프록시 (경로 그대로 일치, FO_ONLY 인가).
 *
 * ⚠️ 미해결/제한 사항 ([[ecfefonuxt4-bff-migration-plan]] 참조):
 *  1) 로그인 필요(MEMBER) — 2026-09-12 로그인 브릿지 완료로 세션이 있으면 정상 동작.
 *     다만 결제(Toss) 자체는 이 호출과 무관하게 이미 성공했으므로, 세션 만료 등으로 이
 *     호출이 실패해도 "결제 완료" 화면 자체를 막지 않도록 호출부(checkout/success.vue)에서
 *     실패를 흡수하게 했다.
 *  2) 2026-09: ecBeBo FoOdOrderService.placeOrder()가 od_order_item 생성 + SKU 재고
 *     원자적 차감을 지원하도록 확장됨 — items를 그대로 전달한다. 다만 FE 상품 타입에
 *     아직 prodSkuId 개념이 없어(무옵션 상품 전제) items[].prodSkuId 는 대부분 undefined로
 *     넘어가고, 이 경우 백엔드는 재고차감을 건너뛴다(옵션상품 SKU 연동은 후속 과제).
 */
interface FoOrderCreateItemBody {
  prodId?: string;
  prodSkuId?: string;
  prodNm?: string;
  unitPrice?: number;
  orderQty?: number;
  rsPoolId?: string;
}

export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.href ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{
    totalAmt?: number;
    payAmt?: number;
    ordererEmail?: string;
    accessChannelCd?: string;
    items?: FoOrderCreateItemBody[];
  }>(event).catch(() => ({}) as Record<string, never>);
  if (!body?.payAmt || body.payAmt < 1) {
    throw createError({ statusCode: 400, statusMessage: "결제 금액이 필요합니다." });
  }
  if (!body.items?.length) {
    throw createError({ statusCode: 400, statusMessage: "주문 품목이 필요합니다." });
  }

  // memberId/orderId/orderStatusCd 등은 ecBeBo가 인증 컨텍스트로 직접 채운다 — 여기선 안 보냄.
  const created = await beApi.post<{ data?: { orderId?: string } }>(
    "/fo/order/create",
    {
      totalAmt: body.totalAmt ?? body.payAmt,
      payAmt: body.payAmt,
      ordererEmail: body.ordererEmail,
      accessChannelCd: body.accessChannelCd ?? "WEB_PC",
      items: body.items,
    },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "orderId=" + created?.data?.orderId);
  return { success: true, orderId: created?.data?.orderId };
});
