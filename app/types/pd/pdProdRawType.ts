/** ecBeBo PdProdDto.Item(+prodImgs/prodOpts/prodSkus) 원본 응답 — utils/mapProduct.ts 가 PdProdType(화면용)으로 변환한다. */
export interface PdProdImgRawType {
  prodImgId: string;
  prodId: string;
  cdnHost?: string | null;
  cdnImgUrl?: string | null;
  cdnThumbUrl?: string | null;
  imgAltText?: string | null;
  sortOrd?: number | null;
  isThumb?: string | null; // Y/N
}

export interface PdProdOptRawType {
  prodOptId: string;
  prodOptNm: string;
  prodOptVal?: string | null;
  prodOptStdCd?: string | null;
  prodOptTypeLevel?: number | null;
  prodOpt1TypeCd?: string | null;
  prodOpt2TypeCd?: string | null;
}

export interface PdProdSkuRawType {
  prodSkuId: string;
  prodId: string;
  prodOpt1Id?: string | null;
  prodOpt2Id?: string | null;
  skuCode?: string | null; // 2026-09-14: ecBeBo PdProdSkuDto.prodSkuCode → skuCode 리네이밍에 맞춤
  addPrice?: number | null;
  stockQty?: number | null;
  useYn?: string | null;
}

export interface PdProdRawType {
  prodId: string;
  categoryId?: string | null;
  brandId?: string | null;
  prodNm: string;
  prodCode?: string | null;
  prodTypeCd?: string | null; // 상품유형 SINGLE/OPTION/GROUP/SET/GIFT
  stdPrice?: number | null; // 정가
  salePrice?: number | null; // 판매가
  saleDiscntRate?: number | null;
  prodStatusCd?: string | null;
  thumbnailUrl?: string | null;
  contentHtml?: string | null;
  weight?: number | null;
  isNew?: string | null; // Y/N
  isBest?: string | null; // Y/N
  soldOutYn?: string | null; // Y/N
  advrtStmt?: string | null;
  cateNm?: string | null;
  parentCategoryId?: string | null;
  brandNm?: string | null;
  prodStock?: number | null;
  discntPrice?: number | null; // 프로모션 적용가 (있으면 salePrice보다 우선)
  prodOpt1TypeCd?: string | null;
  prodOpt2TypeCd?: string | null;
  prodImgs?: PdProdImgRawType[] | null;
  prodOpts?: PdProdOptRawType[] | null;
  prodSkus?: PdProdSkuRawType[] | null;
}
