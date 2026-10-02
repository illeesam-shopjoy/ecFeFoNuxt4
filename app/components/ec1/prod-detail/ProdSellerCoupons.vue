<template>
  <!-- 상품 상세 > 쿠폰 받기 — 이 상품에 쓸 수 있는 판매자 쿠폰을 보여 주고 받는다(회원당 1장). 받은 쿠폰은 결제할 때 이 상품에 적용된다.
       받을 수 있는 쿠폰이 없으면 아무것도 그리지 않는다. -->
  <div v-if="coupons.length" class="mb-4 rounded-[10px] border border-[#f1e4d3] bg-[#fdf9f3] px-3 py-2.5">
    <div class="mb-1.5 text-[0.82rem] font-bold text-[#8a5a1f]"><i class="fas fa-ticket-alt mr-1"></i>이 상품에 쓸 수 있는 쿠폰</div>
    <ul class="m-0 flex list-none flex-col gap-1.5 p-0">
      <li v-for="c in coupons" :key="c.couponId" class="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2">
        <div class="min-w-0 flex-1">
          <div class="truncate text-[0.88rem] font-bold text-gray-900">{{ benefit(c) }} <span class="font-normal text-gray-600">{{ c.couponNm }}</span></div>
          <div class="text-[0.75rem] text-gray-500">{{ condition(c) }}</div>
        </div>
        <button v-if="c.claimedByMe" type="button" class="shrink-0 rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-3 py-1.5 text-[0.78rem] font-bold text-gray-500" disabled>받음</button>
        <button v-else type="button" class="shrink-0 cursor-pointer rounded-lg border-0 bg-theme px-3 py-1.5 text-[0.78rem] font-bold text-white disabled:opacity-60" :disabled="busyId === c.couponId" @click="handleBtnAction('coupon-claim', c)">
          {{ busyId === c.couponId ? "받는 중…" : "쿠폰 받기" }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { pmSellerPromoSvc } from "~/svc/fo/ec/pm/pmSellerPromoSvc";
import type { PmSellerBuyerCouponType } from "~/types/pm/pmSellerPromoType";

const props = defineProps<{ prodId: string }>();
const coupons = ref<PmSellerBuyerCouponType[]>([]);
const busyId = ref("");

const benefit = (c: PmSellerBuyerCouponType) => (c.valTypeCd === "RATE" ? `${c.value}% 할인` : `${Number(c.value).toLocaleString()}원 할인`);
function condition(c: PmSellerBuyerCouponType): string {
  const parts: string[] = [];
  if (c.minOrderAmt) parts.push(`${c.minOrderAmt.toLocaleString()}원 이상 구매 시`);
  if (c.valTypeCd === "RATE" && c.maxDiscntAmt) parts.push(`최대 ${c.maxDiscntAmt.toLocaleString()}원`);
  if (c.endDate) parts.push(`${c.endDate} 까지`);
  if (c.remaining != null) parts.push(`${c.remaining}장 남음`);
  return parts.join(" · ");
}

async function load() {
  if (!props.prodId) return void (coupons.value = []);
  try {
    useAuthStore().loadStToken();
    coupons.value = await pmSellerPromoSvc.getProdCoupons(props.prodId, useAuthStore().isStLoggedIn);
  } catch {
    coupons.value = []; // 쿠폰 영역은 부가 정보 — 조회에 실패해도 상품 화면은 그대로 보인다
  }
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ ProdSellerCoupons.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "coupon-claim") {
    return claim(param as PmSellerBuyerCouponType);
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

async function claim(c: PmSellerBuyerCouponType) {
  if (!useAuthStore().isStLoggedIn) {
    useNuxtApp().$toast.info("로그인하면 쿠폰을 받을 수 있습니다.");
    return void (await navigateTo({ path: "/login", query: { redirect: useRoute().fullPath } }));
  }
  busyId.value = c.couponId;
  try {
    await pmSellerPromoSvc.claimCoupon(c.couponId);
    useNuxtApp().$toast.success("쿠폰을 받았습니다. 결제할 때 이 상품에 적용됩니다.");
  } catch (e) {
    const msg = String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? "쿠폰을 받지 못했습니다.").split("::")[0]!;
    useNuxtApp().$toast.error(msg);
  } finally {
    busyId.value = "";
    await load(); // 받음 표시·남은 수량 갱신
  }
}

onMounted(load);
watch(() => props.prodId, load);
</script>
