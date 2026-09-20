/** 적립금(캐시) 이력. 필드명은 ecBeBo(JPA) PmCacheDto.Item(pm_cache) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmCacheType {
  cacheId: string; // 적립금ID (YYMMDDhhmmss+rand4)
  memberId?: string; // 회원ID
  memberNm?: string; // 회원명
  cacheTypeCd?: string; // 유형 — CACHE_TYPE_CD {EARN_ADMIN:관리자 지급, EARN_EVENT:이벤트 지급, USE_ORDER:주문 사용 …}
  cacheTypeCdNm?: string; // 유형 코드 라벨
  cacheAmt?: number; // 금액 (양수:적립 / 음수:차감)
  balanceAmt?: number; // 처리후 잔액
  refId?: string; // 참조ID (주문ID 등)
  cacheDesc?: string; // 내역 설명
  procUserId?: string; // 처리자 (관리자 직접 부여시)
  cacheDate?: string; // 처리일시
  expireDate?: string; // 소멸예정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
