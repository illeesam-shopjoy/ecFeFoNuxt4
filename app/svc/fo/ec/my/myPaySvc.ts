/**
 * myPaySvc.ts — 내 결제 관련 조회 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyPageController(GET /api/fo/ec/my/last-pay-method, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { authCfg, csrGet } from "~/utils/svcHttp";

export const myPaySvc = {
  /** GET /fo/ec/my/last-pay-method — 마지막으로 결제(또는 입금대기)한 결제수단 코드(PAY_METHOD). 없으면 null */
  getLastPayMethod: (): Promise<string | null> => csrGet<{ payMethodCd?: string | null }>("/fo/ec/my/last-pay-method", authCfg()).then((r) => r?.payMethodCd ?? null),
};
