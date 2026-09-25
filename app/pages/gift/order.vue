<template>
  <layout :transparent="true">
    <breadcrumb-area title="선물하기" subtitle="선물 결제" />
    <client-only>
      <section class="pt-[16px] md:pt-[80px] pb-100">
        <div class="mx-auto max-w-[640px] px-4">
          <div v-if="!ctx" class="text-center">
            <h3>선물할 상품 정보가 없습니다</h3>
            <nuxt-link class="os-btn os-btn-black mt-15" to="/shop">쇼핑하러 가기</nuxt-link>
          </div>
          <template v-else>
            <!-- 선물 요약 -->
            <div class="mb-4 rounded-xl border border-[#e5e7eb] bg-white p-5">
              <h3 class="go-title">🎁 선물 정보</h3>
              <dl class="m-0 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1.5 text-[0.9rem]">
                <dt class="text-gray-500">상품</dt><dd class="m-0 font-semibold text-gray-900">{{ ctx.prodNm }} × {{ ctx.qty }}</dd>
                <dt class="text-gray-500">받는 분</dt><dd class="m-0">{{ ctx.recvNm }}<template v-if="ctx.recvPhone"> · {{ ctx.recvPhone }}</template></dd>
                <dt v-if="ctx.giftMsg" class="text-gray-500">메시지</dt><dd v-if="ctx.giftMsg" class="m-0 whitespace-pre-line">{{ ctx.giftMsg }}</dd>
              </dl>
              <p class="m-0 mt-3 text-[0.78rem] text-gray-400">결제 금액은 서버에서 상품 가격으로 계산됩니다. 결제가 완료되면 받는 분께 전달할 쿠폰 코드/링크가 발급됩니다.</p>
            </div>

            <!-- 결제 방법 -->
            <div class="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <h3 class="go-title">결제 방법</h3>
              <pay-method-select v-model="payMethod" />
              <div v-if="isTestPay" class="mt-3 rounded-lg bg-[#fff7e6] px-3 py-2 text-[0.8rem] text-[#8a5a25]"><i class="fas fa-info-circle mr-1.5"></i>테스트 결제 환경입니다. 실제로 결제되지 않습니다.</div>
              <label class="m-0 mt-3 flex cursor-pointer items-center gap-2 text-[0.85rem] text-gray-700">
                <input v-model="agree" type="checkbox" class="!my-0 accent-[#bc8246]" />[필수] 결제 서비스 이용 약관, 개인정보 처리에 동의합니다.
              </label>
              <p v-if="err" class="m-0 mt-2 whitespace-pre-line text-[0.82rem] text-red-500">{{ err }}</p>
              <div class="order-button-payment mt-20">
                <button type="button" class="os-btn os-btn-black" :disabled="busy" @click="pay">{{ busy ? "처리 중..." : "선물 결제하기" }}</button>
              </div>
            </div>
          </template>
        </div>
      </section>
    </client-only>
  </layout>
</template>

<script setup lang="ts">
/**
 * 선물 결제 — 상품 상세의 [선물하기]에서 받은 정보(gift_ctx)로 서버에 선물 주문을 만들고(금액 서버 계산), 선택한 결제수단의 결제창을 연다.
 * 결제가 끝나면 /gift/success 가 승인·기록하고, 승인되면 서버가 쿠폰을 사용 가능 상태로 바꾼다.
 */
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import PayMethodSelect from "~/components/pay/PayMethodSelect.vue";
import { DEFAULT_PAY_METHOD, loadLastPayMethod, saveLastPayMethod, type PayMethodCd } from "~/conts/payMethods";
import { getPayProvider } from "~/utils/payProvider";
import { prodCouponSvc } from "~/svc/fo/ec/pm/prodCouponSvc";
import { useAuthStore } from "~/store/useAuthStore";

useHead({ title: "선물하기" });

interface GiftCtx { prodId: string; prodSkuId?: string; qty: number; prodNm: string; recvNm: string; recvPhone: string; recvEmail: string; giftMsg: string }
const ctx = ref<GiftCtx | null>(null);
const payMethod = ref<PayMethodCd>(DEFAULT_PAY_METHOD);
const agree = ref(true);
const busy = ref(false);
const err = ref("");
const isTestPay = computed(() => ((useRuntimeConfig().public as { tossPayClientKey?: string }).tossPayClientKey ?? "").startsWith("test_"));

onMounted(() => {
  useAuthStore().loadStToken();
  if (!useAuthStore().isStLoggedIn) return void navigateTo("/login");
  try {
    ctx.value = JSON.parse(sessionStorage.getItem("gift_ctx") ?? "null");
  } catch {
    ctx.value = null;
  }
  payMethod.value = loadLastPayMethod();
});

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

async function pay() {
  if (!ctx.value || busy.value) return;
  err.value = "";
  if (!agree.value) return void (err.value = "결제 서비스 이용 약관과 개인정보 처리에 동의해 주세요.");
  busy.value = true;
  try {
    // 1) 서버에 선물 주문(결제 대기)을 만든다 — 결제 금액은 서버가 계산
    const c = ctx.value;
    const g = await prodCouponSvc.giftOrder({ prodId: c.prodId, prodSkuId: c.prodSkuId, qty: c.qty, recvNm: c.recvNm, recvPhone: c.recvPhone, recvEmail: c.recvEmail, giftMsg: c.giftMsg });
    sessionStorage.setItem("gift_pay", JSON.stringify({ orderId: g.orderId, couponCode: g.couponCode, prodNm: c.prodNm, recvNm: c.recvNm }));
    saveLastPayMethod(payMethod.value);
    // 2) 결제창 — 성공/실패는 /gift/success, /gift/fail 로 돌아온다
    const origin = window.location.origin;
    const user = useAuthStore().user;
    await getPayProvider(payMethod.value).request({
      method: payMethod.value,
      amount: g.payAmt,
      orderId: g.orderId,
      orderName: `선물하기 - ${c.prodNm}`.slice(0, 100),
      successUrl: `${origin}/gift/success`,
      failUrl: `${origin}/gift/fail`,
      customerKey: user?.memberId || "@@ANONYMOUS",
      customerEmail: user?.userEmail,
      customerName: user?.userNm,
    });
  } catch (e) {
    if ((e as { code?: string })?.code === "USER_CANCEL") return; // 결제창을 닫음
    err.value = errText(e, "선물 결제를 시작하지 못했습니다.");
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.go-title { margin: 0 0 12px; font-size: 1.05rem !important; font-weight: 700 !important; line-height: 1.3; color: #111827; letter-spacing: 0; }
</style>
