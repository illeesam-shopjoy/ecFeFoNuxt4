/**
 * myChatSvc.ts (fo/my/chat) — 고객센터 채팅 위젯(ChatWidget)용 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmChattController(/api/fo/my/chat, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { authCfg, csrGet, csrList, csrPost, idPath } from "~/utils/svcHttp";
import { requireMsgText } from "~/utils/mapMy";
import type { CmChattMsgType } from "~/types/cm/cmChattMsgType";
import type { CmChattType } from "~/types/cm/cmChattType";

const CHAT = "/fo/my/chat";

export const myChatSvc = {
  /** GET /fo/my/chat — 내 채팅방 목록 */
  getMyList: (): Promise<CmChattType[]> => csrList<CmChattType>(CHAT, authCfg()),

  /** POST /fo/my/chat/open — 채팅방 열기(없으면 생성) */
  openRoom: (subject?: string): Promise<CmChattType> => csrPost<CmChattType>(`${CHAT}/open`, { subject: subject ?? "고객 문의" }, authCfg()),

  /** GET /fo/my/chat/{id}/messages — 메시지 목록(afterMsgId 이후만) */
  getMessages: (chattId: string, afterMsgId?: string | null): Promise<CmChattMsgType[]> =>
    csrList<CmChattMsgType>(idPath(CHAT, chattId, "/messages"), authCfg({ params: afterMsgId ? { afterMsgId } : undefined })),

  /** POST /fo/my/chat/{id}/msg — 메시지 전송 */
  sendMsg: (chattId: string, msgText: string): Promise<CmChattMsgType> => csrPost<CmChattMsgType>(idPath(CHAT, chattId, "/msg"), { msgText: requireMsgText(msgText) }, authCfg()),
};
