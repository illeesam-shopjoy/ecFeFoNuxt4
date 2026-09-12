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
 * 공지 목록(관리자). ecBeBo GET /api/base/sy/notice/page 프록시.
 * ⚠️ /api/base/** 는 로그인 필요(2026-09 401 확인) — 이 프로젝트의 관리자 로그인
 * (app/pages/adminCo/login.vue)은 ecBeBo와 무관한 자체 인증이라, 로그인을 ecBeBo로
 * 브릿지하기 전까지는 이 라우트도 항상 401이다(상품 리뷰/주문 생성과 동일한 미해결 사항 —
 * [[ecfefonuxt4-bff-migration-plan]] 참조).
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const query = getQuery(event);
  const pageNo = Math.max(1, Number(query.pageNo) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));

  const page = await beApi.get<BePage<BeNoticeItem>>(
    "/base/sy/notice/page",
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
