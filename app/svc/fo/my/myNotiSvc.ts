/**
 * myNotiSvc.ts — 마이페이지 알림 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoSyNotiController(/api/fo/my/noti, FO_ONLY) — 로그인 토큰 필요(useAuthHeaders).
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { cleanParams } from "~/utils/svcInput";
import { latestNotis } from "~/utils/mapMy";
import type { MyListParams, MyNotiItem, MyPageResult } from "~/types/fo/foMyType";

const auth = () => ({ headers: useAuthHeaders() });

export const myNotiSvc = {
  /** GET /fo/my/noti/list — 알림 목록. 백엔드는 전체를 주므로 최신순 정렬 후 limit(1~100)만 자른다(utils/mapMy.latestNotis) */
  getList: async (limit = 30): Promise<MyNotiItem[]> => latestNotis((await axiosCsr.get<MyNotiItem[]>("/fo/my/noti/list", auth())).data ?? [], limit),

  /** GET /fo/my/noti/page — 알림 목록(페이징, 기본 1페이지 10건) */
  getPage: async (params: MyListParams & { readYn?: string; notiTypeCd?: string }): Promise<MyPageResult<MyNotiItem>> =>
    (await axiosCsr.get<MyPageResult<MyNotiItem>>("/fo/my/noti/page", { ...auth(), params: { pageNo: 1, pageSize: 10, ...cleanParams(params as Record<string, unknown>) } })).data,

  /** GET /fo/my/noti/unread-count — 안 읽은 알림 수 */
  getUnreadCount: async (): Promise<number> => (await axiosCsr.get<number>("/fo/my/noti/unread-count", auth())).data ?? 0,

  /** PATCH /fo/my/noti/{id}/read — 읽음/안읽음 처리 */
  markRead: async (id: string, readYn: "Y" | "N" = "Y"): Promise<unknown> =>
    (await axiosCsr.patch(`/fo/my/noti/${encodeURIComponent(id)}/read`, { readYn: readYn === "N" ? "N" : "Y" }, auth())).data ?? true,

  /** POST /fo/my/noti/read-all — 전체 읽음. 처리 건수 반환 */
  markAllRead: async (): Promise<number> => (await axiosCsr.post<number>("/fo/my/noti/read-all", {}, auth())).data ?? 0,

  /** DELETE /fo/my/noti/{id} — 알림 1건 삭제 */
  remove: async (id: string): Promise<unknown> => (await axiosCsr.delete(`/fo/my/noti/${encodeURIComponent(id)}`, auth())).data,

  /** DELETE /fo/my/noti/all — 알림 전체 삭제 */
  removeAll: async (): Promise<unknown> => (await axiosCsr.delete("/fo/my/noti/all", auth())).data,
};
