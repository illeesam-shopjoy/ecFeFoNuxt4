<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="쇼핑" subtitle="쇼핑" :compact="true" />

    <!-- 스켈레톤 그리드 (SSR 로딩 중) -->
    <section v-if="shopProducts.pending.value" class="shop__area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
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
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-3 col-lg-3 col-md-4">
            <!-- 쇼핑 사이드바 (옛 ShopSidebar) -->
            <div class="shop__sidebar">
              <!-- 상품 카테고리 (2026-09-13: 멀티선택 토글) -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>상품 카테고리</h3>
                  <button type="button" class="filter-reset-link" @click="shopProducts.resetCategory">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="categories">
                    <div class="shop-category-accordion">
                      <div class="card" v-for="(item, i) in parentCategories" :key="item.categoryId">
                        <div class="card-header white-bg">
                          <h5 class="mb-0">
                            <button
                              type="button"
                              @click="toggleAccordion(i); shopProducts.toggleCategory(item.categoryId)"
                              :class="['shop-accordion-btn', expandedCategory[i] ? '' : 'collapsed', shopProducts.categoryIds.value.includes(item.categoryId) ? 'active' : '']"
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
                                  <a @click.prevent="shopProducts.toggleCategory(child.id)" href="#" :class="[shopProducts.categoryIds.value.includes(child.id) ? 'active' : '']">
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
                    <button type="button" class="filter-reset-link" @click="shopProducts.resetPrice">초기화</button>
                  </div>
                  <div class="sidebar__widget-content">
                    <div class="price__slider">
                      <div id="slider-range"></div>
                      <div>
                        <Slider v-model="shopProducts.priceRange.value" :tooltips="false" :max="500000" />
                        <label for="amount">가격: {{ formatPrice(shopProducts.priceRange.value[0]) }} - {{ formatPrice(shopProducts.priceRange.value[1]) }}</label>
                      </div>
                    </div>
                  </div>
                </div>
              </client-only>

              <!-- 상품 사이즈 (2026-09-13: 멀티선택 토글, ecBeBo sizeInfoCd 실 값 기준) -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-30 flex items-center justify-between">
                  <h3>사이즈</h3>
                  <button type="button" class="filter-reset-link" @click="shopProducts.resetSize">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="size">
                    <ul>
                      <li v-for="size in SIZE_OPTIONS" :key="size" :class="`${shopProducts.sizeCds.value.includes(size) ? 'active' : ''}`">
                        <a @click.prevent="shopProducts.toggleSize(size)" href="#">{{ size }}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 상품 색상 -->
              <div class="sidebar__widget mb-60">
                <div class="sidebar__widget-title mb-20 flex items-center justify-between">
                  <h3>색상 선택</h3>
                  <button type="button" class="filter-reset-link" @click="shopProducts.resetColor">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="color__pick">
                    <form>
                      <ul>
                        <li v-for="(color, i) in allColor?.slice(0, 8)" :key="color">
                          <button @click.prevent="shopProducts.setColor(color)" type="button" :class="`color color-${Number(i) + 1} ${shopProducts.colorFilter.value === color ? `active-${Number(i) + 1}` : ''}`"></button>
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
                  <button type="button" class="filter-reset-link" @click="shopProducts.resetBrand">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="brand">
                    <ul>
                      <li v-for="b in brandList" :key="b.brandId">
                        <a :class="`${shopProducts.brandIds.value.includes(b.brandId ?? '') ? 'active' : ''}`" @click.prevent="shopProducts.toggleBrand(b.brandId ?? '')" href="#">
                          {{ b.brandNm }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 전체 초기화 버튼 -->
              <div class="reset-button mt-20 mb-30">
                <button class="os-btn os-btn-black" @click="shopProducts.resetAll">전체 초기화</button>
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
                    <span>전체 {{ shopProducts.totalCount.value }}개 중 {{ shopProducts.rawCount.value }}개 표시</span>
                  </div>
                </div>
                <div class="shop__header-right flex items-center justify-between sm:justify-end">
                  <!-- 2026-09-13: 정렬은 ecBeBo가 지원하는 컬럼(prodNm/regDate/salePrice)만 -->
                  <div class="sort-wrapper mr-30 pr-25 relative">
                    <select :value="shopProducts.sort.value" @change="shopProducts.setSort(($event.target as HTMLSelectElement).value)">
                      <option value="">기본 정렬(최신순)</option>
                      <option value="prodNm asc">이름순</option>
                      <option value="salePrice asc">가격 낮은순</option>
                      <option value="salePrice desc">가격 높은순</option>
                    </select>
                  </div>
                  <ul class="flex items-center gap-2" role="tablist">
                    <li>
                      <button type="button" :class="['p-2 rounded', viewMode === 'grid' ? 'bg-theme text-white' : 'bg-gray-200']" @click="viewMode = 'grid'" aria-label="그리드 보기"><i class="fas fa-th"></i></button>
                    </li>
                    <li>
                      <button type="button" :class="['p-2 rounded', viewMode === 'list' ? 'bg-theme text-white' : 'bg-gray-200']" @click="viewMode = 'list'" aria-label="목록 보기"><i class="fas fa-list-ul"></i></button>
                    </li>
                  </ul>
                </div>
              </div>
              <!-- 2026-09-13(요청사항: "카드형/목록형 클릭하면 애니메이션 효과") — v-show 대신
                   Transition+v-if로 바꿔 전환 시 살짝 페이드되게 한다. -->
              <div id="pills-tabContent">
                <Transition name="view-fade" mode="out-in">
                  <div v-if="viewMode === 'grid'" key="grid" id="pills-grid" role="tabpanel">
                    <product-item v-for="item in shopProducts.items.value" :key="item.prodId" :item="item" />
                  </div>
                  <div v-else key="list" id="pills-list" role="tabpanel">
                    <product-list-item v-for="item in shopProducts.items.value" :key="item.prodId" :item="item" />
                  </div>
                </Transition>
                <p v-if="!shopProducts.pending.value && !shopProducts.items.value.length" class="text-center py-40 text-gray-400">조건에 맞는 상품이 없습니다.</p>
              </div>

              <!-- 2026-09-13(요청사항: "하단은 페이징을두지말고 더보기 자동 스크롤로 해줘") —
                   숫자 페이지네이션 대신 이 센티넬이 화면에 보이면 자동으로 다음 페이지를 불러온다. -->
              <div ref="loadMoreSentinel" class="shop__load-more-area mt-40 text-center">
                <span v-if="shopProducts.loadingMore.value" class="text-gray-400">불러오는 중…</span>
                <span v-else-if="!shopProducts.hasMore.value && shopProducts.items.value.length" class="text-gray-300 text-sm">마지막 상품입니다.</span>
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
import { useProductsStore } from "~/store/useProductsStore";
import ProductItem from "~/components/products/ProductItem.vue";
import ProductListItem from "~/components/products/ProductListItem.vue";
import AppImage from "~/components/ui/AppImage.vue";
import Slider from "@vueform/slider";
import "@vueform/slider/themes/default.css";
import { pdCategorySvc, type CategoryTreeResponse } from "~/svc/fo/ec/pd/pdCategorySvc";
import { syBrandSvc } from "~/svc/fo/ec/sy/syBrandSvc";
import { useShopProducts } from "~/composables/useShopProducts";
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";

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
// 기존 useProductsStore(전체 상품 클라이언트 필터링)를 안 쓰고, /shop 전용 서버
// 페이징/멀티선택 필터 컴포저블을 쓴다. useProductsStore는 "추천 상품" 등 다른 화면과
// 공유되는 부분에서만 계속 쓴다(app.vue의 전역 로드가 채워줌).
const shopProducts = useShopProducts(initialQuery);
const { formatPrice } = usePrice();

const viewMode = ref<"grid" | "list">("grid");

// 2026-09-13: ecBeBo sizeInfoCd 실 enum 값(자유 텍스트가 아니라 고정 코드) — 상품 옵션(SKU)
// 스캔이 아니라 상품 자체 필드라 서버에서 바로 IN 필터링된다.
const SIZE_OPTIONS = ["FREE", "XS", "S", "M", "L", "XL"];

// ── 사이드바: 상품 카테고리 (옛 ProductCategory) ─────────────────────────────
const { data: catData } = useAsyncData<CategoryTreeResponse>(
  "category-tree",
  () => pdCategorySvc.getCategoryTree(),
  { default: () => ({ categoryTree: [], categoryIdToName: {} }), lazy: true }
);

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

// ── 사이드바: 브랜드 — 2026-09-13: store.products 스캔 대신 전용 API(캐시됨) ─────────
const { data: brandList } = useAsyncData(
  "shop-brand-list",
  () => syBrandSvc.getBrands(),
  { default: () => [], lazy: true }
);

// ── 사이드바: 상품 색상 (옛 ProductColor) — useProductsStore가 채워주는 전역 상품목록에서
//    옵션값만 훑는다(색상은 ecBeBo 서버 필터가 아직 없어 이 화면 자체 필터링용 참고 목록).
const store = useProductsStore();
const allColor = computed(() => {
  const optionIds = new Set<string>();
  store.products.forEach((product) => {
    product.optionColors?.forEach((opt) => optionIds.add(opt.optionCode ?? String(opt.optionId)));
  });
  return Array.from(optionIds);
});

// ── 사이드바: 추천 상품 (옛 ProductsFeatured) ─────────────────────────────
const featuredProducts = computed(() => store.products.filter((p) => p.trending).slice(0, 2));

// ── 더보기 자동 스크롤(IntersectionObserver) ─────────────────────────────
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
onMounted(() => {
  if (typeof IntersectionObserver === "undefined" || !loadMoreSentinel.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) shopProducts.loadMore();
    },
    { rootMargin: "200px" }
  );
  observer.observe(loadMoreSentinel.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease;
}
.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}

/* 2026-09-13(요청사항: "항목별 초기화 버튼 있어야 해") */
.filter-reset-link {
  font-size: 0.78rem;
  color: #999;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.filter-reset-link:hover {
  color: var(--theme-color, #bc8246);
  text-decoration: underline;
}
</style>
