/** 토스페이먼츠 결제위젯 SDK v2 (window.TossPayments) 에서 이 앱이 쓰는 부분 — pages/checkout.vue */
export interface OdTossWidgetsType {
  setAmount: (amount: { currency: string; value: number }) => Promise<void>;
  renderPaymentMethods: (o: { selector: string; variantKey?: string }) => Promise<unknown>;
  renderAgreement: (o: { selector: string; variantKey?: string }) => Promise<unknown>;
  requestPayment: (o: { orderId: string; orderName: string; successUrl: string; failUrl: string; customerEmail?: string; customerName?: string }) => Promise<void>;
}

export type OdTossPaymentsFactoryType = (clientKey: string) => { widgets: (p: { customerKey: string }) => OdTossWidgetsType };
