/**
 * useCacheProducts.ts — 홈/위젯용 "최신 상품 N개" 조회 (페이징 API 1페이지).
 *
 * 예전에는 전역 useProductsStore 가 앱 시작 때 전체 카탈로그(최대 1000건, 실측 15초+)를 받아
 * 각 위젯이 .filter() 로 필요한 몇 개만 골라 썼다. 이제 각 화면이 필요한 만큼만 직접 조회한다.
 *
 * - 같은 size 로 호출하는 위젯끼리는 useAsyncData key 가 같아 요청 1회를 공유한다.
 * - lazy: 화면 진입을 막지 않고 도착하는 대로 채운다(브라우저→Netlify→NAS 왕복을 렌더 경로에서 제외).
 */
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { type PdProductType } from "~/types/pdProductType";

export function useCacheProducts(size = 24) {
  const { data } = useAsyncData<PdProductType[]>(`pd-latest-${size}`, () => pdProductSvc.getPaged({ pageNo: 1, pageSize: size }).then((r) => r.items), {
    default: () => [],
    lazy: true,
    server: false, // 보조 위젯 — SEO 서버 렌더(/shop 사이드바 등)에서는 뺀다
  });
  return data as Ref<PdProductType[]>;
}
