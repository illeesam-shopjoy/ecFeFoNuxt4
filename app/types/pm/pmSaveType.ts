/** 프로모션 적립금. 필드명은 ecBeBo(JPA) PmSaveDto.Item(pm_save) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmSaveType {
  saveId: string;
  memberId?: string;
  saveTypeCd?: string;
  saveTypeCdNm?: string; // 코드 라벨
  saveAmt?: number;
  balanceAmt?: number;
  refTypeCd?: string;
  refId?: string;
  expireDate?: string;
  saveMemo?: string;
  regDate?: string;
  siteId?: string; // 사이트ID
}
