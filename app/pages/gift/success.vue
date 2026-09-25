<template>
  <layout :transparent="true">
    <breadcrumb-area title="선물 결제 완료" subtitle="선물 결제 완료" />
    <section class="pb-70">
      <div class="mx-auto max-w-[560px] px-4 py-14 text-center">
        <p v-if="status === 'loading'" class="text-gray-600">결제를 확인하고 있습니다...</p>

        <template v-else-if="status === 'ok'">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-[1.7rem]" :class="waiting ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-[#f0fdf4] text-[#16a34a]'">{{ waiting ? "⏳" : "🎁" }}</div>
          <h2 class="mb-2 text-2xl font-bold" :class="waiting ? 'text-[#b45309]' : 'text-green-700'">{{ waiting ? "입금 대기 중입니다" : "선물이 준비되었습니다" }}</h2>
          <p class="mb-6 text-[0.9rem] text-gray-500">
            {{ waiting ? "가상계좌로 입금하면 쿠폰이 활성화됩니다. 입금이 확인되면 아래 링크로 전달할 수 있어요." : `${recvNm || "받는 분"}께 아래 링크나 코드를 전달해 주세요.` }}
          </p>

          <!-- 쿠폰 코드 카드 -->
          <div class="mb-5 rounded-2xl border border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-5 py-6 text-left">
            <div class="text-[0.78rem] text-gray-500">상품쿠폰 코드</div>
            <div class="my-1 select-all font-mono text-[1.6rem] font-extrabold tracking-widest text-gray-900">{{ code }}</div>
            <div class="text-[0.85rem] font-semibold text-gray-700">{{ prodNm }}</div>
            <div v-if="expireText" class="mt-1 text-[0.78rem] text-gray-500">사용 기한 {{ expireText }}</div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2">
            <button type="button" class="gs-btn gs-kakao" @click="shareKakao">💬 카카오톡으로 보내기</button>
            <button type="button" class="gs-btn" @click="copy(link, '선물 링크가 복사되었습니다.')">🔗 링크 복사</button>
            <button type="button" class="gs-btn" @click="copy(code, '쿠폰 코드가 복사되었습니다.')">📋 코드 복사</button>
            <a class="gs-btn no-underline" :href="smsHref">✉️ 문자로 보내기</a>
          </div>

          <dl v-if="vaRows.length" class="mx-auto mt-6 max-w-md overflow-hidden rounded-xl border border-[#e5e7eb] bg-white text-left text-[0.88rem]">
            <div v-for="r in vaRows" :key="r.label" class="flex justify-between gap-4 border-b border-[#f0f0f0] px-4 py-2.5 last:border-b-0"><dt class="text-gray-500">{{ r.label }}</dt><dd class="m-0 font-semibold text-gray-800">{{ r.value }}</dd></div>
          </dl>

          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <nuxt-link class="os-btn" to="/my/prod-coupon">내 상품쿠폰</nuxt-link>
            <nuxt-link class="os-btn os-btn-black" to="/">쇼핑 계속하기</nuxt-link>
          </div>
        </template>

        <template v-else>
          <h2 class="mb-4 text-2xl font-bold text-red-600">결제 확인 실패</h2>
          <p class="mb-8 text-gray-600">{{ errorMessage }}</p>
          <nuxt-link class="os-btn os-btn-black" to="/">홈으로</nuxt-link>
        </template>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
/** 선물 결제 완료 — 토스 승인·기록(서버) 후 쿠폰 코드/링크를 보여주고 카카오톡·문자 등으로 전달하게 한다. */
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { paymentSvc } from "~/svc/co/payments/paymentSvc";
import { prodCouponSvc } from "~/svc/fo/ec/pm/prodCouponSvc";
import { useAuthStore } from "~/store/useAuthStore";
import { giftLink, ymd } from "~/conts/prodCoupon";
import { useShareTools } from "~/composables/useShareTools";
import type { OdPayConfirmResType } from "~/types/od/odPayConfirmResType";

useHead({ title: "선물 결제 완료" });
const route = useRoute();
const { shareKakaoUrl } = useShareTools();

const status = ref<"loading" | "ok" | "fail">("loading");
const errorMessage = ref("");
const pay = ref<OdPayConfirmResType | null>(null);
const code = ref("");
const prodNm = ref("");
const recvNm = ref("");
const expireText = ref("");
const link = computed(() => (code.value ? giftLink(code.value) : ""));
const waiting = computed(() => pay.value?.status === "WAITING_FOR_DEPOSIT");
const smsHref = computed(() => `sms:?&body=${encodeURIComponent(`🎁 선물이 도착했어요! ${link.value}`)}`);
const BANKS: Record<string, string> = { "04": "국민", "11": "농협", "20": "우리", "81": "하나", "88": "신한", "89": "케이뱅크", "90": "카카오뱅크", "92": "토스뱅크" };
const vaRows = computed(() => {
  const v = pay.value?.virtualAccount;
  if (!v) return [];
  return [
    { label: "입금 은행", value: v.bankCode ? `${BANKS[v.bankCode] ?? v.bankCode}은행` : "" },
    { label: "계좌번호", value: v.accountNumber ?? "" },
    { label: "입금 기한", value: v.dueDate ? String(v.dueDate).slice(0, 16).replace("T", " ") : "" },
  ].filter((r) => r.value);
});

async function copy(text: string, msg: string) {
  try {
    await navigator.clipboard.writeText(text);
    await useAlert().openAlert(msg);
  } catch {
    await useAlert().openAlert("복사하지 못했습니다. 직접 선택해 복사해 주세요.");
  }
}
function shareKakao() {
  return shareKakaoUrl({ title: `🎁 ${prodNm.value} 선물이 도착했어요`, description: "링크를 눌러 선물을 받아 보세요.", url: link.value, buttonTitle: "선물 받기" });
}

onMounted(async () => {
  useAuthStore().loadStToken();
  const paymentKey = String(route.query.paymentKey ?? "");
  const orderId = String(route.query.orderId ?? "");
  const amount = Number(route.query.amount);
  if (!paymentKey || !orderId || !amount) {
    status.value = "fail";
    errorMessage.value = "결제 정보가 없습니다.";
    return;
  }
  try {
    // 승인 + 서버 기록(od_pay). 결제가 완료되면 서버가 쿠폰을 사용 가능(ACTIVE)으로 바꾼다
    pay.value = await paymentSvc.confirmPayment({ paymentKey, orderId, amount, keyType: "pay", orderRefId: orderId });
    let saved: { couponCode?: string; prodNm?: string; recvNm?: string } = {};
    try {
      saved = JSON.parse(sessionStorage.getItem("gift_pay") ?? "{}");
    } catch {
      /* 무시 */
    }
    // 코드는 서버 기록으로 다시 확인(이 탭의 저장값이 없을 때도 보이도록)
    const mine = await prodCouponSvc.mine().catch(() => null);
    const c = mine?.sent.find((x) => x.srcOrderId === orderId);
    code.value = c?.couponCode ?? saved.couponCode ?? "";
    prodNm.value = c?.prodNm ?? saved.prodNm ?? "";
    recvNm.value = c?.recvNm ?? saved.recvNm ?? "";
    expireText.value = ymd(c?.expireDate);
    if (!code.value) throw new Error("쿠폰 코드를 확인하지 못했습니다. '내 상품쿠폰'에서 확인해 주세요.");
    status.value = "ok";
    try {
      sessionStorage.removeItem("gift_ctx");
      sessionStorage.removeItem("gift_pay");
    } catch {
      /* 무시 */
    }
  } catch (e) {
    status.value = "fail";
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string };
    errorMessage.value = err?.data?.statusMessage ?? err?.statusMessage ?? err?.message ?? "결제 확인에 실패했습니다.";
  }
});
</script>

<style scoped>
.gs-btn { display: inline-flex; align-items: center; gap: 4px; padding: 10px 16px; border: 1.5px solid #d1d5db; border-radius: 10px; background: #fff; color: #1f2937; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.gs-btn:hover { border-color: #9ca3af; }
.gs-kakao { border-color: #FEE500; background: #FEE500; color: #191919; }
</style>
