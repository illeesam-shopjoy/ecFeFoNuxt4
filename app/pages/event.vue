<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="이벤트" subtitle="이벤트" />

    <!-- 2026-09-19(요청사항: "이벤트목록 … ecFeFoNuxt4 페이지에 만들어줘") — ecFeBo(pages/fo/Event.js) 이식.
         검색 + 탭(진행중/당첨자 발표) + 정렬 + 카드 그리드. 진행중 이벤트가 0건이면 상태필터를 풀어 전체 이벤트로 확장해 보여준다. -->
    <section class="pt-16 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 검색 -->
        <form class="flex items-center gap-2 mb-5" @submit.prevent="search">
          <div class="relative flex-1 max-w-[400px]">
            <input
              v-model="searchValue"
              type="text"
              placeholder="ID 또는 이벤트명 검색"
              class="w-full h-11 pl-3.5 pr-10 border border-[#e5e7eb] rounded-md text-[0.88rem] bg-white text-gray-900"
            />
            <button v-if="searchValue" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-gray-400 text-base px-1" aria-label="검색어 지우기" @click="resetSearch">✕</button>
          </div>
          <button type="submit" class="h-11 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.88rem] font-semibold cursor-pointer whitespace-nowrap">검색</button>
        </form>

        <!-- 탭 + 정렬 -->
        <div class="flex flex-wrap items-center justify-between border-b border-[#e5e7eb] mb-7">
          <div class="flex">
            <button
              v-for="t in tabs"
              :key="t.key"
              type="button"
              class="px-6 py-3 bg-transparent border-0 border-b-2 -mb-px cursor-pointer text-[0.88rem]"
              :class="activeTab === t.key ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-400 font-medium'"
              @click="changeTab(t.key)"
            >
              {{ t.label }}<template v-if="t.key === 'ongoing'"> ({{ ongoingCount }})</template>
            </button>
          </div>
          <div class="flex pb-0.5">
            <button
              v-for="s in sorts"
              :key="s.key"
              type="button"
              class="px-3.5 py-1.5 bg-transparent border-0 cursor-pointer text-[0.8rem] first:border-r first:border-[#e5e7eb]"
              :class="sortBy === s.key ? 'text-gray-900 font-bold' : 'text-gray-400'"
              @click="changeSort(s.key)"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- 폴백 안내 -->
        <div v-if="broadened" class="bg-[#f9fafb] border border-[#e5e7eb] rounded-md px-3.5 py-2.5 mb-4 text-[0.82rem] text-gray-500">
          <i class="fas fa-info-circle mr-1.5"></i>진행 중인 이벤트가 없어 전체 이벤트를 보여드립니다.
        </div>

        <!-- 카드 그리드 -->
        <div class="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          <nuxt-link
            v-for="ev in cards"
            :key="ev.eventId"
            :to="`/event-dtl/${ev.eventId}`"
            class="block bg-white border border-[#e5e7eb] rounded overflow-hidden no-underline transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
          >
            <div class="relative h-[170px] overflow-hidden flex flex-col justify-end items-start p-4" :style="{ background: ev.bg }">
              <div class="relative z-[1] text-white">
                <div class="text-[0.72rem] opacity-70 tracking-wider mb-1">{{ ev.startDate }} ~ {{ ev.endDate }}</div>
                <div class="text-[1.45rem] font-black leading-tight tracking-tight">{{ ev.title }}</div>
              </div>
              <div v-if="ev.ended" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span class="text-white text-[0.85rem] font-bold tracking-[3px] border border-white/60 px-3.5 py-1">CLOSED</span>
              </div>
            </div>
            <div class="px-3.5 pt-3.5 pb-4">
              <div class="mb-1.5">
                <span class="inline-block px-1.5 py-0.5 rounded-sm text-[0.68rem] font-bold text-white" :style="{ background: ev.tagColor }">{{ ev.tag }}</span>
              </div>
              <div class="text-[0.87rem] font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">{{ ev.title }}</div>
              <div class="text-[0.75rem] text-gray-400">{{ ev.startDate }} ~ {{ ev.endDate }}</div>
            </div>
          </nuxt-link>
        </div>

        <!-- 빈 상태 / 로딩 / 오류 -->
        <div v-if="!cards.length" class="text-center py-14 text-gray-400">
          <div class="text-3xl mb-3"><i class="fal fa-inbox"></i></div>
          <div class="text-[0.95rem]">
            {{ loading ? "불러오는 중..." : errorMsg || (searchValue ? "검색 결과가 없습니다." : activeTab === "ongoing" ? "진행 중인 이벤트가 없습니다." : "종료된 이벤트가 없습니다.") }}
          </div>
        </div>

        <!-- 페이지네이션 (2페이지 이상일 때만) -->
        <div v-if="pager.pageTotalPage > 1" class="mt-10">
          <fo-pager :pager="pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" />
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { foPmEventSvc, type PmEventCardType, type PmEventPagedResult } from "~/svc/fo/ec/pm/foPmEventSvc";
import FoPager from "~/components/fo/FoPager.vue";
import { usePageTitle } from "~/composables/usePageTitle";

