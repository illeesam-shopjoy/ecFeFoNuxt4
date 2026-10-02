<template>
  <!-- 동네지도 — 내 동네 위치 지도(MapSwitch: 카카오/구글/네이버 전환) + 업체 카테고리 + 동네 가게(샘플) + 동네 바꾸기 -->
  <layout>
    <template #top>
      <div class="flex items-center justify-between h-14 px-2 pl-4">
        <button type="button" class="inline-flex items-center gap-1.5 text-[19px] font-extrabold" @click="townOpen = true">동네지도 <span class="muted text-[14px] font-semibold ml-1">{{ town }}</span><i class="fas fa-chevron-down text-[12px] muted"></i></button>
        <nuxt-link to="/search" class="icon-btn" aria-label="검색"><i class="far fa-search"></i></nuxt-link>
      </div>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <client-only>
      <map-switch :addr="`성남시 ${town}`" :lat="center.lat" :lng="center.lng" height-css="300px" toolbar-position="bottom" />
      <template #fallback><div class="skeleton h-[300px]"></div></template>
    </client-only>

    <ul class="grid grid-cols-5 gap-y-4 px-3 py-5 border-b border-[var(--dm-line)]">
      <li v-for="c in DM_MAP_CATEGORIES" :key="c.label">
        <button type="button" class="w-full flex flex-col items-center gap-1.5" @click="handleSelectAction('cate-open', c.label)">
          <span class="w-12 h-12 rounded-full bg-[var(--dm-chip)] inline-flex items-center justify-center text-[18px] text-[var(--dm-text-2)]"><i :class="c.icon"></i></span>
          <span class="text-[12px]">{{ c.label }}</span>
        </button>
      </li>
    </ul>

    <section class="px-4 pt-5 pb-8">
      <div class="flex items-baseline justify-between mb-3"><h2 class="text-[17px] font-extrabold">{{ town }} 인기 가게</h2><span class="text-[11px] muted">표시용 샘플</span></div>
      <ul class="divide-y divide-[var(--dm-line)]">
        <li v-for="s in SHOPS" :key="s.name" class="flex gap-3 py-3">
          <span class="w-14 h-14 rounded-xl bg-[var(--dm-chip)] inline-flex items-center justify-center text-[20px] text-[var(--dm-text-2)] flex-none"><i :class="s.icon"></i></span>
          <div class="flex-1 min-w-0">
            <b class="text-[15px]">{{ s.name }}</b> <span class="text-[12px] muted">{{ s.cate }}</span>
            <p class="text-[13px] muted mt-0.5"><i class="fas fa-star text-[#f2b400] mr-0.5"></i>{{ s.rating }} · 후기 {{ s.reviews }} · {{ s.dist }}</p>
            <p class="text-[13px] mt-0.5 clamp-2">{{ s.desc }}</p>
          </div>
        </li>
      </ul>
    </section>

    <dm-sheet :open="townOpen" title="지도 동네 선택" @close="townOpen = false">
      <div class="grid grid-cols-2 gap-2">
        <button v-for="n in DM_NEIGHBORHOODS" :key="n" type="button" class="h-11 rounded-lg text-[15px] font-semibold" :class="n === town ? 'bg-[var(--dm-primary)] text-white' : 'bg-[var(--dm-chip)]'" @click="setTown(n); townOpen = false">{{ n }}</button>
      </div>
    </dm-sheet>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import MapSwitch from "~/components/danmoo1/common/map/MapSwitch.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useDmTown } from "~/composables/useDmTown";
import { DM_MAP_CATEGORIES, DM_NEIGHBORHOODS, coordsOf } from "~/conts/tenant/danmoo1";

const currentFilePath = useCurrentFilePath();
useHead({ title: "동네지도" });
const { town, setTown } = useDmTown();
const { openAlert } = useAlert();
const townOpen = ref(false);
const center = computed(() => coordsOf(town.value));

const SHOPS = [
  { name: "여수동 손만두", cate: "음식점", rating: 4.8, reviews: 132, dist: "350m", desc: "매일 아침 빚는 손만두 · 포장주문 가능", icon: "fas fa-utensils" },
  { name: "동네 수선집", cate: "수리", rating: 4.9, reviews: 58, dist: "600m", desc: "옷 수선·가방 수선 · 당일 수선", icon: "fas fa-cut" },
  { name: "초록 세탁", cate: "생활서비스", rating: 4.7, reviews: 211, dist: "1.1km", desc: "운동화 세탁 · 이불 세탁 · 수거 배달", icon: "fas fa-tshirt" },
  { name: "피아노 레슨 안쌤", cate: "레슨/과외", rating: 5.0, reviews: 24, dist: "800m", desc: "성인 취미 피아노 · 체험 레슨 무료", icon: "fas fa-music" },
];

/* handleSelectAction — 업체 카테고리 선택(업체 데이터는 없다 → 준비 중) */
const handleSelectAction = (cmd: string, label: string) => {
  if (cmd === "cate-open") return openAlert({ title: label, message: "동네 업체 찾기는 준비 중이에요.", variant: "info" });
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};
</script>
