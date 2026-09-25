/**
 * payProvider.ts — PG 어댑터. 주문 화면은 getPayProvider(method).request(...) 만 호출한다.
 * PG 를 추가하면 PayProvider 를 구현해 PROVIDERS 에 등록하고, conts/payMethods.ts 의 PAY_METHOD_PG 에서 수단에 연결한다.
 * (승인/취소/웹훅은 서버 쪽 — server/api/payments/*)
 */
import { PAY_METHOD_PG, type PayMethodCd, type PayPgCd } from "~/conts/payMethods";

export interface PayRequest {
  method: PayMethodCd;
  amount: number; // 최종 결제 금액(원)
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerKey: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PayProvider {
  pg: PayPgCd;
  /** 결제창을 연다. 성공/실패는 successUrl/failUrl 로 돌아온다. 사용자가 창을 닫으면 code === "USER_CANCEL" 오류 */
  request(req: PayRequest): Promise<void>;
}

// ── 토스페이먼츠 결제창(SDK v2 standard, payment()) ──
const TOSS_SCRIPT = "https://js.tosspayments.com/v2/standard";
type TossPaymentApi = { requestPayment: (o: Record<string, unknown>) => Promise<void> };
type TossFactory = (clientKey: string) => { payment: (o: { customerKey: string }) => TossPaymentApi };

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("결제 모듈을 불러오지 못했습니다. 네트워크를 확인해 주세요."));
    document.head.appendChild(s);
  });
}

/** 결제수단 → 토스 결제창 옵션. 간편결제는 method:"CARD" + easyPay(flowMode DIRECT)로 해당 앱을 바로 연다 */
function tossMethodOptions(method: PayMethodCd): Record<string, unknown> {
  switch (method) {
    case "TRANSFER":
      return { method: "TRANSFER", transfer: { cashReceipt: { type: "소득공제" }, useEscrow: false } };
    case "VIRTUAL_ACCOUNT":
      return { method: "VIRTUAL_ACCOUNT", virtualAccount: { cashReceipt: { type: "소득공제" }, useEscrow: false, validHours: 72 } };
    case "KAKAOPAY":
      return { method: "CARD", card: { flowMode: "DIRECT", easyPay: "KAKAOPAY", useEscrow: false } };
    case "NAVERPAY":
      return { method: "CARD", card: { flowMode: "DIRECT", easyPay: "NAVERPAY", useEscrow: false } };
    case "TOSSPAY":
      return { method: "CARD", card: { flowMode: "DIRECT", easyPay: "TOSSPAY", useEscrow: false } };
    default:
      return { method: "CARD", card: { flowMode: "DEFAULT", useEscrow: false, useCardPoint: false, useAppCardOnly: false } };
  }
}

const tossProvider: PayProvider = {
  pg: "TOSS",
  async request(req) {
    const clientKey = (useRuntimeConfig().public as { tossPayClientKey?: string }).tossPayClientKey;
    if (!clientKey) throw new Error("토스페이먼츠 결제창 클라이언트 키가 설정되지 않았습니다.\n(NUXT_PUBLIC_TOSSPAYMENTS_PAY_CLIENT_KEY)");
    await loadScript(TOSS_SCRIPT);
    const factory = (window as unknown as { TossPayments?: TossFactory }).TossPayments;
    if (!factory) throw new Error("토스페이먼츠 SDK 를 초기화하지 못했습니다.");
    await factory(clientKey)
      .payment({ customerKey: req.customerKey })
      .requestPayment({
        ...tossMethodOptions(req.method),
        amount: { currency: "KRW", value: req.amount },
        orderId: req.orderId,
        orderName: req.orderName,
        successUrl: req.successUrl,
        failUrl: req.failUrl,
        customerEmail: req.customerEmail || undefined,
        customerName: req.customerName || undefined,
      });
  },
};

const PROVIDERS: Record<PayPgCd, PayProvider> = { TOSS: tossProvider };

/** 결제수단을 처리할 PG 어댑터 */
export const getPayProvider = (method: PayMethodCd): PayProvider => PROVIDERS[PAY_METHOD_PG[method]];
