<template>
  <!-- 수신 동의 — 휴대폰/카카오/SMS/이메일 수신 + 광고 수신. 각각 따로 체크한다(Y/N). 광고성 정보 수신은 선택이다. -->
  <div>
    <span class="mb-1 block text-[0.78rem] text-gray-500">수신 동의</span>
    <div class="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3 text-[0.85rem] sm:grid-cols-3">
      <label v-for="o in OPTS" :key="o.key" class="m-0 flex cursor-pointer items-center gap-2" :class="o.key === 'recvAdYn' ? 'font-semibold text-[#8a5a25]' : 'text-gray-700'">
        <input type="checkbox" :checked="model[o.key] === 'Y'" @change="set(o.key, ($event.target as HTMLInputElement).checked)" />{{ o.label }}
      </label>
    </div>
    <label class="m-0 mt-1.5 flex cursor-pointer items-center gap-2 text-[0.78rem] text-gray-500"><input type="checkbox" :checked="allOn" @change="setAll(($event.target as HTMLInputElement).checked)" />전체 동의</label>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";

const OPTS = [
  { key: "recvPhoneYn", label: "휴대폰 수신" },
  { key: "recvKakaoYn", label: "카카오 수신" },
  { key: "recvSmsYn", label: "SMS 수신" },
  { key: "recvEmailYn", label: "이메일 수신" },
  { key: "recvAdYn", label: "광고 수신" },
] as const;
type Key = (typeof OPTS)[number]["key"];

const model = defineModel<MbRecvConsentType>({ required: true });
const allOn = computed(() => OPTS.every((o) => model.value[o.key] === "Y"));
const set = (k: Key, on: boolean) => (model.value = { ...model.value, [k]: on ? "Y" : "N" });
const setAll = (on: boolean) => (model.value = { recvPhoneYn: on ? "Y" : "N", recvKakaoYn: on ? "Y" : "N", recvSmsYn: on ? "Y" : "N", recvEmailYn: on ? "Y" : "N", recvAdYn: on ? "Y" : "N" });
</script>
