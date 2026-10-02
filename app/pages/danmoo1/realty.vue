<template>
  <!-- 부동산 — 매물 종류 칩 + 매물 목록 + 상세 시트(지도) + 관심. 부동산 데이터는 백엔드에 없어 표시용 샘플 -->
  <layout>
    <template #top>
      <dm-title-bar fallback="/">
        <template #title><b class="text-[19px] font-extrabold">부동산 <span class="muted text-[14px] font-semibold ml-1">{{ town }}</span></b></template>
        <template #right><nuxt-link to="/map" class="icon-btn" aria-label="지도"><i class="far fa-map"></i></nuxt-link></template>
      </dm-title-bar>
      <dm-chips v-model="chip" :items="DM_REALTY_TYPES.map((s) => ({ value: s, label: s }))" clearable />
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <div class="mx-4 mt-2 mb-1 rounded-xl bg-[var(--dm-primary-soft)] px-4 py-3 text-[13px]"><i class="fas fa-info-circle primary mr-1.5"></i>매물은 표시용 샘플이에요. 매물 등록·문의는 준비 중입니다.</div>
    <dm-empty v-if="chip && !KIND_CHIPS.has(chip) && chip !== '관심' && chip !== '전체'" icon="far fa-building" :title="`${chip}은 준비 중이에요`" />
    <template v-else>
      <ul>
        <li v-for="r in list" :key="r.id" class="px-4 py-4 border-b border-[var(--dm-line)]">
          <div class="flex gap-3.5">
            <button type="button" class="flex-1 min-w-0 text-left flex gap-3.5" @click="handleSelectAction('realty-open', r)">
              <span class="w-28 h-24 rounded-xl bg-[var(--dm-chip)] inline-flex items-center justify-center text-[26px] text-[var(--dm-text-3)] flex-none"><i :class="iconOf(r.kind)"></i></span>
              <span class="flex-1 min-w-0 pt-0.5">
                <span class="text-[12px] muted">{{ r.kind }} · {{ r.town }}</span>
                <p class="text-[17px] font-extrabold mt-0.5">{{ r.price }}</p>
                <p class="text-[13.5px] muted mt-1">{{ r.area }} · {{ r.floor }}</p>
                <p class="text-[12px] muted mt-2"><i class="far fa-clock mr-1"></i>{{ r.moveIn }} · 직거래</p>
              </span>
            </button>
            <button type="button" class="text-[18px] self-start" :class="likes.includes(r.id) ? 'primary' : 'muted'" aria-label="관심" @click="handleSelectAction('realty-like', r)"><i :class="likes.includes(r.id) ? 'fas fa-heart' : 'far fa-heart'"></i></button>
          </div>
        </li>
      </ul>
      <dm-empty v-if="!list.length" icon="far fa-building" :title="chip === '관심' ? '관심 매물이 없어요' : `'${chip}' 매물이 없어요`" />
    </template>

    <!-- 매물 상세 -->
    <dm-sheet :open="!!openItem" title="매물 상세" @close="openItem = null">
      <template v-if="openItem">
        <span class="text-[12px] muted">{{ openItem.kind }} · {{ openItem.town }}</span>
        <h3 class="text-[20px] font-extrabold mt-1">{{ openItem.price }}</h3>
        <p class="text-[14px] muted mt-1">{{ openItem.desc }}</p>
        <ul class="mt-4 space-y-2 text-[14.5px]">
          <li class="flex gap-3"><span class="w-16 muted">면적</span><span>{{ openItem.area }}</span></li>
          <li class="flex gap-3"><span class="w-16 muted">층</span><span>{{ openItem.floor }}</span></li>
          <li class="flex gap-3"><span class="w-16 muted">입주</span><span>{{ openItem.moveIn }}</span></li>
          <li class="flex gap-3"><span class="w-16 muted">옵션</span><span class="flex flex-wrap gap-1.5"><span v-for="o in openItem.options" :key="o" class="px-2 py-0.5 rounded bg-[var(--dm-chip)] text-[13px]">{{ o }}</span></span></li>
        </ul>
        <client-only>
          <div class="rounded-xl overflow-hidden mt-4"><map-switch :addr="`성남시 ${openItem.town}`" :lat="coordsOf(openItem.town).lat" :lng="coordsOf(openItem.town).lng" height-css="180px" toolbar-position="bottom" /></div>
        </client-only>
      </template>
      <template #foot>
        <div class="flex gap-2">
          <button type="button" class="btn-soft !h-12 w-14 text-[18px]" :class="openItem && likes.includes(openItem.id) ? 'text-[var(--dm-primary)]' : ''" aria-label="관심" @click="openItem && handleSelectAction('realty-like', openItem)"><i :class="openItem && likes.includes(openItem.id) ? 'fas fa-heart' : 'far fa-heart'"></i></button>
          <button type="button" class="btn-primary flex-1" @click="handleBtnAction('realty-contact')">문의하기</button>
        </div>
      </template>
    </dm-sheet>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmChips from "~/components/danmoo1/dm/DmChips.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import MapSwitch from "~/components/danmoo1/common/map/MapSwitch.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { readLocalList, toggleLocalList, useDmTown } from "~/composables/useDmTown";
import { DM_REALTY_LIKE_KEY, DM_REALTY_SAMPLE, DM_REALTY_TYPES, coordsOf, type DmRealtySample } from "~/conts/tenant/danmoo1";

const currentFilePath = useCurrentFilePath();
useHead({ title: "부동산" });
const { town } = useDmTown();
const { openAlert } = useAlert();
const chip = ref("");
const likes = ref<string[]>([]);
const openItem = ref<DmRealtySample | null>(null);
const KIND_CHIPS = new Set(["아파트", "원룸", "투룸+", "오피스텔", "상가"]);
const list = computed(() => {
  if (chip.value === "관심") return DM_REALTY_SAMPLE.filter((r) => likes.value.includes(r.id));
  return KIND_CHIPS.has(chip.value) ? DM_REALTY_SAMPLE.filter((r) => r.kind === chip.value) : DM_REALTY_SAMPLE;
});
const iconOf = (kind: string) => ({ 아파트: "fas fa-building", 토지: "fas fa-mountain", 상가: "fas fa-store", 건물: "fas fa-city", 오피스텔: "fas fa-hotel" })[kind] ?? "fas fa-home";

/* handleBtnAction — 버튼 액션 dispatch */
const handleBtnAction = (cmd: string) => {
  if (cmd === "realty-contact") return openAlert({ title: "문의하기", message: "매물 문의는 준비 중이에요.", variant: "info" });
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 매물 선택/관심 */
const handleSelectAction = (cmd: string, r: DmRealtySample) => {
  if (cmd === "realty-open") return (openItem.value = r);
  if (cmd === "realty-like") return (likes.value = toggleLocalList(DM_REALTY_LIKE_KEY, r.id));
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

onMounted(() => { likes.value = readLocalList(DM_REALTY_LIKE_KEY, 50); });
</script>
