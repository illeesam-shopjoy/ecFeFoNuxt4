/**
 * paymentSvc.ts — 결제(Toss) 승인 API 호출 객체 (서버 전용 — server/api/payments/confirm.post.ts).
 *
 * 2026-09-20: app/svc/** 는 원칙적으로 브라우저가 ecBeBo 를 직접 호출하는 계층(axiosCsr)이다. 이 호출은 "반드시 server/api 를 거쳐야 하는"
 * 예외라 axiosCsr 대신 $fetch(/api/...)를 쓴다(예전 app/svcServer/ 를 이 폴더로 합침). 토스 시크릿 키(runtimeConfig.tossPaymentsSecretKey)는
 * 서버에만 있어야 하므로 브라우저 직접 호출이 불가능하다 — server/api 가 SSR 외에 남는 예외 중 하나(결제 승인).
 */
import type { OdPayConfirmResType } from "~/types/od/odPayConfirmResType";
import type { OdPayConfirmType } from "~/types/od/odPayConfirmType";

export const paymentSvc = {
  /** POST /api/payments/confirm — Toss 결제 승인 확정 */
  confirmPayment: (body: OdPayConfirmType): Promise<OdPayConfirmResType> => $fetch<OdPayConfirmResType>("/api/payments/confirm", { method: "POST", body }),
};
