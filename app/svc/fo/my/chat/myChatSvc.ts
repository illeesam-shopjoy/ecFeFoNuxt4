/**
 * myChatSvc.ts (fo/my/chat) — 고객센터 채팅 위젯(ChatWidget)용 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmChattController(/api/fo/my/chat, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { requireMsgText } from "~/utils/mapMy";
import type { BeChattItem, BeChattMsgItem } from "~/types/chatTypes";

export const myChatSvc = {
  /** GET /fo/my/chat — 내 채팅방 목록 */
  getMyList: async (): Promise<BeChattItem[]> => (await axiosCsr.get<BeChattItem[]>("/fo/my/chat", { headers: useAuthHeaders() })).data ?? [],

  /** POST /fo/my/chat/open — 채팅방 열기(없으면 생성) */
  openRoom: async (subject?: string): Promise<BeChattItem> => (await axiosCsr.post<BeChattItem>("/fo/my/chat/open", { subject: subject ?? "고객 문의" }, { headers: useAuthHeaders() })).data,

  /** GET /fo/my/chat/{id}/messages — 메시지 목록(afterMsgId 이후만) */
  getMessages: async (chattId: string, afterMsgId?: string | null): Promise<BeChattMsgItem[]> =>
    (await axiosCsr.get<BeChattMsgItem[]>(`/fo/my/chat/${encodeURIComponent(chattId)}/messages`, { headers: useAuthHeaders(), params: afterMsgId ? { afterMsgId } : undefined })).data ?? [],

  /** POST /fo/my/chat/{id}/msg — 메시지 전송 */
  sendMsg: async (chattId: string, msgText: string): Promise<BeChattMsgItem> =>
    (await axiosCsr.post<BeChattMsgItem>(`/fo/my/chat/${encodeURIComponent(chattId)}/msg`, { msgText: requireMsgText(msgText) }, { headers: useAuthHeaders() })).data,
};
