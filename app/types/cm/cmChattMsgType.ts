/** 채팅 메시지. 필드명은 ecBeBo(JPA) CmChattMsgDto.Item(cm_chatt_msg) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface CmChattMsgType {
  chattMsgId: string; // 메시지ID
  chattId?: string; // 채팅방ID (cm_chatt.chatt_id)
  senderTypeCd?: string; // 발신자유형 (MEMBER/ADMIN/SYSTEM)
  senderTypeCdNm?: string; // 발신자유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  senderId?: string; // 발신자ID (memberId 또는 userId)
  senderNm?: string; // 발신자명 (비정규화 캐시)
  msgText?: string; // 메시지 내용
  msgTypeCd?: string; // 메시지유형 — CHATT_MESSAGE_TYPE {TEXT:텍스트, IMAGE:이미지, FILE:파일, SYSTEM:시스템}
  msgTypeCdNm?: string; // 메시지유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  refTypeCd?: string; // 참조유형 (ORDER/PRODUCT/CLAIM)
  refTypeCdNm?: string; // 참조유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  refId?: string; // 참조ID
  readYn?: string; // 읽음여부 Y/N
  sendDate?: string; // 발송일시
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
