<template>
  <!-- 최근 본 물건 — 상세를 열 때 이 브라우저(localStorage dm.recentView)에 쌓인 상품ID 순서대로(최근 10개) -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="최근 본 물건" fallback="/my">
        <template #right><button v-if="ids.length" type="button" class="text-[13px] muted px-2" @click="handleBtnAction('recent-clear')">지우기</button></template>
      </dm-title-bar>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <div v-if="loading" class="grid grid-cols-2 gap-x-3 gap-y-5 p-4"><div v-for="i in 4" :key="i" class="skeleton aspect-square rounded-xl"></div></div>
    <dm-empty v-else-if="!items.length" icon="far fa-clock" title="최근 본 물건이 없어요" desc="물건을 열어 보면 여기에 차례로 쌓여요">
      <nuxt-link to="/" class="btn-primary mt-3 px-8">물건 둘러보기</nuxt-link>
    </dm-empty>
    <ul v-else class="grid grid-cols-2 gap-x-3 gap-y-5 p-4">
      <li v-for="p in items" :key="p.prodId"><dm-mini-card :prod="p" /></li>
    </ul>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmMiniCard from "~/components/danmoo1/dm/DmMiniCard.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { readLocalList, writeLocalList } from "~/composables/useDmTown";
import { DM_RECENT_VIEW_KEY } from "~/conts/tenant/danmoo1";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import type { PdProdType } from "~/types/pd/pdProdType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "최근 본 물건" });
const ids = ref<string[]>([]);
const items = ref<PdProdType[]>([]);
const loading = ref(true);

/* handleBtnAction — 버튼 액션 dispatch */
const handleBtnAction = (cmd: string) => {
  if (cmd === "recent-clear") {
    writeLocalList(DM_RECENT_VIEW_KEY, []);
    ids.value = [];
    items.value = [];
    return;
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* initPage — 최근 10개를 각각 조회(없어진 물건은 건너뜀) */
const initPage = async () => {
  ids.value = readLocalList(DM_RECENT_VIEW_KEY, 20).slice(0, 10);
  try {
    const found = await Promise.all(ids.value.map((id) => pdProductSvc.getById(id).catch(() => null)));
    items.value = found.filter((p): p is PdProdType => !!p);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
