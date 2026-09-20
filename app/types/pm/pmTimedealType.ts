/**
 * 타임딜 항목 타입 — ecBeBo PmEventItemDto.Item / PmPlanItemDto.Item 의 dealXxx 파생 필드 기준.
 * 이벤트/기획전 항목 둘 다 동일한 dealXxx 필드셋을 쓰므로 화면에서는 하나의 타입으로 다룬다.
 */
export interface PmTimedealItemType {
  // 이벤트 항목이면 eventItemId, 기획전 항목이면 planItemId 중 하나만 채워짐
  eventItemId?: string;
  planItemId?: string;
  eventId?: string;
  planId?: string;
  targetId?: string; // 이벤트: prodId (targetTypeCd=PRODUCT 기준)
  prodId?: string; // 기획전: prodId
  dealPoolId: string;
  dealProdSkuId: string;
  dealPrice: number;
  dealTotalQty: number;
  dealRemainQty: number;
  dealEndDate: string;
}
