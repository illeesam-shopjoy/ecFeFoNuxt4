import { beApi, type BePage } from "~~/server/utils/beApi";
import { logger } from "~~/server/utils/logger";
import type { PdOptionType } from "~/types/pdOptionType";
import type { BeProdItem, BeProdOptItem } from "~~/server/utils/mapProduct";

interface BeSizeCode {
  codeId: string;
  codeValue: string;
  codeLabel: string;
  sortOrd?: number;
}

/**
 * 전역 옵션(필터용) 목록. 실 스키마엔 상품 옵션의 "전역 카탈로그"가 없다 — 색상/사이즈는
 * 상품별 pd_prod_opt에만 있고(상품 상세 조회 시에만 나옴), 그걸 전 상품에 걸쳐 모으려면
 * N+1 조회가 필요하다. 사이즈는 공개 공통코드(SIZE_INFO_CD, /api/co/sy/code)로 해결되지만,
 * 색상은 그런 전역 코드그룹이 실제로 존재하지 않는다(2026-09 COLOR_CD/PROD_COLOR_CD 등
 * 여러 이름으로 직접 조회해 확인함, 전부 0건).
 *
 * 2026-09-10: 처음엔 "블랙/화이트/그레이/베이지" 같은 그럴듯한 값을 하드코딩해뒀었는데,
 * 그 optionId가 전부 지어낸 값이라 실제 상품과 매칭될 수 없어(필터를 눌러도 항상 결과가
 * 0건) 오히려 사용자를 속이는 꼴이었다. 지금은 실제 상품 표본을 조회해 진짜 COLOR 옵션만
 * 모아서 내려준다 — 지금 시드데이터엔 옵션이 거의 비어 있어 결과가 적거나 없을 수 있지만,
 * 적어도 "선택하면 실제로 필터링되는 값만" 보여준다. 매 요청마다 N+1 하지 않도록 짧게 캐시.
 */
const SAMPLE_SIZE = 40;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분
let colorCache: { at: number; colors: PdOptionType[] } | null = null;

function classifyIsColor(o: BeProdOptItem, fallbackTypeCd?: string | null): boolean {
  const v = (o.prodOpt1TypeCd ?? o.prodOpt2TypeCd ?? fallbackTypeCd ?? "").toUpperCase();
  return v.includes("COLOR");
}

async function loadRealColorOptions(): Promise<PdOptionType[]> {
  if (colorCache && Date.now() - colorCache.at < CACHE_TTL_MS) return colorCache.colors;

  const page = await beApi.get<BePage<BeProdItem>>("/fo/ec/pd/prod/page", { pageSize: SAMPLE_SIZE, useYn: "Y" }).catch(() => null);
  const ids = (page?.pageList ?? []).map((p) => p.prodId);

  const details = await Promise.all(
    ids.map((id) =>
      beApi.get<BeProdItem>(`/fo/ec/pd/prod/${id}`).catch((e: unknown) => {
        logger.warn("[api] prod-opt 색상 표본 조회 실패:", id, (e as Error)?.message);
        return null;
      }),
    ),
  );

  const seen = new Map<string, PdOptionType>();
  for (const d of details) {
    if (!d) continue;
    for (const o of d.prodOpts ?? []) {
      if (!classifyIsColor(o, d.prodOpt1TypeCd)) continue;
      if (!seen.has(o.prodOptId)) {
        seen.set(o.prodOptId, { optionId: o.prodOptId, optionCode: o.prodOptStdCd ?? o.prodOptId, optionNm: o.prodOptNm, optionType: "COLOR", optionLevel: 1 });
      }
    }
  }
  const colors = [...seen.values()];
  colorCache = { at: Date.now(), colors };
  return colors;
}

export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const [sizeCodes, colors] = await Promise.all([
    beApi.get<BeSizeCode[]>("/co/sy/code", { codeGrps: "SIZE_INFO_CD" }).catch((e: unknown) => {
      logger.warn("[api]", url, "사이즈 코드 조회 실패, 빈 목록으로 진행:", (e as Error)?.message);
      return [] as BeSizeCode[];
    }),
    loadRealColorOptions(),
  ]);
  const sizes: PdOptionType[] = sizeCodes.map((c) => ({ optionId: c.codeId, optionCode: c.codeValue, optionNm: c.codeLabel, optionType: "SIZE", optionLevel: 1 }));

  const out = [...colors, ...sizes];
  logger.info("[api] ◀", method, url, "list size=" + out.length, `(색상 실측 ${colors.length}건, 표본 ${SAMPLE_SIZE}개 상품)`);
  return out;
});
