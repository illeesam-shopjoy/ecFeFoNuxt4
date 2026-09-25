<template>
  <layout :transparent="true">
    <breadcrumb-area title="마이페이지" subtitle="마이페이지" />
    <section class="pt-14 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
        <my-menu active="prod-coupon" />
        <div class="min-w-0">
          <!-- 코드 입력으로 받기 -->
          <div class="mb-4 rounded-lg border border-[#e5e7eb] bg-white p-4">
            <div class="mb-2 text-[0.85rem] font-bold text-gray-800">🎁 선물 코드 등록</div>
            <form class="flex flex-wrap gap-2" @submit.prevent="claimByCode">
              <input v-model="codeInput" class="pc-in min-w-[180px] flex-1 font-mono uppercase" maxlength="14" placeholder="선물 코드 (XXXX-XXXX-XXXX)" />
              <button type="submit" class="h-10 cursor-pointer rounded-md border-0 bg-gray-900 px-5 text-[0.85rem] font-bold text-white">받기</button>
            </form>
            <p class="m-0 mt-2 text-[0.75rem] text-gray-400">받은 선물 링크를 열어도 됩니다. 사용 가능한 상품쿠폰은 결제 시 “상품쿠폰” 결제수단으로 교환할 수 있어요.</p>
          </div>

          <div class="mb-3 flex border-b border-[#e5e7eb]">
            <button v-for="t in TABS" :key="t.key" type="button" class="-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-6 py-3 text-[0.88rem]" :class="tab === t.key ? 'border-gray-900 font-bold text-gray-900' : 'border-transparent text-gray-400'" @click="tab = t.key">
              {{ t.label }} <span class="font-normal">({{ t.key === "received" ? data.received.length : data.sent.length }})</span>
            </button>
          </div>

          <div v-if="loading" class="py-16 text-center text-gray-400">불러오는 중...</div>
          <div v-else-if="errorMsg" class="py-16 text-center text-red-500">{{ errorMsg }}</div>
          <div v-else-if="!rows.length" class="py-16 text-center text-[1rem] text-gray-400">{{ tab === "received" ? "받은 상품쿠폰이 없습니다." : "보낸 선물이 없습니다." }}</div>
          <ul v-else class="m-0 list-none space-y-3 p-0">
            <li v-for="c in rows" :key="c.prodCouponId" class="rounded-xl border border-[#e5e7eb] bg-white p-4">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div class="text-[0.95rem] font-bold text-gray-900">{{ c.prodNm }} <span class="font-normal text-gray-500">× {{ c.qty }}</span></div>
                  <div class="mt-0.5 text-[0.8rem] text-gray-500">
                    <template v-if="tab === 'received'">보낸 분 {{ c.senderNm || "-" }}</template>
                    <template v-else>받는 분 {{ c.recvNm || "-" }}<template v-if="c.claimed"> · 수령 완료</template></template>
                    <template v-if="c.expireDate"> · 기한 {{ ymd(c.expireDate) }}</template>
                  </div>
                </div>
                <span class="rounded-full px-2.5 py-0.5 text-[0.75rem] font-bold" :class="PROD_COUPON_STATUS[c.statusCd]?.cls">{{ PROD_COUPON_STATUS[c.statusCd]?.label ?? c.statusCd }}</span>
              </div>
              <div v-if="c.giftMsg" class="mt-2 whitespace-pre-line rounded-lg bg-[#faf6f1] px-3 py-2 text-[0.82rem] text-gray-600">{{ c.giftMsg }}</div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span class="select-all font-mono text-[0.85rem] font-bold tracking-wider text-gray-700">{{ c.couponCode }}</span>
                <button type="button" class="pc-btn" @click="copy(c.couponCode, '쿠폰 코드가 복사되었습니다.')">코드 복사</button>
                <template v-if="tab === 'sent' && (c.statusCd === 'ACTIVE' || c.statusCd === 'PENDING_PAY')">
                  <button type="button" class="pc-btn" @click="copy(giftLink(c.couponCode), '선물 링크가 복사되었습니다.')">링크 복사</button>
                  <button type="button" class="pc-btn pc-kakao" @click="kakao(c)">카카오톡 보내기</button>
                </template>
                <nuxt-link v-if="tab === 'received' && c.statusCd === 'ACTIVE'" class="pc-btn pc-primary no-underline" :to="`/gift/redeem?coupon=${c.prodCouponId}`">교환하기</nuxt-link>
              </div>
              <div v-if="PROD_COUPON_STATUS[c.statusCd]?.hint && c.statusCd !== 'ACTIVE'" class="mt-1.5 text-[0.75rem] text-gray-400">{{ PROD_COUPON_STATUS[c.statusCd].hint }}</div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
