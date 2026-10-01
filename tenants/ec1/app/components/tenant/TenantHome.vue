<template>
  <!-- ec1 홈 화면 — 멀티테넌트 이전 app/pages/index.vue 의 본문을 그대로 옮긴 것(2026-10-02). core 의 index.vue 가 <TenantHome /> 로 부른다. -->
  <div>
    <home-hero-slider />
    <category-area />
    <trending-products />
    <shop-banner />
    <sale-off-product />
    <client-brand-slider />
    <blog-area />
    <subscribe-area />
  </div>
</template>

<script setup lang="ts">
// 공통 컴포넌트는 core(app/)에 있다 — 레이어 안에서도 ~ 별칭은 프로젝트 루트(app/)를 가리킨다.
import HomeHeroSlider from "~/components/hero-banner/HomeHeroSlider.vue";
import CategoryArea from "~/components/category/CategoryArea.vue";
import TrendingProducts from "~/components/products/TrendingProducts.vue";
import ShopBanner from "~/components/shop-banner/ShopBanner.vue";
import SaleOffProduct from "~/components/products/SaleOffProduct.vue";
import ClientBrandSlider from "~/components/client-brands/ClientBrandSlider.vue";
import BlogArea from "~/components/blogs/BlogArea.vue";
import SubscribeArea from "~/components/subscribe/SubscribeArea.vue";
</script>
