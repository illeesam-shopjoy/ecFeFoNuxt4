<template>
  <!-- 결제수단 선택 — 카드형 라디오. 고른 수단의 안내를 아래에 보여준다. 실제 결제창은 [주문하기]를 눌러야 열린다. -->
  <div>
    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <label
        v-for="m in PAY_METHODS"
        :key="m.cd"
        class="m-0 flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] bg-white px-3 py-3 transition"
        :class="model === m.cd ? 'border-[#1a1410] shadow-sm' : 'border-[#e5e7eb] hover:border-gray-400'"
      >
        <input v-model="model" type="radio" name="pay-method" :value="m.cd" class="sr-only" />
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.85rem] font-extrabold" :class="m.markCls">{{ m.mark }}</span>
        <span class="min-w-0 leading-tight">
          <span class="block truncate text-[0.85rem] font-bold text-gray-900">{{ m.nm }}</span>
          <span class="block truncate text-[0.72rem] text-gray-500">{{ m.desc }}</span>
        </span>
        <i v-if="model === m.cd" class="fas fa-check-circle ml-auto shrink-0 text-[#1a1410]"></i>
      </label>
    </div>
    <ul v-if="selected" class="m-0 mt-3 list-none rounded-lg bg-[#f9fafb] px-4 py-3 text-[0.8rem] leading-relaxed text-gray-600">
      <li v-for="(n, i) in selected.notes" :key="i" class="flex gap-1.5"><span class="text-gray-400">·</span><span>{{ n }}</span></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PAY_METHODS, type PayMethodCd } from "~/conts/payMethods";

const model = defineModel<PayMethodCd>({ required: true });
const selected = computed(() => PAY_METHODS.find((m) => m.cd === model.value));
</script>
