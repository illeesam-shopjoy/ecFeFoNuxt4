/**
 * foOrderSvc.ts — FO 주문 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘",
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘", "server/api/fo/* 도
 * server/api/fo/ec/ 아래 구성되면 될거 같아") —
 * checkout/success.vue가 "/api/fo/order/create" 문자열을 $fetch에 박아 호출하던 걸 모음.
 * 2026-09-12: 로컬 BFF 라우트를 server/api/fo/order/* → server/api/fo/ec/order/*로 옮기며
 * URL도 /api/fo/ec/order/create로 바뀜 — ⚠ ecBeBo 실제 백엔드 URL은 여전히
 * /api/fo/order/create(FoOrderController, "ec" 없음)라 이 지점부터 로컬 경로와 실제
 * 백엔드 경로가 더 이상 1:1이 아니다(server/api/fo/ec/order/create.post.ts 내부의
 * beApi 호출 대상 문자열 참조, 사용자가 이 불일치를 인지하고 명시적으로 선택함).
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";

/** 주문품목 — 2026-09 od_order_item 생성 배관 신설과 함께 추가 (prodSkuId는 FE에 SKU 개념이
 *  아직 없어 무옵션 상품 한정으로 undefined 전달 → 백엔드가 재고차감을 건너뜀, 후속 과제) */
export interface FoOrderCreateItem {
  prodId: string;
  prodSkuId?: string;
  prodNm?: string;
  unitPrice?: number;
  orderQty: number;
  rsPoolId?: string; // 타임딜(이벤트/기획전) 구매 시 세팅
}

export interface FoOrderCreateBody {
  payAmt: number;
  totalAmt: number;
  items: FoOrderCreateItem[];
}

export const foOrderSvc = {
  /** POST /api/fo/ec/order/create — ecBeBo에 주문+품목 생성 (로그인 필요) */
  createOrder: (body: FoOrderCreateBody) =>
    $fetch("/api/fo/ec/order/create", { method: "POST", body, headers: useAuthHeaders() }),
};
