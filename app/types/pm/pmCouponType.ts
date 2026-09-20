/** 쿠폰. 필드명은 ecBeBo(JPA) PmCouponDto.Item(pm_coupon) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). 내 쿠폰 목록(/fo/my/coupon)도 이 모양이다. */
export interface PmCouponType {
  couponId: string; // 쿠폰ID (YYMMDDhhmmss+rand4)
  couponCd?: string; // 쿠폰코드
  couponNm?: string; // 쿠폰명
  couponTypeCd?: string; // 쿠폰유형 — COUPON_TYPE_CD {RATE:정률 할인, FIXED:정액 할인, PROD_DISCNT:상품할인쿠폰, ORDER_DISCNT:주문할인쿠폰 …}
  couponTypeCdNm?: string; // 쿠폰유형 코드 라벨
  discountRate?: number; // 할인률 (%)
  discountAmt?: number; // 할인금액
  minOrderAmt?: number; // 최소주문금액
  minOrderQty?: number; // 최소주문수량 (NULL=제한없음)
  maxDiscountAmt?: number; // 최대할인한도 (NULL=무제한)
  issueLimit?: number; // 총발급한도 (NULL=무제한)
  issueCnt?: number; // 발급된 개수
  maxIssuePerMem?: number; // 회원당 최대발급수 (NULL=무제한)
  couponDesc?: string; // 쿠폰설명
  validFrom?: string; // 유효기간 시작
  validTo?: string; // 유효기간 종료
  couponStatusCd?: string; // 상태 — COUPON_STATUS_CD {ACTIVE:활성, INACTIVE:비활성, EXPIRED:만료}
  couponStatusCdBefore?: string; // 변경 전 쿠폰상태
  couponStatusCdNm?: string; // 쿠폰상태 코드 라벨
  useYn?: string; // 사용여부 Y/N
  targetTypeCd?: string; // 적용대상 — PROMO_TARGET_TYPE {ALL:전체, PRODUCT:상품, CATEGORY:카테고리, VENDOR:업체, BRAND:브랜드 …}
  targetTypeCdNm?: string; // 적용대상 코드 라벨
  applyScopeCd?: string; // 적용범위 — COUPON_APPLY_SCOPE_CD {ORDER:주문할인, PRODUCT:상품할인, DELIVERY:배송비할인}
  applyScopeCdNm?: string; // 적용범위 코드 라벨
  targetValue?: string; // 적용대상값
  memGradeCd?: string; // 적용 회원등급 코드 (NULL=전체) — MEMBER_GRADE
  memGradeCdNm?: string; // 회원등급 코드 라벨
  selfCdivRate?: number; // 자사(사이트) 분담율 (%)
  sellerCdivRate?: number; // 판매자(업체) 분담율 (%)
  sellerCdivRemark?: string; // 판매자 분담 비고
  dvcPcYn?: string; // PC 채널 적용여부 Y/N
  dvcMwebYn?: string; // 모바일WEB 적용여부 Y/N
  dvcMappYn?: string; // 모바일APP 적용여부 Y/N
  memo?: string; // 메모
  vendorId?: string; // 판매업체 (sy_vendor.vendor_id)
  chargeStaff?: string; // 판매담당자명
  visibilityTargets?: string; // 공개대상 (^코드^코드^ 형식)
  mdUserId?: string; // 담당MD (sy_user.user_id)
  siteId?: string; // 사이트ID
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
