/**
 * 토스페이먼츠 웹훅 수신 — 가상계좌 입금 완료/만료, 결제 취소 등 "결제 상태 변경"을 받는다.
 * 토스 개발자센터 > 웹훅 에 이 주소(https://<사이트>/api/payments/toss-webhook)를 PAYMENT_STATUS_CHANGED 이벤트로 등록한다.
 *
 * 웹훅 본문은 위조될 수 있으므로 신뢰하지 않고, 본문에 있는 결제키/주문번호로 토스 API 에 결제를 직접 조회해(시크릿 키) 그 결과만 반영한다.
 * 반영은 ecBeBo(POST /api/co/pay/record)가 멱등하게 처리한다. 반영 실패 시 5xx 를 돌려 토스가 재시도하게 한다.
 * @see https://docs.tosspayments.com/reference/using-api/webhook-events
 */
import { recordPay } from "~~/server/utils/payRecord";

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig();
  const secretKey = String(cfg.tossPaymentsPaySecretKey ?? "");
  if (!secretKey) throw createError({ statusCode: 503, statusMessage: "토스 시크릿 키가 설정되지 않았습니다." });

  const body = (await readBody(event).catch(() => ({}))) as {
    eventType?: string;
    data?: { paymentKey?: string; orderId?: string };
    paymentKey?: string; // 옛 형식(DEPOSIT_CALLBACK)
    orderId?: string;
  };
  const paymentKey = String(body?.data?.paymentKey ?? body?.paymentKey ?? "").trim();
  const tossOrderId = String(body?.data?.orderId ?? body?.orderId ?? "").trim();
  if (!paymentKey && !tossOrderId) return { ok: true, ignored: "결제 식별자 없음" };

  // 토스에 직접 조회 — 본문 값이 아니라 토스가 알려 주는 상태를 쓴다
  const auth = Buffer.from(`${secretKey}:`, "utf8").toString("base64");
  const url = paymentKey ? `https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}` : `https://api.tosspayments.com/v1/payments/orders/${encodeURIComponent(tossOrderId)}`;
  const payment = await $fetch<Record<string, unknown>>(url, { headers: { Authorization: `Basic ${auth}` }, timeout: 8000 }).catch(() => null);
  if (!payment) return { ok: true, ignored: "토스에서 결제를 찾지 못함" }; // 우리 결제가 아니거나 테스트 통지 — 재시도 불필요

  const result = await recordPay(null, payment).catch((e: unknown) => {
    throw createError({ statusCode: 500, statusMessage: `결제 기록 실패: ${(e as { message?: string })?.message ?? "unknown"}` }); // 5xx → 토스 재시도
  });
  return { ok: true, result };
});
