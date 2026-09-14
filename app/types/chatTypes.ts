/**
 * 2026-09-15 — 채팅상담 위젯 클라이언트측 타입. server/utils/chatTypes.ts와 동일한
 * ecBeBo DTO(CmChattDto.Item / CmChattMsgDto.Item) 필드 구조를 그대로 재사용한다.
 */
export interface BeChattItem {
  chattId: string;
  subject?: string;
  chattStatusCd: "PENDING" | "ACTIVE" | "CLOSED" | string;
  lastMsgDate?: string;
}

export interface BeChattMsgItem {
  chattMsgId: string;
  chattId: string;
  senderTypeCd: "MEMBER" | "ADMIN" | "SYSTEM" | string;
  senderNm?: string;
  msgText: string;
  sendDate?: string;
  /** 낙관적 UI 전용 로컬 플래그(서버 응답엔 없음) */
  _pending?: boolean;
  _error?: boolean;
}
