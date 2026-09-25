<template>
  <!-- 수신 동의 — 3그룹: ① 필수(주문/문의) ② 선택 마케팅(이벤트/기획전) ③ 선택 광고. 각각 Y/N. -->
  <div>
    <!-- ① 필수 -->
    <span class="mb-1 block text-[0.78rem] text-gray-500">수신 동의 <b class="font-bold text-[#dc2626]">(필수)</b> <span class="text-gray-400">주문/문의</span></span>
    <div class="grid grid-cols-3 gap-x-3 gap-y-2 rounded-lg border bg-[#f9fafb] px-3 py-3 text-[0.85rem] " :class="requiredOk ? 'border-[#e5e7eb]' : 'border-[#fca5a5]'">
      <label v-for="o in REQUIRED" :key="o.key" class="m-0 flex cursor-pointer items-center gap-2 text-gray-700">
        <input type="checkbox" class="!my-0 !ml-0 !mr-2 !h-4 !w-4 shrink-0 !border-0 !p-0 accent-[#bc8246]" :checked="model[o.key] === 'Y'" @change="set(o.key, ($event.target as HTMLInputElement).checked)" />{{ o.label }}
      </label>
    </div>
    <p class="m-0 mt-1 text-[0.72rem]" :class="requiredOk ? 'text-gray-400' : 'text-red-500'">SMS, 이메일, 카카오 중 1개 이상 필수입니다.</p>

    <!-- ② 선택 마케팅 -->
    <span class="mb-1 mt-3 block text-[0.78rem] text-gray-500">수신 동의 <span class="text-gray-400">(선택)</span> 마케팅 <span class="text-gray-400">이벤트/기획전</span></span>
    <div class="grid grid-cols-3 gap-x-3 gap-y-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[0.85rem]">
      <label v-for="o in MARKETING" :key="o.key" class="m-0 flex cursor-pointer items-center gap-2 text-gray-700">
        <input type="checkbox" class="!my-0 !ml-0 !mr-2 !h-4 !w-4 shrink-0 !border-0 !p-0 accent-[#bc8246]" :checked="model[o.key] === 'Y'" @change="set(o.key, ($event.target as HTMLInputElement).checked)" />{{ o.label }}
      </label>
    </div>

    <!-- ③ 선택 광고 -->
    <span class="mb-1 mt-3 block text-[0.78rem] text-gray-500">수신 동의 <span class="text-gray-400">(선택)</span> 마케팅 광고</span>
    <div class="grid grid-cols-3 gap-x-3 gap-y-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[0.85rem]">
      <label v-for="o in ADVERT" :key="o.key" class="m-0 flex cursor-pointer items-center gap-2 font-semibold text-[#8a5a25]">
        <input type="checkbox" class="!my-0 !ml-0 !mr-2 !h-4 !w-4 shrink-0 !border-0 !p-0 accent-[#bc8246]" :checked="model[o.key] === 'Y'" @change="set(o.key, ($event.target as HTMLInputElement).checked)" />{{ o.label }}
      </label>
    </div>

    <label class="m-0 mt-2 flex cursor-pointer items-center gap-2 text-[0.78rem] text-gray-500"><input type="checkbox" class="!my-0 !ml-0 !mr-2 !h-4 !w-4 shrink-0 !border-0 !p-0 accent-[#bc8246]" :checked="allOn" @change="setAll(($event.target as HTMLInputElement).checked)" />전체 동의</label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";
import { isRequiredRecvOk, withAdSummary } from "~/utils/recvConsent";

const REQUIRED = [
  { key: "recvSmsYn", label: "SMS" },
  { key: "recvEmailYn", label: "이메일" },
  { key: "recvKakaoYn", label: "카카오" },
] as const;
const MARKETING = [
  { key: "recvMktSmsYn", label: "SMS" },
  { key: "recvMktEmailYn", label: "이메일" },
  { key: "recvMktKakaoYn", label: "카카오" },
] as const;
const ADVERT = [
  { key: "recvAdSmsYn", label: "SMS" },
  { key: "recvAdEmailYn", label: "이메일" },
  { key: "recvAdKakaoYn", label: "카카오" },
] as const;
type Key = (typeof REQUIRED)[number]["key"] | (typeof MARKETING)[number]["key"] | (typeof ADVERT)[number]["key"];
const ALL_KEYS: Key[] = [...REQUIRED, ...MARKETING, ...ADVERT].map((o) => o.key);

const model = defineModel<MbRecvConsentType>({ required: true });
const requiredOk = computed(() => isRequiredRecvOk(model.value));
const allOn = computed(() => ALL_KEYS.every((k) => model.value[k] === "Y"));
// 광고 채널이 바뀌면 광고 요약값(recvAdYn)도 함께 맞춘다
const set = (k: Key, on: boolean) => (model.value = withAdSummary({ ...model.value, [k]: on ? "Y" : "N" }));
const setAll = (on: boolean) => (model.value = withAdSummary({ ...model.value, ...Object.fromEntries(ALL_KEYS.map((k) => [k, on ? "Y" : "N"])) }));
</script>
