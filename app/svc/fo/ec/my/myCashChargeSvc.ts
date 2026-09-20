/**
 * myCashChargeSvc.ts — 캐시 충전 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * 토스 결제 승인이 끝난 paymentKey/orderId/amount 를 보내면 서버가 토스에서 결제를 다시 조회해 일치할 때만 충전한다.
 */
import { authCfg, csrPost } from "~/utils/svcHttp";
import type { PmCashChargeReqType, PmCashChargeResType } from "~/types/pm/pmCashChargeType";

export const myCashChargeSvc = {
  /** POST /fo/ec/my/cache/charge */
  charge: (body: PmCashChargeReqType): Promise<PmCashChargeResType> => csrPost<PmCashChargeResType>("/fo/ec/my/cache/charge", body, authCfg()),
};
