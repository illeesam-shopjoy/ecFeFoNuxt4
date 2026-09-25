<template>
  <layout :transparent="true">
    <breadcrumb-area title="상품쿠폰 교환" subtitle="상품쿠폰 교환" />
    <client-only>
      <section class="pb-70 pt-[16px] md:pt-[60px]">
        <div class="mx-auto max-w-[640px] px-4">
          <p v-if="loading" class="py-16 text-center text-gray-500">불러오는 중...</p>

          <!-- 교환 완료 -->
          <div v-else-if="doneOrderId" class="py-10 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[1.7rem]">🎉</div>
            <h2 class="mb-2 text-2xl font-bold text-green-700">주문이 접수되었습니다</h2>
            <p class="mb-6 text-[0.9rem] text-gray-500">상품쿠폰으로 교환되어 0원 결제 처리되었습니다. 주문번호 <b class="font-mono text-gray-800">{{ doneOrderId }}</b></p>
            <div class="flex justify-center gap-3">
              <nuxt-link class="os-btn os-btn-black" to="/my/order">주문내역 보기</nuxt-link>
              <nuxt-link class="os-btn" to="/">쇼핑 계속하기</nuxt-link>
            </div>
          </div>

          <div v-else-if="!c" class="py-10 text-center">
            <h3>교환할 상품쿠폰을 찾을 수 없습니다</h3>
            <p class="text-gray-500">{{ err }}</p>
            <nuxt-link class="os-btn os-btn-black mt-15" to="/my/prod-coupon">내 상품쿠폰</nuxt-link>
          </div>

          <template v-else>
            <div class="mb-4 rounded-xl border border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-5 py-4">
              <div class="text-[0.78rem] text-gray-500">교환할 상품 <span class="font-mono tracking-wider">{{ c.couponCode }}</span></div>
              <div class="text-[1.05rem] font-extrabold text-gray-900">{{ c.prodNm }} <span class="font-normal text-gray-600">× {{ c.qty }}</span></div>
              <div v-if="c.senderNm" class="mt-0.5 text-[0.8rem] text-gray-500">{{ c.senderNm }}님의 선물 · 결제 금액 <b>0원</b> (상품쿠폰)</div>
            </div>

            <div class="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="rd-title">배송 정보</h3>
                <button type="button" class="cursor-pointer rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-gray-700 hover:border-gray-400" @click="addrManageRef?.show()">📍 주소 목록에서 선택</button>
              </div>
              <label class="rd-l">받는 분 <b class="text-[#dc2626]">*</b></label>
              <input v-model="form.recvNm" class="rd-in" maxlength="50" placeholder="이름" />
              <label class="rd-l mt-3">연락처 <b class="text-[#dc2626]">*</b></label>
              <input v-model="form.recvPhone" class="rd-in" maxlength="20" inputmode="tel" placeholder="010-0000-0000" />
              <label class="rd-l mt-3">주소 <b class="text-[#dc2626]">*</b></label>
              <div class="flex gap-2">
                <input v-model="form.recvZip" class="rd-in !w-[110px] shrink-0" readonly placeholder="우편번호" />
                <input v-model="form.recvAddr" class="rd-in flex-1" readonly placeholder="주소 검색을 눌러 주세요" @click="addrSearchRef?.show()" />
                <button type="button" class="h-10 shrink-0 cursor-pointer rounded-lg border-0 bg-gray-900 px-4 text-[0.82rem] font-semibold text-white" @click="addrSearchRef?.show()">주소 검색</button>
              </div>
              <input v-model="form.recvAddrDetail" class="rd-in mt-2" maxlength="100" placeholder="상세 주소 (동, 호수 등)" />
              <label class="rd-l mt-3">배송 메모 <span class="text-gray-400">(선택)</span></label>
              <input v-model="form.recvMemo" class="rd-in" maxlength="200" placeholder="배송 시 요청사항" />
              <p v-if="err" class="m-0 mt-3 whitespace-pre-line text-[0.82rem] text-red-500">{{ err }}</p>
              <p class="m-0 mt-3 text-[0.75rem] text-gray-400">교환하면 재고가 차감되고 바로 주문이 접수됩니다. 교환 후에는 쿠폰이 사용 완료 처리됩니다.</p>
              <div class="mt-4">
                <button type="button" class="os-btn os-btn-black" :disabled="busy" @click="redeem">{{ busy ? "처리 중..." : "상품 교환하기 (0원)" }}</button>
              </div>
            </div>
          </template>
        </div>
      </section>
    </client-only>
    <addr-search-modal ref="addrSearchRef" @select="onAddrSearched" />
    <addr-manage-modal ref="addrManageRef" pick @pick="onAddrPicked" />
  </layout>
</template>

