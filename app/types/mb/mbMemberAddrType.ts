/** 회원 배송지. 필드명은 ecBeBo(JPA) MbMemberAddrDto.Item(mb_member_addr) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface MbMemberAddrType {
  memberAddrId: string; // 배송지ID (YYMMDDhhmmss+rand4)
  memberId?: string; // 회원ID (mb_member.member_id)
  addrNm?: string; // 배송지명 (예: 집, 회사)
  recvNm?: string; // 수령자명
  recvPhone?: string; // 수령자 연락처
  zipCode?: string; // 우편번호
  addr?: string; // 기본주소
  addrDetail?: string; // 상세주소
  defaultYn?: string; // 기본배송지여부 Y/N
  regDate?: string; // 등록일시
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일시
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
