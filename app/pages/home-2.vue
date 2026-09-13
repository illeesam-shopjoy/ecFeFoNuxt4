<template>
  <layout-two>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <main class="box-25">
      <home-two-hero-slider />
      <category-area :style_2="true" />
      <section class="product__area pt-60 pb-100">
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
        <div class="container-fluid">
          <div class="product__banner relative">
            <div class="product__banner-inner absolute fix hidden lg:block">
              <div class="product__banner-img fix">
                <nuxt-link :to="`/prod-dtl/${trendingBigItem?.prodId}`">
                  <app-image :src="trendingBigItem?.bigImg" alt="product-banner" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
                </nuxt-link>
              </div>
              <div class="product__banner-content absolute">
                <h4>
                  <nuxt-link :to="`/prod-dtl/${trendingBigItem?.prodId}`">
                    <span v-html="trendingBigItem?.prodNm"></span>
                  </nuxt-link>
                </h4>
                <nuxt-link :to="`/prod-dtl/${trendingBigItem?.prodId}`" class="link-btn"> 바로 보기 </nuxt-link>
              </div>
            </div>
            <div class="row">
              <div class="col-xl-6 offset-xl-6 col-lg-6 offset-lg-6">
                <div class="product__slider-2">
                  <div class="row">
                    <div v-for="item in trendingProducts" :key="item.prodId" class="col-lg-4 col-md-6 product__item">
                      <product-item :item="item" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <shop-banner :style_2="true" />
      <section class="sale__area pb-55">
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
        </div>
        <div class="container-fluid">
          <div class="row">
            <div class="col-xl-12">
              <div class="sale__area-slider-2">
                <div class="row">
                  <div v-for="(item, i) in saleProducts" :key="i" class="col-xl-2 col-lg-3 col-md-4 col-6 sale__item">
                    <product-item :item="item" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <blog-area />
      <client-brand-slider :style_2="true" />
      <subscribe-area :style_2="true" />
    </main>
  </layout-two>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import LayoutTwo from "~/layout/LayoutTwo.vue";
import { computed } from "vue";
import HomeTwoHeroSlider from "~/components/hero-banner/HomeTwoHeroSlider.vue";
import CategoryArea from "~/components/category/CategoryArea.vue";
import { useProductsStore } from "~/store/useProductsStore";
import ProductItem from "~/components/products/ProductItem.vue";
import AppImage from "~/components/ui/AppImage.vue";
import ShopBanner from "~/components/shop-banner/ShopBanner.vue";
import BlogArea from "~/components/blogs/BlogArea.vue";
import ClientBrandSlider from "~/components/client-brands/ClientBrandSlider.vue";
import SubscribeArea from "~/components/subscribe/SubscribeArea.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "홈 2",
});
usePageTitle("홈 2");

const productsStore = useProductsStore();
const trendingBigItem = computed(() => productsStore.products.find((p) => p.bigImg));
// 2026-09-13 버그수정: "인기상품 표시되어야 해" — 현재 시딩된 상품 중 trending=true인
// 항목이 없어 "인기 상품" 섹션이 항상 비어 있었다. trending 상품이 없으면 최근 상품으로 대체.
const trendingProducts = computed(() => {
  const trending = productsStore.products.filter((p) => p.trending);
  return (trending.length ? trending : productsStore.products).slice(0, 6);
});
const saleProducts = computed(() => productsStore.products.filter((p) => typeof p.saleDiscntRate === "number" && p.saleDiscntRate > 0).slice(0, 12));
</script>

<style scoped></style>
