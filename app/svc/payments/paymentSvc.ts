/**
 * paymentSvc.ts — 결제(Toss) API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘",
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * checkout/success.vue가 "/api/payments/confirm" 문자열을 $fetch에 박아 호출하던 걸 모음.
 * 폴더 위치(svc/payments/)는 실제 라우트 경로(server/api/payments/*)를 그대로 따른다.
 */
export const paymentSvc = {
  /** POST /api/payments/confirm — Toss 결제 승인 확정 */
  confirmPayment: (body: { paymentKey: string; orderId: string; amount: number }) =>
    $fetch("/api/payments/confirm", { method: "POST", body }),
};
