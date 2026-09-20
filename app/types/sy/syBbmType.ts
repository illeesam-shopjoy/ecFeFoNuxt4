import type { SyBbsType } from "~/types/sy/syBbsType";

/** 게시판 마스터. 필드명은 ecBeBo(JPA) SyBbmDto.Item(sy_bbm) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyBbmType {
  bbmId: string; // 게시판ID (YYMMDDhhmmss+rand4)
  bbmCode?: string; // 게시판코드
  bbmNm?: string; // 게시판명
  pathId?: string; // 표시경로ID
  bbmTypeCd?: string; // 게시판유형 — BBM_TYPE_CD {NORMAL:일반팝업, NOTICE:공지팝업, EVENT:이벤트팝업, COOKIE:쿠키팝…
  bbmTypeCdNm?: string; // 게시판유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  allowComment?: string; // 댓글허용 Y/N
  allowAttach?: string; // 첨부허용 Y/N
  allowLike?: string; // 좋아요허용 Y/N
  contentTypeCd?: string; // 내용유형 — BBM_CONTENT_TYPE {NONE:불가, TEXTAREA:textarea, HTMLEDITOR:htmled…
  contentTypeCdNm?: string; // 내용유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  scopeTypeCd?: string; // 접근범위 — SCOPE_TYPE_CD {PUBLIC:공개, PRIVATE:개인, ADMIN:관리자, ALL:전체}
  scopeTypeCdNm?: string; // 접근범위 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  sortOrd?: number; // 정렬순서
  useYn?: string; // 사용여부 Y/N
  bbmRemark?: string; // 비고
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  bbss?: SyBbsType[]; // 이 게시판의 게시글 (sy_bbs.bbm_id)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
