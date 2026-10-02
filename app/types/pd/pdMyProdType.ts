/**
 * 판매자 상품등록(단품) — ecBeBo FoPdProdWriteController(/api/fo/ec/pd/my-prod) 계약. 2026-10-02 (셀러 Phase 2 · 2B).
 * 상품 소유(sellerId)·상품유형(SINGLE)·사이트는 서버가 정하므로 요청에 담지 않는다.
 */
/** 판매자가 고를 수 있는 상태 — 판매중/판매중지 (판매종료 ENDED 는 삭제 버튼, 임시저장 DRAFT 는 없음) */
export type PdMyProdStatusCd = "ACTIVE" | "INACTIVE" | "ENDED" | "DRAFT";

/** SKU 재고 한 줄 — warehouseId 는 SKU 자체 지정이 없으면 상품 기본 창고(서버가 실효값으로 채움) */
export interface PdMySkuStockType {
  prodSkuId: string;
  skuCode?: string;
  warehouseId?: string;
  stockQty?: number;
  saleCount?: number;
}

/** 내 상품 한 건 (목록/상세 공용) */
export interface PdMyProdType {
  prodId: string;
  prodNm: string;
  categoryId?: string;
  salePrice?: number;
  stdPrice?: number;
  thumbnailUrl?: string;
  prodStatusCd?: PdMyProdStatusCd;
  contentHtml?: string; // 상세 조회에서만 채움
  warehouseId?: string; // 상품 기본 출고 창고
  warehouseNm?: string;
  prodSkuId?: string; // 단품의 SKU
  stockQty?: number; // SKU 재고 합계
  skus?: PdMySkuStockType[];
}

/** POST/PUT 본문 */
export interface PdMyProdSaveType {
  prodNm: string;
  categoryId: string;
  salePrice: number;
  stdPrice?: number;
  stockQty: number;
  warehouseId: string;
  contentHtml?: string;
  prodStatusCd?: "ACTIVE" | "INACTIVE";
  /** 대표이미지 — AttachUploader 로 먼저 올린 미연계 파일의 attachId. 수정 시 주면 교체, 생략하면 기존 유지 */
  attachId?: string;
}

/** POST /ai-draft 본문 — 사진으로 상품정보 자동 작성(Claude 연계). 사진은 화면에서 줄여 base64 로 보낸다 */
export interface PdMyProdAiDraftReqType {
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  /** 판매자 메모(선택) — 예: "작년에 산 정품, 박스 있음" */
  hint?: string;
}

/** AI 가 작성한 상품정보 초안 — 입력란에 채워 넣고 판매자가 확인·수정한 뒤 저장한다 */
export interface PdMyProdAiDraftType {
  prodNm: string; // 알아볼 수 없으면 빈 값
  categoryId: string; // 이 사이트 카테고리 중 하나(없으면 빈 값)
  categoryNm: string;
  contentHtml: string;
  tags: string[];
  suggestedSalePrice?: number | null; // 말하기 어려우면 없음
  checkNote: string; // 저장 전에 확인할 점
  model?: string;
}
