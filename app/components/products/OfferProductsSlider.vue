<template>
  <section :class="`product__offer ${style_2 ? 'pb-45' : 'pt-115 pb-50'}`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div :class="`${style_2 ? 'custom-container' : 'container'} mx-auto`">
      <div class="row flex justify-center">
        <!-- 인기 상품 시작 -->
        <div class="col-xl-4 col-lg-4 col-md-6">
          <div class="product__offer-inner mb-30">
            <div class="product__title mb-60">
              <h4>인기 상품</h4>
            </div>
            <div class="product__offer-slider relative">
              <Carousel :items-to-show="1" :wrap-around="true" :snapAlign="'center'" ref="slider_1">
                <Slide v-for="(item, i) in trending_products" :key="i" class="product__offer-wrapper !block">
                  <div class="sidebar__widget-content">
                    <sm-product-item v-for="(prd, i) in item.items" :key="i" :prd="prd" />
                  </div>
                </Slide>
              </Carousel>
              <!-- 네비 버튼 -->
              <div class="owl-nav">
                <div @click="handlePrev" class="owl-prev">
                  <button>
                    <i class="fal fa-angle-left"></i>
                  </button>
                </div>
                <div class="owl-next" @click="handleNext">
                  <button>
                    <i class="fal fa-angle-right"></i>
                  </button>
                </div>
              </div>
              <!-- 네비 버튼 -->
            </div>
          </div>
        </div>
        <!-- 인기 상품 끝 -->

        <!-- 세일 상품 시작 -->
        <div class="col-xl-4 col-lg-4 col-md-6">
          <div class="product__offer-inner mb-30">
            <div class="product__title mb-60">
              <h4>할인 상품</h4>
            </div>
            <div class="product__offer-slider relative">
              <Carousel :items-to-show="1" :wrap-around="true" :snapAlign="'center'" ref="slider_2">
                <Slide v-for="(item, i) in sale_products" :key="i" class="product__offer-wrapper !block">
                  <div class="sidebar__widget-content">
                    <sm-product-item v-for="(prd, i) in item.items" :key="i" :prd="prd" />
                  </div>
                </Slide>
              </Carousel>
              <!-- 네비 버튼 -->
              <div class="owl-nav">
                <div @click="handlePrevTwo" class="owl-prev">
                  <button>
                    <i class="fal fa-angle-left"></i>
                  </button>
                </div>
                <div class="owl-next" @click="handleNextTwo">
                  <button>
                    <i class="fal fa-angle-right"></i>
                  </button>
                </div>
              </div>
              <!-- 네비 버튼 -->
            </div>
          </div>
        </div>
        <!-- 세일 상품 끝 -->

        <!-- 베스트 상품 시작 -->
        <div class="col-xl-4 col-lg-4 col-md-6">
          <div class="product__offer-inner mb-30">
            <div class="product__title mb-60">
              <h4>베스트 상품</h4>
            </div>
            <div class="product__offer-slider relative">
              <Carousel :items-to-show="1" :wrap-around="true" :snapAlign="'center'" ref="slider_3">
                <Slide v-for="(item, i) in top_products" :key="i" class="product__offer-wrapper !block">
                  <div class="sidebar__widget-content">
                    <sm-product-item v-for="(prd, i) in item.items" :key="i" :prd="prd" />
                  </div>
                </Slide>
              </Carousel>
              <!-- 네비 버튼 -->
              <div class="owl-nav">
                <div @click="handlePrevThree" class="owl-prev">
                  <button>
                    <i class="fal fa-angle-left"></i>
                  </button>
                </div>
                <div class="owl-next" @click="handleNextThree">
                  <button>
                    <i class="fal fa-angle-right"></i>
                  </button>
                </div>
              </div>
              <!-- 네비 버튼 -->
            </div>
          </div>
        </div>
        <!-- 베스트 상품 끝 -->
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('특가 상품');
import { ref, computed } from "vue";
import { Carousel, Slide } from "vue3-carousel";
import SmProductItem from "./SmProductItem.vue";

defineProps({
  style_2: { type: Boolean, default: false },
});
const slider_1 = ref<{ next(): void; prev(): void } | null>(null);
const slider_2 = ref<{ next(): void; prev(): void } | null>(null);
const slider_3 = ref<{ next(): void; prev(): void } | null>(null);
// isTrending/isTopRated 플래그는 실 스키마에 없어 항상 false(mapProduct.ts) — 최신 상품 24개 기준으로 노출한다.
const products = useCacheProducts();
const trending_products = computed(() => [
  { id: 1, items: products.value.slice(0, 3) },
  { id: 2, items: products.value.slice(3, 6) },
]);
const saleList = useCacheProducts(6, { isSale: true });
const sale_products = computed(() => {
  const sale = saleList.value;
  return [
    { id: 1, items: sale.slice(0, 3) },
    { id: 2, items: sale.slice(3, 6) },
  ];
});
const top_products = computed(() => {
  const top = products.value.filter((p) => p.isTopRated);
  return [
    { id: 1, items: top.slice(0, 3) },
    { id: 2, items: top.slice(3, 6) },
  ];
});
function handleNext() {
  slider_1.value?.next();
}
function handlePrev() {
  slider_1.value?.prev();
}
function handleNextTwo() {
  slider_2.value?.next();
}
function handlePrevTwo() {
  slider_2.value?.prev();
}
function handleNextThree() {
  slider_3.value?.next();
}
function handlePrevThree() {
  slider_3.value?.prev();
}
</script>
