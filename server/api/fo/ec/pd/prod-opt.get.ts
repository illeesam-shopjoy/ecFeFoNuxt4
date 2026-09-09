import { beApi } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { PdOptionType } from "~/types/pdOptionType";

interface BeSizeCode {
  codeId: string;
  codeValue: string;
  codeLabel: string;
  sortOrd?: number;
}

/**
 * 전역 옵션(필터용) 목록. 실 스키마엔 상품 옵션의 "전역 카탈로그"가 없다 — 색상/사이즈는
 * 상품별 pd_prod_opt에만 있고(상품 상세 조회 시에만 나옴), 그걸 전 상품에 걸쳐 모으려면
 * N+1 조회가 필요해 비용이 크다. 대신 사이즈는 공개 공통코드(SIZE_INFO_CD, /api/co/sy/code)를
 * 쓰고, 색상은 전역 카탈로그가 없어 필터 UI용 정적 폴백만 제공한다(2026-09 BFF 전환 1차분 —
 * 실제 판매 색상과 다를 수 있음, 상품 상세의 optionColors가 진짜 값).
 */
const FALLBACK_COLORS: PdOptionType[] = [
  { optionId: "COLOR-BLACK", optionNm: "블랙", optionType: "COLOR", optionLevel: 1 },
  { optionId: "COLOR-WHITE", optionNm: "화이트", optionType: "COLOR", optionLevel: 1 },
  { optionId: "COLOR-GRAY", optionNm: "그레이", optionType: "COLOR", optionLevel: 1 },
  { optionId: "COLOR-BEIGE", optionNm: "베이지", optionType: "COLOR", optionLevel: 1 },
];

export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const sizeCodes = await beApi.get<BeSizeCode[]>("/co/sy/code", { codeGrps: "SIZE_INFO_CD" }).catch((e: unknown) => {
    logger.warn("[api]", url, "사이즈 코드 조회 실패, 빈 목록으로 진행:", (e as Error)?.message);
    return [] as BeSizeCode[];
  });
  const sizes: PdOptionType[] = sizeCodes.map((c) => ({ optionId: c.codeId, optionCode: c.codeValue, optionNm: c.codeLabel, optionType: "SIZE", optionLevel: 1 }));

  const out = [...FALLBACK_COLORS, ...sizes];
  logger.info("[api] ◀", method, url, "list size=" + out.length);
  return out;
});
