/**
 * useSeoDetail.ts — SEO 단위화면(상세)의 공통 조회 패턴.
 *
 * - 서버 렌더링(SSR): server/api 에서 **SEO 용 최소 정보만** 받는다(axiosSsr — 같은 Lambda 안 내부 호출, HTTP 없음).
 *   메타 태그·JSON-LD·첫 화면(제목/이미지/가격 등)용이고, 변하는 데이터(리뷰·재고·본문)가 없어 Netlify CDN 에 길게 캐시해도 안전하다.
 * - 브라우저(CSR): 화면이 뜬 직후 svc 로 ecBeBo 에서 **전체 정보를 직접 조회**해 최소 정보를 교체한다(server:false).
 *   클라이언트 내비게이션으로 들어온 경우엔 SEO 조회를 건너뛰고 바로 전체 조회만 한다.
 *
 * 사용: `const { item, pending, refresh, seo } = await useSeoDetail<T>(key, seoUrl, fetchFull);`
 *   item = 전체 정보(있으면) 아니면 SEO 정보 / pending = 아직 아무것도 못 받았고 전체 조회가 진행 중 /
 *   refresh = 전체 정보 재조회(등록·삭제 후 갱신용 — SSR CDN 캐시를 우회한다) / seo = 서버가 받은 SEO 정보(CDN 캐시 판단용).
 *
 * ⚠ 이 함수는 async 가 아니다 — `await` 뒤에는 Nuxt 인스턴스 컨텍스트가 사라져 useAsyncData/useRequestEvent 를 다시 부를 수 없으므로
 *   모든 컴포저블을 동기적으로 먼저 호출하고, 서버 SEO 조회 대기는 Promise 로만 돌려준다(호출부의 `await` 가 대기).
 */
import { axiosSsr } from "~/utils/axiosSsr";

export function useSeoDetail<T>(key: string, seoUrl: string | null, fetchFull: () => Promise<T | null>) {
  const seoAsync = useAsyncData<T | null>(
    `${key}:seo`,
    async () => (import.meta.server && seoUrl ? (await axiosSsr.get<T>(seoUrl)).data : null),
    { default: () => null }
  );
  const event = import.meta.server ? useRequestEvent() : undefined;

  const { data: full, status: fullStatus, refresh } = useAsyncData<T | null>(`${key}:full`, () => fetchFull().catch(() => null), { server: false, default: () => null });

  // useAsyncData 의 제네릭 반환(PickFrom)이 T 와 구조적으로 같지만 타입상 달라 캐스트한다.
  const seo = computed(() => seoAsync.data.value as T | null);
  const item = computed(() => (full.value ?? seo.value) as T | null);
  const pending = computed(() => !item.value && fullStatus.value !== "success" && fullStatus.value !== "error");

  return seoAsync.then(() => {
    // 존재하지 않는 리소스가 200 으로 색인되지 않게 서버 렌더에서는 404 로 응답한다.
    if (event && seoAsync.error.value) setResponseStatus(event, 404);
    return { item, pending, refresh, seo };
  });
}
