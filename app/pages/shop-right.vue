<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="쇼핑" subtitle="쇼핑" />

    <!-- 쇼핑 영역 (옛 ShopArea, 사이드바 우측) -->
    <section class="shop__area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-9 col-lg-9 col-md-8">
            <div class="shop__content-area">
              <div class="shop__header flex flex-wrap justify-between items-center mb-40">
                <div class="shop__header-left">
                  <div class="show-text">
                    <span>전체 {{ store.products.length }}개 중 {{ displayStart }}–{{ displayEnd }}개 표시</span>
                  </div>
                </div>
                <div class="shop__header-right flex items-center justify-between sm:justify-end">
                  <!-- 정렬/필터 -->
                  <sort-filtering />
                  <!-- 정렬/필터 -->
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
              <div id="pills-tabContent">
                <div v-show="viewMode === 'grid'" id="pills-grid" role="tabpanel">
                  <product-item v-for="(item, i) in store.filterProducts.slice(pageStart, pageStart + countOfPage)" :key="i" :item="item" />
                </div>
                <div v-show="viewMode === 'list'" id="pills-list" role="tabpanel">
                  <product-list-item v-for="(item, i) in store.filterProducts.slice(pageStart, pageStart + countOfPage)" :key="i" :item="item" />
                </div>
              </div>

              <div class="shop__pagination-area mt-40">
                <pagination :items="store.filterProducts" :count-of-page="9" @paginatedData="paginatedData" />
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-lg-3 col-md-4">
            <!-- 쇼핑 사이드바 (옛 ShopSidebar) -->
            <div class="shop__sidebar">
              <!-- 상품 카테고리 -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-25">
                  <h3>상품 카테고리</h3>
                </div>
                <div class="sidebar__widget-content">
                  <div class="categories">
                    <div class="shop-category-accordion">
                      <div class="card" v-for="(item, i) in parentCategories" :key="item.categoryId">
                        <div class="card-header white-bg">
                          <h5 class="mb-0">
                            <button
                              type="button"
                              @click="toggleCategory(i); store.handleStParentCategory(item.value)"
                              :class="['shop-accordion-btn', expandedCategory[i] ? '' : 'collapsed', store.activeCls === item.value ? 'active' : '']"
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
                                <li v-for="(childId, j) in item.children" :key="j">
                                  <a @click.prevent="store.handleStCategory(childId)" href="#" :class="[store.activeCls === childId ? 'active' : '']">
                                    {{ categoryIdToName[childId] ?? childId }}
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

              <!-- 가격 필터 -->
              <client-only>
                <div class="sidebar__widget mb-55">
                  <div class="sidebar__widget-title mb-30">
                    <h3>가격별 필터</h3>
                  </div>
                  <div class="sidebar__widget-content">
                    <div class="price__slider">
                      <div id="slider-range"></div>
                      <div>
                        <form @submit.prevent="store.getStFilterPrice">
                          <Slider v-model="store.priceRange" :tooltips="false" @change="store.onChangeRange" :max="500000" />
                          <button type="submit">필터</button>
                          <label for="amount">가격: {{ formatPrice(store.priceRange[0]) }} - {{ formatPrice(store.priceRange[1]) }}</label>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </client-only>

              <!-- 상품 사이즈 -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-30">
                  <h3>사이즈</h3>
                </div>
                <div class="sidebar__widget-content">
                  <div class="size">
                    <ul>
                      <li v-for="(size, i) in allSizes" :key="i" :class="`${store.activeCls === size ? 'active' : ''}`">
                        <a @click.prevent="store.handleStSize(size)" href="#">{{ getSizeLabel(size) }}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 상품 색상 -->
              <div class="sidebar__widget mb-60">
                <div class="sidebar__widget-title mb-20">
                  <h3>색상 선택</h3>
                </div>
                <div class="sidebar__widget-content">
                  <div class="color__pick">
                    <form>
                      <ul>
                        <li v-for="(color, i) in allColor?.slice(0, 8)" :key="color">
                          <button @click.prevent="store.handleStColor(color)" type="button" :class="`color color-${Number(i) + 1} ${store.activeCls === color ? `active-${Number(i) + 1}` : ''}`"></button>
                        </li>
                      </ul>
                    </form>
                  </div>
                </div>
              </div>

              <!-- 상품 브랜드 -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25">
                  <h3>브랜드</h3>
                </div>
                <div class="sidebar__widget-content">
                  <div class="brand">
                    <ul>
                      <li v-for="(brand, i) in brands" :key="i">
                        <a :class="`${store.activeCls === brand ? 'active' : ''}`" @click.prevent="store.handleStBrand(brand)" href="#">
                          {{ getBrandLabel(brand) }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 초기화 버튼 -->
              <div class="reset-button mt-20 mb-30">
                <button class="os-btn os-btn-black" @click="store.handleStResetFilter">필터 초기화</button>
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
import SortFiltering from "~/components/shop/filter-widget/SortFiltering.vue";
import { useProductsStore } from "~/store/useProductsStore";
import { ref, reactive, computed } from "vue";
import ProductItem from "~/components/products/ProductItem.vue";
import ProductListItem from "~/components/products/ProductListItem.vue";
import Pagination from "~/components/ui/Pagination.vue";
import AppImage from "~/components/ui/AppImage.vue";
import Slider from "@vueform/slider";
import "@vueform/slider/themes/default.css";
import { pdCategorySvc, type CategoryTreeResponse } from "~/svc/fo/ec/pd/pdCategorySvc";
import { useFilterLabels } from "~/composables/useFilterLabels";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "쇼핑",
});
usePageTitle("쇼핑 우사이드");

