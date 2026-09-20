import type { PdCategoryType } from "~/types/pd/pdCategoryType";
import type { SyBrandType } from "~/types/sy/syBrandType";
import type { PdReviewType } from "~/types/pd/pdReviewType";
import type { PdProdOptType } from "~/types/pd/pdProdOptType";
import type { SyAttachFileType, SyAttachType } from "~/types/sy/syAttachType";
import type { PdProdImgRawType, PdProdOptRawType, PdProdSkuRawType, PdProdRawType } from "~/types/pd/pdProdRawType";
import type { PdReviewCommentRawType, PdReviewRawType, PdReviewsRawType } from "~/types/pd/pdReviewRawType";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import type { PdProdPageParamsType } from "~/types/pd/pdProdPageParamsType";
import type { PdProdQnaRawType, PdProdQnaType } from "~/types/pd/pdProdQnaType";
import type { PdProdType } from "~/types/pd/pdProdType";
import type { PdProdImgType } from "~/types/pd/pdProdImgType";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";

/**
 * ecBeBo(Spring Boot 백엔드) 응답 shape → 이 앱의 PdProdType으로 변환.
 * 2026-09 BFF 전환으로 Prisma 직결 DB row 대신 ecBeBo의 PdProdDto.Item(+prodImgs/prodOpts/prodSkus)을 입력으로 받는다.
 * PdProdType 필드명 자체를 ecBeBo(JPA) 기준으로 맞춰뒀기 때문에(app/types/pdProdType.ts 참조) 대부분 그대로
 * 통과시키면 되고, img/thumbImg/bigImg/relatedImages/rating/smDesc 처럼 JPA에 없는 파생값만 이 파일에서 계산한다.
 */

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

function mapOption(o: PdProdOptRawType, fallbackTypeCd?: string | null): PdProdOptType {
  return {
    prodOptId: o.prodOptId,
    prodOptStdCd: o.prodOptStdCd ?? o.prodOptId,
    prodOptNm: o.prodOptNm,
    prodOptTypeCd: o.prodOpt1TypeCd ?? o.prodOpt2TypeCd ?? fallbackTypeCd ?? "",
    prodOptTypeLevel: o.prodOptTypeLevel ?? 1,
  };
}

