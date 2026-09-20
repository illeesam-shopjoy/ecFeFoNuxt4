<template>
  <Teleport to="body">
    <Transition name="coupon-fade">
      <div
        v-show="visible"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-modal-title"
        @click.self="cancel"
      >
        <div class="coupon-dialog relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl p-6">
          <button type="button" class="absolute top-4 right-4 p-2 rounded hover:bg-gray-100" @click="cancel" aria-label="닫기">
            <i class="fal fa-times"></i>
          </button>
          <div class="-mx-6 -mt-6 mb-6 rounded-t-xl border-b border-[#f0e2cf] bg-[#faf3ea] py-4 pl-6 pr-14 pt-5">
            <h3 id="coupon-modal-title" class="text-lg font-semibold text-gray-900 mb-1">쿠폰 적용</h3>
            <p class="text-sm text-gray-500 mb-0">종류별로 최대 1개씩 적용됩니다. 기본은 혜택이 가장 큰 쿠폰(같으면 종료가 빠른 쿠폰)이 자동 적용되며, 여기서 바꿀 수 있습니다.</p>
          </div>

          <p v-if="!coupons.length" class="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">사용할 수 있는 쿠폰이 없습니다. (로그인 후 보유 쿠폰이 표시됩니다)</p>
          <fieldset v-for="section in sections" :key="section.category" class="mb-6 last:mb-0">
            <legend class="text-sm font-semibold text-gray-800 mb-2">{{ section.label }} <span class="font-normal text-gray-400">· 최대 1개</span></legend>
            <div class="flex flex-col gap-2">
              <label
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition"
                :class="selected[section.category] === null ? 'border-theme bg-theme/5' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" class="mt-1" :name="`coupon-${section.category}`" :checked="selected[section.category] === null" @change="selected[section.category] = null" />
                <span class="text-sm text-gray-500">선택 안 함</span>
              </label>
              <label
                v-for="coupon in section.coupons"
                :key="coupon.couponId"
                class="flex items-start gap-3 p-3 rounded-lg border transition"
                :class="[
                  blockOf(coupon) ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60' : 'cursor-pointer',
                  selected[section.category]?.couponId === coupon.couponId ? 'border-theme bg-theme/5' : blockOf(coupon) ? '' : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <input
                  type="radio"
                  class="mt-1"
                  :name="`coupon-${section.category}`"
                  :disabled="!!blockOf(coupon)"
                  :checked="selected[section.category]?.couponId === coupon.couponId"
                  @change="selected[section.category] = coupon"
                />
                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900">{{ coupon.name }}</span>
                    <span v-if="bestId[section.category] === coupon.couponId" class="rounded-full bg-[#faf3ea] px-2 py-px text-[11px] font-semibold text-theme">최대 혜택</span>
                  </span>
                  <span v-if="coupon.desc" class="block text-xs text-gray-500 mt-0.5">{{ coupon.desc }}</span>
                  <span class="block text-xs mt-0.5" :class="blockOf(coupon) ? 'text-red-500' : 'text-gray-500'">
                    <template v-if="blockOf(coupon)">{{ blockOf(coupon) }}</template>
                    <template v-else>
                      <b class="text-[#c0392b]">-{{ formatPrice(couponDiscount(coupon, bases[section.category])) }}</b>
                      <template v-if="coupon.validTo"> · ~{{ coupon.validTo }} 까지</template>
                    </template>
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div class="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 rounded-lg border border-[#c9ced6] bg-[#f3f4f6] text-gray-700 shadow-sm hover:bg-[#e5e7eb] transition" @click="cancel">취소</button>
            <button type="button" class="os-btn os-btn-black" @click="apply">적용하기</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 2026-09-14(요청사항: "주문할인쿠폰 상품할인쿠폰 배송비할인쿠폰 선택하여 적용할 수 있게
 * 모달연결해주고") — checkout.vue의 "쿠폰이 있으신가요?" 링크가 열던 단순 텍스트 입력
 * 대신, 종류별(주문/상품/배송비) 쿠폰을 목록에서 골라 적용하는 모달.
 */
import { computed, reactive, ref, watch } from "vue";
import { type PmCouponApplyType, type CouponCategory, type AppliedCoupons } from "~/types/pm/pmCouponApplyType";
import { COUPON_CATEGORY_LABEL, couponBlockReason, couponDiscount, pickBestCoupon, todayYmd } from "~/utils/mapCoupon";

const props = defineProps<{
  /** 내 쿠폰(전체) */
  coupons: PmCouponApplyType[];
  /** 지금 적용 중인 쿠폰 */
  appliedCoupons: AppliedCoupons;
  /** 상품합계 — 최소 주문금액 판단 기준 */
  subtotal: number;
  /** 종류별 할인 대상 금액(미리보기 계산용) */
  bases: Record<CouponCategory, number>;
}>();
const emit = defineEmits<{
  (e: "apply", coupons: AppliedCoupons): void;
}>();
const { formatPrice } = usePrice();

const sections = computed(() =>
  (["order", "product", "shipping"] as CouponCategory[]).map((category) => ({ category, label: COUPON_CATEGORY_LABEL[category], coupons: props.coupons.filter((c) => c.category === category) }))
);
const blockOf = (c: PmCouponApplyType) => couponBlockReason(c, props.subtotal, todayYmd());
/** 종류별 "최대 혜택" 쿠폰 ID — 배지 표시용 */
const bestId = computed<Record<CouponCategory, string | null>>(() => ({
  order: pickBestCoupon(props.coupons.filter((c) => c.category === "order"), props.bases.order, props.subtotal, todayYmd())?.couponId ?? null,
  product: pickBestCoupon(props.coupons.filter((c) => c.category === "product"), props.bases.product, props.subtotal, todayYmd())?.couponId ?? null,
  shipping: pickBestCoupon(props.coupons.filter((c) => c.category === "shipping"), props.bases.shipping, props.subtotal, todayYmd())?.couponId ?? null,
}));

const visible = ref(false);
const selected = reactive<AppliedCoupons>({ order: null, product: null, shipping: null });

// 모달을 열 때마다(부모가 show() 호출 시) 현재 적용 중인 선택으로 초기화.
watch(visible, (v) => {
  if (!v) return;
  selected.order = props.appliedCoupons.order;
  selected.product = props.appliedCoupons.product;
  selected.shipping = props.appliedCoupons.shipping;
});

function show() {
  visible.value = true;
}
function cancel() {
  visible.value = false;
}
function apply() {
  emit("apply", { order: selected.order, product: selected.product, shipping: selected.shipping });
  visible.value = false;
}
defineExpose({ show });
</script>

<style scoped>
.coupon-fade-enter-active,
.coupon-fade-leave-active {
  transition: opacity 0.2s ease;
}
.coupon-fade-enter-from,
.coupon-fade-leave-to {
  opacity: 0;
}
.coupon-fade-enter-active .coupon-dialog,
.coupon-fade-leave-active .coupon-dialog {
  transition: transform 0.2s ease;
}
.coupon-fade-enter-from .coupon-dialog,
.coupon-fade-leave-to .coupon-dialog {
  transform: scale(0.95);
}
</style>
