/**
 * myNotiSvc.ts — 내 알림함(상단 종) API 호출 객체 (로그인 필요). ecFeBo foApiSvc.myNoti 이식 (2026-09-19).
 * 수신자(회원) 조건은 ecBeBo 가 로그인 정보로 강제 주입한다.
 *   getList        → GET    /api/fo/my/noti                 (ecBeBo /fo/my/noti/list — 최신순 limit 건)
 *   getPage        → GET    /api/fo/my/noti/page            (ecBeBo /fo/my/noti/page — 서버 페이징)
 *   getUnreadCount → GET    /api/fo/my/noti/unread-count
 *   markRead       → PATCH  /api/fo/my/noti/{id}/read       (body { readYn: "Y"|"N" })
 *   markAllRead    → POST   /api/fo/my/noti/read-all
 *   remove         → DELETE /api/fo/my/noti/{id}
 *   removeAll      → DELETE /api/fo/my/noti/all
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import type { MyListParams, MyNotiItem, MyPageResult } from "~/types/foMyType";

const clean = (p: Record<string, unknown>) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));
const h = () => ({ headers: useAuthHeaders() });

export const myNotiSvc = {
  getList: (limit = 30) => $fetch<MyNotiItem[]>("/api/fo/my/noti", { ...h(), query: { limit } }),
  getPage: (params: MyListParams & { readYn?: string; notiTypeCd?: string }) => $fetch<MyPageResult<MyNotiItem>>("/api/fo/my/noti/page", { ...h(), query: clean(params as Record<string, unknown>) }),
  getUnreadCount: () => $fetch<number>("/api/fo/my/noti/unread-count", h()),
  markRead: (id: string, readYn: "Y" | "N" = "Y") => $fetch<unknown>(`/api/fo/my/noti/${encodeURIComponent(id)}/read`, { ...h(), method: "PATCH", body: { readYn } }),
  markAllRead: () => $fetch<number>("/api/fo/my/noti/read-all", { ...h(), method: "POST" }),
  remove: (id: string) => $fetch<unknown>(`/api/fo/my/noti/${encodeURIComponent(id)}`, { ...h(), method: "DELETE" }),
  removeAll: () => $fetch<unknown>("/api/fo/my/noti/all", { ...h(), method: "DELETE" }),
};
