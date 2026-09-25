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

          <!-- 내 보유 쿠폰 / 지금 적용 가능한 쿠폰 요약 -->
          <div class="mb-5 flex items-center justify-between rounded-lg bg-[#f9fafb] px-4 py-3 text-[0.88rem]">
            <span class="text-gray-600">내 보유 쿠폰 <b class="text-gray-900">{{ coupons.length }}장</b></span>
            <span class="text-gray-600">지금 적용 가능 <b class="text-theme">{{ usableCount }}장</b></span>
          </div>
          <p v-if="!coupons.length" class="mb-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-[0.85rem] text-gray-500">사용할 수 있는 쿠폰이 없습니다. (로그인 후 보유 쿠폰이 표시됩니다)</p>

          <!-- ① 상품할인쿠폰 — 상품(주문 줄)마다 1개 -->
          <div class="mb-5">
            <div class="cp-title">{{ COUPON_CATEGORY_LABEL.product }} <span class="cp-hint">· 상품별 1개</span></div>
            <p v-if="!productPool.length" class="cp-empty">보유한 상품할인쿠폰이 없습니다.</p>
            <div v-for="line in lines" :key="line.key" class="mb-3 last:mb-0" :class="{ hidden: !productPool.length }">
              <div class="mb-1 flex items-baseline justify-between gap-2 text-[0.82rem]">
                <span class="min-w-0 truncate font-medium text-gray-800" v-html="line.name"></span>
                <span class="shrink-0 text-gray-500">{{ formatPrice(line.amount) }}</span>
              </div>
              <select class="cp-select" :value="selected.product[line.key]?.couponId ?? ''" @change="pickProduct(line, ($event.target as HTMLSelectElement).value)">
                <option value="">선택 안 함</option>
                <option v-for="coupon in productPool" :key="coupon.couponId" :value="coupon.couponId" :disabled="!!productBlock(coupon, line)">{{ optionLabel(coupon, couponDiscount(coupon, line.amount), productBlock(coupon, line), bestOfLine[line.key] === coupon.couponId) }}</option>
              </select>
              <p v-if="selected.product[line.key]" class="cp-info">{{ infoLine(selected.product[line.key]!) }}</p>
            </div>
          </div>

          <!-- ② 주문할인 / ③ 배송비할인 — 주문당 1개 -->
          <div v-for="section in orderSections" :key="section.category" class="mb-5">
            <div class="cp-title">{{ section.label }} <span class="cp-hint">· 주문당 1개</span></div>
            <p v-if="!section.coupons.length" class="cp-empty">보유한 {{ section.label }}이 없습니다.</p>
            <template v-else>
              <select class="cp-select" :value="selected[section.category]?.couponId ?? ''" @change="pickOrder(section.category, ($event.target as HTMLSelectElement).value)">
                <option value="">선택 안 함</option>
                <option v-for="coupon in section.coupons" :key="coupon.couponId" :value="coupon.couponId" :disabled="!!blockOf(coupon)">{{ optionLabel(coupon, couponDiscount(coupon, previewBase[section.category]), blockOf(coupon), bestId[section.category] === coupon.couponId) }}</option>
              </select>
              <p v-if="selected[section.category]" class="cp-info">{{ infoLine(selected[section.category]!) }}</p>
            </template>
          </div>

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

/** 옵션 문구: 쿠폰명 · 할인액(또는 못 쓰는 이유) · 최대 혜택 */
function optionLabel(c: PmCouponApplyType, discount: number, block: string, best: boolean): string {
  if (block) return `${c.name} · 사용 불가 (${block})`;
  return `${c.name} · -${formatPrice(discount)}${best ? " · 최대 혜택" : ""}`;
}
/** 고른 쿠폰 설명 한 줄 — 설명 · 유효기간 */
function infoLine(c: PmCouponApplyType): string {
  return [c.desc, c.validTo ? `~${c.validTo} 까지` : ""].filter(Boolean).join(" · ");
}
function pickProduct(line: CouponLine, couponId: string) {
  selected.product[line.key] = couponId ? productPool.value.find((c) => c.couponId === couponId) ?? null : null;
}
function pickOrder(category: "order" | "shipping", couponId: string) {
  selected[category] = couponId ? props.coupons.find((c) => c.couponId === couponId && c.category === category) ?? null : null;
}
/** 지금 조건(기간·최소금액)을 만족해 쓸 수 있는 쿠폰 수 */
const usableCount = computed(() => props.coupons.filter((c) => !couponBlockReason(c, props.subtotal, todayYmd())).length);

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
.cp-title { margin-bottom: 6px; font-size: 0.92rem; font-weight: 700; color: #1f2937; }
.cp-hint { font-weight: 400; color: #9ca3af; }
.cp-empty { margin: 0; padding: 10px 12px; border: 1px dashed #e5e7eb; border-radius: 8px; text-align: center; font-size: 0.8rem; color: #9ca3af; }
.cp-select { width: 100%; height: 42px; padding: 0 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.88rem; color: #111827; outline: none; }
.cp-select:focus { border-color: #bc8246; }
.cp-info { margin: 4px 0 0; font-size: 0.78rem; color: #6b7280; }
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
