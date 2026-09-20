/** 배송지 저장 요청 — ecBeBo MbMemberAddr(엔티티) 필드명 (조회 응답 MbMemberAddrType 과 우편번호/기본여부 이름이 다르다) */
export interface MbMemberAddrSaveType {
  memberAddrId?: string;
  addrNm?: string;
  recvNm: string;
  recvPhone: string;
  zipCd?: string;
  addr: string;
  addrDetail?: string;
  isDefault?: "Y" | "N";
}
