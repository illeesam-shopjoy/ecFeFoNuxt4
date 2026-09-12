import { beApi, authHeaderFrom, type BePage } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";

interface BeNoticeItem {
  noticeId: string;
  noticeTitle: string;
  noticeTypeCd?: string | null;
  isFixed?: string | null;
  contentHtml?: string | null;
  noticeStatusCd?: string | null;
  regBy?: string | null;
  regDate?: string | null;
  updBy?: string | null;
  updDate?: string | null;
}

/**
 * 공지 목록. ecBeBo GET /api/fo/sy/notice/page(FoSyNoticeController) 프록시.
 * 2026-09-12: 내부 공용 레이어(/api/base/sy/notice) 대신 FO 전용 레이어로 교체 — 로그인한
 * FO 회원이면 누구나 접근 가능(진짜 관리자 권한 분리는 안 함, 사용자 요청). 이 화면
 * (adminSy/notices)은 app/pages/adminCo/login.vue의 별도 관리자 로그인과 무관하게, 지금은
 * ecFeFoNuxt4의 FO 회원 로그인(useAuthStore) 세션이 있어야 열람/수정된다 — 호출부(index.vue,
 * [id].vue)가 useAuthHeaders()로 그 토큰을 실어 보낸다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const pageNo = Math.max(1, Number(query.pageNo) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));

  const page = await beApi.get<BePage<BeNoticeItem>>(
    "/fo/sy/notice/page",
    { pageNo, pageSize, noticeTitle: query.noticeTitle || undefined, noticeTypeCd: query.noticeType || undefined, status: query.status || undefined },
    authHeaderFrom(event),
  );

  const rows = page.pageList.map((r) => ({
    noticeId: r.noticeId,
    noticeTitle: r.noticeTitle,
    noticeType: r.noticeTypeCd ?? "",
    noticeContent: r.contentHtml ?? "",
    status: r.noticeStatusCd ?? "",
    createBy: r.regBy ?? "",
    createTime: r.regDate ?? null,
    updateBy: r.updBy ?? "",
    updateTime: r.updDate ?? null,
    remark: "",
  }));

  logger.info("[api] ◀", method, url, "total=" + page.pageTotalCount);
  return { list: rows, totalCount: page.pageTotalCount };
});
