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
 *  2) ecBeBo FoOdOrderService.placeOrder()는 od_order "헤더" 한 줄만 저장하고 주문
 *     품목(od_order_item)은 별도 처리하지 않는다(2026-09 실제 서비스 코드 확인) — 즉
 *     지금 이 엔드포인트만으로는 "주문했다"는 기록만 남고 무엇을 주문했는지는 안 남는다.
 *     품목까지 정식으로 남기려면 od_order_item 쪽 API가 먼저 필요 — 이번 전환 범위 밖.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const body = await readBody<{ totalAmt?: number; payAmt?: number; ordererEmail?: string; accessChannelCd?: string }>(event).catch(() => ({}) as Record<string, never>);
  if (!body?.payAmt || body.payAmt < 1) {
    throw createError({ statusCode: 400, statusMessage: "결제 금액이 필요합니다." });
  }

  // memberId/orderId/orderStatusCd 등은 ecBeBo가 인증 컨텍스트로 직접 채운다 — 여기선 안 보냄.
  const created = await beApi.post<{ data?: { orderId?: string } }>(
    "/fo/order/create",
    {
      totalAmt: body.totalAmt ?? body.payAmt,
      payAmt: body.payAmt,
      ordererEmail: body.ordererEmail,
      accessChannelCd: body.accessChannelCd ?? "WEB_PC",
    },
    authHeaderFrom(event),
  );

  logger.info("[api] ◀", method, url, "orderId=" + created?.data?.orderId);
  return { success: true, orderId: created?.data?.orderId };
});
