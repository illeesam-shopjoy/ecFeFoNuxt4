<template>
  <layout :transparent="true">
    <breadcrumb-area title="선물 결제 실패" subtitle="선물 결제 실패" />
    <section class="pb-70">
      <div class="mx-auto max-w-[520px] px-4 py-14 text-center">
        <h2 class="mb-3 text-2xl font-bold text-red-600">결제가 완료되지 않았습니다</h2>
        <p class="mb-2 text-gray-600">{{ message }}</p>
        <p v-if="code" class="mb-6 text-[0.8rem] text-gray-400">오류 코드: {{ code }}</p>
        <p class="mb-8 text-[0.85rem] text-gray-500">결제되지 않았으니 요금이 청구되지 않습니다. 다시 시도해 주세요.</p>
        <div class="flex justify-center gap-3">
          <nuxt-link class="os-btn os-btn-black" to="/gift/order">다시 결제하기</nuxt-link>
          <nuxt-link class="os-btn" to="/">홈으로</nuxt-link>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";

useHead({ title: "선물 결제 실패" });
const route = useRoute();
const message = String(route.query.message ?? "결제를 완료하지 못했습니다.");
const code = String(route.query.code ?? "");
</script>
