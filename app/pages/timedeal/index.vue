<template>
  <layout :transparent="true">
    <breadcrumb-area title="타임딜" subtitle="타임딜" />
    <section class="pt-60 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div v-if="loading" class="text-center py-60 text-gray-500">타임딜 상품을 불러오고 있습니다...</div>
        <div v-else-if="!items.length" class="text-center py-60 text-gray-500">현재 진행중인 타임딜이 없습니다.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24">
          <div v-for="deal in items" :key="deal.dealPoolId" class="border rounded-lg p-16 flex flex-col gap-8">
            <span class="inline-block w-fit px-8 py-2 rounded bg-red-500 text-white text-xs font-bold">
              {{ deal.eventItemId ? "이벤트 타임딜" : "기획전 타임딜" }}
            </span>
            <div class="text-lg font-bold">{{ formatPrice(deal.dealPrice) }}</div>
            <div class="text-sm text-gray-500">잔여수량: {{ deal.dealRemainQty }} / {{ deal.dealTotalQty }}</div>
            <div class="text-sm text-gray-500">종료: {{ formatEndDate(deal.dealEndDate) }}</div>
            <button
              class="os-btn os-btn-black mt-8"
              :disabled="deal.dealRemainQty <= 0 || buyingPoolId === deal.dealPoolId"
              @click="handleBuyNow(deal)"
            >
              {{ deal.dealRemainQty <= 0 ? "매진" : buyingPoolId === deal.dealPoolId ? "처리중..." : "바로 구매" }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { usePrice } from "~/composables/usePrice";
import { foPmEventSvc } from "~/svc/fo/ec/pm/foPmEventSvc";
import { foPmPlanSvc } from "~/svc/fo/ec/pm/foPmPlanSvc";
import { foOrderSvc } from "~/svc/fo/ec/order/foOrderSvc";
import { useAuthStore } from "~/store/useAuthStore";
import type { PmTimedealItemType } from "~/types/pm/pmTimedealType";

const { formatPrice } = usePrice();
const items = ref<PmTimedealItemType[]>([]);
const loading = ref(true);
const buyingPoolId = ref<string | null>(null);

function formatEndDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function loadTimedeals() {
  loading.value = true;
  try {
    const [eventDeals, planDeals] = await Promise.all([
      foPmEventSvc.getTimedealList().catch(() => []),
      foPmPlanSvc.getTimedealList().catch(() => []),
    ]);
    items.value = [...eventDeals, ...planDeals];
  } finally {
    loading.value = false;
  }
}

// 즉시구매 — 장바구니를 거치지 않고 타임딜 특가로 바로 주문(rsPoolId 포함, 예약풀+SKU재고 동시 차감).
// 재고/타임딜 소진 시 서버가 409 성격의 오류로 거부한다 — 그대로 alert로 안내.
async function handleBuyNow(deal: PmTimedealItemType) {
  const authStore = useAuthStore();
  if (!authStore.isStLoggedIn) {
    useNuxtApp().$toast?.error?.("로그인 후 구매할 수 있습니다.");
    return navigateTo("/login");
  }
  buyingPoolId.value = deal.dealPoolId;
  try {
    await foOrderSvc.createOrder({
      payAmt: deal.dealPrice,
      totalAmt: deal.dealPrice,
      items: [
        {
          prodId: (deal.targetId ?? deal.prodId) as string,
          prodSkuId: deal.dealProdSkuId,
          unitPrice: deal.dealPrice,
          orderQty: 1,
          rsPoolId: deal.dealPoolId,
        },
      ],
    });
    useNuxtApp().$toast?.success?.("타임딜 주문이 완료되었습니다.");
    await loadTimedeals();
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string };
    const msg = err?.data?.statusMessage ?? err?.statusMessage ?? "주문에 실패했습니다.";
    useNuxtApp().$toast?.error?.(msg);
  } finally {
    buyingPoolId.value = null;
  }
}

onMounted(loadTimedeals);
useHead({ title: "타임딜" });
</script>
