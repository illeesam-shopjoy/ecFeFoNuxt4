/** 프로모션 할인. 필드명은 ecBeBo(JPA) PmDiscntDto.Item(pm_discnt) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmDiscntType {
  discntId: string; // 할인ID (YYMMDDhhmmss+rand4)
  discntNm?: string; // 할인명
  discntTypeCd?: string; // 할인유형 — DISCNT_TYPE {PROD:상품할인, ORDER:주문할인, SHIP:배송비할인, SHIP_FREE:무료배송,…
  discntTypeCdNm?: string; // 할인유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  discntValTypeCd?: string; // 할인방식 — DISCNT_VAL_TYPE {RATE:정률, AMOUNT:정액, SHIP_FREE:해당없음}
  discntValTypeCdNm?: string; // 할인방식 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  discntTargetCd?: string; // 할인대상 — DISCNT_TARGET_CD {ALL:전체, CATEGORY:카테고리, PRODUCT:상품, MEMBER_GRA…
  discntTargetCdNm?: string; // 할인대상 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  discntValue?: number; // 할인값 (정률이면 %, 정액이면 원)
  minOrderAmt?: number; // 최소주문금액
  minOrderQty?: number; // 최소주문수량 (NULL=제한없음)
  maxDiscntAmt?: number; // 최대할인한도 (NULL=무제한)
  startDate?: string; // 할인 시작일시
  endDate?: string; // 할인 종료일시
  discntStatusCd?: string; // 상태 — DISCNT_STATUS_CD {ACTIVE:진행중, INACTIVE:비활성, EXPIRED:종료}
  discntStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  discntStatusCdBefore?: string; // 변경 전 상태
  discntDesc?: string; // 할인 설명
  memGradeCd?: string; // 적용 회원등급 코드 (NULL=전체) — MEMBER_GRADE {BASIC:일반, GOLD:우수, NORMAL:일반, VIP…
  memGradeCdNm?: string; // 적용 회원등급 코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  selfCdivRate?: number; // 자사(사이트) 분담율 (%) — 기본 100%
  sellerCdivRate?: number; // 판매자(업체) 분담율 (%) — 기본 0%
  dvcPcYn?: string; // PC 채널 적용여부 Y/N
  dvcMwebYn?: string; // 모바일WEB 적용여부 Y/N
  dvcMappYn?: string; // 모바일APP 적용여부 Y/N
  useYn?: string; // 사용여부 Y/N
  vendorId?: string; // 판매업체 (sy_vendor.vendor_id)
  chargeStaff?: string; // 판매담당자명 (업체 선택 시 자동 채움, 수정 가능)
  visibilityTargets?: string; // 공개대상 (^코드^코드^ 형식, 예: ^PUBLIC^)
  mdUserId?: string; // 담당MD (sy_user.user_id)
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
