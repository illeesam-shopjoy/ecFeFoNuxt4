<template>
  <!-- 전체 서비스 — 당근 "메뉴" 화면. 그룹별 아이콘 격자, 연결 안 된 서비스는 "준비 중" 안내 -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="전체 서비스" :back="false" close /></template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <section v-for="g in DM_SERVICES" :key="g.group" class="px-4 pt-6">
      <h2 class="text-[17px] font-extrabold mb-3">{{ g.group }}</h2>
      <ul class="grid grid-cols-4 gap-y-5 gap-x-2">
        <li v-for="it in g.items" :key="it.label">
          <button type="button" class="w-full flex flex-col items-center gap-2" @click="handleSelectAction('service-open', it)">
            <span class="w-14 h-14 rounded-2xl flex items-center justify-center text-[22px]" :style="{ background: `${it.color}1f`, color: it.color }"><i :class="it.icon"></i></span>
            <span class="text-[12.5px] leading-tight text-center" :class="{ muted: !it.to }">{{ it.label }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section class="px-4 pt-8 pb-10">
      <h2 class="text-[17px] font-extrabold mb-3">내 정보</h2>
      <ul class="rounded-xl bg-[var(--dm-bg-soft)] divide-y divide-[var(--dm-line)]">
        <li v-for="m in myMenus" :key="m.label">
          <nuxt-link :to="m.to" class="flex items-center justify-between h-12 px-4 text-[15px]"><span><i :class="`${m.icon} w-6 muted`"></i>{{ m.label }}</span><i class="fas fa-chevron-right text-[12px] muted"></i></nuxt-link>
        </li>
      </ul>
      <p class="muted text-[11px] mt-6 text-center">site {{ tenant.siteId }} · {{ tenant.moduleId }} · {{ envNm }}</p>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { DM_SERVICES } from "~/conts/tenant/danmoo1";

const currentFilePath = useCurrentFilePath();
useHead({ title: "전체 서비스" });
const tenant = useTenant();
const envNm = useRuntimeConfig().public.envNm;
const { openAlert } = useAlert();

const myMenus = [
  { label: "나의 danmoo", icon: "far fa-user", to: "/my" },
  { label: "관심목록", icon: "far fa-heart", to: "/my/likes" },
  { label: "알림", icon: "far fa-bell", to: "/noti" },
  { label: "채팅", icon: "far fa-comment", to: "/chat" },
];

/* handleSelectAction — 서비스 아이콘 선택: 연결된 화면이 있으면 이동, 없으면 준비 중 */
const handleSelectAction = (cmd: string, it: { label: string; to?: string }) => {
  if (cmd === "service-open") return it.to ? navigateTo(it.to) : openAlert({ title: it.label, message: "준비 중인 서비스예요.", variant: "info" });
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};
</script>
