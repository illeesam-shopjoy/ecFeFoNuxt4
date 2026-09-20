/** ecBeBo CmBlogDto.Item 원본 응답 — utils/mapBlog.ts 가 CmBlogType(화면용)으로 변환한다. */
export interface CmBlogFileRawType {
  blogFileId: string;
  imgUrl?: string | null;
  thumbUrl?: string | null;
  imgAltText?: string | null;
  sortOrd?: number | null;
}

export interface CmBlogRawType {
  blogId: string;
  blogTitle: string;
  blogSummary?: string | null;
  blogContent?: string | null;
  blogAuthor?: string | null;
  regDate?: string | null;
  files?: CmBlogFileRawType[] | null;
}
