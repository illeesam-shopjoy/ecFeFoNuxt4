<template>
  <!-- ec2 홈 화면 — ec1 과 다른 구성(히어로 문구 + 카테고리 + 인기상품 + 구독). 공통 컴포넌트는 core 것을 재사용한다. -->
  <div>
    <section class="ec2-hero">
      <div class="max-w-7xl mx-auto px-4 py-20 text-center">
        <p class="m-0 mb-2 text-[0.9rem] font-semibold tracking-widest text-white/80">{{ tenant.moduleId.toUpperCase() }}</p>
        <h1 class="m-0 mb-3 text-[2.2rem] font-extrabold text-white">{{ tenant.name }}</h1>
        <p class="m-0 text-[1.05rem] text-white/90">{{ tenant.tagline }}</p>
        <NuxtLink to="/shop" class="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-[0.95rem] font-bold text-theme no-underline">상품 둘러보기</NuxtLink>
      </div>
    </section>
    <category-area />
    <trending-products />
    <subscribe-area />
  </div>
</template>

<script setup lang="ts">
import CategoryArea from "~/components/category/CategoryArea.vue";
import TrendingProducts from "~/components/products/TrendingProducts.vue";
import SubscribeArea from "~/components/subscribe/SubscribeArea.vue";

const tenant = useTenant();
</script>

<style scoped>
/* 테넌트 대표색(환경파일 NUXT_PUBLIC_THEME_COLOR → tailwind theme)을 쓰는 히어로 */
.ec2-hero { background: linear-gradient(135deg, #2f6fd6, #1b3f87); }
</style>
