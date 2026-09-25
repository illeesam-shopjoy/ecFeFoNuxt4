<template>
  <layout :transparent="true">
    <breadcrumb-area title="선물 받기" subtitle="선물 받기" />
    <section class="pb-70">
      <div class="mx-auto max-w-[520px] px-4 py-14 text-center">
        <p v-if="loading" class="text-gray-500">선물을 확인하고 있습니다...</p>
        <template v-else-if="c">
          <div class="mx-auto mb-3 text-[3rem]">🎁</div>
          <h2 class="mb-1 text-2xl font-bold text-gray-900">{{ c.senderNm ? `${c.senderNm}님이 선물을 보냈어요` : "선물이 도착했어요" }}</h2>
          <p class="mb-5 text-[0.9rem] text-gray-500">받는 분이 상품을 고르는 게 아니라, 아래 상품을 교환(주문)해서 받는 선물입니다.</p>

          <div class="mb-4 rounded-2xl border border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-5 py-6 text-left">
            <div class="text-[1.1rem] font-extrabold text-gray-900">{{ c.prodNm }}</div>
            <div class="mt-0.5 text-[0.85rem] text-gray-600">수량 {{ c.qty }}개</div>
            <div v-if="c.giftMsg" class="mt-3 whitespace-pre-line rounded-lg bg-white/70 px-3 py-2 text-[0.85rem] text-gray-700">{{ c.giftMsg }}</div>
            <div class="mt-3 flex items-center justify-between text-[0.8rem] text-gray-500">
              <span>코드 <b class="font-mono tracking-wider text-gray-700">{{ c.couponCode }}</b></span>
              <span class="rounded-full px-2.5 py-0.5 font-bold" :class="PROD_COUPON_STATUS[c.statusCd]?.cls">{{ PROD_COUPON_STATUS[c.statusCd]?.label }}</span>
            </div>
            <div v-if="c.expireDate" class="mt-1 text-[0.78rem] text-gray-500">사용 기한 {{ ymd(c.expireDate) }}</div>
          </div>

          <p v-if="err" class="mb-3 text-[0.85rem] text-red-500">{{ err }}</p>
          <p v-if="c.statusCd !== 'ACTIVE'" class="mb-3 text-[0.85rem] text-gray-500">{{ PROD_COUPON_STATUS[c.statusCd]?.hint }}</p>

          <template v-if="c.statusCd === 'ACTIVE'">
            <button v-if="!loggedIn" type="button" class="os-btn os-btn-black" @click="goLogin">로그인하고 선물 받기</button>
            <template v-else-if="!claimed">
              <button type="button" class="os-btn os-btn-black" :disabled="busy" @click="claim">{{ busy ? "처리 중..." : "내 쿠폰으로 받기" }}</button>
            </template>
            <template v-else>
              <p class="mb-3 text-[0.9rem] font-semibold text-green-700">선물을 받았습니다! 배송지를 입력해 상품을 받아 보세요.</p>
              <nuxt-link class="os-btn os-btn-black" :to="`/gift/redeem?coupon=${c.prodCouponId}`">배송지 입력하고 받기</nuxt-link>
            </template>
          </template>
          <div class="mt-6"><nuxt-link class="text-[0.85rem] text-gray-500 underline" to="/my/prod-coupon">내 상품쿠폰 보기</nuxt-link></div>
        </template>
        <template v-else>
          <h2 class="mb-3 text-2xl font-bold text-red-600">선물을 찾을 수 없습니다</h2>
          <p class="mb-8 text-gray-600">{{ err || "코드가 올바르지 않거나 삭제된 선물입니다." }}</p>
          <nuxt-link class="os-btn os-btn-black" to="/">홈으로</nuxt-link>
        </template>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
/** 선물 링크 도착 화면 — 코드로 미리보기(공개)하고, 로그인 후 내 쿠폰으로 받는다(claim). 받은 뒤 /gift/redeem 에서 배송지를 넣어 교환한다. */
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { prodCouponSvc } from "~/svc/fo/ec/pm/prodCouponSvc";
import { useAuthStore } from "~/store/useAuthStore";
import { PROD_COUPON_STATUS, ymd } from "~/conts/prodCoupon";
import { setLoginReturn } from "~/utils/loginReturn";
import type { PmProdCouponType } from "~/types/pm/pmProdCouponType";

useHead({ title: "선물 받기" });
const route = useRoute();
const code = String(route.params.code ?? "");
const c = ref<PmProdCouponType | null>(null);
const loading = ref(true);
const busy = ref(false);
const err = ref("");
const loggedIn = ref(false);
const claimed = ref(false);

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

function goLogin() {
  // 로그인 후 이 선물 화면으로 돌아오도록 경로를 남긴다(소셜 로그인 이동 후에도 유지)
  setLoginReturn(`/gift/${encodeURIComponent(code)}`);
  navigateTo("/login");
}

async function claim() {
  if (!c.value || busy.value) return;
  busy.value = true;
  err.value = "";
  try {
    c.value = await prodCouponSvc.claim(code);
    claimed.value = true;
  } catch (e) {
    err.value = errText(e, "선물을 받지 못했습니다.");
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  const auth = useAuthStore();
  auth.loadStToken();
  loggedIn.value = auth.isStLoggedIn;
  try {
    c.value = await prodCouponSvc.preview(code);
    // 이미 내가 받은 쿠폰인지(재방문) 확인
    if (loggedIn.value && c.value) {
      const mine = await prodCouponSvc.mine().catch(() => null);
      claimed.value = !!mine?.received.some((x) => x.prodCouponId === c.value!.prodCouponId);
    }
  } catch (e) {
    err.value = errText(e, "");
  } finally {
    loading.value = false;
  }
});
</script>
