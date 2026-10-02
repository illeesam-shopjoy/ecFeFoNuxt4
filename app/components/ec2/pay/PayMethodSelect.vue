<template>
  <!-- 결제수단 선택 — 토글 버튼형. 고른 수단은 어두운 채움 + 눌린(inset) 느낌으로 표시하고 나머지는 흰 버튼. 실제 결제창은 [주문하기]를 눌러야 열린다. -->
  <div>
    <div class="grid grid-cols-2 gap-2.5">
      <label
        v-for="m in PAY_METHODS"
        :key="m.cd"
        class="pm-btn m-0 flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-3"
        :class="model === m.cd ? 'pm-on' : 'pm-off'"
        :aria-pressed="model === m.cd"
      >
        <input v-model="model" type="radio" name="pay-method" :value="m.cd" class="sr-only" />
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.9rem] font-extrabold" :style="{ background: m.markBg, color: m.markFg }">{{ m.mark }}</span>
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block break-keep text-[0.86rem] font-bold">{{ m.nm }}</span>
          <span class="pm-desc mt-0.5 block break-keep text-[0.72rem]">{{ m.desc }}</span>
        </span>
        <i v-if="model === m.cd" class="fas fa-check-circle shrink-0 text-[1.05rem]"></i>
      </label>
      <!-- 상품쿠폰(선물 교환권) — 쿠폰 수를 넘긴 화면(주문/결제)에서만 보인다 -->
      <label v-if="voucherCount !== undefined" class="pm-btn m-0 flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-3" :class="model === 'VOUCHER' ? 'pm-on' : 'pm-off'" :aria-pressed="model === 'VOUCHER'">
        <input v-model="model" type="radio" name="pay-method" value="VOUCHER" class="sr-only" />
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[1rem]" style="background: #bc8246; color: #ffffff">🎁</span>
        <span class="min-w-0 flex-1 leading-tight">
          <span class="block break-keep text-[0.86rem] font-bold">상품쿠폰</span>
          <span class="pm-desc mt-0.5 block break-keep text-[0.72rem]">선물 받은 상품 교환권 · {{ voucherCount }}장</span>
        </span>
        <i v-if="model === 'VOUCHER'" class="fas fa-check-circle shrink-0 text-[1.05rem]"></i>
      </label>
    </div>
    <ul v-if="selected && model !== 'VOUCHER'" class="m-0 mt-3 list-none rounded-lg bg-[#f9fafb] px-4 py-3 text-[0.8rem] leading-relaxed text-gray-600">
      <li v-for="(n, i) in selected.notes" :key="i" class="flex gap-1.5"><span class="text-gray-400">·</span><span>{{ n }}</span></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PAY_METHODS, type PayMethodCd } from "~/conts/payMethods";

const model = defineModel<PayMethodCd | "VOUCHER">({ required: true });
defineProps<{ voucherCount?: number }>();
const selected = computed(() => PAY_METHODS.find((m) => m.cd === model.value));
</script>

<style scoped>
.pm-btn { transition: background-color 0.15s, box-shadow 0.15s, border-color 0.15s, transform 0.1s; }
/* 안 눌린 버튼 */
.pm-off { background: #fff; border-color: #e5e7eb; color: #1f2937; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06); }
.pm-off .pm-desc { color: #6b7280; }
.pm-off:hover { border-color: #9ca3af; }
/* 눌린(선택된) 버튼 — 어두운 채움 + 안쪽 그림자로 눌린 느낌 */
.pm-on { background: #1a1410; border-color: #1a1410; color: #fff; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45); transform: translateY(1px); }
.pm-on .pm-desc { color: #d6cfc6; }
.pm-on .fa-check-circle { color: #f5c26b; }
</style>
