<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <!-- 2026-09-19(요청사항: "이벤트상세 … ecFeFoNuxt4 페이지에 만들어줘") — ecFeBo(pages/fo/EventView.js) 이식.
         히어로 배너 + 이벤트 혜택 카드 + 이벤트 대상 + 유의사항 + 목록으로. -->
    <div v-if="pending" class="max-w-7xl mx-auto px-4 py-32 text-center text-gray-400">불러오는 중...</div>

    <template v-else-if="ev">
      <!-- 히어로 -->
      <div class="relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[400px] px-4 pt-[72px] pb-[60px] text-white" :style="{ background: heroBg }">
        <div class="absolute -top-[60px] -right-[60px] w-[240px] h-[240px] rounded-full bg-white/[0.18]"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.12]"></div>
        <div class="relative z-[1] max-w-[700px]">
          <div class="inline-block px-4 py-1 rounded-full border border-current text-[0.72rem] font-bold tracking-[2px] mb-5 opacity-80">{{ ev.eventTypeCd || "EVENT" }}</div>
          <h1 class="text-[2rem] sm:text-[2.6rem] font-black leading-tight mb-4 tracking-tight text-white">{{ ev.title }}</h1>
          <p v-if="ev.desc" class="text-[0.95rem] leading-relaxed opacity-80 mb-6 whitespace-pre-line">{{ ev.desc }}</p>
          <div class="text-[0.82rem] font-semibold opacity-65">{{ ev.startDate }} ~ {{ ev.endDate }}</div>
        </div>
      </div>

      <section class="bg-white pt-10 pb-24">
        <div class="max-w-[960px] mx-auto px-4">
          <nuxt-link to="/event" class="inline-flex items-center gap-1.5 text-gray-400 text-[0.82rem] mb-8 no-underline hover:text-theme">← 이벤트 목록으로</nuxt-link>

          <!-- 혜택 카드 -->
          <div class="bg-white border border-[#e5e7eb] rounded-2xl px-5 sm:px-8 py-8 mb-9 text-center">
            <div class="text-[0.72rem] font-bold text-theme tracking-[2px] mb-2.5">SHOPJOY BENEFIT</div>
            <h2 class="text-[1.4rem] font-black text-gray-900 mb-1.5">이벤트 혜택</h2>
            <p v-if="ev.desc" class="text-[0.85rem] text-gray-400 mb-7 whitespace-pre-line">{{ ev.desc }}</p>
            <div v-if="ev.benefits.length" class="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <div v-for="(b, i) in ev.benefits" :key="i" class="border border-[#e5e7eb] rounded-xl px-4 py-6">
                <div class="text-[0.75rem] text-gray-400 mb-2.5">{{ b.label }}</div>
                <div class="text-[1.45rem] font-black text-gray-900 mb-2">{{ b.value }}</div>
                <div v-if="b.desc" class="text-[0.74rem] text-gray-400 mb-4 leading-normal">{{ b.desc }}</div>
              </div>
            </div>
            <div v-else class="text-[0.85rem] text-gray-400 py-4">등록된 혜택 정보가 없습니다.</div>
          </div>

          <!-- 이벤트 대상 -->
          <div v-if="ev.eventItems.length" class="mb-9">
            <h2 class="text-[1.1rem] font-extrabold text-gray-900 mb-4">이벤트 대상</h2>
            <div class="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              <div v-for="it in ev.eventItems" :key="it.id" class="bg-white border border-[#e5e7eb] rounded-md p-4">
                <div class="text-[0.72rem] text-gray-400 mb-1.5">{{ it.targetType }}</div>
                <div class="text-[0.88rem] font-bold text-gray-900 break-all">{{ it.targetId }}</div>
              </div>
            </div>
          </div>

          <!-- 유의사항 -->
          <div v-if="notices.length" class="bg-[#fafafa] border border-[#e5e7eb] rounded-xl px-5 sm:px-7 py-5 mb-8">
            <h3 class="text-[0.85rem] font-bold text-gray-500 mb-3.5">유의사항</h3>
            <ul class="list-none p-0 m-0">
              <li v-for="(line, i) in notices" :key="i" class="relative pl-3.5 text-[0.8rem] text-gray-400 leading-[1.9]">
                <span class="absolute left-0">·</span>{{ line }}
              </li>
            </ul>
          </div>

          <div class="text-center">
            <nuxt-link to="/event" class="inline-block px-8 py-3 border border-[#e5e7eb] rounded-lg bg-white text-gray-600 text-[0.85rem] font-semibold no-underline hover:border-theme hover:text-theme">← 이벤트 목록으로</nuxt-link>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 py-32 text-center text-gray-500">
      <p class="mb-6">이벤트를 찾을 수 없습니다.</p>
      <nuxt-link to="/event" class="os-btn os-btn-black os-btn-3 inline-block">이벤트 목록으로</nuxt-link>
    </div>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import { foPmEventSvc, type PmEventDetailType } from "~/svc/fo/ec/pm/foPmEventSvc";
import { usePageTitle } from "~/composables/usePageTitle";

const route = useRoute();
const id = String(route.params.id ?? "");

const { data: ev, pending } = await useAsyncData<PmEventDetailType | null>(
  `event-dtl-${id}`,
  () => (id ? foPmEventSvc.getById(id).catch(() => null) : Promise.resolve(null)),
  { server: false }
);

usePageTitle("이벤트 상세");
useHead({ title: computed(() => (ev.value?.title ? `${ev.value.title}` : "이벤트 상세")) });

// 히어로 배경 — ecFeBo 와 동일한 보라 그라데이션
const heroBg = "linear-gradient(135deg,#5b6cff 0%,#8a4fff 100%)";
// 유의사항 — 이벤트 설명을 줄 단위로
const notices = computed(() => (ev.value?.desc ?? "").split("\n").filter(Boolean));
</script>
