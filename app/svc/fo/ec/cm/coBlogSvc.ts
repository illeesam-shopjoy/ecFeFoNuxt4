/**
 * coBlogSvc.ts — 블로그(게시판) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmBlogController(/api/fo/ec/cm/bltn) 를 직접 부른다. 블로그 상세 SEO 서버 렌더링(blog-dtl)만 server/api 를 거친다.
 * 응답 가공은 utils/mapBlog.ts.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { mapBlog, mapBlogPage, type BeBlogItem } from "~/utils/mapBlog";
import { beConfig } from "~/utils/beConfig";
import type { CmBlogType } from "~/types/cm/cmBlogType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";

export const coBlogSvc = {
  /** GET /fo/ec/cm/bltn/page — 블로그 전체 목록(최대 200건, 홈 최신글/사이드바용) */
  getPage: async (): Promise<CmBlogType[]> => mapBlogPage((await axiosCsr.get<CoBasePageType<BeBlogItem>>("/fo/ec/cm/bltn/page", { params: { pageSize: 200, useYn: "Y" } })).data, beConfig.cdnBase).items,

  /** GET /fo/ec/cm/bltn/page?pageNo=… — 서버 페이징(블로그 목록 화면 "더 보기") */
  getPaged: async (pageNo: number, pageSize = 20): Promise<CoPagedResultType<CmBlogType>> =>
    mapBlogPage((await axiosCsr.get<CoBasePageType<BeBlogItem>>("/fo/ec/cm/bltn/page", { params: { pageNo, pageSize, useYn: "Y" } })).data, beConfig.cdnBase),

  /** GET /fo/ec/cm/bltn/{id} — 블로그 단건 */
  getById: async (id: string): Promise<CmBlogType> => mapBlog((await axiosCsr.get<BeBlogItem>(`/fo/ec/cm/bltn/${encodeURIComponent(id)}`)).data, beConfig.cdnBase),
};
