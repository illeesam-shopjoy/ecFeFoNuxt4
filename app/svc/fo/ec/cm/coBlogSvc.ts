/**
 * coBlogSvc.ts — 블로그(게시판) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmBlogController(/api/fo/ec/cm/bltn) 를 직접 부른다. 블로그 상세 SEO 서버 렌더링(blog-dtl)만 server/api 를 거친다.
 * 응답 가공은 utils/mapBlog.ts.
 */
import { authCfg, csrDelete, csrGet, csrPost, idPath } from "~/utils/svcHttp";
import { mapBlog, mapBlogPage } from "~/utils/mapBlog";
import { beConfig } from "~/utils/beConfig";
import type { CmBlogRawType } from "~/types/cm/cmBlogRawType";
import type { CmBlogReplyType } from "~/types/cm/cmBlogReplyType";
import type { CmBlogType } from "~/types/cm/cmBlogType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";

const BASE = "/fo/ec/cm/bltn";
const pageOf = (params: Record<string, unknown>): Promise<CoPagedResultType<CmBlogType>> =>
  csrGet<CoBasePageType<CmBlogRawType>>(`${BASE}/page`, { params }).then((p) => mapBlogPage(p, beConfig.cdnBase));

export const coBlogSvc = {
  /** GET /fo/ec/cm/bltn/page — 블로그 전체 목록(최대 200건, 홈 최신글/사이드바용) */
  getPage: (): Promise<CmBlogType[]> => pageOf({ pageSize: 200, useYn: "Y" }).then((r) => r.items),

  /** GET /fo/ec/cm/bltn/page?pageNo=… — 서버 페이징(블로그 목록 화면 "더 보기") */
  getPaged: (pageNo: number, pageSize = 20): Promise<CoPagedResultType<CmBlogType>> => pageOf({ pageNo, pageSize, useYn: "Y" }),

  /** GET /fo/ec/cm/bltn/page — 조건 조회(카테고리/검색어). danmoo1 커뮤니티 등 카테고리별 목록용 (2026-10-02) */
  getPagedWith: (params: { pageNo: number; pageSize?: number; blogCateId?: string; searchValue?: string }): Promise<CoPagedResultType<CmBlogType>> =>
    pageOf({ pageSize: 20, useYn: "Y", ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")) }),

  /** POST /fo/ec/cm/bltn — 글 등록(로그인 필요, 등록자=로그인 회원). danmoo1 동네생활 글쓰기용 (2026-10-02). 본문은 화면에서 toSafeHtml 로 정화해 보여준다 */
  create: (body: { blogTitle: string; blogContent: string; blogSummary?: string; blogAuthor?: string; blogCateId?: string }): Promise<CmBlogRawType> =>
    csrPost<CmBlogRawType>(BASE, { blogTypeCd: "BLOG", useYn: "Y", isNotice: "N", ...body }, authCfg()),

  /** POST /fo/ec/cm/bltn/{id}/reply — 댓글 등록(로그인 필요). danmoo1 동네생활 댓글 (2026-10-02, ecBeBo FoCmBlogController.createReply) */
  createReply: (blogId: string, content: string, parentCommentId?: string): Promise<CmBlogReplyType> =>
    csrPost<CmBlogReplyType>(idPath(BASE, blogId, "/reply"), { blogCommentContent: content, parentCommentId }, authCfg()),

  /** DELETE /fo/ec/cm/bltn/{id}/reply/{replyId} — 내 댓글 삭제 */
  deleteReply: (blogId: string, replyId: string): Promise<void> => csrDelete(`${idPath(BASE, blogId, "/reply")}/${encodeURIComponent(replyId)}`, authCfg()),

  /** GET /fo/ec/cm/bltn/{id} — 블로그 단건 */
  getById: (id: string): Promise<CmBlogType> => csrGet<CmBlogRawType>(idPath(BASE, id)).then((b) => mapBlog(b, beConfig.cdnBase)),
};