// ── 쇼핑 영역 (옛 ShopArea) ─────────────────────────────
const store = useProductsStore();
const { formatPrice } = usePrice();
const { getSizeLabel, getBrandLabel } = useFilterLabels();

const viewMode = ref<"grid" | "list">("grid");
const pageStart = ref(0);
const countOfPage = ref(9);

const currentPageItems = computed(() => store.filterProducts.slice(pageStart.value, pageStart.value + countOfPage.value));
const displayStart = computed(() => (currentPageItems.value.length ? pageStart.value + 1 : 0));
const displayEnd = computed(() => pageStart.value + currentPageItems.value.length);

function paginatedData(_rows: unknown[], start: number, count: number) {
  pageStart.value = start;
  countOfPage.value = count;
}

// ── 사이드바: 상품 카테고리 (옛 ProductCategory) ─────────────────────────────
// 2026-09-13(성능 개선): lazy:true — 메인 상품 목록만 SSR을 블로킹하고 사이드바 카테고리는
// 화면이 뜬 뒤 비동기로 채워지게 한다.
const { data: catData } = useAsyncData<CategoryTreeResponse>(
  "category-tree",
  () => pdCategorySvc.getCategoryTree(),
  { default: () => ({ categoryTree: [], categoryIdToName: {} }), lazy: true }
);

const categoryIdToName = computed(() => catData.value?.categoryIdToName ?? {});

const parentCategories = computed(() => {
  const seen = new Set<string>();
  return (catData.value?.categoryTree ?? []).filter((arr) => {
    if (seen.has(arr.parentTitle)) return false;
    seen.add(arr.parentTitle);
    return true;
  });
});

const expandedCategory = reactive<Record<number, boolean>>({});
function toggleCategory(i: number) {
  expandedCategory[i] = !expandedCategory[i];
}

// ── 사이드바: 상품 사이즈 (옛 ProductSizes) ─────────────────────────────
const allSizes = computed(() => {
  const optionIds = new Set<string>();
  store.products.forEach((product) => {
    product.optionSizes?.forEach((opt) => optionIds.add(opt.optionCode ?? String(opt.optionId)));
  });
  return Array.from(optionIds);
});

// ── 사이드바: 상품 색상 (옛 ProductColor) ─────────────────────────────
const allColor = computed(() => {
  const optionIds = new Set<string>();
  store.products.forEach((product) => {
    product.optionColors?.forEach((opt) => optionIds.add(opt.optionCode ?? String(opt.optionId)));
  });
  return Array.from(optionIds);
});

// ── 사이드바: 브랜드 (옛 ProductBrands) ─────────────────────────────
const brands = computed(() => [...new Set(store.products.map((p) => p.brand?.brandCode ?? String(p.brand?.brandId)))]);

// ── 사이드바: 추천 상품 (옛 ProductsFeatured) ─────────────────────────────
const featuredProducts = computed(() => store.products.filter((p) => p.trending).slice(0, 2));
</script>
