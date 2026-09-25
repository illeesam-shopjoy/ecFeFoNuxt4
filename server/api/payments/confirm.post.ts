/**
 * 토스페이먼츠 결제 승인 API
 * successUrl 리다이렉트 후 클라이언트에서 paymentKey, orderId, amount 를 보내 승인 처리합니다.
 * @see https://docs.tosspayments.com/reference#%EA%B2%B0%EC%A0%9C-%EC%8A%B9%EC%9D%B8
 */
import { recordPay } from "~~/server/utils/payRecord";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event).catch(() => ({})) as {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
    keyType?: string;
    orderRefId?: string; // 우리 주문번호(od_order.order_id) — 결제 결과를 이 주문에 기록한다
  };
  // keyType "pay" = 주문 화면의 결제창(API 개별 연동 키), 그 외 = 결제위젯 키(캐시 충전 등). 결제를 연 키의 짝 시크릿으로 승인해야 한다.
  const secretKey = (body?.keyType === "pay" ? config.tossPaymentsPaySecretKey : config.tossPaymentsSecretKey) as string;
  if (!secretKey) {
    throw createError({ statusCode: 500, statusMessage: "토스페이먼츠 시크릿 키가 설정되지 않았습니다." });
  }
  const paymentKey = String(body?.paymentKey ?? "").trim();
  const orderId = String(body?.orderId ?? "").trim();
  const amount = Number(body?.amount);

  if (!paymentKey || !orderId || !Number.isInteger(amount) || amount < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "paymentKey, orderId, amount(원)가 필요합니다.",
    });
  }

  const auth = Buffer.from(`${secretKey}:`, "utf8").toString("base64");
  const res = await $fetch<Record<string, unknown>>("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: { paymentKey, orderId, amount },
  }).catch((err: { data?: { code?: string; message?: string }; statusCode?: number }) => {
    const message = err?.data?.message ?? err?.data?.code ?? "결제 승인 요청 실패";
    throw createError({
      statusCode: err?.statusCode ?? 502,
      statusMessage: message,
    });
  });

  // 승인된 결제를 우리 주문에 기록(od_pay + 주문 상태). 가상계좌는 입금대기(PENDING)로 남고 입금되면 웹훅이 결제완료로 바꾼다.
  // 기록 실패는 승인 결과를 막지 않는다(돈은 이미 승인됨) — 응답에 실패를 알리고, 웹훅/재조회로 나중에 맞출 수 있다.
  const orderRefId = String(body?.orderRefId ?? "").trim() || undefined;
  const recorded = await recordPay(orderRefId, res).catch((e: unknown) => ({ ok: false, skipped: (e as { message?: string })?.message ?? "기록 실패" }));
  return { ...res, _recorded: recorded };
});
