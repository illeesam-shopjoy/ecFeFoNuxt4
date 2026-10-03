<template>
  <!-- 쿠폰함 — 이 계정이 가진 쿠폰(ShopJoy 와 같은 지갑). danmoo1 에서는 쓰는 곳이 없어 보기만 한다 -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="쿠폰함" fallback="/my" /></template>

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-ticket-alt" title="로그인하면 쿠폰을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/my/coupons' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!coupons.length" icon="far fa-ticket-alt" title="가진 쿠폰이 없어요" desc="쿠폰은 ShopJoy 결제에서 쓸 수 있어요" />
    <ul v-else class="p-4 space-y-3">
      <li v-for="c in coupons" :key="c.couponId" class="rounded-2xl border border-[var(--dm-line)] overflow-hidden flex">
        <div class="w-24 flex-none bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] flex flex-col items-center justify-center p-2 text-center">
          <b class="text-[18px] leading-tight">{{ c.discountRate ? `${c.discountRate}%` : formatWon(c.discountAmt, "") || "할인" }}</b>
          <span class="text-[11px]">{{ c.couponTypeCdNm || "쿠폰" }}</span>
        </div>
        <div class="flex-1 min-w-0 px-4 py-3">
          <b class="text-[15px] block truncate">{{ c.couponNm }}</b>
          <p class="text-[12.5px] muted mt-1">
            <template v-if="c.minOrderAmt">{{ formatWon(c.minOrderAmt) }} 이상 구매 시</template><template v-else>조건 없음</template>
            <template v-if="c.maxDiscountAmt"> · 최대 {{ formatWon(c.maxDiscountAmt) }}</template>
          </p>
          <p v-if="c.couponCd" class="text-[11px] muted mt-1">코드 {{ c.couponCd }}</p>
        </div>
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
import { myCouponSvc } from "~/svc/fo/my/myCouponSvc";
import { formatWon } from "~/utils/timeAgo";
import type { PmCouponType } from "~/types/pm/pmCouponType";

useHead({ title: "쿠폰함" });
const authStore = useAuthStore();
const coupons = ref<PmCouponType[]>([]);
const loading = ref(false);
const ready = ref(false);

/* initPage — 로그인 복원 후 내 쿠폰 */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  loading.value = true;
  try {
    coupons.value = await myCouponSvc.getList({});
  } catch (e) {
    console.error("[danmoo1/my/coupons] 쿠폰 조회 실패", e);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
