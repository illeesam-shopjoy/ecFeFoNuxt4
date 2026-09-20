/**
 * coBlogSvc.ts — 블로그(게시판) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmBlogController(/api/fo/ec/cm/bltn) 를 직접 부른다. 블로그 상세 SEO 서버 렌더링(blog-dtl)만 server/api 를 거친다.
 * 응답 가공은 utils/mapBlog.ts.
 */
import { csrGet, idPath } from "~/utils/svcHttp";
import { mapBlog, mapBlogPage } from "~/utils/mapBlog";
import { beConfig } from "~/utils/beConfig";
import type { CmBlogRawType } from "~/types/cm/cmBlogRawType";
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

  /** GET /fo/ec/cm/bltn/{id} — 블로그 단건 */
  getById: (id: string): Promise<CmBlogType> => csrGet<CmBlogRawType>(idPath(BASE, id)).then((b) => mapBlog(b, beConfig.cdnBase)),
};
