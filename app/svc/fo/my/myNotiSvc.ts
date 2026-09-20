/**
 * myNotiSvc.ts — 마이페이지 알림 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoSyNotiController(/api/fo/my/noti, FO_ONLY) — 로그인 토큰 필요(authCfg).
 */
import { authCfg, csrDelete, csrGet, csrList, csrPatch, csrPost, idPath, myListApi } from "~/utils/svcHttp";
import { latestNotis } from "~/utils/mapMy";
import type { MyListParams } from "~/types/fo/foMyType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { SyNotiType } from "~/types/sy/syNotiType";
import { cleanParams } from "~/utils/svcInput";

const NOTI = "/fo/my/noti";

export const myNotiSvc = {
  /** GET /fo/my/noti/list — 알림 목록. 백엔드는 전체를 주므로 최신순 정렬 후 limit(1~100)만 자른다(utils/mapMy.latestNotis) */
  getList: (limit = 30): Promise<SyNotiType[]> => csrList<SyNotiType>(`${NOTI}/list`, authCfg()).then((list) => latestNotis(list, limit)),

  /** GET /fo/my/noti/page — 알림 목록(페이징, 기본 1페이지 10건) */
  getPage: (params: MyListParams & { readYn?: string; notiTypeCd?: string }): Promise<CoBasePageType<SyNotiType>> =>
    csrGet<CoBasePageType<SyNotiType>>(`${NOTI}/page`, authCfg({ params: { pageNo: 1, pageSize: 10, ...cleanParams(params) } })),

  /** GET /fo/my/noti/unread-count — 안 읽은 알림 수 */
  getUnreadCount: (): Promise<number> => csrGet<number | null>(`${NOTI}/unread-count`, authCfg()).then((n) => n ?? 0),

  /** PATCH /fo/my/noti/{id}/read — 읽음/안읽음 처리 */
  markRead: (id: string, readYn: "Y" | "N" = "Y"): Promise<void> => csrPatch(idPath(NOTI, id, "/read"), { readYn }, authCfg()),

  /** POST /fo/my/noti/read-all — 전체 읽음. 처리 건수 반환 */
  markAllRead: (): Promise<number> => csrPost<number | null>(`${NOTI}/read-all`, {}, authCfg()).then((n) => n ?? 0),

  /** DELETE /fo/my/noti/{id} — 알림 1건 삭제 */
  remove: (id: string): Promise<void> => csrDelete(idPath(NOTI, id), authCfg()),

  /** DELETE /fo/my/noti/all — 알림 전체 삭제 */
  removeAll: (): Promise<void> => csrDelete(`${NOTI}/all`, authCfg()),
};
