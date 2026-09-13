/**
 * useShopProducts.ts — /shop 페이지 전용 서버 페이징/멀티선택 필터 상태.
 *
 * 2026-09-13(요청사항: "상품이 10000개가 될수도 있기에 페이징 api 조회 해야해" +
 * "하단은 페이징을두지말고 더보기 자동 스크롤로 해줘" +
 * "좌측 항목은 가급적 멀티 선택할 수 있도록 해줘 항목마다 토글이지") —
 * 기존 useProductsStore(전체 상품을 한 번에 불러와 클라이언트에서 .filter())는 홈 화면
 * 인기상품/베스트/장바구니 등 다른 여러 화면이 그대로 기대고 있어 건드리지 않고,
 * 이 컴포저블은 /shop 전용 "서버가 페이지 단위로 내려주는" 별도 상태를 갖는다.
 *
 * 카테고리/브랜드/사이즈는 전부 배열(멀티선택, 토글)로 관리하고 ecBeBo(2026-09-13 확장
 * — categoryIds/brandIds/sizeInfoCds IN 조건)에 그대로 넘겨 진짜 서버에서 필터링된다.
 * 가격범위도 이제 서버(priceMin/priceMax)로 넘어간다. 색상(optionColors)만 ecBeBo에
 * 옵션 테이블 조인 필터가 아직 없어 "지금까지 불러온 페이지 안에서만" 보조로 걸러준다
 * (전체 카탈로그 기준 아님 — 색상은 서버 필터 추가 전까지 이 한계를 안고 감).
 */
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { pdProductSvc, type PdProductPagedResult } from "~/svc/fo/ec/pd/pdProductSvc";
import { type PdProductType } from "~/types/pdProductType";

const PAGE_SIZE = 12;

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
  } = useAsyncData<PdProductPagedResult>("shop-products-paged", () => pdProductSvc.getPaged(buildParams(1)));

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

  // 무한스크롤로 이어붙일 누적 목록 — firstPage가 바뀌면(필터 변경) 새로 시작.
  const items = ref<PdProductType[]>([]);
  const pageNo = ref(1);
  const hasMore = ref(true);
  const totalCount = ref(0);
  const loadingMore = ref(false);

  // 2026-09-13 버그수정: "브랜드 클릭하니 화면이 백지현상" → "깜빡임 효과 안나오게 해줘" —
  // useAsyncData가 필터 변경으로 재조회를 시작하면 새 응답이 오기 전 잠깐 firstPage.value가
  // null/undefined가 되는 순간이 있는데, 그때 items를 []로 비워버려서 화면이 순간 비어
  // 보였다. v가 없을 때는(아직 응답 안 옴) 기존 items를 그대로 두고 아무것도 안 한다 —
  // 진짜 새 데이터가 도착했을 때만 교체.
  watch(
    firstPage,
    (v) => {
      if (!v) return;
      items.value = v.items;
      pageNo.value = 1;
      hasMore.value = v.hasMore;
      totalCount.value = v.pageTotalCount;
    },
    { immediate: true }
  );

  async function loadMore() {
    if (loadingMore.value || pending.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
      const next = pageNo.value + 1;
      const res = await pdProductSvc.getPaged(buildParams(next));
      items.value = [...items.value, ...res.items];
      pageNo.value = next;
      hasMore.value = res.hasMore;
      totalCount.value = res.pageTotalCount;
    } catch (err) {
      console.error("[useShopProducts] 더보기 로드 실패:", err);
    } finally {
      loadingMore.value = false;
    }
  }

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
    rawCount: computed(() => items.value.length),
    totalCount,
    hasMore,
    pending,
    loadingMore,
  };
}
