import type { PdProdImgType } from "~/types/pd/pdProdImgType";
import type { PdProdOptType } from "~/types/pd/pdProdOptType";
import type { PdProdSkuType } from "~/types/pd/pdProdSkuType";
import type { PdCategoryType } from "~/types/pd/pdCategoryType";
import type { SyBrandType } from "~/types/sy/syBrandType";
import type { PdReviewType } from "~/types/pd/pdReviewType";
import type { PdCategoryProdType } from "~/types/pd/pdCategoryProdType";

/**
 * 상품 타입. 2026-09 BFF 전환 — 필드명을 ecBeBo(JPA) PdProdDto.Item 기준으로 정렬함
 * (이전엔 Prisma 가상 스키마 기준 title/price/quantity 등 자체 명명이었음).
 * img/thumbImg/bigImg/relatedImages 는 JPA 원본 컬럼이 아니라 prodImgs[] 목록에서
 * BFF가 뽑아낸 화면용 파생값이라 그대로 유지 (server/utils/mapProduct.ts 참조).
 */
export interface PdProdType {
  prodId: string; // 상품ID (ecBeBo prodId, 예: "PR2607070656371295")
  prodTypeCd?: string; // 상품유형 코드 (ecBeBo prodTypeCd: SINGLE/OPTION/GROUP/SET/GIFT) — 표시명은 conts/pdConst.ts prodTypeLabel
  prodTypeCdNm?: string; // 상품유형 코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  img: string; // 대표 이미지 (prodImgs 중 대표 1장, cdnImgUrl)
  isTrending?: boolean; // 트렌딩 여부 — ecBeBo에 대응 컬럼 없음, 항상 false
  isTopRated?: boolean; // 베스트 평점 여부 — ecBeBo에 대응 컬럼 없음, 항상 false
  isBest?: boolean; // 베스트여부 (ecBeBo isBest: Y/N)
  isNew?: boolean; // 신상품여부 (ecBeBo isNew: Y/N)
  isBanner?: boolean; // 배너 노출 여부 — ecBeBo에 대응 컬럼 없음, 항상 false
  bannerImg?: string; // 배너 이미지
  saleDiscntRate?: number; // 판매할인율(%) (ecBeBo saleDiscntRate, 없으면 stdPrice·salePrice 차이로 계산)
  prodImgs?: PdProdImgType[]; // 이미지 전체(정렬순, 색상 옵션 연결 정보 포함) — 상세 갤러리가 색상 선택에 따라 순서를 바꾼다
  relatedImages?: string[]; // 대표 이미지를 제외한 나머지 이미지 목록 (prodImgs[].cdnImgUrl)
  thumbImg?: string; // 호버 시 보여줄 보조 이미지 (prodImgs 중 2번째 사진)
  bigImg?: string; // 상세페이지 확대용 (현재 백엔드엔 별도 고해상도본이 없어 img와 동일)
  parentCategory?: PdCategoryType; // 상위 카테고리
  category?: PdCategoryType; // 카테고리
  brand?: SyBrandType; // 브랜드
  prodNm: string; // 상품명 (ecBeBo prodNm)
  salePrice: number; // 판매가 (ecBeBo salePrice, 프로모션 할인가가 있으면 그 값)
  stdPrice?: number; // 정가 (ecBeBo stdPrice)
  rating: number; // 평점 — ecBeBo 상품 자체엔 없고 리뷰 요약(getReviews summary.avgRating)에서만 나옴, 목록에서는 0
  prodStock: number; // 재고 수량 (ecBeBo prodStock, SKU 재고 합산값)
  orderQuantity?: number; // 주문 수량 (장바구니 등에서 쓰는 UI 상태, ecBeBo 필드 아님)
  smDesc: string; // 짧은 설명 — ecBeBo엔 없어 advrtStmt/contentHtml에서 BFF가 요약 생성
  prodOpt1List?: PdProdOptType[]; // 사이즈 옵션 목록 (ecBeBo prodOpts 중 SIZE 계열)
  prodOpt2List: PdProdOptType[]; // 컬러 옵션 목록 (ecBeBo prodOpts 중 COLOR·기타 계열)
  prodSkus?: PdProdSkuType[]; // 옵션조합 SKU 목록 (ecBeBo prodSkus, 2026-09 추가 — 재고차감 대상 식별용)
  weight?: number; // 무게 (ecBeBo weight)
  categoryProds?: PdCategoryProdType[]; // 이 상품이 연결된 카테고리 목록 (pd_category_prod)
  reviews?: PdReviewType[]; // 리뷰 목록 (상세 조회 시 BFF가 별도 tier2 호출로 병합)
  contentHtml: string; // 상세 설명 HTML (ecBeBo contentHtml, 원문 그대로 v-html 렌더링)
  // ── pd_prod 테이블 컬럼(ecBeBo PdProdDto.Item) — 서버가 내려주는 경우에만 채워진다 ──
  categoryId?: string; // 카테고리ID
  brandId?: string; // 브랜드ID
  vendorId?: string; // 업체ID
  prodCode?: string; // 상품코드(SKU)
  currCd?: string; // 통화코드 (KRW/USD/CNY/JPY, 기본 KRW) - 환율 변환은 하지 않음
  currCdNm?: string; // 통화코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  saleDiscntAmt?: number; // 판매할인금액(원) — 정가-판매가 최종 기준값
  prodStatusCd?: string; // 상태 — PROD_STATUS_CD {DRAFT:임시저장, ACTIVE:전시중, INACTIVE:판매중지, ENDED:판매종료…
  prodStatusCdNm?: string; // 상품상태 코드라벨 (조인 표시용)
  thumbnailUrl?: string; // 썸네일URL
  sizeInfoCd?: string; // 사이즈 — SIZE_INFO_CD {FREE:FREE, XS:XS, S:S, M:M, L:L, XL:XL}
  sizeInfoCdNm?: string; // 사이즈 코드라벨 (조인 표시용)
  viewCount?: number; // 조회수
  saleStartDate?: string; // 판매기간 시작 (NOT NULL — 등록시각 자동기입)
  saleEndDate?: string; // 판매기간 종료 (NULL=무기한)
  dispStartDate?: string; // 전시기간 시작 (NOT NULL — 등록시각 자동기입)
  dispEndDate?: string; // 전시기간 종료 (NULL=무기한)
  saleStateCd?: string; // (FO 전용 계산값, DB컬럼 아님) {SCHEDULED:출시예정, ON_SALE:판매중(구매가능), SOLDOUT:품절, E…
  saleStateCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  minBuyQty?: number; // 최소구매수량 (기본 1)
  maxBuyQty?: number; // 최대구매수량 (NULL=무제한)
  dayMaxBuyQty?: number; // 1일 최대구매수량 (NULL=무제한)
  idMaxBuyQty?: number; // ID당 최대구매수량 (NULL=무제한)
  adltYn?: string; // 성인상품 여부 Y/N
  sameDayDlivYn?: string; // 당일배송여부 Y/N
  soldOutYn?: string; // 품절여부 Y/N
  dlivTmpltId?: string; // 배송템플릿ID (pd_dliv_tmplt.dliv_tmplt_id)
  dlivMethodCd?: string; // 배송방법 override — DLIV_METHOD_CD, NULL이면 배송템플릿 기본값 사용
  dlivMethodCdNm?: string; // 배송방법 override 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  couponUseYn?: string; // 쿠폰 사용 가능 여부 Y/N
  saveUseYn?: string; // 적립금 사용 가능 여부 Y/N
  discntUseYn?: string; // 할인 적용 가능 여부 Y/N
  advrtStmt?: string; // 홍보문구 (500자 이내)
  advrtStartDate?: string; // 홍보문구 시작일시
  advrtEndDate?: string; // 홍보문구 종료일시
  siteId?: string; // 사이트ID
  cateNm?: string; // 카테고리명 (조인 표시용)
  parentCategoryId?: string; // 상위 카테고리ID (조인 표시용)
  brandNm?: string; // 브랜드명 (조인 표시용)
  vendorNm?: string; // 업체명 (조인 표시용)
  prodOptStdCd?: string; // 옵션 표준코드 (공통코드 그룹 기준)
  prodOptStdCdNm?: string; // 옵션 표준코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOpt1TypeCd?: string; // 옵션유형1 분류코드 (예: COLOR)
  prodOpt1TypeCdNm?: string; // 옵션유형1 분류코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  prodOpt2TypeCd?: string; // 옵션유형2 분류코드 (예: SIZE)
  prodOpt2TypeCdNm?: string; // 옵션유형2 분류코드 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  saleCount?: number; // 판매수량 합산 (pd_prod_stock.sale_count, 목록용)
  discntPrice?: number; // 프로모션 할인 적용가 (활성 상품할인 중 최고할인 적용, 없으면 NULL)
  discntRate?: number; // 적용된 할인율(%) — 정액할인이면 판매가 대비 환산율
  appliedDiscntNm?: string; // 적용된 할인정책명 (discntPrice 산출 근거)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일시 (reg_date)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
