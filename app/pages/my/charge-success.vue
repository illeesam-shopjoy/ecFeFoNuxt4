<template>
  <my-shell active="cache" title="캐쉬 충전 결과" :file-path="null">
    <div class="mx-auto max-w-xl rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center">
      <p v-if="state === 'loading'" class="m-0 text-gray-600">결제를 확인하고 충전하는 중입니다...</p>
      <template v-else-if="state === 'ok'">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[1.7rem] text-[#16a34a]"><i class="fas fa-check"></i></div>
        <h3 class="m-0 mb-1 text-[1.3rem] font-bold text-green-700">캐쉬가 충전되었습니다</h3>
        <p class="m-0 mb-5 text-[0.9rem] text-gray-500">충전 {{ formatPrice(result.charged) }} · 현재 잔액 <b class="text-gray-900">{{ formatPrice(result.balance) }}</b></p>
      </template>
      <template v-else>
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fef2f2] text-[1.7rem] text-[#dc2626]"><i class="fas fa-times"></i></div>
        <h3 class="m-0 mb-1 text-[1.3rem] font-bold text-red-600">충전에 실패했습니다</h3>
        <p class="m-0 mb-5 whitespace-pre-line text-[0.9rem] text-gray-600">{{ message }}</p>
      </template>
      <div class="flex justify-center gap-2">
        <nuxt-link to="/my/cache" class="rounded-lg bg-gray-900 px-5 py-2.5 text-[0.9rem] font-bold text-white no-underline">캐쉬 내역</nuxt-link>
        <nuxt-link v-if="state === 'fail'" to="/my/cache" class="rounded-lg border border-[#c9ced6] bg-[#f3f4f6] px-5 py-2.5 text-[0.9rem] font-semibold text-gray-700 no-underline">다시 충전</nuxt-link>
      </div>
    </div>
  </my-shell>
</template>

<script setup lang="ts">
/** 토스 결제창에서 돌아오는 곳 — ① 토스 승인(서버) ② 서버가 결제를 다시 조회해 캐시 충전 */
import MyShell from "~/components/my/MyShell.vue";
import { useAuthStore } from "~/store/useAuthStore";
import { paymentSvc } from "~/svc/co/payments/paymentSvc";
import { myCashChargeSvc } from "~/svc/fo/ec/my/myCashChargeSvc";
import type { PmCashChargeResType } from "~/types/pm/pmCashChargeType";

useHead({ title: "캐쉬 충전 결과" });
const { formatPrice } = usePrice();
const state = ref<"loading" | "ok" | "fail">("loading");
const message = ref("");
const result = ref<PmCashChargeResType>({ balance: 0, charged: 0 });

onMounted(async () => {
  const auth = useAuthStore();
  auth.loadStToken();
  const q = useRoute().query;
  if (q.code) {
    state.value = "fail";
    message.value = `${String(q.message ?? "결제에 실패했습니다.")}\n(오류 코드: ${String(q.code)})`;
    return;
  }
  const paymentKey = String(q.paymentKey ?? "");
  const orderId = String(q.orderId ?? "");
  const amount = Number(q.amount);
  if (!paymentKey || !orderId || !amount || !auth.isStLoggedIn) {
    state.value = "fail";
    message.value = !auth.isStLoggedIn ? "로그인이 필요합니다." : "결제 정보가 없습니다.";
    return;
  }
  try {
    await paymentSvc.confirmPayment({ paymentKey, orderId, amount });
    result.value = await myCashChargeSvc.charge({ paymentKey, orderId, amount });
    state.value = "ok";
  } catch (e) {
    const x = e as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string };
    state.value = "fail";
    message.value = String(x?.data?.statusMessage ?? x?.data?.message ?? x?.statusMessage ?? x?.message ?? "충전 처리에 실패했습니다.").split("::")[0]! + "\n결제가 승인됐다면 잠시 뒤 캐쉬 내역을 확인해 주세요.";
  }
});
</script>
