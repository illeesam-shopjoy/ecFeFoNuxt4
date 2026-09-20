import type { SyAttachFileType } from "~/types/sy/syAttachType";

/** 고객 문의(1:1 문의). 필드명은 ecBeBo(JPA) SyContactDto.Item(sy_contact) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyContactType {
  contactId: string; // 문의ID (YYMMDDhhmmss+rand4)
  memberId?: string; // 회원ID
  memberNm?: string; // 문의자명
  categoryCd?: string; // 문의유형 — CONTACT_CATEGORY_KR {DELIVERY:배송 문의, PRODUCT:상품 문의 …}
  contactTitle?: string; // 제목
  contactContent?: string; // 문의내용
  contactStatusCd?: string; // 처리상태 — CONTACT_STATUS_CD {RECEIVED:접수, IN_PROGRESS:처리중, DONE:완료}
  contactStatusCdNm?: string; // 처리상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  contactAnswer?: string; // 답변내용
  answerUserId?: string; // 답변자 (sy_user.user_id)
  answerDate?: string; // 답변일시
  contactDate?: string; // 문의일시
  attachFiles?: SyAttachFileType[]; // 문의 내용 첨부파일
  attach2Files?: SyAttachFileType[]; // 답변 첨부파일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
