import type { CoCategoryType } from "~/types/coCategoryType";
import type { CoBrandType } from "~/types/coBrandType";
import type { PdReviewType } from "~/types/pdReviewType";
import type { PdOptionType } from "~/types/pdOptionType";
import { resolveProdCdnUrl } from "~~/server/utils/cdn";

/**
 * ecBeBo(Spring Boot 백엔드) 응답 shape → 이 앱의 PdProductType으로 변환.
 * 2026-09 BFF 전환으로 Prisma 직결 DB row 대신 ecBeBo의 PdProdDto.Item(+prodImgs/prodOpts/prodSkus)을 입력으로 받는다.
 * PdProductType 필드명 자체를 ecBeBo(JPA) 기준으로 맞춰뒀기 때문에(app/types/pdProductType.ts 참조) 대부분 그대로
 * 통과시키면 되고, img/thumbImg/bigImg/relatedImages/rating/smDesc 처럼 JPA에 없는 파생값만 이 파일에서 계산한다.
 */

export interface BeProdImgItem {
  prodImgId: string;
  prodId: string;
  cdnHost?: string | null;
  cdnImgUrl?: string | null;
  cdnThumbUrl?: string | null;
  imgAltText?: string | null;
  sortOrd?: number | null;
  isThumb?: string | null; // Y/N
}

export interface BeProdOptItem {
  prodOptId: string;
  prodOptNm: string;
  prodOptVal?: string | null;
  prodOptStdCd?: string | null;
  prodOptTypeLevel?: number | null;
  prodOpt1TypeCd?: string | null;
  prodOpt2TypeCd?: string | null;
}

export interface BeProdSkuItem {
  prodSkuId: string;
  prodId: string;
  prodOpt1Id?: string | null;
  prodOpt2Id?: string | null;
  prodSkuCode?: string | null;
  addPrice?: number | null;
  useYn?: string | null;
}

export interface BeProdItem {
  prodId: string;
  categoryId?: string | null;
  brandId?: string | null;
  prodNm: string;
  prodCode?: string | null;
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
  prodImgs?: BeProdImgItem[] | null;
  prodOpts?: BeProdOptItem[] | null;
  prodSkus?: BeProdSkuItem[] | null;
}

export interface BeReviewCommentItem {
  reviewCommentId: string;
  parentReplyId?: string | null;
  writerNm?: string | null;
  reviewReplyContent: string;
  regDate?: string | null;
}

export interface BeReviewItem {
  reviewId: string;
  prodId: string;
  reviewTitle?: string | null;
  reviewContent: string;
  rating: number;
  reviewDate?: string | null;
  regUserNm?: string | null;
  comments?: BeReviewCommentItem[] | null;
}

const HTML_TAG_RE = /<[^>]*>/g;

