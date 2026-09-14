/**
 * 2026-09-15 — 채팅상담 위젯(ecBeBo FoCmChattController) 응답 타입.
 * 실제 백엔드 DTO(CmChattDto.Item / CmChattMsgDto.Item) 필드 그대로 — chattId(방ID),
 * chattStatusCd(PENDING/ACTIVE/CLOSED, FoCmChattService 실제 문자열 비교 기준),
 * senderTypeCd(MEMBER/ADMIN/SYSTEM). ecFeBo의 foAppFooter.js가 쓰던 chattRoomId/senderCd는
 * 이 DTO에 없는 필드명이라 실제로는 항상 undefined였다 — 여기선 실제 필드명을 그대로 쓴다.
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
}
