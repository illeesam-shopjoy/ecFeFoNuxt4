/** 블로그 타입. 필드명은 ecBeBo(JPA) CmBlogDto.Item 기준 (2026-09 정렬). */
export interface CoBlogType {
  blogId: string; // 블로그ID (ecBeBo blogId)
  img: string; // 대표 이미지 — ecBeBo files[0].imgUrl (BFF가 뽑아낸 파생값, JPA 원본 컬럼 아님)
  blogTitle: string; // 제목 (ecBeBo blogTitle)
  blogAuthor: string; // 작성자 (ecBeBo blogAuthor)
  regDate: string; // 작성일 (ecBeBo regDate)
  blogSummary: string; // 요약 (ecBeBo blogSummary)
  blogContent?: string; // 본문 HTML (ecBeBo blogContent)
}
