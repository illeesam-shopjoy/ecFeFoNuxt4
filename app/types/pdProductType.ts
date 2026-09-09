import type { PdOptionType } from "~/types/pdOptionType";
import type { CoCategoryType } from "~/types/coCategoryType";
import type { CoBrandType } from "~/types/coBrandType";
import type { PdReviewType } from "~/types/pdReviewType";

/**
 * 상품 타입. 2026-09 BFF 전환 — 필드명을 ecBeBo(JPA) PdProdDto.Item 기준으로 정렬함
 * (이전엔 Prisma 가상 스키마 기준 title/price/quantity 등 자체 명명이었음).
 * img/thumbImg/bigImg/relatedImages 는 JPA 원본 컬럼이 아니라 prodImgs[] 목록에서
 * BFF가 뽑아낸 화면용 파생값이라 그대로 유지 (server/utils/mapProduct.ts 참조).
 */
export interface PdProductType {
  prodId: string; // 상품ID (ecBeBo prodId, 예: "PR2607070656371295")
  img: string; // 대표 이미지 (prodImgs 중 대표 1장, cdnImgUrl)
  trending?: boolean; // 트렌딩 여부 — ecBeBo에 대응 컬럼 없음, 항상 false
  topRated?: boolean; // 베스트 평점 여부 — ecBeBo에 대응 컬럼 없음, 항상 false
  isBest?: boolean; // 베스트여부 (ecBeBo isBest: Y/N)
  isNew?: boolean; // 신상품여부 (ecBeBo isNew: Y/N)
  banner?: boolean; // 배너 노출 여부 — ecBeBo에 대응 컬럼 없음, 항상 false
  bannerImg?: string; // 배너 이미지
  saleDiscntRate?: number; // 판매할인율(%) (ecBeBo saleDiscntRate, 없으면 stdPrice·salePrice 차이로 계산)
  relatedImages?: string[]; // 대표 이미지를 제외한 나머지 이미지 목록 (prodImgs[].cdnImgUrl)
  thumbImg?: string; // 호버 시 보여줄 보조 이미지 (prodImgs 중 2번째 사진)
  bigImg?: string; // 상세페이지 확대용 (현재 백엔드엔 별도 고해상도본이 없어 img와 동일)
  parentCategory?: CoCategoryType; // 상위 카테고리
  category?: CoCategoryType; // 카테고리
  brand?: CoBrandType; // 브랜드
  prodNm: string; // 상품명 (ecBeBo prodNm)
  salePrice: number; // 판매가 (ecBeBo salePrice, 프로모션 할인가가 있으면 그 값)
  stdPrice?: number; // 정가 (ecBeBo stdPrice)
  rating: number; // 평점 — ecBeBo 상품 자체엔 없고 리뷰 요약(getReviews summary.avgRating)에서만 나옴, 목록에서는 0
  prodStock: number; // 재고 수량 (ecBeBo prodStock, SKU 재고 합산값)
  orderQuantity?: number; // 주문 수량 (장바구니 등에서 쓰는 UI 상태, ecBeBo 필드 아님)
  smDesc: string; // 짧은 설명 — ecBeBo엔 없어 advrtStmt/contentHtml에서 BFF가 요약 생성
  optionSizes?: PdOptionType[]; // 사이즈 옵션 목록 (ecBeBo prodOpts 중 SIZE 계열)
  optionColors: PdOptionType[]; // 컬러 옵션 목록 (ecBeBo prodOpts 중 COLOR·기타 계열)
  weight?: number; // 무게 (ecBeBo weight)
  dimension?: string; // 치수 — ecBeBo에 대응 컬럼 없음
  reviews?: PdReviewType[]; // 리뷰 목록 (상세 조회 시 BFF가 별도 tier2 호출로 병합)
  contentHtml: string; // 상세 설명 HTML (ecBeBo contentHtml, 원문 그대로 v-html 렌더링)
}
