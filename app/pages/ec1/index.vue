<template>
  <layout>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- ec1 홈 화면 (멀티테넌트: app/pages/ec1 — 이 모듈로 빌드할 때만 "/" 가 된다). 컴포넌트는 공통(app/components)을 그대로 쓴다. -->
    <home-hero-slider />
    <category-area />
    <trending-products />
    <shop-banner />
    <sale-off-product />
    <client-brand-slider />
    <blog-area />
    <subscribe-area />
  </layout>
</template>

<script setup lang="ts">
// 2026-09-23: nuxt.config.ts app.keepalive.include 매칭용 이름 (뒤로가기 시 스크롤·상태 복원)
defineOptions({ name: "HomePage" });
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import HomeHeroSlider from "~/components/hero-banner/HomeHeroSlider.vue";
import CategoryArea from "~/components/category/CategoryArea.vue";
import TrendingProducts from "~/components/products/TrendingProducts.vue";
import ShopBanner from "~/components/shop-banner/ShopBanner.vue";
import SaleOffProduct from "~/components/products/SaleOffProduct.vue";
import ClientBrandSlider from "~/components/client-brands/ClientBrandSlider.vue";
import BlogArea from "~/components/blogs/BlogArea.vue";
import SubscribeArea from "~/components/subscribe/SubscribeArea.vue";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: useTenant().name, // 모듈이 정한 이름(app/conts/tenant/ec1.ts)
});
usePageTitle("홈");
</script>
