<template>
  <layout-six>
    <home-hero-slider :style_2="true" />
    <category-area :style_4="true" />
    <trending-product-three />
    <shop-banner />
    <sale-off-product />
    <blog-area />
    <subscribe-area />
  </layout-six>
</template>

<script setup lang="ts">
import LayoutSix from "~/layout/ec1/LayoutSix.vue";
import HomeHeroSlider from "~/components/ec1/hero-banner/HomeHeroSlider.vue";
import CategoryArea from "~/components/ec1/category/CategoryArea.vue";
import TrendingProductThree from "~/components/ec1/products/TrendingProductThree.vue";
import ShopBanner from "~/components/ec1/shop-banner/ShopBanner.vue";
import SaleOffProduct from "~/components/ec1/products/SaleOffProduct.vue";
import BlogArea from "~/components/ec1/blogs/BlogArea.vue";
import SubscribeArea from "~/components/ec1/subscribe/SubscribeArea.vue";

useHead({
  title: "홈 6",
});
</script>
