<template>
  <section class="product__area pt-60 pb-65">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="max-w-7xl mx-auto px-4">
      <div class="row">
        <div class="col-xl-12">
          <div class="section__title-wrapper text-center mb-55">
            <div class="section__title mb-10">
              <h2>인기 상품</h2>
            </div>
            <div class="section__sub-title">
              <p>다양한 트렌드를 반영한 인기 상품을 만나보세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-4">
      <div class="row">
        <div class="col-xl-6 col-lg-6">
          <div class="product__slider-3">
            <div class="row">
              <div v-for="item in trending_products.slice(0, 2)" :key="item.prodId" class="col-lg-6 col-md-6 product__item">
                <product-item :item="item" />
              </div>
            </div>
          </div>
          <!-- 2026-09-14(요청사항: "여기 인기상품 큰 이미지에는 커지는 효과가 없네 여기도
               적용해줘") — 작은 카드(product-item)와 동일한 20% 줌인 호버 효과. -->
          <div v-if="big_item_2" class="product__banner mb-30 group">
            <nuxt-link :to="`/prod-dtl/${big_item_2.prodId}`" class="w-img">
              <app-image :src="big_item_2.bigImg" alt="product_img" wrap-class="w-img" img-class="transition-transform duration-300 group-hover:scale-[1.2]" :skeleton-style="{ width: '100%', aspectRatio: '4/3' }" />
            </nuxt-link>
          </div>
        </div>
        <div class="col-xl-6 col-lg-6">
          <div v-if="big_item_1" class="product__banner w-img pb-25 mb-30 relative group">
            <nuxt-link :to="`/prod-dtl/${big_item_1.prodId}`" class="w-img">
              <app-image :src="big_item_1.bigImg" alt="product_img" wrap-class="w-img" img-class="transition-transform duration-300 group-hover:scale-[1.2]" :skeleton-style="{ width: '100%', aspectRatio: '4/3' }" />
            </nuxt-link>
            <div class="product__banner-content absolute">
              <h4>
                <nuxt-link :to="`/prod-dtl/${big_item_1.prodId}`">
                  <span v-html="big_item_1.prodNm"></span>
                </nuxt-link>
              </h4>
              <nuxt-link :to="`/prod-dtl/${big_item_1.prodId}`" class="link-btn"> 바로 보기 </nuxt-link>
            </div>
          </div>
          <div class="product__slider-3">
            <div class="row">
              <div v-for="item in trending_products.slice(2, 4)" :key="item.prodId" class="col-lg-6 col-md-6 product__item">
                <product-item :item="item" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('트렌드 상품 3');
import { computed } from "vue";
import ProductItem from "./ProductItem.vue";
import AppImage from "~/components/ui/AppImage.vue";

// trending 플래그는 실 스키마에 없어 항상 false(mapProduct.ts) — 최신 상품 기준으로 노출한다.
const products = useCacheProducts();
const big_item_1 = computed(() => products.value.filter((p) => p.bigImg)[0]);
const big_item_2 = computed(() => products.value.filter((p) => p.bigImg)[1]);
const trending_products = computed(() => products.value.slice(0, 4));
</script>
