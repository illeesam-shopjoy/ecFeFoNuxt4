/** 토스 결제 승인 요청 본문 (POST /api/payments/confirm) — 성공 리다이렉트 쿼리에서 받은 값 */
export interface OdPayConfirmType {
  paymentKey: string;
  orderId: string;
  amount: number;
  keyType?: "pay" | "widget"; // pay = 주문 화면 결제창 키(기본 widget = 결제위젯 키)
}
