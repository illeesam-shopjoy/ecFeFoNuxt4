<template>
  <!-- 설정 — 내 동네·동네 범위 · 화면 테마 · 키워드 알림 관리 · 최근 검색어 삭제 · 계정(로그아웃) · 앱 정보(사이트·모듈·환경) -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="설정" fallback="/my" /></template>

    <section class="px-4 pt-5">
      <h2 class="text-[15px] font-extrabold muted mb-1">동네</h2>
      <button type="button" class="dm-menu" @click="townOpen = true"><span><i class="far fa-map-marker-alt"></i>내 동네</span><span class="r">{{ town }}<i class="fas fa-chevron-right text-[11px]"></i></span></button>
      <div class="dm-menu !h-auto py-2"><span><i class="far fa-dot-circle"></i>동네 범위</span>
        <span class="r !gap-1"><button v-for="r in DM_RANGE_OPTIONS" :key="r.value" type="button" class="h-8 px-2.5 rounded-full text-[12.5px] font-semibold" :class="r.value === range ? 'bg-[var(--dm-text)] text-[var(--dm-bg)]' : 'bg-[var(--dm-chip)] text-[var(--dm-text)]'" @click="setRange(r.value)">{{ r.label }}</button></span>
      </div>
    </section>

    <section class="px-4 pt-6">
      <h2 class="text-[15px] font-extrabold muted mb-1">화면</h2>
      <!-- 2026-10-03: 사이트 정상여부 체크(기본 꺼짐, localStorage) — 켜면 로그인할 때 서버가 사이트·모듈 짝을 확인한다 -->
      <button type="button" class="dm-menu" :aria-pressed="siteCheck.on.value" @click="siteCheck.toggle()"><span><i class="far fa-shield-check"></i>사이트 정상여부 체크</span><span class="r"><span class="w-11 h-6 rounded-full relative transition" :class="siteCheck.on.value ? 'bg-[var(--dm-primary)]' : 'bg-[var(--dm-line)]'"><span class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" :class="siteCheck.on.value ? 'left-[22px]' : 'left-0.5'"></span></span></span></button>
      <button type="button" class="dm-menu" @click="handleBtnAction('theme-toggle')"><span><i class="far fa-moon"></i>다크 모드</span><span class="r"><span class="w-11 h-6 rounded-full relative transition" :class="dark ? 'bg-[var(--dm-primary)]' : 'bg-[var(--dm-line)]'"><span class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" :class="dark ? 'left-[22px]' : 'left-0.5'"></span></span></span></button>
    </section>

    <section class="px-4 pt-6">
      <div class="flex items-center justify-between mb-1"><h2 class="text-[15px] font-extrabold muted">키워드 알림</h2><nuxt-link to="/search" class="text-[13px] primary font-bold">추가</nuxt-link></div>
      <p v-if="!keywords.length" class="muted text-[14px] py-3">등록한 키워드가 없어요. 검색 결과에서 '키워드 알림'을 눌러 추가해요.</p>
      <ul v-else class="flex flex-wrap gap-2 py-2">
        <li v-for="k in keywords" :key="k" class="inline-flex items-center gap-1.5 h-9 pl-3.5 pr-2 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] text-[14px] font-semibold">
          <i class="far fa-bell"></i>{{ k }}
          <button type="button" class="w-5 h-5 rounded-full text-[11px]" aria-label="삭제" @click="handleSelectAction('keyword-remove', k)"><i class="fas fa-times"></i></button>
        </li>
      </ul>
      <button type="button" class="dm-menu" @click="handleBtnAction('recent-clear')"><span><i class="far fa-history"></i>최근 검색어·최근 본 물건 지우기</span><span class="r"><i class="fas fa-chevron-right text-[11px]"></i></span></button>
    </section>

    <section class="px-4 pt-6">
      <h2 class="text-[15px] font-extrabold muted mb-1">계정</h2>
      <template v-if="authStore.isStLoggedIn">
        <div class="dm-menu"><span><i class="far fa-user"></i>{{ authStore.user?.userNm }}</span><span class="r">{{ authStore.user?.userEmail }}</span></div>
        <button type="button" class="dm-menu" @click="handleBtnAction('auth-logout')"><span><i class="far fa-sign-out-alt"></i>로그아웃</span><span class="r"><i class="fas fa-chevron-right text-[11px]"></i></span></button>
      </template>
      <nuxt-link v-else :to="{ path: '/login', query: { redirect: '/my/settings' } }" class="dm-menu"><span><i class="far fa-sign-in-alt"></i>로그인</span><span class="r"><i class="fas fa-chevron-right text-[11px]"></i></span></nuxt-link>
    </section>

    <section class="px-4 pt-6 pb-10">
      <h2 class="text-[15px] font-extrabold muted mb-1">앱 정보</h2>
      <ul class="text-[13.5px] rounded-xl bg-[var(--dm-bg-soft)] px-4 py-3 space-y-1.5">
        <li class="flex justify-between"><span class="muted">사이트</span><span>{{ tenant.siteId }}</span></li>
        <li class="flex justify-between"><span class="muted">모듈</span><span>{{ tenant.moduleId }} · {{ tenant.name }}</span></li>
        <li class="flex justify-between"><span class="muted">환경</span><span>{{ envNm }} ({{ mode }})</span></li>
        <li class="flex justify-between"><span class="muted">백엔드</span><span class="truncate max-w-[60%]">{{ apiBase }}</span></li>
      </ul>
    </section>

    <dm-sheet :open="townOpen" title="내 동네 설정" @close="townOpen = false">
      <div class="grid grid-cols-2 gap-2">
        <button v-for="n in DM_NEIGHBORHOODS" :key="n" type="button" class="h-11 rounded-lg text-[15px] font-semibold" :class="n === town ? 'bg-[var(--dm-primary)] text-white' : 'bg-[var(--dm-chip)]'" @click="setTown(n); townOpen = false">{{ n }}</button>
      </div>
    </dm-sheet>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import { readLocalList, useDmTown, writeLocalList } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_KEYWORD_ALERT_KEY, DM_NEIGHBORHOODS, DM_RANGE_OPTIONS, DM_RECENT_SEARCH_KEY, DM_RECENT_VIEW_KEY } from "~/conts/tenant/danmoo1";
