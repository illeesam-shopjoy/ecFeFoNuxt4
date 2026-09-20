/** 프로모션 상품권. 필드명은 ecBeBo(JPA) PmVoucherDto.Item(pm_voucher) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmVoucherType {
  voucherId: string;
  voucherNm?: string;
  voucherTypeCd?: string;
  voucherTypeCdNm?: string; // 코드 라벨
  voucherValue?: number;
  minOrderAmt?: number;
  maxDiscntAmt?: number;
  expireMonth?: number;
  voucherStatusCd?: string;
  voucherStatusCdNm?: string; // 코드 라벨
  voucherStatusCdBefore?: string;
  voucherDesc?: string;
  useYn?: string;
  regDate?: string; // 등록일시 (reg_date)
  siteId?: string; // 사이트ID
  updDate?: string;
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
