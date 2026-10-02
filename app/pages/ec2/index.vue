<template>
  <layout>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- ec2 홈 화면 (멀티테넌트: app/pages/ec2 — 이 모듈로 빌드할 때만 "/" 가 된다). ec1 과 다른 구성이고, 컴포넌트는 공통(app/components)을 재사용한다. -->
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
  </layout>
</template>

<script setup lang="ts">
// nuxt.config.ts app.keepalive.include 매칭용 이름 (뒤로가기 시 스크롤·상태 복원) — ec1 홈과 같은 이름
defineOptions({ name: "HomePage" });
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/ec2/Layout.vue";
import CategoryArea from "~/components/ec2/category/CategoryArea.vue";
import TrendingProducts from "~/components/ec2/products/TrendingProducts.vue";
import SubscribeArea from "~/components/ec2/subscribe/SubscribeArea.vue";

import { usePageTitle } from "~/composables/usePageTitle";
const tenant = useTenant();
useHead({
  title: tenant.name, // 모듈이 정한 이름(app/conts/tenant/ec2.ts)
});
usePageTitle("홈");
</script>

<style scoped>
.ec2-hero { background: linear-gradient(135deg, #2f6fd6, #1b3f87); }
</style>
