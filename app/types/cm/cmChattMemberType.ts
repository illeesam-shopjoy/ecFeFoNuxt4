/** 채팅방 참여자. 필드명은 ecBeBo(JPA) CmChattMemberDto.Item(cm_chatt_member) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface CmChattMemberType {
  chattMemberId: string; // 참여자ID
  chattId?: string; // 채팅방ID (cm_chatt.chatt_id)
  memberTypeCd?: string; // 참여자유형 (MEMBER/ADMIN)
  memberTypeCdNm?: string; // 참여자유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  refId?: string; // 참조ID (mb_member.member_id 또는 sy_user.user_id)
  refNm?: string; // 참여자명 (비정규화 캐시)
  unreadCnt?: number; // 미읽음 메시지 수
  joinDate?: string; // 참여일시
  leaveDate?: string; // 퇴장일시 (NULL=현재 참여중)
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