const siteCheck = useSiteCheckToggle(); // 사이트 정상여부 체크 토글 (기본 꺼짐, localStorage, 2026-10-03)

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "설정" });
const authStore = useAuthStore();
const tenant = useTenant();
const { envNm, mode, apiBaseUrlDisplay: apiBase } = useRuntimeConfig().public;
const { town, setTown, range, setRange } = useDmTown();
const { dark, toggle } = useTheme();
const { openAlert } = useAlert();
const { openConfirm } = useConfirm();
const keywords = ref<string[]>([]);
const townOpen = ref(false);

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "theme-toggle") return toggle();
  if (cmd === "recent-clear") {
    writeLocalList(DM_RECENT_SEARCH_KEY, []);
    writeLocalList(DM_RECENT_VIEW_KEY, []);
    return openAlert({ title: "삭제", message: "최근 검색어와 최근 본 물건을 지웠어요.", variant: "success" });
  }
  if (cmd === "auth-logout") {
    if (!(await openConfirm({ title: "로그아웃", message: "로그아웃 할까요?" }))) return;
    await authStore.setStLogout();
    return navigateTo("/");
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 키워드 삭제 */
const handleSelectAction = (cmd: string, k: string) => {
  if (cmd === "keyword-remove") {
    keywords.value = keywords.value.filter((x) => x !== k);
    return writeLocalList(DM_KEYWORD_ALERT_KEY, keywords.value);
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

onMounted(async () => {
  keywords.value = readLocalList(DM_KEYWORD_ALERT_KEY, 10);
  await useAuthReady();
});
</script>
