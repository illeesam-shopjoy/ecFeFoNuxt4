<template>
  <!-- 구매내역 — 이 계정의 주문(ShopJoy 결제 주문과 같은 데이터). danmoo1 자체는 채팅 직거래라 주문이 없을 수 있다 -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="구매내역" fallback="/my" /></template>

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-shopping-bag" title="로그인하면 구매내역을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/my/orders' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!orders.length" icon="far fa-receipt" title="구매내역이 없어요" desc="danmoo에서는 채팅으로 직거래해요. 결제한 주문(ShopJoy)이 있으면 여기에 보여요" />
    <ul v-else>
      <li v-for="o in orders" :key="o.orderId" class="px-4 py-4 border-b border-[var(--dm-line)]">
        <div class="flex items-center justify-between text-[12.5px] muted"><span>{{ ymd(o.orderDate || o.regDate) }} · {{ o.orderId }}</span><span class="font-bold" :class="o.orderStatusCd === 'CANCELED' ? 'text-danger' : 'primary'">{{ o.orderStatusCdNm || o.orderStatusCd }}</span></div>
        <p class="text-[15.5px] mt-1.5 clamp-2">{{ firstItem(o) }}</p>
        <div class="flex items-center justify-between mt-1.5"><span class="text-[13px] muted">{{ o.payMethodCdNm || o.payMethodCd || "" }}<template v-if="o.dlivStatusCdNm"> · {{ o.dlivStatusCdNm }}</template></span><b class="text-[16px]">{{ formatWon(o.payAmt ?? o.totalAmt, "0원") }}</b></div>
      </li>
    </ul>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { myOrderSvc } from "~/svc/fo/my/myOrderSvc";
import { formatWon } from "~/utils/timeAgo";
import type { OdOrderType } from "~/types/od/odOrderType";

useHead({ title: "구매내역" });
const authStore = useAuthStore();
const orders = ref<OdOrderType[]>([]);
const loading = ref(false);
const ready = ref(false);
const ymd = (v?: string) => (v ? String(v).slice(0, 10).replace(/-/g, ".") : "");
const firstItem = (o: OdOrderType) => {
  const items = o.orderItems ?? [];
  if (!items.length) return "주문 상품";
  return items.length > 1 ? `${items[0]!.prodNm} 외 ${items.length - 1}건` : String(items[0]!.prodNm ?? "주문 상품");
};

/* initPage — 로그인 복원 후 내 주문(최근순) */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  loading.value = true;
  try {
    orders.value = (await myOrderSvc.getList({})).sort((a, b) => String(b.orderDate || b.regDate || "").localeCompare(String(a.orderDate || a.regDate || "")));
  } catch (e) {
    console.error("[danmoo1/my/orders] 주문 조회 실패", e);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
