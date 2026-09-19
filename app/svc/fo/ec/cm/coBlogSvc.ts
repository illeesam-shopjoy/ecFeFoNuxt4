/**
 * coBlogSvc.ts — 블로그(게시판) API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo FoCmBlogController(/api/fo/ec/cm/bltn) 를 직접 부른다. 블로그 상세 SEO 서버 렌더링(blog-dtl)만 server/api 를 거친다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { mapBlog, type BeBlogItem } from "~/utils/mapBlog";
import { beConfig } from "~/utils/beConfig";
import { type CoBlogType } from "~/types/coBlogType";

/** 목록 응답(페이징) — server/api/fo/ec/cm/bltn 와 같은 모양 */
export interface CoBlogPagedResult {
  items: CoBlogType[];
  pageNo: number;
  pageSize: number;
  pageTotalCount: number;
  pageTotalPage: number;
  hasMore: boolean;
}

interface BePage<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}

export const coBlogSvc = {
  /** GET /fo/ec/cm/bltn/page — 블로그 전체 목록(최대 200건, 홈 최신글/사이드바용) */
  getPage: async (): Promise<CoBlogType[]> => {
    const page = (await axiosCsr.get<BePage<BeBlogItem>>("/fo/ec/cm/bltn/page", { params: { pageSize: 200, useYn: "Y" } })).data;
    return page.pageList.map((b) => mapBlog(b, beConfig.cdnBase));
  },

  /** GET /fo/ec/cm/bltn/page?pageNo=… — 서버 페이징(블로그 목록 화면 "더 보기") */
  getPaged: async (pageNo: number, pageSize = 20): Promise<CoBlogPagedResult> => {
    const page = (await axiosCsr.get<BePage<BeBlogItem>>("/fo/ec/cm/bltn/page", { params: { pageNo, pageSize, useYn: "Y" } })).data;
    return {
      items: page.pageList.map((b) => mapBlog(b, beConfig.cdnBase)),
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      pageTotalCount: page.pageTotalCount,
      pageTotalPage: page.pageTotalPage,
      hasMore: page.pageNo < page.pageTotalPage,
    };
  },

  /** GET /fo/ec/cm/bltn/{id} — 블로그 단건 */
  getById: async (id: string): Promise<CoBlogType> => {
    const row = (await axiosCsr.get<BeBlogItem>(`/fo/ec/cm/bltn/${encodeURIComponent(id)}`)).data;
    return mapBlog(row, beConfig.cdnBase);
  },
};
