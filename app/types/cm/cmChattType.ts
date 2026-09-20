import type { CmChattMemberType } from "~/types/cm/cmChattMemberType";
import type { CmChattMsgType } from "~/types/cm/cmChattMsgType";

/** 채팅방. 필드명은 ecBeBo(JPA) CmChattDto.Item(cm_chatt) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface CmChattType {
  chattId: string; // 채팅방ID
  subject?: string; // 채팅주제
  chattStatusCd?: string; // 상태 — CHATT_STATUS {WAITING:대기, ACTIVE:진행중, DONE:완료}
  chattStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  chattStatusCdBefore?: string; // 변경 전 상태 — CHATT_STATUS {WAITING:대기, ACTIVE:진행중, DONE:완료}
  lastMsgDate?: string; // 마지막 메시지 일시
  chattMemo?: string; // 관리자 메모
  closeDate?: string; // 종료일시
  closeReason?: string; // 종료사유
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  chattMembers?: CmChattMemberType[]; // 채팅방 참여자 (cm_chatt_member.chatt_id)
  chattMsgs?: CmChattMsgType[]; // 채팅 메시지 (cm_chatt_msg.chatt_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
