<template>
  <Teleport to="body">
    <Transition name="coupon-fade">
      <div
        v-show="visible"
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/55 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-modal-title"
        @click.self="cancel"
      >
        <div class="coupon-dialog relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.28)] p-6">
          <button type="button" class="modal-x" @click="cancel" aria-label="닫기">
            <i class="fal fa-times text-[0.95rem]"></i>
          </button>
          <div class="-mx-6 -mt-6 mb-6 rounded-t-2xl border-b border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] py-4 pl-6 pr-14 pt-5">
            <h3 id="coupon-modal-title" class="text-lg font-semibold text-gray-900 mb-1">쿠폰 적용</h3>
            <!-- 2026-09-22(요청사항: "상품할인쿠폰은 최대 1개가 아니라 상품별 1개") — 상품할인은 상품(주문 줄)마다 1개씩, 주문할인·배송비할인은 주문당 1개 -->
            <p class="text-sm text-gray-500 mb-0">상품할인쿠폰은 <b>상품별로 1개</b>씩, 주문할인·배송비할인쿠폰은 주문당 1개씩 적용됩니다. 기본은 혜택이 가장 큰 쿠폰(같으면 종료가 빠른 쿠폰)이 자동 적용되며, 여기서 바꿀 수 있습니다.</p>
          </div>

          <p v-if="!coupons.length" class="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">사용할 수 있는 쿠폰이 없습니다. (로그인 후 보유 쿠폰이 표시됩니다)</p>

          <!-- 상품할인쿠폰 — 상품(주문 줄)별 1개 -->
          <fieldset class="mb-6">
            <legend class="text-sm font-semibold text-gray-800 mb-2">{{ COUPON_CATEGORY_LABEL.product }} <span class="font-normal text-gray-400">· 상품별 1개</span></legend>
            <p v-if="!productPool.length" class="m-0 rounded-lg border border-dashed border-gray-200 px-3 py-3 text-center text-xs text-gray-400">보유한 상품할인쿠폰이 없습니다.</p>
            <div v-for="line in lines" :key="line.key" class="mb-4 last:mb-0" :class="{ hidden: !productPool.length }">
              <div class="mb-1.5 flex items-baseline justify-between gap-2 text-[13px]">
                <span class="min-w-0 truncate font-medium text-gray-800" v-html="line.name"></span>
                <span class="shrink-0 text-xs text-gray-500">{{ formatPrice(line.amount) }}</span>
              </div>
              <div class="flex flex-col gap-2">
                <label class="flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition" :class="!selected.product[line.key] ? 'border-theme bg-theme/5' : 'border-gray-200 hover:border-gray-300'">
                  <input type="radio" class="mt-1" :name="`coupon-product-${line.key}`" :checked="!selected.product[line.key]" @change="selected.product[line.key] = null" />
                  <span class="text-sm text-gray-500">선택 안 함</span>
                </label>
                <label
                  v-for="coupon in productPool"
                  :key="coupon.couponId"
                  class="flex items-start gap-3 rounded-lg border p-3 transition"
                  :class="[
                    productBlock(coupon, line) ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60' : 'cursor-pointer',
                    selected.product[line.key]?.couponId === coupon.couponId ? 'border-theme bg-theme/5' : productBlock(coupon, line) ? '' : 'border-gray-200 hover:border-gray-300',
                  ]"
                >
                  <input
                    type="radio"
                    class="mt-1"
                    :name="`coupon-product-${line.key}`"
                    :disabled="!!productBlock(coupon, line)"
                    :checked="selected.product[line.key]?.couponId === coupon.couponId"
                    @change="selected.product[line.key] = coupon"
                  />
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-900">{{ coupon.name }}</span>
                      <span v-if="bestOfLine[line.key] === coupon.couponId" class="rounded-full bg-[#faf3ea] px-2 py-px text-[11px] font-semibold text-theme">최대 혜택</span>
                    </span>
                    <span v-if="coupon.desc" class="block text-xs text-gray-500 mt-0.5">{{ coupon.desc }}</span>
                    <span class="block text-xs mt-0.5" :class="productBlock(coupon, line) ? 'text-red-500' : 'text-gray-500'">
                      <template v-if="productBlock(coupon, line)">{{ productBlock(coupon, line) }}</template>
                      <template v-else>
                        <b class="text-[#c0392b]">-{{ formatPrice(couponDiscount(coupon, line.amount)) }}</b>
                        <template v-if="coupon.validTo"> · ~{{ coupon.validTo }} 까지</template>
                      </template>
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </fieldset>

          <!-- 주문할인 / 배송비할인 — 주문당 1개 -->
          <fieldset v-for="section in orderSections" :key="section.category" class="mb-6 last:mb-0">
            <legend class="text-sm font-semibold text-gray-800 mb-2">{{ section.label }} <span class="font-normal text-gray-400">· 주문당 1개</span></legend>
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
                      <b class="text-[#c0392b]">-{{ formatPrice(couponDiscount(coupon, previewBase[section.category])) }}</b>
                      <template v-if="coupon.validTo"> · ~{{ coupon.validTo }} 까지</template>
                    </template>
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <div class="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
            <button type="button" class="mbtn mbtn-ghost" @click="cancel">취소</button>
            <button type="button" class="mbtn mbtn-primary min-w-[120px]" @click="apply">적용하기</button>
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
 * 2026-09-22(요청사항: "상품할인쿠폰은 최대 1개가 아니라 상품별 1개") — 상품할인쿠폰은 주문 줄(상품)마다 1개씩 고른다. 한 쿠폰은 한 상품에만 쓸 수 있어
 * 다른 상품에 이미 고른 쿠폰은 여기서 비활성화된다.
 */