useHead({ title: "이벤트" });
usePageTitle("이벤트");

type TabKey = "ongoing" | "ended";
type SortKey = "latest" | "deadline";
const tabs: { key: TabKey; label: string }[] = [
  { key: "ongoing", label: "진행중" },
  { key: "ended", label: "당첨자 발표" },
];
const sorts: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최근등록순" },
  { key: "deadline", label: "마감임박순" },
];

// 이벤트 상태코드 → 한글, 카드 배너 그라데이션(eventId 해시로 안정 배정) — ecFeBo foConsts 와 동일
const STATUS_KOR: Record<string, string> = { PENDING: "진행예정", ACTIVE: "진행중", ENDED: "종료" };
const BANNER_BGS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#30cfd0,#330867)",
];
function hashIdx(s: string, len: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return len ? h % len : 0;
}

const route = useRoute();
const searchValue = ref(typeof route.query.eventId === "string" ? route.query.eventId : "");
const activeTab = ref<TabKey>("ongoing");
const sortBy = ref<SortKey>("latest");
const pager = reactive({ pageNo: 1, pageSize: 20, pageTotalPage: 1 });
const pageTotalCount = ref(0);
const broadened = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const events = ref<PmEventCardType[]>([]);

const cards = computed(() =>
  events.value.map((e) => {
    const ended = e.eventStatusCd === "ENDED";
    return {
      eventId: e.eventId,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      ended,
      bg: BANNER_BGS[hashIdx(e.eventId, BANNER_BGS.length)],
      tag: STATUS_KOR[e.eventStatusCd] || "이벤트",
      tagColor: ended ? "#9ca3af" : "#ef4444",
    };
  })
);

// 진행중 탭이면 서버 총건수(전체 폴백 시 진행중은 0건), 그 외 탭이면 현재 목록 안의 진행중 수
const ongoingCount = computed(() => {
  if (activeTab.value !== "ongoing") return events.value.filter((e) => e.eventStatusCd !== "ENDED").length;
  return broadened.value ? 0 : pageTotalCount.value;
});

async function fetchEvents(statusCd: string | null): Promise<PmEventPagedResult> {
  const sv = searchValue.value.trim();
  return foPmEventSvc.getPage({
    pageNo: pager.pageNo,
    pageSize: pager.pageSize,
    ...(statusCd ? { eventStatusCd: statusCd } : {}),
    ...(sortBy.value === "deadline" ? { sort: "endDate asc" } : {}),
    ...(sv ? { searchValue: sv } : {}),
  });
}

async function load() {
  loading.value = true;
  errorMsg.value = "";
  broadened.value = false;
  try {
    let r: PmEventPagedResult;
    if (searchValue.value.trim()) {
      // 검색어가 있으면 진행중 필터 없이 검색(종료 탭이면 종료만)
      r = await fetchEvents(activeTab.value === "ended" ? "ENDED" : null);
    } else if (activeTab.value === "ended") {
      r = await fetchEvents("ENDED");
    } else {
      // 진행중 탭: 먼저 ACTIVE, 0건이면 상태필터를 풀고 전체 이벤트로 폴백
      r = await fetchEvents("ACTIVE");
      if (r.pageTotalCount === 0) {
        r = await fetchEvents(null);
        broadened.value = r.pageTotalCount > 0;
      }
    }
    events.value = r.items;
    pageTotalCount.value = r.pageTotalCount;
    pager.pageTotalPage = r.pageTotalPage || 1;
  } catch {
    events.value = [];
    pageTotalCount.value = 0;
    pager.pageTotalPage = 1;
    errorMsg.value = "이벤트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    loading.value = false;
  }
}

function search() {
  pager.pageNo = 1;
  load();
}
function resetSearch() {
  searchValue.value = "";
  search();
}
function changeTab(k: TabKey) {
  if (activeTab.value === k) return;
  activeTab.value = k;
  pager.pageNo = 1;
  load();
}
function changeSort(k: SortKey) {
  if (sortBy.value === k) return;
  sortBy.value = k;
  pager.pageNo = 1;
  load();
}
function goPage(n: number) {
  if (n < 1 || n > pager.pageTotalPage || n === pager.pageNo) return;
  pager.pageNo = n;
  load();
}

onMounted(load);

/* handleSelectAction — 선택/페이징 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, param: unknown = {}) => {
  // 페이지 이동 (param: pageNo)
  if (cmd === "pager-setPage") {
    return goPage(param as number);
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};
</script>

<style scoped>
</style>
