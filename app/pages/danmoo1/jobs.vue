<template>
  <!-- 알바 — 당근알바 첫 화면 모양(바로가기 칩 + 공고 목록 + 상세 시트 + 관심). 알바 데이터는 백엔드에 없어 표시용 샘플 -->
  <layout>
    <template #top>
      <dm-title-bar fallback="/">
        <template #title><b class="text-[19px] font-extrabold">알바 <span class="muted text-[14px] font-semibold ml-1">{{ town }}</span></b></template>
        <template #right>
          <button type="button" class="icon-btn" aria-label="관심 알바" @click="chip = chip === '관심' ? '' : '관심'"><i :class="chip === '관심' ? 'fas fa-heart primary' : 'far fa-heart'"></i></button>
          <nuxt-link to="/search" class="icon-btn" aria-label="검색"><i class="far fa-search"></i></nuxt-link>
        </template>
      </dm-title-bar>
      <dm-chips v-model="chip" :items="DM_JOB_SHORTCUTS.map((s) => ({ value: s, label: s }))" clearable />
    </template>

    <div class="mx-4 mt-2 mb-1 rounded-xl bg-[var(--dm-primary-soft)] px-4 py-3 text-[13px]"><i class="fas fa-info-circle primary mr-1.5"></i>알바 공고는 표시용 샘플이에요. 지원·공고 등록은 준비 중입니다.</div>
    <ul>
      <li v-for="j in jobs" :key="j.id" class="px-4 py-4 border-b border-[var(--dm-line)]">
        <div class="flex gap-3">
          <button type="button" class="flex-1 min-w-0 text-left" @click="handleSelectAction('job-open', j)">
            <span class="inline-block text-[11px] px-1.5 py-0.5 rounded bg-[var(--dm-chip)] muted mb-1.5">{{ j.badge }}</span>
            <p class="text-[15.5px] font-semibold leading-snug clamp-2">{{ j.title }}</p>
            <p class="text-[13px] muted mt-1 truncate">{{ j.place }}</p>
            <p class="text-[15px] font-bold mt-1.5">{{ j.pay }} <span class="text-[12.5px] muted font-normal ml-1">{{ j.hours }}</span></p>
          </button>
          <div class="flex flex-col items-center gap-2 flex-none">
            <span class="w-16 h-16 rounded-xl bg-[var(--dm-chip)] inline-flex items-center justify-center text-[22px] text-[var(--dm-text-3)]"><i class="fas fa-store"></i></span>
            <button type="button" class="text-[18px]" :class="likes.includes(j.id) ? 'primary' : 'muted'" aria-label="관심" @click="handleSelectAction('job-like', j)"><i :class="likes.includes(j.id) ? 'fas fa-heart' : 'far fa-heart'"></i></button>
          </div>
        </div>
      </li>
    </ul>
    <dm-empty v-if="!jobs.length" icon="far fa-briefcase" :title="chip === '관심' ? '관심 알바가 없어요' : `'${chip}' 알바가 없어요`" :desc="chip === '관심' ? '하트를 누른 공고가 여기에 모여요' : ''" />

    <!-- 공고 상세 -->
    <dm-sheet :open="!!openJob" title="알바 상세" @close="openJob = null">
      <template v-if="openJob">
        <span class="inline-block text-[11px] px-1.5 py-0.5 rounded bg-[var(--dm-chip)] muted">{{ openJob.badge }}</span>
        <h3 class="text-[18px] font-extrabold leading-snug mt-2">{{ openJob.title }}</h3>
        <p class="text-[13.5px] muted mt-1">{{ openJob.place }}</p>
        <ul class="mt-4 space-y-2 text-[14.5px]">
          <li class="flex gap-3"><span class="w-16 muted">급여</span><b>{{ openJob.pay }}</b></li>
          <li class="flex gap-3"><span class="w-16 muted">근무시간</span><span>{{ openJob.hours }}</span></li>
          <li class="flex gap-3"><span class="w-16 muted">근무기간</span><span>{{ openJob.period }}</span></li>
        </ul>
        <p class="text-[14.5px] leading-relaxed mt-4">{{ openJob.desc }}</p>
      </template>
      <template #foot>
        <div class="flex gap-2">
          <button type="button" class="btn-soft !h-12 w-14 text-[18px]" :class="openJob && likes.includes(openJob.id) ? 'text-[var(--dm-primary)]' : ''" aria-label="관심" @click="openJob && handleSelectAction('job-like', openJob)"><i :class="openJob && likes.includes(openJob.id) ? 'fas fa-heart' : 'far fa-heart'"></i></button>
          <button type="button" class="btn-primary flex-1" @click="handleBtnAction('job-apply')">지원하기</button>
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
import { readLocalList, toggleLocalList, useDmTown } from "~/composables/useDmTown";
import { DM_JOBS_SAMPLE, DM_JOB_LIKE_KEY, DM_JOB_SHORTCUTS, type DmJobSample } from "~/conts/tenant/danmoo1";

useHead({ title: "알바" });
const { town } = useDmTown();
const { openAlert } = useAlert();
const chip = ref("");
const likes = ref<string[]>([]);
const openJob = ref<DmJobSample | null>(null);
// 칩은 제목·장소·배지에 포함된 말로 걸러 보는 흉내만 낸다(관심 칩은 하트 누른 공고)
const jobs = computed(() => {
  if (chip.value === "관심") return DM_JOBS_SAMPLE.filter((j) => likes.value.includes(j.id));
  if (!chip.value || chip.value === "이웃알바") return DM_JOBS_SAMPLE;
  const key = chip.value.split("/")[0]!;
  return DM_JOBS_SAMPLE.filter((j) => `${j.title} ${j.place} ${j.badge}`.includes(key));
});

/* handleBtnAction — 버튼 액션 dispatch */
const handleBtnAction = (cmd: string) => {
  if (cmd === "job-apply") return openAlert({ title: "지원하기", message: "알바 지원은 준비 중이에요.", variant: "info" });
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 공고 선택/관심 */
const handleSelectAction = (cmd: string, j: DmJobSample) => {
  if (cmd === "job-open") return (openJob.value = j);
  if (cmd === "job-like") return (likes.value = toggleLocalList(DM_JOB_LIKE_KEY, j.id));
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

onMounted(() => { likes.value = readLocalList(DM_JOB_LIKE_KEY, 50); });
</script>