<script setup lang="ts">
/**
 * 상품쿠폰 교환 — 받은 쿠폰(?coupon=쿠폰ID)에 받는 분·배송지를 넣어 0원 주문으로 교환한다(결제수단 "상품쿠폰").
 * 이름·연락처·배송지는 내 기본 배송지/프로필로 미리 채운다.
 */
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import AddrSearchModal from "~/components/modals/AddrSearchModal.vue";
import AddrManageModal from "~/components/modals/AddrManageModal.vue";
import { prodCouponSvc } from "~/svc/fo/ec/pm/prodCouponSvc";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import { useAuthStore } from "~/store/useAuthStore";
import type { PmProdCouponType } from "~/types/pm/pmProdCouponType";
import type { MbMemberAddrType } from "~/types/mb/mbMemberAddrType";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";

useHead({ title: "상품쿠폰 교환" });
const route = useRoute();
const c = ref<PmProdCouponType | null>(null);
const loading = ref(true);
const busy = ref(false);
const err = ref("");
const doneOrderId = ref("");
const addrSearchRef = ref<InstanceType<typeof AddrSearchModal> | null>(null);
const addrManageRef = ref<InstanceType<typeof AddrManageModal> | null>(null);
const form = reactive({ recvNm: "", recvPhone: "", recvZip: "", recvAddr: "", recvAddrDetail: "", recvMemo: "" });

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

function applyAddr(a: { recvNm?: string; recvPhone?: string; zipCode?: string; addr?: string; addrDetail?: string }, overwrite: boolean) {
  if (a.recvNm && (overwrite || !form.recvNm)) form.recvNm = a.recvNm;
  if (a.recvPhone && (overwrite || !form.recvPhone)) form.recvPhone = a.recvPhone;
  if (a.addr && (overwrite || !form.recvAddr)) {
    form.recvZip = a.zipCode ?? "";
    form.recvAddr = a.addr;
    form.recvAddrDetail = a.addrDetail ?? "";
  }
}
const onAddrPicked = (a: MbMemberAddrType) => applyAddr(a, true);
function onAddrSearched(r: SyAddrSearchResultType) {
  form.recvZip = r.zonecode;
  form.recvAddr = r.address;
}

async function prefill() {
  try {
    const [profile, addrs] = await Promise.all([myInfoSvc.getProfile(), myAddrSvc.getMyAddrs().catch(() => [])]);
    const addr = addrs.find((a) => a.defaultYn === "Y") ?? addrs[0];
    if (addr) applyAddr(addr, false);
    if (!form.recvNm) form.recvNm = profile.memberNm || useAuthStore().user?.userNm || "";
    if (!form.recvPhone) form.recvPhone = profile.memberPhone || "";
    if (!form.recvAddr && profile.memberAddr) applyAddr({ zipCode: profile.memberZipCode, addr: profile.memberAddr, addrDetail: profile.memberAddrDetail }, false);
  } catch {
    /* 미리 채우기 실패는 무시 — 직접 입력 */
  }
}

async function redeem() {
  if (!c.value || busy.value) return;
  err.value = "";
  if (!form.recvNm.trim()) return void (err.value = "받는 분 이름을 입력해 주세요.");
  if (!form.recvPhone.trim()) return void (err.value = "연락처를 입력해 주세요.");
  if (!form.recvAddr.trim()) return void (err.value = "주소를 입력해 주세요.");
  busy.value = true;
  try {
    const r = await prodCouponSvc.redeem({ prodCouponId: c.value.prodCouponId, recvNm: form.recvNm.trim(), recvPhone: form.recvPhone.trim(), recvZip: form.recvZip, recvAddr: form.recvAddr.trim(), recvAddrDetail: form.recvAddrDetail.trim(), recvMemo: form.recvMemo.trim() });
    doneOrderId.value = r.orderId;
  } catch (e) {
    err.value = errText(e, "교환하지 못했습니다.");
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  const auth = useAuthStore();
  auth.loadStToken();
  if (!auth.isStLoggedIn) return void navigateTo("/login");
  const id = String(route.query.coupon ?? "");
  try {
    const mine = await prodCouponSvc.mine();
    const found = mine.received.find((x) => x.prodCouponId === id);
    if (!found) err.value = "내 받은 쿠폰에 없는 쿠폰입니다.";
    else if (found.statusCd !== "ACTIVE") err.value = "사용할 수 없는 쿠폰입니다.";
    else c.value = found;
  } catch (e) {
    err.value = errText(e, "쿠폰을 불러오지 못했습니다.");
  }
  loading.value = false;
  if (c.value) prefill();
});
</script>

<style scoped>
.rd-title { margin: 0; font-size: 1.05rem !important; font-weight: 700 !important; line-height: 1.3; color: #111827; letter-spacing: 0; }
.rd-l { display: block; margin-bottom: 4px; font-size: 0.8rem; color: #6b7280; }
.rd-in { width: 100%; height: 40px; padding: 0 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.88rem; outline: none; }
.rd-in:focus { border-color: #bc8246; }
</style>
