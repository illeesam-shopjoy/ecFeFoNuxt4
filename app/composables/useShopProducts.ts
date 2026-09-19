/**
 * useShopProducts.ts — /shop 페이지 전용 서버 페이징/멀티선택 필터 상태.
 *
 * 2026-09-13(요청사항: "상품이 10000개가 될수도 있기에 페이징 api 조회 해야해" +
 * "하단은 페이징을두지말고 더보기 자동 스크롤로 해줘" +
 * "좌측 항목은 가급적 멀티 선택할 수 있도록 해줘 항목마다 토글이지") —
 * 전체 상품을 한 번에 받아 클라이언트에서 .filter() 하던 옛 useProductsStore 는 제거됐고
 * (2026-09-20), 이 컴포저블이 /shop 전용 "서버가 페이지 단위로 내려주는" 상태를 갖는다.
 *
 * 카테고리/브랜드/사이즈는 전부 배열(멀티선택, 토글)로 관리하고 ecBeBo(2026-09-13 확장
 * — categoryIds/brandIds/sizeInfoCds IN 조건)에 그대로 넘겨 진짜 서버에서 필터링된다.
 * 가격범위도 이제 서버(priceMin/priceMax)로 넘어간다. 색상(optionColors)만 ecBeBo에
 * 옵션 테이블 조인 필터가 아직 없어 "지금까지 불러온 페이지 안에서만" 보조로 걸러준다
 * (전체 카탈로그 기준 아님 — 색상은 서버 필터 추가 전까지 이 한계를 안고 감).
 */
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { pdProductSvc, type PdProductPageParams, type PdProductPagedResult } from "~/svc/fo/ec/pd/pdProductSvc";
import { axiosSsr } from "~/utils/axiosSsr";
import { type PdProductType } from "~/types/pdProductType";

const PAGE_SIZE = 12;

/**
 * 상품 목록 조회. /shop 은 SEO 단위화면이라 **서버 렌더링(SSR)일 때만** server/api(같은 Lambda 안 내부 호출, axiosSsr)를 거치고,
 * 브라우저(필터 변경·더보기)는 svc 로 ecBeBo 를 직접 호출한다.
 * server/api 는 배열 파라미터를 콤마 문자열로 받는다(server/api/fo/ec/pd/prod/page.get.ts).
 */
function fetchProducts(params: PdProductPageParams): Promise<PdProductPagedResult> {
  if (!import.meta.server) return pdProductSvc.getPaged(params);
  const q: Record<string, string | number> = { pageNo: params.pageNo, pageSize: params.pageSize ?? 12 };
  if (params.categoryIds?.length) q.categoryIds = params.categoryIds.join(",");
  if (params.brandIds?.length) q.brandIds = params.brandIds.join(",");
  if (params.sizeCds?.length) q.sizeCds = params.sizeCds.join(",");
  if (params.priceMin != null) q.priceMin = params.priceMin;
  if (params.priceMax != null) q.priceMax = params.priceMax;
  if (params.sort) q.sort = params.sort;
  if (params.keyword) q.keyword = params.keyword;
  return axiosSsr.get<PdProductPagedResult>("/api/fo/ec/pd/prod/page", { params: q }).then((r) => r.data);
}

