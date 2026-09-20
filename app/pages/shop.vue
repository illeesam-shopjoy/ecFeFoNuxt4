<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="쇼핑" subtitle="쇼핑" />

    <!-- 스켈레톤 그리드 — 2026-09-13 버그수정: "브랜드 클릭하니 화면이 백지현상" — 필터
         클릭으로 재조회될 때도 pending이 true가 되는데, 그때마다 사이드바까지 통째로
         스켈레톤으로 바뀌어 화면이 껌뻑이는 것처럼 보였다. "처음 로딩(아직 아무 상품도
         없음)"일 때만 이 스켈레톤을 보여주고, 필터 재조회 중엔 아래 실제 화면을 그대로
         유지한 채 목록 부분만 살짝 옅게 표시한다(loadingOverlay). -->
    <!-- 2026-09-14(요청사항: "상품항목 반응형으로 20% 늘어나면 좋겠어") — 전체 영역
         너비를 max-w-7xl(1280px)에서 max-w-screen-2xl(1536px, 정확히 20% 증가)로 늘려
         사이드바/상품그리드가 반응형 비율을 그대로 유지한 채 전부 20% 커지게 함. -->
    <section v-if="isInitialLoading" class="shop__area pt-100 pb-100">
      <div class="max-w-screen-2xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-9 col-lg-9 col-md-8 offset-xl-3 offset-lg-3 offset-md-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <skeleton-card v-for="n in 9" :key="n" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 실제 쇼핑 영역 (옛 ShopArea, 사이드바 좌측) -->
    <section v-else class="shop__area pt-100 pb-100">
      <div class="max-w-screen-2xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-3 col-lg-3 col-md-4">
            <!-- 쇼핑 사이드바 (옛 ShopSidebar) -->
            <div class="shop__sidebar">
              <!-- 상품 카테고리 (2026-09-13: 멀티선택 토글) -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>상품 카테고리</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetCategoryFilter">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="categories">
                    <div class="shop-category-accordion">
                      <div class="card" v-for="(item, i) in parentCategories" :key="item.categoryId">
                        <div class="card-header white-bg">
                          <h5 class="mb-0">
                            <button
                              type="button"
                              @click="toggleAccordion(i); toggleCategory(item.categoryId)"
                              :class="['shop-accordion-btn', expandedCategory[i] ? '' : 'collapsed', categoryIds.includes(item.categoryId) ? 'active' : '']"
                              :aria-expanded="!!expandedCategory[i]"
                            >
                              {{ item.parentTitle }}
                            </button>
                          </h5>
                        </div>
                        <div class="shop-category-collapse" :class="{ show: expandedCategory[i] }">
                          <div class="card-body">
                            <div class="categories__list">
                              <ul>
                                <li v-for="child in item.children" :key="child.id">
                                  <a @click.prevent="toggleCategory(child.id)" href="#" :class="[categoryIds.includes(child.id) ? 'active' : '']">
                                    {{ child.name }}
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 가격 필터 (2026-09-13: 서버 priceMin/priceMax로 실제 전체 카탈로그 기준 필터링) -->
              <client-only>
                <div class="sidebar__widget mb-55">
                  <div class="sidebar__widget-title mb-30 flex items-center justify-between">
                    <h3>가격별 필터</h3>
                    <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetPrice">초기화</button>
                  </div>
                  <div class="sidebar__widget-content">
                    <div class="price__slider">
                      <div id="slider-range"></div>
                      <div>
                        <Slider v-model="priceRange" :tooltips="false" :max="500000" />
                        <label for="amount">가격: {{ formatPrice(priceRange[0]) }} - {{ formatPrice(priceRange[1]) }}</label>
                      </div>
                    </div>
                  </div>
                </div>
              </client-only>

              <!-- 상품 사이즈 (2026-09-13: 멀티선택 토글, ecBeBo sizeInfoCd 실 값 기준) -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-30 flex items-center justify-between">
                  <h3>사이즈</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetSize">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="size">
                    <ul>
                      <li v-for="size in SIZE_OPTIONS" :key="size" :class="`${sizeCds.includes(size) ? 'active' : ''}`">
                        <a @click.prevent="toggleSize(size)" href="#">{{ size }}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 상품 색상 -->
              <div class="sidebar__widget mb-60">
                <div class="sidebar__widget-title mb-20 flex items-center justify-between">
                  <h3>색상 선택</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetColor">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="color__pick">
                    <form>
                      <ul>
                        <li v-for="(color, i) in allColor?.slice(0, 8)" :key="color">
                          <button @click.prevent="setColor(color)" type="button" :class="`color color-${Number(i) + 1} ${colorFilter === color ? `active-${Number(i) + 1}` : ''}`"></button>
                        </li>
                      </ul>
                    </form>
                  </div>
                </div>
              </div>

              <!-- 상품 브랜드 (2026-09-13: 멀티선택 토글 + 전용 브랜드 API) -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>브랜드</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetBrand">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="brand">
                    <ul>
                      <li v-for="b in brandList" :key="b.brandId">
                        <a :class="`${brandIds.includes(b.brandId ?? '') ? 'active' : ''}`" @click.prevent="toggleBrand(b.brandId ?? '')" href="#">
                          {{ b.brandNm }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 전체 초기화 버튼 -->
              <div class="reset-button mt-20 mb-30">
                <button class="os-btn os-btn-black" @click="resetAllFilters">전체 초기화</button>
              </div>

              <!-- 추천 상품 -->
              <div class="sidebar__widget">
                <div class="sidebar__widget-title mb-30">
                  <h3>추천 상품</h3>
                </div>
                <div class="sidebar__widget-content">
                  <div class="features__product">
                    <ul>
                      <li v-for="(item, i) in featuredProducts" :key="i" class="mb-20">
                        <div class="featires__product-wrapper d-flex">
                          <div class="features__product-thumb mr-15">
                            <nuxt-link :to="`/prod-dtl/${item.prodId}`">
                              <app-image :src="item.img" alt="pro-sm-1" :img-style="{ width: '86px', height: '110px', objectFit: 'cover' }" :skeleton-style="{ width: '86px', height: '110px' }" />
                            </nuxt-link>
                          </div>
                          <div class="features__product-content">
                            <h5>
                              <nuxt-link :to="`/prod-dtl/${item.prodId}`">
                                <span v-html="item.prodNm"></span>
                              </nuxt-link>
                            </h5>
                            <div class="price">
                              <span>{{ formatPrice(item.salePrice) }}</span>
                              <span v-if="item.stdPrice" class="old-price">
                                <del>{{ formatPrice(item.stdPrice) }}</del>
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-9 col-lg-9 col-md-8">
            <div class="shop__content-area">
              <div class="shop__header flex flex-wrap justify-between items-center mb-40">
                <div class="shop__header-left">
                  <div class="show-text">
                    <span>전체 {{ totalCount }}개 중 {{ rawCount }}개 표시</span>
                  </div>
                </div>
                <div class="shop__header-right flex items-center justify-between sm:justify-end">
                  <!-- 2026-09-13: 정렬은 ecBeBo가 지원하는 컬럼(prodNm/regDate/salePrice)만 -->
                  <div class="sort-wrapper mr-30 pr-25 relative">
                    <select :value="sort" @change="setSort(($event.target as HTMLSelectElement).value)">
                      <option value="">기본 정렬(최신순)</option>
                      <option value="prodNm asc">이름순</option>
                      <option value="salePrice asc">가격 낮은순</option>
                      <option value="salePrice desc">가격 높은순</option>
                    </select>
                  </div>
                  <!-- 2026-09-13(요청사항: "아이콘 좀 기네 정사각형으로") — 버튼이 아이콘
                       폭에 따라 늘어나 보여서 width/height를 고정해 정사각형으로 만듦. -->
                  <ul class="flex items-center gap-2" role="tablist">
                    <li>
                      <button type="button" :class="['w-9 h-9 p-0 rounded flex items-center justify-center', viewMode === 'grid' ? 'bg-theme text-white' : 'bg-gray-200']" @click="viewMode = 'grid'" aria-label="그리드 보기"><i class="fas fa-th"></i></button>
                    </li>
                    <li>
                      <button type="button" :class="['w-9 h-9 p-0 rounded flex items-center justify-center', viewMode === 'list' ? 'bg-theme text-white' : 'bg-gray-200']" @click="viewMode = 'list'" aria-label="목록 보기"><i class="fas fa-list-ul"></i></button>
                    </li>
                  </ul>
                </div>
              </div>
              <!-- 2026-09-13(요청사항: "카드형/목록형 클릭하면 애니메이션 효과") — v-show 대신
                   Transition+v-if로 바꿔 전환 시 살짝 페이드되게 한다. -->
              <!-- 2026-09-14(요청사항: "필터에 따라 우측 목록 다시 보여줄때 반짝하여 보여주는것보다
                   약간의 애니메이션 효과 넣어주면 좋겠어") — 바깥 Transition은 그리드/목록형 전환용,
                   안쪽 TransitionGroup은 필터가 바뀌어 items 배열이 통째로 다른 상품으로 교체될 때
                   쓰인다. 필터가 바뀌면 대부분 상품ID(:key)가 이전 목록과 겹치지 않으므로 Vue가
                   기존 카드는 자동으로 제거(leave)하고 새 카드는 추가(enter)로 처리해 —
                   TransitionGroup이 그 각각에 product-fade 트랜지션(살짝 fade+이동)을 입혀준다. -->
              <div id="pills-tabContent">
                <Transition name="view-fade" mode="out-in">
                  <TransitionGroup v-if="viewMode === 'grid'" key="grid" tag="div" id="pills-grid" role="tabpanel" name="product-fade">
                    <product-item v-for="item in displayItems" :key="item.prodId" :item="item" />
                  </TransitionGroup>
                  <TransitionGroup v-else key="list" tag="div" id="pills-list" role="tabpanel" name="product-fade">
                    <product-list-item v-for="item in displayItems" :key="item.prodId" :item="item" />
                  </TransitionGroup>
                </Transition>
                <p v-if="!pending && !displayItems.length" class="text-center py-40 text-gray-400">조건에 맞는 상품이 없습니다.</p>
              </div>

              <!-- 2026-09-13(요청사항: "하단은 페이징을두지말고 더보기 자동 스크롤로 해줘") —
                   숫자 페이지네이션 대신 이 센티넬이 화면에 보이면 자동으로 다음 페이지를 불러온다. -->
              <!-- 2026-09-14(요청사항: "하단에 더보기 버튼 추가해줘") — 자동 스크롤 로딩은
                   그대로 두되, 스크롤이 아직 센티넬까지 닿지 않았거나 자동 로딩을 못 미더워하는
                   사용자를 위해 눌러서도 다음 페이지를 부를 수 있는 버튼을 추가. -->
              <div ref="loadMoreSentinel" class="shop__load-more-area mt-40 text-center">
                <span v-if="loadingMore" class="text-gray-400">불러오는 중…</span>
                <button
                  v-else-if="hasMore && displayItems.length"
                  type="button"
                  class="os-btn os-btn-black"
                  @click="loadMore"
                >
                  더보기
                </button>
                <span v-else-if="displayItems.length" class="text-gray-300 text-sm">마지막 상품입니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import SkeletonCard from "~/components/ui/SkeletonCard.vue";
import ProductItem from "~/components/products/ProductItem.vue";
import ProductListItem from "~/components/products/ProductListItem.vue";
import AppImage from "~/components/ui/AppImage.vue";
import Slider from "@vueform/slider";
import "@vueform/slider/themes/default.css";
import { pdCategorySvc, type CategoryTreeResponse } from "~/svc/fo/ec/pd/pdCategorySvc";
import { syBrandSvc } from "~/svc/fo/ec/sy/syBrandSvc";
import { pdProductSvc, type PdProductPageParams, type PdProductPagedResult } from "~/svc/fo/ec/pd/pdProductSvc";
import { axiosSsr } from "~/utils/axiosSsr";
import { type PdProductType } from "~/types/pdProductType";
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";

import { usePageTitle } from "~/composables/usePageTitle";
useSeoMeta({
  title: "쇼핑 | Outstock",
  ogTitle: "쇼핑 | Outstock",
  description: "다양한 상품을 쇼핑하세요.",
});
usePageTitle("쇼핑");

// 2026-09-13 추가: 헤더 검색(SearchModal)에서 /shop?q=검색어 로 넘어왔을 때 적용.
const route = useRoute();
const initialQuery = typeof route.query.q === "string" ? route.query.q : "";

// ── 쇼핑 영역 — 2026-09-13(요청사항: "10000개가 될수도 있기에 페이징 api 조회 해야해") ──
// 서버 페이징/멀티선택 필터(전체 상품 클라이언트 필터링 X). 2026-09-20: 이 화면에서만 쓰는 useShopProducts 컴포저블을 이 파일로 병합했다.
// 카테고리/브랜드/사이즈는 전부 배열(멀티선택, 토글)로 ecBeBo(categoryIds/brandIds/sizeInfoCds IN 조건)에 넘겨 서버에서 필터링하고,
// 가격범위도 서버(priceMin/priceMax)로 넘긴다. 색상(optionColors)만 옵션 테이블 조인 필터가 없어 "지금까지 불러온 페이지 안에서만" 보조로 거른다.
const PAGE_SIZE = 12;
const { formatPrice } = usePrice();

/**
 * 상품 목록 조회. /shop 은 SEO 단위화면이라 **서버 렌더링(SSR)의 첫 페이지만** server/api(같은 Lambda 안 내부 호출, axiosSsr)를 거쳐
 * 검색엔진이 상품 링크·이름을 HTML 로 읽게 하고, 브라우저(필터 변경·더보기·클라이언트 내비게이션)는 svc 로 ecBeBo 를 직접 호출한다.
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
const toggleIn = (arr: string[], value: string): string[] => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

// 필터 상태(전부 배열=멀티선택, 토글)
const categoryIds = ref<string[]>([]);
const brandIds = ref<string[]>([]);
const sizeCds = ref<string[]>([]);
const sort = ref(""); // "" = 기본(등록일 최신순)
const keyword = ref(initialQuery);
const priceRange = ref<[number, number]>([0, 500000]);
const colorFilter = ref(""); // 색상만 서버 필터가 없어 클라이언트 보조필터로 남김

const viewMode = ref<"grid" | "list">("grid");

// 2026-09-13(요청사항: "브랜드 클릭하니 화면이 백지현상" → "깜빡임 효과 안나오게 해줘") —
// 필터 재조회 중(pending)에도 이미 보여주고 있던 목록은 그대로 유지하고(useAsyncData가
// 알아서 유지해줌), 스켈레톤 전체화면 전환은 "정말 처음이라 아직 아무 상품도 없을 때"만.
const isInitialLoading = computed(() => pending.value && displayItems.value.length === 0);

// 2026-09-13: ecBeBo sizeInfoCd 실 enum 값(자유 텍스트가 아니라 고정 코드) — 상품 옵션(SKU)
// 스캔이 아니라 상품 자체 필드라 서버에서 바로 IN 필터링된다.
const SIZE_OPTIONS = ["FREE", "XS", "S", "M", "L", "XL"];

// ── 사이드바: 상품 카테고리 (옛 ProductCategory) ─────────────────────────────
const { data: catData } = useAsyncData<CategoryTreeResponse>(
  "category-tree",
  () => pdCategorySvc.getCategoryTree(),
  // 2026-09-19: server:false — 사이드바는 SEO 대상이 아닌데 서버 렌더가 이걸 기다리면(특히 Netlify→NAS WAN) 페이지 응답이 그만큼 늦어진다.
  //   브라우저에서 불러오며 응답은 CDN 캐시(server/utils/cdnCache.ts)를 탄다.
  { default: () => ({ categoryTree: [], categoryIdToName: {}, categoryIdToDescendants: {} }), lazy: true, server: false }
);

// 사이드바에서 고른 카테고리를 하위 카테고리까지 확장해서 조회한다 — 백엔드 categoryIds 필터는 정확히 일치만 지원하고 상품은 최하위 카테고리에 속하기 때문.
const expandCategoryIds = (ids: string[]): string[] => {
  const map = catData.value?.categoryIdToDescendants ?? {};
  return [...new Set(ids.flatMap((id) => map[id] ?? [id]))];
};

function buildParams(pageNo: number) {
  const params: PdProductPageParams = { pageNo, pageSize: PAGE_SIZE };
  if (categoryIds.value.length) params.categoryIds = expandCategoryIds(categoryIds.value);
  if (brandIds.value.length) params.brandIds = brandIds.value;
  if (sizeCds.value.length) params.sizeCds = sizeCds.value;
  if (priceRange.value[0] > 0) params.priceMin = priceRange.value[0];
  if (priceRange.value[1] < 500000) params.priceMax = priceRange.value[1];
  if (sort.value) params.sort = sort.value;
  if (keyword.value) params.keyword = keyword.value;
  return params;
}

// 페이지 1(=필터 변경 시 리셋)은 useAsyncData로 — SSR도 이 결과를 그대로 받아 SEO 유지.
// 2026-09-13 버그수정: "사이즈 XS만 여러번 클릭하니 화면 깜빡임" — useAsyncData 의 watch 옵션은 값이 바뀔 때마다 즉시 재조회해서
// 토글 연타 시 매번 다른 결과가 화면에 반영돼 깜빡였다. watch 는 빼고 아래에서 300ms 디바운스로 직접 refresh() 를 호출해,
// 클릭을 멈춘 뒤의 "최종 상태" 한 번만 서버에 물어본다.
const { data: firstPage, pending, refresh } = useAsyncData<PdProductPagedResult>("shop-products-paged", () => fetchProducts(buildParams(1)));

// 서버 렌더의 첫 페이지 조회가 일시적으로 실패하면(Ohio→NAS 콜드 지연 등) firstPage 가 비어 하이드레이션되고 클라이언트는 다시 조회하지 않는다
// — 화면이 뜬 뒤 비어 있으면 브라우저가 ecBeBo 에서 1페이지를 직접 다시 가져온다.
onMounted(() => {
  if (!firstPage.value) refresh();
});

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

// 무한스크롤로 이어붙일 2페이지 이후 항목만 별도 보관 — 1페이지는 useAsyncData 의 data ref(firstPage)를 computed 로 그대로 합쳐 쓴다.
// 2026-09-14 버그수정: 예전엔 watch(firstPage) 로 별도 items ref 에 옮겨 담았는데 SSR 단일 렌더 패스에선 그 watch 가 다시 실행된다는
// 보장이 없어 /shop 최초 SSR HTML 에 상품이 0개로 나갔다(SEO 무의미). computed 는 읽는 시점의 firstPage.value 를 그대로 읽어 이 문제가 없다.
const extraItems = ref<PdProductType[]>([]);
const pageNo = ref(1);
const loadingMore = ref(false);
const extraHasMore = ref<boolean | null>(null); // loadMore 로 알아낸 마지막 페이지 기준 hasMore

// 필터가 바뀌어 firstPage 자체가 새로 오면(=1페이지 재조회), 이어붙여뒀던 다음 페이지들은 버린다.
watch(firstPage, () => {
  extraItems.value = [];
  pageNo.value = 1;
  extraHasMore.value = null;
});

const items = computed<PdProductType[]>(() => [...(firstPage.value?.items ?? []), ...extraItems.value]);
const totalCount = computed(() => firstPage.value?.pageTotalCount ?? 0);
const rawCount = computed(() => items.value.length);
const hasMore = computed(() => extraHasMore.value ?? firstPage.value?.hasMore ?? true);

async function loadMore() {
  if (loadingMore.value || pending.value || !firstPage.value || !hasMore.value) return; // 1페이지가 아직 없으면 2페이지부터 붙이지 않는다
  loadingMore.value = true;
  try {
    const next = pageNo.value + 1;
    const res = await pdProductSvc.getPaged(buildParams(next));
    extraItems.value = [...extraItems.value, ...res.items];
    pageNo.value = next;
    extraHasMore.value = res.hasMore;
  } catch (err) {
    console.error("[shop] 더보기 로드 실패:", err);
  } finally {
    loadingMore.value = false;
  }
}

// 사이드바 색상 스와치 — 지금까지 불러온 상품의 옵션 색상(색상 필터 적용 전 기준이라 선택해도 목록이 줄지 않는다).
const allColor = computed(() => {
  const codes = new Set<string>();
  items.value.forEach((p) => p.optionColors?.forEach((o) => codes.add(o.optionCode ?? String(o.optionId))));
  return Array.from(codes);
});

// 색상만 클라이언트 보조필터 적용 — 나머지는 전부 서버에서 이미 걸러져 온 결과.
const displayItems = computed(() => {
  if (!colorFilter.value) return items.value;
  return items.value.filter((p) => p.optionColors?.some((o) => (o.optionCode ?? String(o.optionId)) === colorFilter.value));
});

const toggleCategory = (id: string) => (categoryIds.value = toggleIn(categoryIds.value, id));
const toggleBrand = (id: string) => (brandIds.value = toggleIn(brandIds.value, id));
const toggleSize = (code: string) => (sizeCds.value = toggleIn(sizeCds.value, code));
const setColor = (code: string) => (colorFilter.value = colorFilter.value === code ? "" : code);
const setSort = (v: string) => (sort.value = v);
const resetCategory = () => (categoryIds.value = []);
const resetBrand = () => (brandIds.value = []);
const resetSize = () => (sizeCds.value = []);
const resetPrice = () => (priceRange.value = [0, 500000]);
const resetColor = () => (colorFilter.value = "");
function resetAll() {
  categoryIds.value = [];
  brandIds.value = [];
  sizeCds.value = [];
  sort.value = "";
  keyword.value = "";
  priceRange.value = [0, 500000];
  colorFilter.value = "";
}

const parentCategories = computed(() => {
  const seen = new Set<string>();
  return (catData.value?.categoryTree ?? []).filter((arr) => {
    if (seen.has(arr.parentTitle)) return false;
    seen.add(arr.parentTitle);
    return true;
  });
});

const expandedCategory = reactive<Record<number, boolean>>({});
function toggleAccordion(i: number) {
  expandedCategory[i] = !expandedCategory[i];
}

// 2026-09-13 버그수정: "초기화 버튼 클릭했는데 텍스트가 선택처럼 보이네" — .shop-accordion-btn은
// 원래 "아코디언 펼침" 표시용으로 펼쳐진 상태면 테마색(주황)이 된다(선택 표시가 아님). 근데
// 초기화를 눌러도 펼쳐진 아코디언은 그대로 남아있어서, 실제로는 아무 카테고리도 선택 안 됐는데
// 펼쳐져 있던 부모들만 주황색으로 남아 "선택된 것처럼" 보였다 — 초기화 시 아코디언도 다 접는다.
function resetCategoryFilter() {
  resetCategory();
  Object.keys(expandedCategory).forEach((k) => delete expandedCategory[Number(k)]);
}
function resetAllFilters() {
  resetAll();
  Object.keys(expandedCategory).forEach((k) => delete expandedCategory[Number(k)]);
}

// ── 사이드바: 브랜드 — 2026-09-13: store.products 스캔 대신 전용 API(캐시됨) ─────────
const { data: brandList } = useAsyncData(
  "shop-brand-list",
  () => syBrandSvc.getBrands(),
  // 2026-09-19: server:false — 브랜드 목록은 상품 1000건을 받아 가공하는 무거운 호출이라(운영 SSR 11초의 주범) 서버 렌더에서 뺀다.
  { default: () => [], lazy: true, server: false }
);

// ── 사이드바: 상품 색상 — 지금까지 불러온 상품의 옵션값(색상은 ecBeBo 서버 필터가 아직 없음) ──

// ── 사이드바: 추천 상품 — 최신 상품 24개 중 베스트 2개, 없으면 최신 2개(백엔드에 isBest 서버 필터 없음) ──
const latestProducts = useLatestProducts();
const featuredProducts = computed(() => {
  const best = latestProducts.value.filter((p) => p.isBest);
  return (best.length ? best : latestProducts.value).slice(0, 2);
});

// ── 더보기 자동 스크롤(IntersectionObserver) ─────────────────────────────
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
onMounted(() => {
  if (typeof IntersectionObserver === "undefined" || !loadMoreSentinel.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "200px" }
  );
  observer.observe(loadMoreSentinel.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
/* 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — filter-reset-link/
   view-toggle-btn은 Tailwind로 대체. 아래 view-fade/product-fade transition만 Transition/
   TransitionGroup의 name prop과 이름이 묶여 있어 남겨둠(Tailwind로 표현 불가). */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease;
}
.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}

/* 2026-09-14(요청사항: "필터에 따라 우측 목록 다시 보여줄때 반짝하여 보여주는것보다
   약간의 애니메이션 효과 넣어주면 좋겠어") — 필터 변경으로 상품 카드가 통째로 교체될 때
   개별 카드가 살짝 fade+이동하며 사라졌다/나타나게. */
.product-fade-enter-active,
.product-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.product-fade-enter-from,
.product-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
