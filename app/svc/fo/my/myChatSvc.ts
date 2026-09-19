/**
 * myChatSvc.ts (fo/my) — 마이페이지 1:1 채팅 화면(my/chatt)용 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmChattController(/api/fo/my/chat, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));
const auth = () => ({ headers: useAuthHeaders() });

export const myChatSvc = {
  /** GET /fo/my/chat — 내 채팅방 목록 */
  getList: async (): Promise<MyRow[]> => (await axiosCsr.get<MyRow[]>("/fo/my/chat", auth())).data ?? [],

  /** GET /fo/my/chat/page — 채팅방 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams): Promise<MyPageResult<MyRow>> =>
    (await axiosCsr.get<MyPageResult<MyRow>>("/fo/my/chat/page", { ...auth(), params: { pageNo: 1, pageSize: 10, ...clean(params) } })).data,

  /** GET /fo/my/chat/{id} — 채팅방 단건 */
  getById: async (id: string): Promise<MyRow> => (await axiosCsr.get<MyRow>(`/fo/my/chat/${encodeURIComponent(id)}`, auth())).data,

  /** GET /fo/my/chat/{id}/messages — 메시지 목록 */
  getMessages: async (id: string, params: MyListParams = {}): Promise<MyRow[]> =>
    (await axiosCsr.get<MyRow[]>(`/fo/my/chat/${encodeURIComponent(id)}/messages`, { ...auth(), params: clean(params) })).data ?? [],

  /** POST /fo/my/chat/open — 채팅방 생성 */
  createRoom: async (body: Record<string, unknown> = {}): Promise<MyRow> =>
    (await axiosCsr.post<MyRow>("/fo/my/chat/open", { subject: body?.subject ?? "고객 문의", siteId: body?.siteId }, auth())).data,

  /** POST /fo/my/chat/{id}/msg — 메시지 전송 */
  sendMsg: async (id: string, body: Record<string, unknown>): Promise<MyRow> => {
    if (!String(body?.msgText ?? "").trim()) {
      const msg = "메시지 내용이 필요합니다.";
      throw Object.assign(new Error(msg), { statusCode: 400, statusMessage: msg, data: { message: msg, statusMessage: msg } });
    }
    return (await axiosCsr.post<MyRow>(`/fo/my/chat/${encodeURIComponent(id)}/msg`, { msgText: body.msgText }, auth())).data;
  },
};
