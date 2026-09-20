/**
 * myAddrSvc.ts — 내 배송지 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(GET /api/fo/ec/my/addr, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { authCfg, csrDelete, csrList, csrPatch, csrPost, idPath } from "~/utils/svcHttp";
import type { MbMemberAddrSaveType } from "~/types/mb/mbMemberAddrSaveType";
import type { MbMemberAddrType } from "~/types/mb/mbMemberAddrType";

export const myAddrSvc = {
  /** GET /fo/ec/my/addr — 내 배송지 목록 */
  getMyAddrs: (): Promise<MbMemberAddrType[]> => csrList<MbMemberAddrType>("/fo/ec/my/addr", authCfg()),

  /** POST /fo/ec/my/addr — 배송지 추가/수정(memberAddrId 가 있으면 수정) */
  saveAddr: (body: MbMemberAddrSaveType): Promise<MbMemberAddrType> => csrPost<MbMemberAddrType>("/fo/ec/my/addr", body, authCfg()),

  /** DELETE /fo/ec/my/addr/{id} — 배송지 삭제 */
  removeAddr: (addrId: string): Promise<void> => csrDelete(idPath("/fo/ec/my/addr", addrId), authCfg()),

  /** PATCH /fo/ec/my/addr/{id}/default — 기본 배송지로 설정 */
  setDefault: (addrId: string): Promise<void> => csrPatch(idPath("/fo/ec/my/addr", addrId, "/default"), undefined, authCfg()),
};
