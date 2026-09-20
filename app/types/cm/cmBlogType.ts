/** 블로그 타입. 필드명은 ecBeBo(JPA) CmBlogDto.Item 기준 (2026-09 정렬). */
export interface CmBlogType {
  blogId: string; // 블로그ID (ecBeBo blogId)
  img: string; // 대표 이미지 — ecBeBo files[0].imgUrl (BFF가 뽑아낸 파생값, JPA 원본 컬럼 아님)
  blogTitle: string; // 제목 (ecBeBo blogTitle)
  blogAuthor: string; // 작성자 (ecBeBo blogAuthor)
  regDate: string; // 작성일 (ecBeBo regDate)
  blogSummary: string; // 요약 (ecBeBo blogSummary)
  blogContent?: string; // 본문 HTML (ecBeBo blogContent)
  // ── cm_blog 테이블 컬럼(ecBeBo CmBlogDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  blogCateId?: string; // 블로그카테고리ID (cm_blog_cate.blog_cate_id)
  blogTypeCd?: string; // 게시글 구분 코드 — BLOG_TYPE {NEWS:뉴스, BLOG:블로그}
  blogTypeCdNm?: string; // 게시글 구분 코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodId?: string; // 상품ID (pd_prod.prod_id, 상품 관련 글일 때만)
  viewCount?: number; // 조회수
  useYn?: string; // 공개여부 Y/N (비공개 글)
  isNotice?: string; // 공지글 여부 Y/N (상단 고정)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
