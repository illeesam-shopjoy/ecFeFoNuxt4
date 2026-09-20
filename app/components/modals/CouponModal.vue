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
          <h3 id="coupon-modal-title" class="text-lg font-semibold text-gray-900 mb-1">쿠폰 적용</h3>
          <p class="text-sm text-gray-500 mb-6">종류별로 하나씩 선택해서 적용할 수 있습니다.</p>

          <fieldset v-for="section in sections" :key="section.category" class="mb-6 last:mb-0">
            <legend class="text-sm font-semibold text-gray-800 mb-2">{{ section.label }}</legend>
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
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition"
                :class="selected[section.category]?.couponId === coupon.couponId ? 'border-theme bg-theme/5' : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  type="radio"
                  class="mt-1"
                  :name="`coupon-${section.category}`"
                  :checked="selected[section.category]?.couponId === coupon.couponId"
                  @change="selected[section.category] = coupon"
                />
                <span>
                  <span class="block text-sm font-medium text-gray-900">{{ coupon.name }}</span>
                  <span v-if="coupon.desc" class="block text-xs text-gray-500 mt-0.5">{{ coupon.desc }}</span>
                </span>
              </label>
            </div>
          </fieldset>

          <div class="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition" @click="cancel">취소</button>
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
import { reactive, ref, watch } from "vue";
import { type PmCouponApplyType, type CouponCategory, type AppliedCoupons } from "~/types/pm/pmCouponApplyType";

// ecBeBo에 쿠폰 API가 아직 없어(syCouponType.ts 주석 참조) 하드코딩된 목업 목록.
const COUPONS: PmCouponApplyType[] = [
  { couponId: "order-5000", category: "order", name: "주문 5,000원 할인", desc: "3만원 이상 구매 시 사용 가능", discountType: "amount", discountValue: 5000 },
  { couponId: "order-10pct", category: "order", name: "주문 금액 10% 할인", desc: "전체 주문 금액 기준", discountType: "percent", discountValue: 10 },
  { couponId: "product-3000", category: "product", name: "상품 3,000원 할인", desc: "상품 금액에서 즉시 할인", discountType: "amount", discountValue: 3000 },
  { couponId: "product-15pct", category: "product", name: "상품 금액 15% 할인", desc: "상품 금액 기준(배송비 제외)", discountType: "percent", discountValue: 15 },
  { couponId: "ship-free", category: "shipping", name: "무료 배송 쿠폰", desc: "배송비 전액 할인", discountType: "free-shipping", discountValue: 0 },
  { couponId: "ship-3000", category: "shipping", name: "배송비 3,000원 할인", desc: "배송비 일부 할인", discountType: "amount", discountValue: 3000 },
];

const sections: { category: CouponCategory; label: string; coupons: PmCouponApplyType[] }[] = [
  { category: "order", label: "주문할인쿠폰", coupons: COUPONS.filter((c) => c.category === "order") },
  { category: "product", label: "상품할인쿠폰", coupons: COUPONS.filter((c) => c.category === "product") },
  { category: "shipping", label: "배송비할인쿠폰", coupons: COUPONS.filter((c) => c.category === "shipping") },
];

const props = defineProps<{
  appliedCoupons: AppliedCoupons;
}>();
const emit = defineEmits<{
  (e: "apply", coupons: AppliedCoupons): void;
}>();

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
