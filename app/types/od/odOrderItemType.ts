/** 주문상품. 필드명은 ecBeBo(JPA) OdOrderItemDto.Item(od_order_item) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface OdOrderItemType {
  orderItemId: string; // 주문상품ID (YYMMDDhhmmss+rand4)
  orderId?: string; // 주문ID (od_order.)
  prodId?: string; // 상품ID (pd_prod.)
  prodSkuId?: string; // SKU ID (pd_prod_sku.prod_sku_id, 무옵션 시 NULL)
  prodOpt1Id?: string; // 옵션1 값ID (pd_prod_opt.opt_id)
  prodOpt2Id?: string; // 옵션2 값ID (pd_prod_opt.opt_id)
  prodNm?: string; // 상품명 (주문 시점 스냅샷)
  brandNm?: string; // 브랜드명 (주문 시점 스냅샷)
  dlivTmpltId?: string; // 배송비 템플릿ID 스냅샷
  normalPrice?: number; // 정상가 (할인 전 1ea 가격)
  unitPrice?: number; // 판매가 (단가, 옵션 추가금액 포함)
  orderQty?: number; // 주문수량
  itemOrderAmt?: number; // 주문금액 (unit_price × order_qty)
  cancelQty?: number; // 취소수량
  itemCancelAmt?: number; // 취소금액 (클레임 누적 취소액)
  completQty?: number; // 판매완료수량
  itemCompletedAmt?: number; // 완료금액 (item_order_amt - item_cancel_amt)
  orgUnitPrice?: number; // 원 단가 (주문 확정 시점 스냅샷)
  orgItemOrderAmt?: number; // 원 주문금액 (주문 확정 시점 스냅샷)
  orgDiscountAmt?: number; // 원 할인금액 (주문 확정 시점 스냅샷)
  orgShippingFee?: number; // 원 배송료 (주문 확정 시점 스냅샷)
  saveRate?: number; // 주문 시점 적립율 (%)
  saveUseAmt?: number; // 사용 적립금 (주문상품별 안분금액)
  saveSchdAmt?: number; // 적립 예정금액 (구매확정 전=예상, 확정 후=실적립)
  orderItemStatusCd?: string; // 품목 주문 상태 — ORDER_ITEM_STATUS_CD {ORDERED:주문완료, PAID:결제완료, PREPARING:준비…
  orderItemStatusCdBefore?: string; // 변경 전 품목상태 — ORDER_ITEM_STATUS_CD
  claimYn?: string; // 클레임 진행 중 여부 Y/N
  buyConfirmYn?: string; // 구매확정여부 Y/N
  buyConfirmSchdDate?: string; // 구매확정 예정일 (배송완료 + N일 자동 설정)
  buyConfirmDate?: string; // 구매확정일시
  settleYn?: string; // 정산처리여부 Y/N
  settleDate?: string; // 정산처리일시
  reserveSaleYn?: string; // 예약판매여부 Y/N
  reserveDlivSchdDate?: string; // 예약판매 발송 예정일시
  bundleGroupId?: string; // 묶음 그룹키 (동일 묶음 구성품 식별, UUID, 일반상품=NULL)
  bundlePriceRate?: number; // 묶음 가격 안분율 (%) — 부분클레임 환불 계산 기준
  giftId?: string; // 발급 사은품ID (pm_gift.gift_id)
  outboundShippingFee?: number; // 해당 항목의 배송료 (부분배송 시)
  dlivCourierCd?: string; // 해당 항목의 배송 택배사 — COURIER {CJ:CJ대한통운, LOTTE:롯데택배, HANJIN:한진택배 외}
  dlivTrackingNo?: string; // 해당 항목의 배송 송장번호
  dlivShipDate?: string; // 해당 항목의 출고일시
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  thumbnailUrl?: string; // 상품 썸네일 URL (pd_prod 현재값)
  salePriceCurrent?: number; // 상품 현재 판매가 (pd_prod 현재값)
  prodNmCurrent?: string; // 상품 현재 상품명 (pd_prod 현재값)
  skuCode?: string; // SKU 코드 (pd_prod_sku 조인, 2026-09-14: prodSkuCode → skuCode)
  prodOptNm1?: string; // 옵션1명 (조인 표시용)
  prodOptNm2?: string; // 옵션2명 (조인 표시용)
  orderItemStatusCdNm?: string; // 품목상태 코드 라벨
  dlivCourierCdNm?: string; // 배송택배사 코드 라벨
  memberNm?: string; // 주문자명 (od_order 스냅샷)
  vendorNm?: string; // 판매업체명 (pd_prod → sy_vendor)
  mdUserNm?: string; // 담당MD명 (pd_prod → sy_user)
  categoryNm?: string; // 카테고리명 (pd_prod → pd_category)
  settleSaleAmt?: number; // 정산 판매금액 합계 (st_settle_item 상관 서브쿼리)
  settleCommissionAmt?: number; // 정산 수수료금액 합계 (st_settle_item 상관 서브쿼리)
  settleVendorAmt?: number; // 정산 업체지급금액 합계 (st_settle_item 상관 서브쿼리)
  discntUsageCount?: number; // 프로모션 할인 적용 건수 (pm_discnt_usage 상관 서브쿼리)
  discntUsageNm?: string; // 적용된 프로모션 할인명
  discntUsageTopId?: string; // 적용된 프로모션 할인ID (대표 1건)
  discntUsageAmt?: number; // 프로모션 할인 적용금액 합계
  couponUsageCount?: number; // 쿠폰 적용 건수 (pm_coupon_usage 상관 서브쿼리)
  couponUsageNm?: string; // 적용된 쿠폰명
  couponUsageTopId?: string; // 적용된 쿠폰ID (대표 1건)
  couponUsageAmt?: number; // 쿠폰 할인 적용금액 합계
  saveUsageCount?: number; // 적립금 사용 건수 (pm_save_usage 상관 서브쿼리)
  saveUsageAmt?: number; // 적립금 사용금액 합계
  giftNm?: string; // 발급 사은품명 (pm_gift 조인)
  dlivMethodCd?: string; // 배송방법 override — DLIV_METHOD_CD, NULL이면 상품 기본값 사용(긴급 발송 등 개별 항목 단위 변경)
  dlivMethodCdNm?: string; // 배송방법 override 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  claimTypeCd?: string; // 클레임유형 — 최신 클레임 1건 대표 표시, CLAIM_TYPE_CD {CANCEL:취소, RETURN:반품, EXCHANGE…
  claimTypeCdNm?: string; // 클레임유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  claimStatusCd?: string; // 클레임상세상태 — 최신 클레임항목 1건 대표 표시, CLAIM_ITEM_STATUS_CD {REQUESTED:신청, APPRO…
  claimStatusCdNm?: string; // 클레임상세상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
}