/** ecBeBo PdProdDto.Item(+연관) → PdProdType 호환 객체 */
export function mapProduct(p: PdProdRawType, cdnBase: string): Record<string, unknown> {
  const resolveProdCdnUrl = (path: string | null | undefined) => resolveCdnUrl(path, cdnBase);
  const imgs = p.prodImgs ?? [];
  const thumb = imgs.find((i) => i.isThumb === "Y") ?? imgs[0];
  const sorted = [...imgs].sort((a, b) => (a.sortOrd ?? 0) - (b.sortOrd ?? 0));
  const secondary = sorted.find((i) => i !== thumb);

  // 2026-09-17(요청사항: "목록에 나오는 상품이미지 썸네일로 나오는거지? 아니라면 썸네일로
  // 나오게 개선해줘") — 지금까지 목록 카드(ProductItem.vue 등 30여 곳이 쓰는 `img`)가
  // cdnThumbUrl(실제 리사이즈된 썸네일)이 아니라 cdnImgUrl(원본 풀사이즈)을 그대로 쓰고
  // 있었다. 한 화면에 상품카드가 수십 개씩 뜨는 목록에서 전부 원본 크기를 받는 셈이라
  // 불필요하게 무거웠고, 자택 NAS 동시부하(→ AppImage 8초 타임아웃)를 키우는 요인이기도
  // 했다. `img`(목록용)는 썸네일을 우선하고, `bigImg`(상세/배너 등 큰 이미지 전용,
  // TrendingProductThree.vue/home-2·7.vue 참조)만 원본을 그대로 쓴다.
  const fullImg = resolveProdCdnUrl(thumb?.cdnImgUrl) ?? resolveProdCdnUrl(p.thumbnailUrl) ?? "";
  const img = resolveProdCdnUrl(thumb?.cdnThumbUrl) ?? fullImg;
  const thumbImg = resolveProdCdnUrl(secondary?.cdnImgUrl) ?? (fullImg || undefined); // 호버 시 보여줄 "다른 사진" — 없으면 대표 이미지 재사용
  const relatedImages = sorted
    .filter((i) => i !== thumb && i !== secondary)
    .map((i) => resolveProdCdnUrl(i.cdnImgUrl))
    .filter((u): u is string => Boolean(u));

  const prodImgs: PdProdImgType[] = sorted.flatMap((i) => {
    const url = resolveProdCdnUrl(i.cdnImgUrl);
    return url ? [{ url, sortOrd: i.sortOrd ?? 0, prodOpt1Id: i.prodOpt1Id || undefined, prodOpt2Id: i.prodOpt2Id || undefined }] : [];
  });

  const category: PdCategoryType | undefined = p.categoryId ? { categoryId: p.categoryId, categoryNm: p.cateNm ?? "", categoryDepth: p.parentCategoryId ? 2 : 1 } : undefined;
  // 목록/상세 API 응답엔 상위 카테고리 "명"까지는 안 내려온다(ID만) — 이름이 필요하면 카테고리 목록을 별도 조회해야 함.
  const parentCategory: PdCategoryType | undefined = p.parentCategoryId ? { categoryId: p.parentCategoryId, categoryNm: "", categoryDepth: 1 } : undefined;
  const brand: SyBrandType | undefined = p.brandId ? { brandId: p.brandId, brandCode: p.brandId, brandNm: p.brandNm ?? "" } : undefined;

  // 2026-09-14 버그수정 — o.prodOpt1TypeCd/prodOpt2TypeCd는 pd_prod_opt 각 행에는 항상
  // null로 내려온다(실제로 확인함, BO "옵션설정" 저장 시 이 값들은 상품 레벨 플랫 컬럼
  // p.prodOpt1TypeCd/prodOpt2TypeCd에만 저장되고 옵션값 행 자체엔 안 채워짐) — 그래서
  // 예전 코드는 항상 p.prodOpt1TypeCd(1단=색상)로만 폴백해, 2단(사이즈) 옵션값까지 전부
  // "색상"으로 분류되어 prodOpt1List(사이즈)가 항상 비어 있었다. o.prodOptTypeLevel(1|2)로 어느
  // 상품 레벨 컬럼을 볼지 먼저 골라야 함.
  const prodOpt2List: PdProdOptType[] = [];
  const prodOpt1List: PdProdOptType[] = [];
  for (const o of p.prodOpts ?? []) {
    const levelTypeCd = o.prodOptTypeLevel === 2 ? p.prodOpt2TypeCd : p.prodOpt1TypeCd;
    const kind = classifyOptionType(o.prodOpt1TypeCd ?? o.prodOpt2TypeCd ?? levelTypeCd);
    const mapped = mapOption(o, levelTypeCd);
    if (kind === "size") prodOpt1List.push(mapped);
    else prodOpt2List.push(mapped); // 색상/기타는 prodOpt2List 쪽에 몰아둠 (템플릿이 컬러 스와치를 기본 옵션 UI로 씀)
  }

  const salePrice = p.discntPrice ?? p.salePrice ?? p.stdPrice ?? 0;
  const stdPrice = p.stdPrice && salePrice < p.stdPrice ? p.stdPrice : undefined;
  const saleDiscntRate = p.saleDiscntRate != null ? Math.round(p.saleDiscntRate) : stdPrice ? Math.round(((stdPrice - salePrice) / stdPrice) * 100) : undefined;

  return {
    prodId: p.prodId,
    prodTypeCd: p.prodTypeCd ?? undefined,
    img,
    thumbImg,
    bigImg: fullImg || undefined,
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
    prodImgs,
    relatedImages,
    contentHtml: p.contentHtml ?? "",
    prodOpt1List,
    prodOpt2List,
    prodSkus: (p.prodSkus ?? [])
      .filter((s) => s.useYn !== "N")
      .map((s) => ({
        prodSkuId: s.prodSkuId,
        prodOpt1Id: s.prodOpt1Id,
        prodOpt2Id: s.prodOpt2Id,
        skuCode: s.skuCode,
        addPrice: s.addPrice,
        stockQty: s.stockQty,
      })),
    reviews: [] as PdReviewType[],
    // 아래 3개(isTrending/isBanner/isTopRated)는 실 스키마에 대응 컬럼이 없음 — 큐레이션 기능 재도입 시 별도 정책 필요, 지금은 항상 false
    isTrending: false,
    isBanner: false,
    isTopRated: false,
    isBest: p.isBest === "Y",
    isNew: p.isNew === "Y",
    saleDiscntRate,
  };
}

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp"]);
const VIDEO_EXT = new Set(["mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv", "flv"]);
export const isImageExt = (ext?: string | null) => IMAGE_EXT.has((ext ?? "").toLowerCase());
export const isVideoExt = (ext?: string | null) => VIDEO_EXT.has((ext ?? "").toLowerCase());

/**
 * 첨부(sy_attach) 목록 → 화면용. 업로드 응답/조회 응답의 파일 URL 호스트가 서버 내부 주소(host.docker.internal 등)로 올 수 있어
 * 실제 CDN origin 으로 보정한다(cdnUrl.fixInternalCdnUrl).
 */
