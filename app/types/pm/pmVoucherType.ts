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
  regDate?: string;
  siteId?: string; // 사이트ID
  updDate?: string;
}