/** contentHtml/advrtStmt 등에서 태그를 걷어내고 길이를 제한한 짧은 설명 생성 */
function toShortText(html: string | null | undefined, max = 120): string | undefined {
  if (!html) return undefined;
  const text = html.replace(HTML_TAG_RE, " ").replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** prodOpt1TypeCd/prodOpt2TypeCd 코드값으로 색상/사이즈 옵션을 대충 구분한다 (표준 코드가 없어 문자열 매칭). */
function classifyOptionType(typeCd: string | null | undefined): "color" | "size" | "etc" {
  const v = (typeCd ?? "").toUpperCase();
  if (v.includes("COLOR")) return "color";
  if (v.includes("SIZE")) return "size";
  return "etc";
}

function mapOption(o: BeProdOptItem, fallbackTypeCd?: string | null): PdOptionType {
  return {
    optionId: o.prodOptId,
    optionCode: o.prodOptStdCd ?? o.prodOptId,
    optionNm: o.prodOptNm,
    optionType: o.prodOpt1TypeCd ?? o.prodOpt2TypeCd ?? fallbackTypeCd ?? "",
    optionLevel: o.prodOptTypeLevel ?? 1,
  };
}

/** ecBeBo PdProdDto.Item(+연관) → PdProductType 호환 객체 */
export function mapProduct(p: BeProdItem): Record<string, unknown> {
  const imgs = p.prodImgs ?? [];
  const thumb = imgs.find((i) => i.isThumb === "Y") ?? imgs[0];
  const sorted = [...imgs].sort((a, b) => (a.sortOrd ?? 0) - (b.sortOrd ?? 0));
  const secondary = sorted.find((i) => i !== thumb);

  const img = resolveProdCdnUrl(thumb?.cdnImgUrl) ?? resolveProdCdnUrl(p.thumbnailUrl) ?? "";
  const thumbImg = resolveProdCdnUrl(secondary?.cdnImgUrl) ?? (img || undefined); // 호버 시 보여줄 "다른 사진" — 없으면 대표 이미지 재사용
  const relatedImages = sorted
    .filter((i) => i !== thumb && i !== secondary)
    .map((i) => resolveProdCdnUrl(i.cdnImgUrl))
    .filter((u): u is string => Boolean(u));

  const category: CoCategoryType | undefined = p.categoryId ? { categoryId: p.categoryId, categoryNm: p.cateNm ?? "", categoryDepth: p.parentCategoryId ? 2 : 1 } : undefined;
  // 목록/상세 API 응답엔 상위 카테고리 "명"까지는 안 내려온다(ID만) — 이름이 필요하면 카테고리 목록을 별도 조회해야 함.
  const parentCategory: CoCategoryType | undefined = p.parentCategoryId ? { categoryId: p.parentCategoryId, categoryNm: "", categoryDepth: 1 } : undefined;
  const brand: CoBrandType | undefined = p.brandId ? { brandId: p.brandId, brandCode: p.brandId, brandNm: p.brandNm ?? "" } : undefined;

  const optionColors: PdOptionType[] = [];
  const optionSizes: PdOptionType[] = [];
  for (const o of p.prodOpts ?? []) {
    const kind = classifyOptionType(o.prodOpt1TypeCd ?? o.prodOpt2TypeCd ?? p.prodOpt1TypeCd);
    const mapped = mapOption(o, p.prodOpt1TypeCd);
    if (kind === "size") optionSizes.push(mapped);
    else optionColors.push(mapped); // 색상/기타는 optionColors 쪽에 몰아둠 (템플릿이 컬러 스와치를 기본 옵션 UI로 씀)
  }

  const salePrice = p.discntPrice ?? p.salePrice ?? p.stdPrice ?? 0;
  const stdPrice = p.stdPrice && salePrice < p.stdPrice ? p.stdPrice : undefined;
  const saleDiscntRate = p.saleDiscntRate != null ? Math.round(p.saleDiscntRate) : stdPrice ? Math.round(((stdPrice - salePrice) / stdPrice) * 100) : undefined;

  return {
    prodId: p.prodId,
    img,
    thumbImg,
    bigImg: img || undefined,
    prodNm: p.prodNm,
    salePrice,
    stdPrice,
    // 실 스키마엔 상품 평균평점 필드가 없음(리뷰 요약 API 별도) — 목록에서는 0, 상세는 reviews 병합 시 채움(server/api/fo/ec/pd/prod/[id].get.ts 참조)
    rating: 0,
    prodStock: p.prodStock ?? 0,
    smDesc: toShortText(p.advrtStmt) ?? toShortText(p.contentHtml) ?? "",
    weight: p.weight ?? undefined,
    category,
    parentCategory,
    brand,
    relatedImages,
    contentHtml: p.contentHtml ?? "",
    optionSizes,
    optionColors,
    reviews: [] as PdReviewType[],
    // 아래 3개(trending/banner/topRated)는 실 스키마에 대응 컬럼이 없음 — 큐레이션 기능 재도입 시 별도 정책 필요, 지금은 항상 false
    trending: false,
    banner: false,
    topRated: false,
    isBest: p.isBest === "Y",
    isNew: p.isNew === "Y",
    saleDiscntRate,
  };
}

/** ecBeBo PdReviewDto.Item(+comments) → PdReviewType (재귀: 답글은 comments를 children review로 편입) */
export function mapReview(r: BeReviewItem): PdReviewType {
  const replies: PdReviewType[] = (r.comments ?? []).map((c) => ({
    reviewId: c.reviewCommentId,
    img: "",
    writerNm: c.writerNm ?? "관리자",
    reviewDate: c.regDate ?? "",
    rating: 0,
    reviewContent: c.reviewReplyContent,
    children: true,
  }));
  const base: PdReviewType = {
    reviewId: r.reviewId,
    img: "",
    writerNm: r.regUserNm ?? "익명",
    reviewDate: r.reviewDate ?? "",
    rating: Number(r.rating) || 0,
    reviewContent: r.reviewContent,
  };
  if (r.reviewTitle) base.title = r.reviewTitle;
  if (replies.length) base.replies = replies;
  return base;
}
