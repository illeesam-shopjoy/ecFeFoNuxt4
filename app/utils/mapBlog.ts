import type { CmBlogType } from "~/types/cm/cmBlogType";
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