function toggleIn(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function useShopProducts(initialKeyword = "") {
  const categoryIds = ref<string[]>([]);
  const brandIds = ref<string[]>([]);
  const sizeCds = ref<string[]>([]);
  const sort = ref(""); // "" = 기본(등록일 최신순)
  const keyword = ref(initialKeyword);
  const priceRange = ref<[number, number]>([0, 500000]);

  // 색상만 서버 필터가 없어 클라이언트 보조필터로 남김(위 주석 참조)
  const colorFilter = ref("");

  function buildParams(pageNo: number) {
    const params: Parameters<typeof pdProductSvc.getPaged>[0] = { pageNo, pageSize: PAGE_SIZE };
    if (categoryIds.value.length) params.categoryIds = categoryIds.value;
    if (brandIds.value.length) params.brandIds = brandIds.value;
    if (sizeCds.value.length) params.sizeCds = sizeCds.value;
    if (priceRange.value[0] > 0) params.priceMin = priceRange.value[0];
    if (priceRange.value[1] < 500000) params.priceMax = priceRange.value[1];
    if (sort.value) params.sort = sort.value;
    if (keyword.value) params.keyword = keyword.value;
    return params;
  }

  // 페이지 1(=필터 변경 시 리셋)은 useAsyncData로 — SSR도 이 결과를 그대로 받아 SEO 유지.
  // 2026-09-13 버그수정: "사이즈 XS만 여러번 클릭하니 화면 깜빡임" — useAsyncData의 watch
  // 옵션은 값이 바뀔 때마다 즉시 재조회해서, 토글을 빠르게 연타하면 "선택→해제→선택..."마다
  // 매번 다른 결과가 화면에 그대로 반영돼 깜빡이는 것처럼 보였다(데이터 자체는 매번 맞는
  // 응답이라 빈 화면 버그와는 다른 원인). watch는 빼고, 아래에서 300ms 디바운스로 직접
  // refresh()를 호출해 — 연타 중엔 재조회 자체를 미루고, 클릭을 멈춘 뒤의 "최종 상태" 한 번만
  // 서버에 물어보게 한다.
  const {
    data: firstPage,
    pending,
    refresh,
  } = useAsyncData<PdProductPagedResult>("shop-products-paged", () => fetchProducts(buildParams(1)));

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  watch(
    [categoryIds, brandIds, sizeCds, sort, keyword, priceRange],
    () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        refresh();
      }, 300);
    },
    { deep: true }
  );
  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  // 무한스크롤로 이어붙일 2페이지 이후 항목만 별도 보관 — 1페이지는 useAsyncData의 data ref
  // (firstPage)를 computed로 그대로 합쳐 쓴다.
  //
  // 2026-09-14 버그수정(오늘 요청한 작업(필터 변경 애니메이션)을 검증하다가 발견 — 요청과는
  // 별개지만 같은 파일이라 함께 고침): 원래는 "watch(firstPage, v => { items.value = v.items })"
  // 처럼 별도 items ref에 옮겨 담는 방식이었는데, SSR에서는 onServerPrefetch가 firstPage.value를
  // 채운 뒤 render()가 호출되기 전에 그 watch 콜백이 반드시 다시 실행된다는 보장이 없다(Vue
  // 워처는 기본적으로 pre-flush라 SSR의 단일 렌더 패스 안에서 다시 실행되지 않을 수 있음).
  // 실제로 확인해보니 /shop 최초 SSR HTML에 상품이 항상 0개로 나가고 있었다 — 검색엔진
  // 크롤러 입장에서는 빈 목록만 보이는 셈이라, /shop을 SSR로 둔 이유(SEO) 자체가 무색해지는
  // 상황이었다. 브라우저로 볼 땐 하이드레이션 직후 같은 watch가 클라이언트에서 정상
  // 재실행돼 눈 깜짝할 사이에 채워져 아무도 못 알아챘을 뿐이다.
  // computed는 "읽는 시점"의 firstPage.value를 그대로 읽어오므로(watch처럼 별도로 다시
  // 실행되길 기다릴 필요가 없음) 이 타이밍 문제가 없다 — SSR render() 시점에 firstPage.value는
  // 이미 채워져 있으므로 바로 정확한 값이 나간다.
  const extraItems = ref<PdProductType[]>([]);
  const pageNo = ref(1);
  const loadingMore = ref(false);
  const extraHasMore = ref<boolean | null>(null); // loadMore로 알아낸 마지막 페이지 기준 hasMore

  // 필터가 바뀌어 firstPage 자체가 새로 오면(=1페이지 재조회), 이어붙여뒀던 다음 페이지들은 버린다.
  watch(firstPage, () => {
    extraItems.value = [];
    pageNo.value = 1;
    extraHasMore.value = null;
  });

  const items = computed<PdProductType[]>(() => [...(firstPage.value?.items ?? []), ...extraItems.value]);
  const totalCount = computed(() => firstPage.value?.pageTotalCount ?? 0);
  const hasMore = computed(() => extraHasMore.value ?? firstPage.value?.hasMore ?? true);

  async function loadMore() {
    if (loadingMore.value || pending.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
      const next = pageNo.value + 1;
      const res = await pdProductSvc.getPaged(buildParams(next)); // 더보기는 브라우저 전용 — svc 직접 호출
      extraItems.value = [...extraItems.value, ...res.items];
      pageNo.value = next;
      extraHasMore.value = res.hasMore;
    } catch (err) {
      console.error("[useShopProducts] 더보기 로드 실패:", err);
    } finally {
      loadingMore.value = false;
    }
  }

  // 사이드바 색상 스와치 — 지금까지 불러온 상품의 옵션 색상(색상 필터 적용 전 기준이라 선택해도 목록이 줄지 않는다).
  const allColors = computed(() => {
    const codes = new Set<string>();
    items.value.forEach((p) => p.optionColors?.forEach((o) => codes.add(o.optionCode ?? String(o.optionId))));
    return Array.from(codes);
  });

  // 색상만 클라이언트 보조필터 적용(위 주석 참조) — 나머지는 전부 서버에서 이미 걸러져 온 결과.
  const displayItems = computed(() => {
    if (!colorFilter.value) return items.value;
    return items.value.filter((p) => p.optionColors?.some((o) => (o.optionCode ?? String(o.optionId)) === colorFilter.value));
  });

  function toggleCategory(id: string) {
    categoryIds.value = toggleIn(categoryIds.value, id);
  }
  function toggleBrand(id: string) {
    brandIds.value = toggleIn(brandIds.value, id);
  }
  function toggleSize(code: string) {
    sizeCds.value = toggleIn(sizeCds.value, code);
  }
  function setColor(code: string) {
    colorFilter.value = colorFilter.value === code ? "" : code;
  }
  function setKeyword(kw: string) {
    keyword.value = kw;
  }
  function setSort(s: string) {
    sort.value = s;
  }
  function resetCategory() {
    categoryIds.value = [];
  }
  function resetBrand() {
    brandIds.value = [];
  }
  function resetSize() {
    sizeCds.value = [];
  }
  function resetPrice() {
    priceRange.value = [0, 500000];
  }
  function resetColor() {
    colorFilter.value = "";
  }
  function resetAll() {
    categoryIds.value = [];
    brandIds.value = [];
    sizeCds.value = [];
    sort.value = "";
    keyword.value = "";
    priceRange.value = [0, 500000];
    colorFilter.value = "";
  }

  return {
    // 필터 상태(전부 배열=멀티선택, 토글)
    categoryIds,
    brandIds,
    sizeCds,
    sort,
    keyword,
    priceRange,
    colorFilter,
    // 액션
    toggleCategory,
    toggleBrand,
    toggleSize,
    setColor,
    setKeyword,
    setSort,
    resetCategory,
    resetBrand,
    resetSize,
    resetPrice,
    resetColor,
    resetAll,
    refresh,
    loadMore,
    // 결과
    items: displayItems,
    allColors,
    rawCount: computed(() => items.value.length),
    totalCount,
    hasMore,
    pending,
    loadingMore,
  };
}
