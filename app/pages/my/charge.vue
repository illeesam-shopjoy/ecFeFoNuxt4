<template>
  <my-shell active="cache" title="캐쉬 충전" :file-path="currentFilePath">
    <div class="rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div class="mb-4 flex items-baseline justify-between">
        <span class="text-[0.9rem] text-gray-500">충전 금액</span>
        <b class="text-[1.4rem] text-gray-900">{{ formatPrice(amount) }}</b>
      </div>
      <div id="charge-payment-method"></div>
      <div id="charge-agreement"></div>
      <div v-if="status === 'loading'" class="py-6 text-center text-[0.85rem] text-gray-500">결제수단을 불러오는 중...</div>
      <div v-else-if="status === 'error'" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.82rem] text-gray-700">
        <div class="mb-1 font-bold text-red-600"><i class="fas fa-exclamation-triangle mr-1.5"></i>결제 연동에 실패했습니다</div>
        <div class="mb-2 whitespace-pre-line">{{ errText }}</div>
        <dl class="m-0 rounded-lg border border-red-100 bg-white px-3 py-2"><div v-for="d in keyInfo()" :key="d.label" class="flex justify-between gap-3 py-0.5 text-[0.78rem]"><dt class="text-gray-500">{{ d.label }}</dt><dd class="m-0 font-mono font-semibold text-gray-800">{{ d.value }}</dd></div></dl>
      </div>
      <div class="mt-5 flex gap-2">
        <nuxt-link to="/my/cache" class="rounded-lg border border-[#c9ced6] bg-[#f3f4f6] px-5 py-3 text-[0.9rem] font-semibold text-gray-700 no-underline">취소</nuxt-link>
        <button type="button" class="flex-1 cursor-pointer rounded-lg border-0 bg-gray-900 py-3 text-[0.95rem] font-bold text-white disabled:opacity-60" :disabled="status !== 'ready' || paying" @click="pay">{{ paying ? "결제 중..." : `${formatPrice(amount)} 충전하기` }}</button>
      </div>
    </div>
  </my-shell>
</template>

<script setup lang="ts">
/** 캐쉬 충전 — 토스 결제위젯으로 금액을 결제하면 /my/charge-success 가 승인·충전을 마무리한다. */
import MyShell from "~/components/my/MyShell.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { loadScriptOnce } from "~/utils/loadScript";
import type { OdTossPaymentsFactoryType, OdTossWidgetsType } from "~/types/od/odTossType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 캐쉬 충전" });
usePageTitle("마이페이지 - 캐쉬 충전");
const { formatPrice } = usePrice();

const MIN = 1000;
const MAX = 1_000_000;
const cfg = useRuntimeConfig().public as { mode?: string; tossPaymentClientKey?: string };
const amount = ref(0);
const status = ref<"loading" | "ready" | "error">("loading");
const errText = ref("");
const paying = ref(false);
let widgets: OdTossWidgetsType | null = null;

const maskKey = (k?: string) => (!k ? "(미설정)" : k.length <= 12 ? "***" : `${k.slice(0, 8)}***${k.slice(-4)}`);
const keyInfo = () => [{ label: "실행 모드(RUN_MODE)", value: String(cfg.mode ?? "-") }, { label: "클라이언트 키", value: maskKey(cfg.tossPaymentClientKey) }];

onMounted(async () => {
  const auth = useAuthStore();
  auth.loadStToken();
  if (!auth.isStLoggedIn) return void (await navigateTo("/login"));
  amount.value = Math.floor(Number(useRoute().query.amount) || 0);
  if (amount.value < MIN || amount.value > MAX) {
    await useAlert().openAlert({ title: "충전 금액 확인", variant: "warning", message: `충전 금액은 ${MIN.toLocaleString()}원 이상 ${MAX.toLocaleString()}원 이하로 입력해 주세요.` });
    return void (await navigateTo("/my/cache"));
  }
  try {
    if (!cfg.tossPaymentClientKey) throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.\n(.env 의 NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY)");
    await loadScriptOnce("https://js.tosspayments.com/v2/standard");
    const T = (window as unknown as { TossPayments?: OdTossPaymentsFactoryType }).TossPayments;
    if (!T) throw new Error("토스페이먼츠 SDK 를 초기화하지 못했습니다.");
    const w = T(cfg.tossPaymentClientKey).widgets({ customerKey: auth.user?.memberId || "@@ANONYMOUS" });
    await w.setAmount({ currency: "KRW", value: amount.value });
    await Promise.all([w.renderPaymentMethods({ selector: "#charge-payment-method", variantKey: "DEFAULT" }), w.renderAgreement({ selector: "#charge-agreement", variantKey: "AGREEMENT" })]);
    widgets = w;
    status.value = "ready";
  } catch (e) {
    errText.value = (e as { message?: string })?.message ?? "결제 연동에 실패했습니다.";
    status.value = "error";
  }
});

async function pay() {
  if (!widgets) return;
  paying.value = true;
  try {
    const orderId = `charge_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await widgets.requestPayment({ orderId, orderName: `캐쉬 충전 ${amount.value.toLocaleString()}원`, successUrl: `${location.origin}/my/charge-success`, failUrl: `${location.origin}/my/charge-success`, customerEmail: useAuthStore().user?.userEmail });
  } catch (e) {
    const x = e as { code?: string; message?: string };
    if (x?.code !== "USER_CANCEL") await useAlert().openAlert({ title: "결제 실패", variant: "error", message: `${x?.message ?? "결제를 진행하지 못했습니다."}${x?.code ? `\n(오류 코드: ${x.code})` : ""}`, details: keyInfo() });
  } finally {
    paying.value = false;
  }
}
</script>