import { computed, reactive, ref, watch } from "vue";
import { type PmCouponApplyType, type CouponCategory, type AppliedCoupons, type CouponLine } from "~/types/pm/pmCouponApplyType";
import { COUPON_CATEGORY_LABEL, couponBlockReason, couponDiscount, lineCouponBlockReason, pickBestCoupon, todayYmd } from "~/utils/mapCoupon";

const props = defineProps<{
  /** 내 쿠폰(전체) */
  coupons: PmCouponApplyType[];
  /** 지금 적용 중인 쿠폰 */
  appliedCoupons: AppliedCoupons;
  /** 상품합계 — 최소 주문금액 판단 기준(주문/배송비 쿠폰) */
  subtotal: number;
  /** 종류별 할인 대상 금액(미리보기 계산용) */
  bases: Record<CouponCategory, number>;
  /** 상품할인쿠폰을 붙일 주문 줄 */
  lines: CouponLine[];
}>();
const emit = defineEmits<{
  (e: "apply", coupons: AppliedCoupons): void;
}>();
const { formatPrice } = usePrice();

const productPool = computed(() => props.coupons.filter((c) => c.category === "product"));
const orderSections = computed(() =>
  (["order", "shipping"] as const).map((category) => ({ category, label: COUPON_CATEGORY_LABEL[category], coupons: props.coupons.filter((c) => c.category === category) }))
);
const blockOf = (c: PmCouponApplyType) => couponBlockReason(c, props.subtotal, todayYmd());

const visible = ref(false);
const selected = reactive<AppliedCoupons>({ order: null, shipping: null, product: {} });

/** 이 줄에서 이 쿠폰을 못 쓰는 이유 — 기간/최소금액, 또는 다른 상품에 이미 고른 쿠폰 */
function productBlock(c: PmCouponApplyType, line: CouponLine): string {
  const why = lineCouponBlockReason(c, line, todayYmd());
  if (why) return why;
  const other = props.lines.find((l) => l.key !== line.key && selected.product[l.key]?.couponId === c.couponId);
  return other ? "다른 상품에 적용 중" : "";
}
/** 줄별 "최대 혜택" 쿠폰 ID — 배지 표시용(아직 다른 줄에 안 쓴 쿠폰 기준이 아니라 그 줄에서 단독으로 가장 큰 쿠폰) */
const bestOfLine = computed<Record<string, string | null>>(() =>
  Object.fromEntries(props.lines.map((l) => [l.key, pickBestCoupon(productPool.value, l.amount, l.amount, todayYmd())?.couponId ?? null]))
);
/** 주문할인 미리보기 기준 — 지금 고른 상품할인쿠폰을 반영한 금액 */
const previewBase = computed<Record<CouponCategory, number>>(() => {
  const productDiscount = props.lines.reduce((sum, l) => sum + (selected.product[l.key] ? couponDiscount(selected.product[l.key]!, l.amount) : 0), 0);
  return { product: props.subtotal, order: props.subtotal - productDiscount, shipping: props.bases.shipping };
});
const bestId = computed<Record<"order" | "shipping", string | null>>(() => ({
  order: pickBestCoupon(props.coupons.filter((c) => c.category === "order"), previewBase.value.order, props.subtotal, todayYmd())?.couponId ?? null,
  shipping: pickBestCoupon(props.coupons.filter((c) => c.category === "shipping"), previewBase.value.shipping, props.subtotal, todayYmd())?.couponId ?? null,
}));

// 모달을 열 때마다(부모가 show() 호출 시) 현재 적용 중인 선택으로 초기화.
watch(visible, (v) => {
  if (!v) return;
  selected.order = props.appliedCoupons.order;
  selected.shipping = props.appliedCoupons.shipping;
  selected.product = { ...props.appliedCoupons.product };
});

function show() {
  visible.value = true;
}
function cancel() {
  visible.value = false;
}
function apply() {
  emit("apply", { order: selected.order, shipping: selected.shipping, product: { ...selected.product } });
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
