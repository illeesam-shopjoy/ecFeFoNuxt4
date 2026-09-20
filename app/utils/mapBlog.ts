import type { CmBlogType } from "~/types/cm/cmBlogType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import { resolveCdnUrl, fixRelativeCdnImgSrc } from "~/utils/cdnUrl";

export interface BeBlogFileItem {
  blogFileId: string;
  imgUrl?: string | null;
  thumbUrl?: string | null;
  imgAltText?: string | null;
  sortOrd?: number | null;
}

export interface BeBlogItem {
  blogId: string;
  blogTitle: string;
  blogSummary?: string | null;
  blogContent?: string | null;
  blogAuthor?: string | null;
  regDate?: string | null;
  files?: BeBlogFileItem[] | null;
}

/** ecBeBo CmBlogDto.Item → CmBlogType */
export function mapBlog(b: BeBlogItem, cdnBase: string): CmBlogType {
  const sorted = [...(b.files ?? [])].sort((a, c) => (a.sortOrd ?? 0) - (c.sortOrd ?? 0));
  const cover = sorted[0];
  return {
    blogId: b.blogId,
    img: resolveCdnUrl(cover?.imgUrl, cdnBase) ?? "",
    blogTitle: b.blogTitle,
    blogAuthor: b.blogAuthor ?? "",
    regDate: b.regDate ?? "",
    blogSummary: b.blogSummary ?? "",
    blogContent: fixRelativeCdnImgSrc(b.blogContent, cdnBase),
  };
}

/** 블로그 페이징 응답 → 화면용(글 매핑 + hasMore) */
export function mapBlogPage(page: CoBasePageType<BeBlogItem>, cdnBase: string): CoPagedResultType<CmBlogType> {
  return {
    items: page.pageList.map((b) => mapBlog(b, cdnBase)),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
}
