/** 이벤트 혜택. 필드명은 ecBeBo(JPA) PmEventBenefitDto.Item(pm_event_benefit) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmEventBenefitType {
  eventBenefitId: string; // 혜택ID
  eventId?: string; // 이벤트ID
  benefitNm?: string; // 혜택명
  benefitTypeCd?: string; // 혜택유형 — BENEFIT_TYPE_CD {COUPON:쿠폰, SAVE:적립금, CACHE:캐시, GIFT:사은품, DISCO…
  benefitTypeCdNm?: string; // 혜택유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  conditionDesc?: string; // 조건 설명
  benefitValue?: string; // 혜택 값
  couponId?: string; // 연결 쿠폰ID
  sortOrd?: number; // 정렬순서
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
