/** mapMaster.ts — 마스터/전시 응답 가공 (svc 는 조회만). */
import type { DpPanelItemType } from "~/types/dp/dpPanelItemType";
import type { SyBrandType } from "~/types/sy/syBrandType";
import type { SyCodeType } from "~/types/sy/syCodeType";

/** 브랜드 목록 — 상품 필터(brandIds)가 brandId 를 받으므로 brandCode 에도 brandId 를 담는다(기존 동작 유지) */
export const mapBrands = (rows: SyBrandType[]): SyBrandType[] => rows.map((b) => ({ brandId: b.brandId, brandCode: b.brandId, brandNm: b.brandNm }));

/** 공통코드 — 화면이 쓰는 4개 컬럼만 남긴다 */
export const mapCodes = (rows: SyCodeType[]): SyCodeType[] => rows.map((r) => ({ codeId: r.codeId, codeGrp: r.codeGrp, codeValue: r.codeValue, codeLabel: r.codeLabel }));

/** 영역의 첫 위젯 config(JSON)를 파싱. 미등록/파싱실패는 null → 호출부가 기본값 폴백 */
export function parseFirstWidgetConfig<T>(items: DpPanelItemType[] | null | undefined): T | null {
  const raw = items?.[0]?.widgetConfigJson;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
