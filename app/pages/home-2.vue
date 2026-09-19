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
                    <!-- 2026-09-14(요청사항: "인기상품 우측에 3열을 2열로 해줘") -->
                    <div v-for="item in trendingProducts" :key="item.prodId" class="col-lg-6 col-md-6 product__item">
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
                <!-- 2026-09-14(요청사항: "할인상품 6열 아니고 5열로 하면되") — col-xl-2(=6열) 대신
                     row-cols-xl-5(=5열, _grid.scss 기존 row-cols-lg-5/sm-5와 동일 패턴)를 .row에 적용. -->
                <div class="row row-cols-xl-5">
                  <div v-for="(item, i) in saleProducts" :key="i" class="col-lg-3 col-md-4 col-6 sale__item px-5 mb-[30px]">
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

// 최신 상품 24개만 조회(전체 카탈로그 X) — trending 플래그는 실 스키마에 없어 항상 false(mapProduct.ts)라 최신순으로 노출.
const products = useLatestProducts();
const trendingBigItem = computed(() => products.value.find((p) => p.bigImg));
const trendingProducts = computed(() => products.value.slice(0, 6));
const saleProducts = computed(() => products.value.filter((p) => typeof p.saleDiscntRate === "number" && p.saleDiscntRate > 0).slice(0, 12));
</script>
