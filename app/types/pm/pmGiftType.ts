/** 프로모션 사은품. 필드명은 ecBeBo(JPA) PmGiftDto.Item(pm_gift) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmGiftType {
  giftId: string; // 사은품ID (YYMMDDhhmmss+rand4)
  giftNm?: string; // 사은품명
  giftTypeCd?: string; // 사은품유형 — GIFT_TYPE_CD {PRODUCT:상품, SAMPLE:샘플, ETC:기타, LIMITED:한정수량, NEW…
  giftTypeCdNm?: string; // 코드 라벨
  prodId?: string; // 연결 상품ID (pd_prod.prod_id)
  giftStock?: number; // 사은품 재고
  giftDesc?: string; // 사은품 설명
  startDate?: string; // 시작일시
  endDate?: string; // 종료일시
  giftStatusCd?: string; // 상태 — GIFT_STATUS_CD {ACTIVE:활성, INACTIVE:비활성, ENDED:종료, SOLDOUT:품절}
  giftStatusCdNm?: string; // 코드 라벨
  giftStatusCdBefore?: string; // 변경 전 상태
  memGradeCd?: string; // 적용 회원등급 코드 (NULL=전체) — MEMBER_GRADE {BASIC:일반, GOLD:우수, NORMAL:일반, VIP…
  memGradeCdNm?: string; // 코드 라벨
  minOrderAmt?: number; // 최소주문금액 — 사은품 지급 기준 금액
  minOrderQty?: number; // 최소주문수량 (NULL=제한없음)
  selfCdivRate?: number; // 자사(사이트) 분담율 (%) — 기본 100%
  sellerCdivRate?: number; // 판매자(업체) 분담율 (%) — 기본 0%
  useYn?: string; // 사용여부 Y/N
  vendorId?: string; // 판매업체 (sy_vendor.vendor_id)
  chargeStaff?: string; // 판매담당자명 (업체 선택 시 자동 채움, 수정 가능)
  visibilityTargets?: string; // 공개대상 (^코드^코드^ 형식, 예: ^PUBLIC^)
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
}
