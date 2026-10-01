/**
 * slSellerSvc.ts — 판매자 신청 API 호출 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr). 2026-09-30.
 * ecBeBo FoSlSellerController(/api/fo/ec/sl/seller/**, FO_ONLY) — 로그인 토큰 필요(authCfg).
 * 입력 검증·응답 정규화는 utils/mapMy.ts — 여기서는 전송만 한다.
 * (회원가입과 동시 신청은 이 svc 가 아니라 authSvc.join() 의 extra.sellerNm/sellerTypeCd 로 간다.)
 */
import { authCfg, csrGet, csrPost } from "~/utils/svcHttp";
import { buildSellerApplyPayload, mapSellerMy } from "~/utils/mapMy";
import type { SlSellerMyType, SlSellerTypeCd } from "~/types/sl/slSellerApplyType";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

const SELLER = "/fo/ec/sl/seller";

export const slSellerSvc = {
  /** POST /fo/ec/sl/seller/apply — 기존 로그인 회원의 판매자 신청(PENDING 생성). 이미 신청/판매자면 서버가 오류를 던진다 */
  applySeller: (sellerNm: string, sellerTypeCd: SlSellerTypeCd | undefined, emailVerifyId: string | undefined, attachFiles: SyAttachChangeType[]): Promise<SlSellerMyType> =>
    csrPost<SlSellerMyType>(`${SELLER}/apply`, buildSellerApplyPayload(sellerNm, sellerTypeCd, emailVerifyId, attachFiles), authCfg()),

  /** GET /fo/ec/sl/seller/my — 내 판매자 신청 현황. 신청 이력이 없으면 null */
  getMySeller: (): Promise<SlSellerMyType | null> => csrGet<SlSellerMyType | null>(`${SELLER}/my`, authCfg()).then(mapSellerMy),
};