export function mapAttachFiles(list: SyAttachFileType[] | null | undefined, cdnBase: string): SyAttachType[] {
  return (list ?? []).map((f) => {
    const fix = (u?: string | null) => fixInternalCdnUrl(resolveCdnUrl(u, cdnBase), cdnBase) || undefined;
    return {
      attachId: f.attachId,
      refTableNm: f.refTableNm ?? undefined,
      refId: f.refId ?? undefined,
      fileNm: f.fileNm ?? "",
      fileExt: (f.fileExt ?? "").toLowerCase(),
      fileSize: Number(f.fileSize ?? 0),
      storagePath: f.storagePath ?? undefined,
      attachUrl: f.attachUrl ?? undefined,
      cdnImgUrl: fix(f.cdnImgUrl || f.attachUrl), // 열기/재생용(호스트 보정)
      thumbUrl: f.thumbUrl ?? undefined,
      thumbCdnUrl: fix(f.thumbCdnUrl || f.thumbUrl),
      sortOrd: f.sortOrd ?? undefined,
    };
  });
}

/** ecBeBo PdReviewDto.Item(+comments) → PdReviewType (재귀: 답글은 comments를 children review로 편입) */
export function mapReview(r: PdReviewRawType, cdnBase: string): PdReviewType {
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
    writerNm: r.writerNm ?? r.regUserNm ?? "익명", // 비회원은 writerNm, 회원은 등록자명
    reviewDate: r.reviewDate ?? "",
    rating: Number(r.rating) || 0,
    reviewContent: r.reviewContent,
  };
  if (r.memberId) base.memberId = r.memberId;
  const files = mapAttachFiles(r.attachFiles, cdnBase);
  if (files.length) {
    base.attachFiles = files;
    base.attachments = files.filter((f) => f.cdnImgUrl && (isImageExt(f.fileExt) || isVideoExt(f.fileExt))).map((f) => f.cdnImgUrl as string);
  }
  if (r.reviewTitle) base.reviewTitle = r.reviewTitle;
  if (replies.length) base.replies = replies;
  return base;
}

/** 화면 조회 조건 → GET /fo/ec/pd/prod/page 쿼리 (배열 필터는 서버가 IN 조건으로 받는다) */
export function buildProdPageQuery(params: PdProdPageParamsType): Record<string, unknown> {
  const q: Record<string, unknown> = { pageNo: params.pageNo, pageSize: params.pageSize ?? 12, useYn: "Y" };
  if (params.categoryIds?.length) q.categoryIds = params.categoryIds;
  if (params.brandIds?.length) q.brandIds = params.brandIds;
  if (params.vendorIds?.length) q.vendorIds = params.vendorIds;
  if (params.mdUserIds?.length) q.mdUserIds = params.mdUserIds;
  if (params.sizeCds?.length) q.sizeInfoCds = params.sizeCds;
  if (params.priceMin != null) q.priceMin = params.priceMin;
  if (params.priceMax != null) q.priceMax = params.priceMax;
  if (params.sort) q.sort = params.sort;
  if (params.keyword) {
    q.searchType = "prodNm";
    q.searchValue = params.keyword;
  }
  return q;
}

/** 상품 페이징 응답 → 화면용(상품 매핑 + hasMore) */
export function mapProdPage(page: CoBasePageType<PdProdRawType>, cdnBase: string): CoPagedResultType<PdProdType> {
  return {
    items: page.pageList.map((p) => mapProduct(p, cdnBase) as unknown as PdProdType),
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    pageTotalCount: page.pageTotalCount,
    pageTotalPage: page.pageTotalPage,
    hasMore: page.pageNo < page.pageTotalPage,
  };
}

/** Q&A 목록 — 첨부(attachFiles)를 브라우저에서 열 수 있는 CDN URL 로 보정 */
export const mapQnaList = (rows: PdProdQnaRawType[], cdnBase: string): PdProdQnaType[] => rows.map((q) => ({ ...q, attachFiles: mapAttachFiles(q.attachFiles, cdnBase) }));

/** 상품 단건 + 리뷰·평균평점 병합 */
export function mapProdDetail(detail: PdProdRawType, reviewsRes: PdReviewsRawType, cdnBase: string): PdProdType {
  const out = mapProduct(detail, cdnBase);
  out.reviews = reviewsRes.reviewPage.pageList.map((r) => mapReview(r, cdnBase));
  if (typeof reviewsRes.summary?.avgRating === "number") out.rating = reviewsRes.summary.avgRating;
  return out as unknown as PdProdType;
}

/** 리뷰 조회 실패 시 대신 쓰는 빈 리뷰 응답 */
export const EMPTY_REVIEWS: PdReviewsRawType = { summary: {}, reviewPage: { pageList: [], pageTotalCount: 0 } };
