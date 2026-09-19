<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="쇼핑" subtitle="쇼핑" />
    <section class="shop__area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row">
          <div class="col-xl-12">
            <div class="shop__content-area">
              <div class="shop__header flex flex-wrap justify-between items-center mb-40">
                <div class="shop__header-left">
                  <div class="show-text">
                    <span>전체 {{ state.products.length }}개 중 1–{{ cp.rows().length }}개 표시</span>
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
                  <product-item v-for="(item, i) in cp.rows()" :key="i" :item="item" />
                </div>
                <div v-show="viewMode === 'list'" id="pills-list" role="tabpanel">
                  <product-list-item v-for="(item, i) in cp.rows()" :key="i" :item="item" />
                </div>
              </div>
              <div class="row mt-40">
                <div class="col-xl-12">
                  <fo-pager v-if="cp.pager.pageTotalCount" :pager="cp.pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" :on-size-change="() => handleSelectAction('pager-sizeChange')" />
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
import { ref, reactive } from "vue";
import SortFiltering from "~/components/shop/filter-widget/SortFiltering.vue";
import { useProductsStore } from "~/store/useProductsStore";
import ProductItem from "~/components/products/ProductItem.vue";
import ProductListItem from "~/components/products/ProductListItem.vue";
import FoPager from "~/components/fo/FoPager.vue";
import { useClientPager } from "~/composables/useClientPager";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "쇼핑 4단",
});
usePageTitle("쇼핑 4단");

const state = useProductsStore();
const viewMode = ref<"grid" | "list">("grid");

const cp = useClientPager(() => state.filterProducts, 12, [12, 24, 48]);

/* handleSelectAction — 선택/페이징 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, param: unknown = {}) => {
  // 페이지 이동 (param: pageNo)
  if (cmd === "pager-setPage") {
    return cp.setPage(param as number);
    // 페이지 크기 변경
  } else if (cmd === "pager-sizeChange") {
    return cp.sizeChange();
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};
</script>