/** 마이페이지 > 선물 · 상품쿠폰 — 받은 쿠폰(교환하기)·보낸 선물(링크/코드 재전달) 목록과 코드 직접 등록 */
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import MyMenu from "~/components/my/MyMenu.vue";
import { prodCouponSvc } from "~/svc/fo/ec/pm/prodCouponSvc";
import { useAuthStore } from "~/store/useAuthStore";
import { PROD_COUPON_STATUS, giftLink, ymd } from "~/conts/prodCoupon";
import { useShareTools } from "~/composables/useShareTools";
import { usePageTitle } from "~/composables/usePageTitle";
import type { PmProdCouponType } from "~/types/pm/pmProdCouponType";

useHead({ title: "마이페이지 - 선물 · 상품쿠폰" });
usePageTitle("마이페이지 - 선물 · 상품쿠폰");
const { shareKakaoUrl } = useShareTools();

const TABS = [
  { key: "received", label: "받은 쿠폰" },
  { key: "sent", label: "보낸 선물" },
] as const;
const tab = ref<"received" | "sent">("received");
const data = reactive<{ received: PmProdCouponType[]; sent: PmProdCouponType[] }>({ received: [], sent: [] });
const rows = computed(() => (tab.value === "received" ? data.received : data.sent));
const loading = ref(true);
const errorMsg = ref("");
const codeInput = ref("");

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

async function load() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const r = await prodCouponSvc.mine();
    data.received = r.received ?? [];
    data.sent = r.sent ?? [];
  } catch (e) {
    errorMsg.value = errText(e, "목록을 불러오지 못했습니다.");
  } finally {
    loading.value = false;
  }
}

async function copy(text: string, msg: string) {
  try {
    await navigator.clipboard.writeText(text);
    await useAlert().openAlert(msg);
  } catch {
    await useAlert().openAlert("복사하지 못했습니다. 직접 선택해 복사해 주세요.");
  }
}
function kakao(c: PmProdCouponType) {
  return shareKakaoUrl({ title: `🎁 ${c.prodNm} 선물이 도착했어요`, description: "링크를 눌러 선물을 받아 보세요.", url: giftLink(c.couponCode), buttonTitle: "선물 받기" });
}

async function claimByCode() {
  const code = codeInput.value.trim();
  if (!code) return useNuxtApp().$toast.error("선물 코드를 입력해 주세요.");
  try {
    await prodCouponSvc.claim(code);
    codeInput.value = "";
    await useAlert().openAlert("선물을 받았습니다. ‘받은 쿠폰’에서 교환할 수 있어요.");
    tab.value = "received";
    await load();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "선물을 받지 못했습니다."));
  }
}

onMounted(() => {
  const auth = useAuthStore();
  auth.loadStToken();
  if (!auth.isStLoggedIn) return void navigateTo("/login");
  load();
});
</script>

<style scoped>
.pc-in { height: 40px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; font-size: 0.88rem; }
.pc-btn { display: inline-flex; align-items: center; padding: 5px 12px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #374151; font-size: 0.78rem; font-weight: 600; cursor: pointer; }
.pc-btn:hover { border-color: #9ca3af; }
.pc-kakao { border-color: #FEE500; background: #FEE500; color: #191919; }
.pc-primary { border-color: #1a1410; background: #1a1410; color: #fff; }
</style>
