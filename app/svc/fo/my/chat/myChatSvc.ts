/**
 * myChatSvc.ts — FO 채팅상담 위젯 API 호출 객체.
 * 2026-09-15(요청사항: "채팅 outstock 에도 추가해줘") — ecFeBo의 foAppFooter.js
 * 채팅상담 플로팅 버튼+패널을 Outstock에 포팅하며 만든 로컬 BFF(server/api/fo/my/chat/*) 호출부.
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { BeChattItem, BeChattMsgItem } from "~/types/chatTypes";

export const myChatSvc = {
  /** GET /api/fo/my/chat — 내 채팅방 목록 (로그인 필요) */
  getMyList: () => $fetch<BeChattItem[]>("/api/fo/my/chat", { headers: useAuthHeaders() }),

  /** POST /api/fo/my/chat/open — 기존 열린 방 반환 또는 신규 생성 */
  openRoom: (subject?: string) => $fetch<BeChattItem>("/api/fo/my/chat/open", { method: "POST", body: { subject }, headers: useAuthHeaders() }),

  /** GET /api/fo/my/chat/{id}/messages — 메시지 목록(afterMsgId 이후분만 폴링) */
  getMessages: (chattId: string, afterMsgId?: string | null) =>
    $fetch<BeChattMsgItem[]>(`/api/fo/my/chat/${chattId}/messages`, { query: afterMsgId ? { afterMsgId } : undefined, headers: useAuthHeaders() }),

  /** POST /api/fo/my/chat/{id}/msg — 메시지 전송 */
  sendMsg: (chattId: string, msgText: string) =>
    $fetch<BeChattMsgItem>(`/api/fo/my/chat/${chattId}/msg`, { method: "POST", body: { msgText }, headers: useAuthHeaders() }),
};
