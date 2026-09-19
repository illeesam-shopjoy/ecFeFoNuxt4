/**
 * myAddrSvc.ts — 내 배송지 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoMyController(GET /api/fo/ec/my/addr, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";

export interface MbMemberAddrItem {
  memberAddrId: string;
  addrNm?: string;
  recvNm?: string;
  recvPhone?: string;
  zipCode?: string;
  addr?: string;
  addrDetail?: string;
  defaultYn?: "Y" | "N" | string;
}

export const myAddrSvc = {
  /** GET /fo/ec/my/addr — 내 배송지 목록 */
  getMyAddrs: async (): Promise<MbMemberAddrItem[]> => (await axiosCsr.get<MbMemberAddrItem[]>("/fo/ec/my/addr", { headers: useAuthHeaders() })).data ?? [],
};
