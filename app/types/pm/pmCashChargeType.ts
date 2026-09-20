/** 캐시 충전 요청(토스 결제 승인 후) / 결과 */
export interface PmCashChargeReqType {
  paymentKey: string;
  orderId: string;
  amount: number;
}
export interface PmCashChargeResType {
  balance: number; // 충전 후 잔액
  charged: number; // 이번에 충전한 금액
}
