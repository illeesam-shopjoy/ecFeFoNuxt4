<template>
  <layout :transparent="true">
    <breadcrumb-area title="결제 실패" subtitle="결제 실패" />
    <section class="checkout-area pb-70">
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fef2f2] text-[1.7rem] text-[#dc2626]"><i class="fas fa-times"></i></div>
        <h2 class="text-2xl font-bold text-red-600 mb-2">결제에 실패했습니다</h2>
        <p class="text-gray-600 mb-6">{{ message || "다시 시도해 주세요." }}</p>
        <dl v-if="code || orderId" class="mx-auto mb-8 max-w-xl overflow-hidden rounded-xl border border-[#e5e7eb] bg-white text-left text-[0.9rem]">
          <div v-if="orderId" class="flex items-baseline justify-between gap-4 border-b border-[#f0f0f0] px-5 py-3">
            <dt class="shrink-0 text-gray-500">주문번호</dt>
            <dd class="m-0 min-w-0 break-all text-right font-semibold text-gray-800">{{ orderId }}</dd>
          </div>
          <div v-if="code" class="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt class="shrink-0 text-gray-500">오류 코드</dt>
            <dd class="m-0 min-w-0 break-all text-right font-mono font-semibold text-gray-800">{{ code }}</dd>
          </div>
        </dl>
        <nuxt-link class="os-btn os-btn-black" to="/checkout">결제 페이지로</nuxt-link>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";

const route = useRoute();
const code = computed(() => (route.query.code as string) ?? "");
const message = computed(() => (route.query.message as string) ?? "");
const orderId = computed(() => (route.query.orderId as string) ?? "");

useHead({ title: "결제 실패" });
</script>
