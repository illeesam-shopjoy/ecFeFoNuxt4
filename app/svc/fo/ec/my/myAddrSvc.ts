/**
 * myAddrSvc.ts — FO 마이페이지 배송지 API 호출 객체.
 * 2026-09-15(요청사항: "로그인사용자의 기본주소 있으면 넣어주면되") — 체크아웃 기본 배송지
 * 프리필용으로 추가.
 */
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
  /** GET /api/fo/ec/my/addr — 내 배송지 목록 (로그인 필요) */
  getMyAddrs: () => $fetch<MbMemberAddrItem[]>("/api/fo/ec/my/addr", { headers: useAuthHeaders() }),
};
