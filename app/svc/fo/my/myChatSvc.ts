/**
 * myChatSvc.ts — 내 채팅(상담) API 호출 객체 (로그인 필요). ecFeBo foApiSvc.myChat 이식 (2026-09-19).
 *   getList     → GET  /api/fo/my/chat              (ecBeBo /fo/my/chat — 내 채팅방 목록)
 *   getPage     → GET  /api/fo/my/chat/page         (ecBeBo /fo/my/chat/page — 서버 페이징)
 *   getById     → GET  /api/fo/my/chat/{id}         (ecBeBo /fo/my/chat/{id} — 채팅방 1건)
 *   getMessages → GET  /api/fo/my/chat/{id}/messages
 *   createRoom  → POST /api/fo/my/chat/open         (열린 방이 있으면 그 방, 없으면 새로 생성)
 *   sendMsg     → POST /api/fo/my/chat/{id}/msg
 * 채팅 플로팅 위젯(components/chat/ChatWidget.vue)은 자체 호출을 유지하고, 이 객체는 마이페이지/추가 화면에서 쓴다.
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyPageResult, MyRow } from "~/types/foMyType";

const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));
const h = () => ({ headers: useAuthHeaders() });

export const myChatSvc = {
  getList: () => $fetch<MyRow[]>("/api/fo/my/chat", h()),
  getPage: (params: MyListParams) => $fetch<MyPageResult<MyRow>>("/api/fo/my/chat/page", { ...h(), query: clean(params) }),
  getById: (id: string) => $fetch<MyRow>(`/api/fo/my/chat/${encodeURIComponent(id)}`, h()),
  getMessages: (id: string, params: MyListParams = {}) => $fetch<MyRow[]>(`/api/fo/my/chat/${encodeURIComponent(id)}/messages`, { ...h(), query: clean(params) }),
  createRoom: (body: Record<string, unknown> = {}) => $fetch<MyRow>("/api/fo/my/chat/open", { ...h(), method: "POST", body }),
  sendMsg: (id: string, body: Record<string, unknown>) => $fetch<MyRow>(`/api/fo/my/chat/${encodeURIComponent(id)}/msg`, { ...h(), method: "POST", body }),
};
