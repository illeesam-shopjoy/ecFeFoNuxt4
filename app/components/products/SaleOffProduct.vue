<template>
  <section class="sale__area pb-100">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <div class="row">
        <div class="col-xl-12">
          <div class="section__title-wrapper text-center mb-55">
            <div class="section__title mb-10">
              <h2>할인</h2>
            </div>
            <div class="section__sub-title">
              <p>한정 할인 상품을 만나보세요.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
        <div class="col" v-for="(item, i) in saleItems" :key="i">
          <product-item :item="item" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('할인 상품');
import ProductItem from "./ProductItem.vue";
import { computed } from "vue";

// 할인 상품 5개 — 서버 isSale 필터로 조회(useCacheProducts.ts 참조).
const saleProducts = useCacheProducts(5, { isSale: true });
const saleItems = computed(() => saleProducts.value);
</script>
