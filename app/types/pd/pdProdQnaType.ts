import type { SyAttachType } from "~/types/sy/syAttachType";

/** 상품 Q&A(상품문의). 필드명은 ecBeBo(JPA) PdProdQnaDto.Item(pd_prod_qna) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PdProdQnaType {
  prodQnaId: string; // 문의ID (YYMMDDhhmmss+rand4)
  prodId?: string; // 상품ID (pd_prod.prod_id)
  prodSkuId?: string; // SKUID (pd_prod_sku.prod_sku_id)
  memberId?: string; // 회원ID (mb_member.member_id)
  orderId?: string; // 주문ID (od_order.order_id)
  prodQnaTypeCd?: string; // 문의유형코드 — PROD_QNA_TYPE_CD {PROD:상품문의}
  prodQnaTypeCdNm?: string; // 문의유형코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodQnaTitle?: string; // 문의제목
  prodQnaContent?: string; // 문의내용
  writerNm?: string; // 작성자명(비회원 작성 시 입력)
  scrtYn?: string; // 비밀글여부 Y/N
  answYn?: string; // 답변여부 Y/N
  answContent?: string; // 답변내용
  answDate?: string; // 답변일시
  answUserId?: string; // 답변자ID (sy_user.user_id)
  dispYn?: string; // 노출여부 Y/N
  useYn?: string; // 사용여부 Y/N
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  attachFiles?: SyAttachType[]; // 질문 첨부파일(sy_attach, ref=pd_prod_qna) — 조회 서비스가 CDN URL 보정해서 채운다
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
