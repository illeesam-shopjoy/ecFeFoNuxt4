<template>
  <layout :transparent="true">
    <div class="max-w-7xl mx-auto px-4 py-32 text-center text-gray-400">
      <template v-if="empty">표시할 상품이 없습니다.</template>
      <template v-else>상품 상세로 이동 중...</template>
    </div>
  </layout>
</template>

<script setup lang="ts">
/**
 * /prod-dtl (id 없음) — 메뉴의 "상품 상세" 링크용. 예전엔 이 페이지가 상품 상세 화면 전체를 복제하고 있었는데(첫 상품 미리보기),
 * 상세 화면이 커지면서(갤러리·탭·하단 구매바 등) 복제를 없애고 첫 상품의 상세 페이지(/prod-dtl/:id)로 이동시킨다. (CSR 전용 — nuxt.config routeRules)
 */
import { ref, onMounted } from "vue";
import Layout from "~/layout/Layout.vue";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";

useHead({ title: "상품 상세" });

const empty = ref(false);
onMounted(async () => {
  try {
    const first = (await pdProductSvc.getPaged({ pageNo: 1, pageSize: 1 })).items[0];
    if (first) {
      await navigateTo(`/prod-dtl/${first.prodId}`, { replace: true });
      return;
    }
  } catch {
    /* 조회 실패는 아래 빈 화면 처리 */
  }
  empty.value = true;
});
</script>
