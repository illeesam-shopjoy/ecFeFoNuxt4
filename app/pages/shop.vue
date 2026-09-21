<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="상품목록" subtitle="상품목록" />

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
                              :class="['shop-accordion-btn', expandedCategory[i] ? '' : 'collapsed', categoryIds.includes(item.categoryId) ? 'active cat-selected' : '']"
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
                                  <a @click.prevent="toggleCategory(child.id)" href="#" :class="[categoryIds.includes(child.id) ? 'active cat-selected' : '']">
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

              <!-- 상품명 검색 -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>상품명 검색</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetName">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <form class="flex gap-1.5" @submit.prevent="applyName">
                    <input v-model="nameInput" type="text" placeholder="상품명을 입력하세요" class="min-w-0 flex-1 rounded-md border border-[#e5e7eb] px-3 py-2 text-[0.85rem] outline-none focus:border-[#bc8246]" />
                    <button type="submit" class="cursor-pointer rounded-md border-0 bg-gray-900 px-3 text-[0.8rem] font-semibold text-white">검색</button>
                  </form>
                  <div v-if="keyword" class="mt-2 text-[0.78rem] text-[#8a5a25]">"{{ keyword }}" 검색 중</div>
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

              <!-- 상품 색상 (2026-09-20: 사이즈 위로 이동 · 멀티선택 · 실제 옵션 색상 스와치 · 선택 시 링+체크로 뚜렷하게) -->
              <div class="sidebar__widget mb-55">
                <div class="sidebar__widget-title mb-30 flex items-center justify-between">
                  <h3>색상</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetColor">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="flex flex-wrap gap-2.5">
                    <button
                      v-for="color in allColor"
                      :key="color"
                      type="button"
                      :title="colorNameOf(color)"
                      :aria-label="colorNameOf(color)"
                      :aria-pressed="colorCds.includes(color)"
                      class="relative flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border-2 bg-[var(--swatch-color)] p-0 transition-transform duration-150 hover:scale-105"
                      :class="colorCds.includes(color) ? 'scale-105 border-white shadow-[0_0_0_2px_#bc8246,0_2px_6px_rgba(0,0,0,0.25)]' : 'border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.15)]'"
                      :style="{ '--swatch-color': prodOptSwatchColor(color) }"
                      @click.prevent="toggleColor(color)"
                    >
                      <i v-if="colorCds.includes(color)" class="fas fa-check text-[10px] drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]" :class="isLightColor(color) ? 'text-[#333]' : 'text-white'"></i>
                    </button>
                    <span v-if="!allColor.length" class="text-[0.85rem] text-[#aaa]">표시할 색상이 없습니다</span>
                  </div>
                </div>
              </div>

              <!-- 상품 사이즈 (2026-09-13: 멀티선택 토글, ecBeBo sizeInfoCd 실 값 기준) -->
              <div class="sidebar__widget mb-60">
                <div class="sidebar__widget-title mb-30 flex items-center justify-between">
                  <h3>사이즈</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetSize">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="size">
                    <ul>
                      <li v-for="size in SIZE_OPTIONS" :key="size" class="!mr-[10px] !mb-[10px] align-top" :class="sizeCds.includes(size) ? 'active' : ''">
                        <!-- 2026-09-21(요청사항: "색상과 사이즈 동그라미 크기 같게") — 색상 스와치(28px)와 같은 28x28 원으로 고정. FREE만 글자가 길어 폰트를 줄임 -->
                        <a class="!h-[28px] !w-[28px] !p-0 !leading-[28px]" :class="size.length > 2 ? '!text-[8px]' : '!text-[10px]'" @click.prevent="toggleSize(size)" href="#">{{ size }}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- 평가 별점 범위 -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>평가 별점</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetRating">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <!-- 2026-09-21(요청사항: "select 2개인데 별표를 드래그하면 좋을거 같아") — 별을 누르면 "n점 이상", 별 위에서 끌면 시작~끝 별 범위.
                       터치 스크롤(세로)은 그대로 두고 가로 드래그만 받는다(touch-action: pan-y). -->
                  <div
                    ref="ratingStarsRef"
                    class="grid cursor-pointer select-none grid-cols-5 touch-pan-y text-center text-[1.7rem]"
                    role="group"
                    aria-label="평가 별점 범위 (별을 누르거나 끌어서 선택)"
                    @pointerdown="onRatingDown"
                    @pointermove="onRatingMove"
                    @pointerup="onRatingEnd"
                    @pointercancel="onRatingEnd"
                  >
                    <i v-for="n in 5" :key="n" class="fas fa-star transition-colors duration-100" :class="n >= Math.max(ratingRange[0], 1) && n <= ratingRange[1] ? 'text-[#f5a623]' : 'text-[#e3e3e3]'"></i>
                  </div>
                  <div class="mt-2 text-[0.78rem] text-[#999]">{{ ratingLabel }}</div>
                </div>
              </div>

              <!-- 상품 브랜드 (2026-09-13: 멀티선택 토글 + 전용 브랜드 API) -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>브랜드</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetBrand">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <div class="brand max-h-[172px] overflow-y-auto pr-1 [scrollbar-width:thin]">
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

              <!-- 판매업체 (모달 선택, 멀티) -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>판매업체</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetVendor">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <button type="button" class="flex w-full cursor-pointer items-center justify-between rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[0.85rem] text-gray-700 hover:border-[#bc8246]" @click="vendorModalRef?.show()">
                    <span>판매업체 선택</span><i class="fas fa-search text-[0.75rem] text-gray-400"></i>
                  </button>
                  <div v-if="vendorIds.length" class="mt-2 flex flex-wrap gap-1.5">
                    <span v-for="id in vendorIds" :key="id" class="inline-flex items-center gap-1 rounded-full bg-[#faf3ea] px-2.5 py-1 text-[0.75rem] font-semibold text-[#8a5a25]">
                      {{ nameOfOpt(vendorList, id) }}
                      <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[#8a5a25]" :aria-label="`${nameOfOpt(vendorList, id)} 해제`" @click="vendorIds = vendorIds.filter((v) => v !== id)">×</button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- 사이트 (select) -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>사이트</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="siteId = ''">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <select v-model="siteId" class="w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[0.85rem] outline-none focus:border-[#bc8246]" aria-label="사이트">
                    <option value="">전체 사이트</option>
                    <option v-for="s in siteList" :key="s.id" :value="s.id">{{ s.name }} ({{ s.prodCount }})</option>
                  </select>
                </div>
              </div>

              <!-- 담당 MD (모달 선택, 멀티) -->
              <div class="sidebar__widget mb-50">
                <div class="sidebar__widget-title mb-25 flex items-center justify-between">
                  <h3>MD</h3>
                  <button type="button" class="text-[0.78rem] text-[#999] bg-transparent border-0 cursor-pointer p-0 hover:text-theme hover:underline" @click="resetMd">초기화</button>
                </div>
                <div class="sidebar__widget-content">
                  <button type="button" class="flex w-full cursor-pointer items-center justify-between rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[0.85rem] text-gray-700 hover:border-[#bc8246]" @click="mdModalRef?.show()">
                    <span>MD 선택</span><i class="fas fa-search text-[0.75rem] text-gray-400"></i>
                  </button>
                  <div v-if="mdUserIds.length" class="mt-2 flex flex-wrap gap-1.5">
                    <span v-for="id in mdUserIds" :key="id" class="inline-flex items-center gap-1 rounded-full bg-[#faf3ea] px-2.5 py-1 text-[0.75rem] font-semibold text-[#8a5a25]">
                      {{ nameOfOpt(mdList, id) }}
                      <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[#8a5a25]" :aria-label="`${nameOfOpt(mdList, id)} 해제`" @click="mdUserIds = mdUserIds.filter((v) => v !== id)">×</button>
                    </span>
                  </div>
                </div>
              </div>

              <filter-pick-modal ref="vendorModalRef" v-model="vendorIds" title="판매업체" :options="vendorList" />
              <filter-pick-modal ref="mdModalRef" v-model="mdUserIds" title="MD" :options="mdList" />

              <!-- 전체 초기화 버튼 -->
              <div class="reset-button mt-20 mb-30">
                <button class="os-btn os-btn-black" @click="resetAllFilters">전체 초기화</button>
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
                <p v-if="!pending && !awaitingCategory && !displayItems.length" class="text-center py-40 text-gray-400">조건에 맞는 상품이 없습니다.</p>
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
import FilterPickModal from "~/components/modals/FilterPickModal.vue";
import { syVendorMdSvc } from "~/svc/fo/ec/sy/syVendorMdSvc";
import type { SyFilterOptType } from "~/types/sy/syFilterOptType";
import { PROD_COLOR_OPTIONS, prodOptSwatchColor } from "~/utils/prodOptColor";
import Slider from "@vueform/slider";
import "@vueform/slider/themes/default.css";
import { pdCategorySvc } from "~/svc/fo/ec/pd/pdCategorySvc";
import type { PdCategoryTreeResType } from "~/types/pd/pdCategoryTreeType";
import { syBrandSvc } from "~/svc/fo/ec/sy/syBrandSvc";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import type { PdProdPageParamsType } from "~/types/pd/pdProdPageParamsType";
import type { CoPagedResultType } from "~/types/co/coPagedResultType";
import { axiosSsr } from "~/utils/axiosSsr";
import { type PdProdType } from "~/types/pd/pdProdType";
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
// 가격범위도 서버(priceMin/priceMax)로 넘긴다. 색상(prodOpt2List)만 옵션 테이블 조인 필터가 없어 "지금까지 불러온 페이지 안에서만" 보조로 거른다.
const PAGE_SIZE = 12;
const { formatPrice } = usePrice();

/**
 * 상품 목록 조회. /shop 은 SEO 단위화면이라 **서버 렌더링(SSR)의 첫 페이지만** server/api(같은 Lambda 안 내부 호출, axiosSsr)를 거쳐
 * 검색엔진이 상품 링크·이름을 HTML 로 읽게 하고, 브라우저(필터 변경·더보기·클라이언트 내비게이션)는 svc 로 ecBeBo 를 직접 호출한다.
 * server/api 는 배열 파라미터를 콤마 문자열로 받는다(server/api/fo/ec/pd/prod/page.get.ts).
 */
function fetchProducts(params: PdProdPageParamsType): Promise<CoPagedResultType<PdProdType>> {
  if (!import.meta.server) return pdProductSvc.getPaged(params);
  const q: Record<string, string | number> = { pageNo: params.pageNo, pageSize: params.pageSize ?? 12 };
  if (params.categoryIds?.length) q.categoryIds = params.categoryIds.join(",");
  if (params.brandIds?.length) q.brandIds = params.brandIds.join(",");
  if (params.siteId) q.siteId = params.siteId;
  if (params.ratingMin) q.ratingMin = params.ratingMin;
  if (params.ratingMax != null && params.ratingMax < 5) q.ratingMax = params.ratingMax;
  if (params.vendorIds?.length) q.vendorIds = params.vendorIds.join(",");
  if (params.mdUserIds?.length) q.mdUserIds = params.mdUserIds.join(",");
  if (params.sizeCds?.length) q.sizeCds = params.sizeCds.join(",");
  if (params.priceMin != null) q.priceMin = params.priceMin;
  if (params.priceMax != null) q.priceMax = params.priceMax;
  if (params.sort) q.sort = params.sort;
  if (params.keyword) q.keyword = params.keyword;
  return axiosSsr.get<CoPagedResultType<PdProdType>>("/api/fo/ec/pd/prod/page", { params: q }).then((r) => r.data);
}
const toggleIn = (arr: string[], value: string): string[] => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

// 필터 상태(전부 배열=멀티선택, 토글)
// 홈의 카테고리 배너 등에서 /shop?category=ID[,ID] 로 들어오면 그 카테고리가 선택된 상태로 시작한다
const categoryFromQuery = (q: unknown): string[] => (typeof q === "string" ? q.split(",").map((s) => s.trim()).filter(Boolean) : []);
const categoryIds = ref<string[]>(categoryFromQuery(route.query.category));
const brandIds = ref<string[]>([]);
const siteId = ref(""); // 사이트(select)
const ratingRange = ref<[number, number]>([0, 5]); // 평가 별점 범위
const nameInput = ref(initialQuery); // 상품명 검색 입력(Enter/검색 버튼으로 keyword 반영)
const vendorIds = ref<string[]>([]); // 판매업체(모달 선택)
const mdUserIds = ref<string[]>([]); // 담당MD(모달 선택)
const sizeCds = ref<string[]>([]);
const sort = ref(""); // "" = 기본(등록일 최신순)
const keyword = ref(initialQuery);
const priceRange = ref<[number, number]>([0, 500000]);
const colorCds = ref<string[]>([]); // 색상만 서버 필터가 없어 클라이언트 보조필터로 남김(멀티선택, 하나라도 일치하면 노출)

const viewMode = ref<"grid" | "list">("grid");

// 2026-09-13(요청사항: "브랜드 클릭하니 화면이 백지현상" → "깜빡임 효과 안나오게 해줘") —
// 필터 재조회 중(pending)에도 이미 보여주고 있던 목록은 그대로 유지하고(useAsyncData가
// 알아서 유지해줌), 스켈레톤 전체화면 전환은 "정말 처음이라 아직 아무 상품도 없을 때"만.
// 2026-09-21 보강(요청사항: "사이즈 선택시 화면깜빡임 — 조건 변경시 깜빡임 없게") — 예전엔 "지금 보이는 상품이 0개 + 조회 중"이면 스켈레톤으로 바뀌어서,
// 결과가 0건이던 조건에서 다른 조건을 누르거나 색상 보조필터로 다 가려진 상태에서 재조회하면 사이드바째 스켈레톤↔실화면이 번갈아 깜빡였다.
// 이제는 1페이지 응답이 아직 한 번도 없을 때(firstPage 없음)만 스켈레톤.
const isInitialLoading = computed(() => pending.value && !firstPage.value);

// 2026-09-13: ecBeBo sizeInfoCd 실 enum 값(자유 텍스트가 아니라 고정 코드) — 상품 옵션(SKU)
// 스캔이 아니라 상품 자체 필드라 서버에서 바로 IN 필터링된다.
const SIZE_OPTIONS = ["FREE", "XS", "S", "M", "L", "XL"];

// ── 사이드바: 상품 카테고리 (옛 ProductCategory) ─────────────────────────────
const { data: catData } = useAsyncData<PdCategoryTreeResType>(
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
  const params: PdProdPageParamsType = { pageNo, pageSize: PAGE_SIZE };
  if (categoryIds.value.length) params.categoryIds = expandCategoryIds(categoryIds.value);
  if (brandIds.value.length) params.brandIds = brandIds.value;
  if (vendorIds.value.length) params.vendorIds = vendorIds.value;
  if (siteId.value) params.siteId = siteId.value;
  if (ratingRange.value[0] > 0) params.ratingMin = ratingRange.value[0];
  if (ratingRange.value[1] < 5) params.ratingMax = ratingRange.value[1];
  if (mdUserIds.value.length) params.mdUserIds = mdUserIds.value;
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
const { data: firstPage, pending, refresh } = useAsyncData<CoPagedResultType<PdProdType>>("shop-products-paged", () => fetchProducts(buildParams(1)));

// 서버 렌더의 첫 페이지 조회가 일시적으로 실패하면(Ohio→NAS 콜드 지연 등) firstPage 가 비어 하이드레이션되고 클라이언트는 다시 조회하지 않는다
// — 화면이 뜬 뒤 비어 있으면 브라우저가 ecBeBo 에서 1페이지를 직접 다시 가져온다.
onMounted(() => {
  if (!firstPage.value) refresh();
});

// 카테고리 트리는 브라우저에서 늦게 도착한다 — 선택된 카테고리가 있으면 하위 카테고리까지 확장해 다시 조회하고, 선택된 그룹은 펼쳐 보여준다
const catLoaded = computed(() => (catData.value?.categoryTree?.length ?? 0) > 0);
const awaitingCategory = computed(() => categoryIds.value.length > 0 && !catLoaded.value);
function openSelectedGroups() {
  parentCategories.value.forEach((p, i) => {
    if (categoryIds.value.includes(p.categoryId) || p.children.some((ch) => categoryIds.value.includes(ch.id))) expandedCategory[i] = true;
  });
}
watch(catLoaded, (ok) => {
  if (!ok || !categoryIds.value.length) return;
  openSelectedGroups();
  refresh();
});
// 상품목록 화면 안에서 ?category= 가 바뀌면(헤더/배너 링크) 선택도 따라 바꾼다
watch(
  () => route.query.category,
  (q) => {
    categoryIds.value = categoryFromQuery(q);
    if (categoryIds.value.length) openSelectedGroups();
  }
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  [categoryIds, brandIds, vendorIds, mdUserIds, siteId, ratingRange, sizeCds, sort, keyword, priceRange],
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
const extraItems = ref<PdProdType[]>([]);
const pageNo = ref(1);
const loadingMore = ref(false);
const extraHasMore = ref<boolean | null>(null); // loadMore 로 알아낸 마지막 페이지 기준 hasMore

// 필터가 바뀌어 firstPage 자체가 새로 오면(=1페이지 재조회), 이어붙여뒀던 다음 페이지들은 버린다.
watch(firstPage, () => {
  extraItems.value = [];
  pageNo.value = 1;
  extraHasMore.value = null;
});

const items = computed<PdProdType[]>(() => [...(firstPage.value?.items ?? []), ...extraItems.value]);
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

// 사이드바 색상 스와치 — 표준 색상(PROD_COLOR_OPTIONS)을 항상 보여주고, 상품에서 발견한 그 밖의 색상은 **누적**해 덧붙인다. 사이즈/브랜드 등 서버 필터로 목록이 줄어도 색상 목록은 줄지 않는다
// (예전엔 현재 목록에서 계산해서 사이즈를 고르면 색상이 사라졌다). 이름은 툴팁/선택 표시용.
const colorNames = reactive(new Map<string, string>(PROD_COLOR_OPTIONS.map((o) => [o.code, o.nm] as const)));
const allColor = computed(() => Array.from(colorNames.keys()));
watch(
  [items, () => items.value.length],
  () => {
    items.value.forEach((p) =>
      p.prodOpt2List?.forEach((o) => {
        const code = o.prodOptStdCd ?? String(o.prodOptId);
        if (!colorNames.has(code)) colorNames.set(code, o.prodOptNm);
      })
    );
  },
  { immediate: true, deep: false }
);

// 색상만 클라이언트 보조필터 적용 — 나머지는 전부 서버에서 이미 걸러져 온 결과.
const displayItems = computed(() => {
  if (!colorCds.value.length) return items.value;
  return items.value.filter((p) => p.prodOpt2List?.some((o) => colorCds.value.includes(o.prodOptStdCd ?? String(o.prodOptId))));
});

const toggleCategory = (id: string) => (categoryIds.value = toggleIn(categoryIds.value, id));
const toggleBrand = (id: string) => (brandIds.value = toggleIn(brandIds.value, id));
const toggleSize = (code: string) => (sizeCds.value = toggleIn(sizeCds.value, code));
const toggleColor = (code: string) => (colorCds.value = toggleIn(colorCds.value, code));
const colorNameOf = (code: string) => colorNames.get(code) ?? code;
const isLightColor = (code: string) => {
  const hex = prodOptSwatchColor(code).replace("#", "");
  if (hex.length !== 6) return true;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 186; // 밝은 색이면 체크를 어둡게
};
const setSort = (v: string) => (sort.value = v);
const resetCategory = () => (categoryIds.value = []);
const resetBrand = () => (brandIds.value = []);
const resetSize = () => (sizeCds.value = []);
const resetPrice = () => (priceRange.value = [0, 500000]);
const resetColor = () => (colorCds.value = []);
function resetAll() {
  categoryIds.value = [];
  brandIds.value = [];
  vendorIds.value = [];
  mdUserIds.value = [];
  siteId.value = "";
  ratingRange.value = [0, 5];
  nameInput.value = "";
  sizeCds.value = [];
  sort.value = "";
  keyword.value = "";
  priceRange.value = [0, 500000];
  colorCds.value = [];
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
// 카테고리 트리가 이미 있으면(홈에서 넘어온 경우 등) 마운트 때, 나중에 도착하면 그때 선택된 그룹을 펼친다
let openedOnce = false;
watch(
  () => parentCategories.value.length,
  (n) => {
    if (n && !openedOnce && categoryIds.value.length) {
      openSelectedGroups();
      openedOnce = true;
    }
  },
  { immediate: true }
);
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

// ── 사이드바: 판매업체 / 담당MD (모달 선택) ─────────────────────────────────────
const vendorModalRef = ref<InstanceType<typeof FilterPickModal> | null>(null);
const mdModalRef = ref<InstanceType<typeof FilterPickModal> | null>(null);
const { data: vendorList } = useAsyncData("shop-vendor-list", () => syVendorMdSvc.getVendors(), { default: () => [], lazy: true, server: false });
const { data: mdList } = useAsyncData("shop-md-list", () => syVendorMdSvc.getMds(), { default: () => [], lazy: true, server: false });
const { data: siteList } = useAsyncData("shop-site-list", () => syVendorMdSvc.getSites(), { default: () => [], lazy: true, server: false });
const applyName = () => (keyword.value = nameInput.value.trim());
const resetName = () => {
  nameInput.value = "";
  keyword.value = "";
};
const resetRating = () => (ratingRange.value = [0, 5]);
/** 별점 드래그 — 누른 별이 시작점(anchor). 그대로 떼면 "anchor점 이상", 다른 별까지 끌면 두 별 사이 범위. */
const ratingStarsRef = ref<HTMLElement | null>(null);
let ratingAnchor: number | null = null;
const ratingStarAt = (e: PointerEvent): number => {
  const rect = ratingStarsRef.value!.getBoundingClientRect();
  return Math.min(5, Math.max(1, Math.ceil(((e.clientX - rect.left) / rect.width) * 5)));
};
const setRatingRange = (min: number, max: number) => {
  if (ratingRange.value[0] !== min || ratingRange.value[1] !== max) ratingRange.value = [min, max];
};
function onRatingDown(e: PointerEvent) {
  ratingAnchor = ratingStarAt(e);
  ratingStarsRef.value?.setPointerCapture(e.pointerId);
  setRatingRange(ratingAnchor, 5);
}
function onRatingMove(e: PointerEvent) {
  if (ratingAnchor == null) return;
  const n = ratingStarAt(e);
  if (n === ratingAnchor) setRatingRange(n, 5);
  else setRatingRange(Math.min(n, ratingAnchor), Math.max(n, ratingAnchor));
}
const onRatingEnd = () => (ratingAnchor = null);
const ratingLabel = computed(() => {
  const [min, max] = ratingRange.value;
  if (min === 0 && max === 5) return "전체";
  const range = max === 5 ? `${min}점 이상` : min === max ? `${min}점` : `${min}~${max}점`;
  return `${range} (리뷰 있는 상품)`;
});
const nameOfOpt = (list: SyFilterOptType[], id: string) => list.find((o) => o.id === id)?.name ?? id;
const resetVendor = () => (vendorIds.value = []);
const resetMd = () => (mdUserIds.value = []);

// ── 사이드바: 상품 색상 — 지금까지 불러온 상품의 옵션값(색상은 ecBeBo 서버 필터가 아직 없음) ──
// (2026-09-21: 사이드바 "추천 상품" 위젯 제거 — 이 화면에서만 쓰던 useCacheProducts 호출도 함께 뺌)

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
/* 2026-09-21 깜빡임 수정 — 예전엔 leave 트랜지션도 있어서 필터가 바뀌면 "사라지는 옛 카드"와 "나타나는 새 카드"가 0.3초간 같이 그리드에 남아
   목록 높이가 순간 두 배가 되고 스크롤/레이아웃이 출렁였다(모바일에서 특히 눈에 띔). 옛 카드는 즉시 제거하고 새 카드만 살짝 fade-in. */
.product-fade-enter-active {
  transition: opacity 0.25s ease;
}
.product-fade-enter-from {
  opacity: 0;
}
</style>
