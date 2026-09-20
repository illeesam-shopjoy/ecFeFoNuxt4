/** 상품 이미지 한 장(화면용). 색상 옵션과 연결된 이미지는 prodOpt1Id/prodOpt2Id 에 그 옵션ID(pd_prod_opt.prod_opt_id)가 들어 있다. */
export interface PdProdImgType {
  url: string; // 이미지 URL (cdnImgUrl, CDN 절대경로로 정규화)
  sortOrd: number; // 정렬순서
  prodOpt1Id?: string; // 연결된 옵션1 값ID (보통 색상) — 없으면 기본이미지
  prodOpt2Id?: string; // 연결된 옵션2 값ID
}
