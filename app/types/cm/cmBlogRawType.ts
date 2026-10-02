/** ecBeBo CmBlogDto.Item 원본 응답 — utils/mapBlog.ts 가 CmBlogType(화면용)으로 변환한다. */
import type { CmBlogReplyType } from "~/types/cm/cmBlogReplyType";

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
  replies?: CmBlogReplyType[] | null; // 댓글 목록 (단건/목록 응답에 포함)
  viewCount?: number | null; // 조회수
  blogCateId?: string | null; // 블로그카테고리ID
  regBy?: string | null; // 등록자(회원ID) — 내가 쓴 글 판별용
}
