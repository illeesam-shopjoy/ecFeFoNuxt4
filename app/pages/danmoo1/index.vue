<template>
  <!-- 홈 — 당근 첫 화면: 내 동네 ▾ · 검색/메뉴/알림, 카테고리 칩, 정렬·가격·거래가능 필터, 중고거래 피드(무한 스크롤), 글쓰기 FAB -->
  <layout :fab="true">
    <template #top>
      <dm-top-bar />
      <dm-chips v-model="cateId" :items="chips" clearable />
      <dm-filter-bar v-model="filter" />
    </template>

    <!-- 안내 띠 -->
    <nuxt-link to="/services" class="mx-4 mt-1 mb-2 flex items-center gap-3 rounded-xl bg-[var(--dm-primary-soft)] px-4 py-3">
      <span class="w-9 h-9 rounded-full bg-[var(--dm-primary)] text-white inline-flex items-center justify-center text-[16px]"><i class="fas fa-carrot"></i></span>
      <span class="flex-1 text-[13.5px] leading-tight"><b>{{ town }}</b> 이웃과 가볍게 거래해요<br /><span class="muted text-[12px]">알바·부동산·동네생활도 한곳에서</span></span>
      <i class="fas fa-chevron-right text-[12px] muted"></i>
    </nuxt-link>

    <!-- 첫 로딩 스켈레톤 -->
    <div v-if="loading && !items.length" class="divide-y divide-[var(--dm-line)]">
      <div v-for="i in 6" :key="i" class="flex gap-3.5 p-4">
        <div class="skeleton w-28 h-28 rounded-[10px] flex-none"></div>
        <div class="flex-1 space-y-2 pt-1"><div class="skeleton h-4 w-3/4 rounded"></div><div class="skeleton h-3 w-1/3 rounded"></div><div class="skeleton h-4 w-1/4 rounded mt-3"></div></div>
      </div>
    </div>

    <template v-else>
      <dm-prod-card v-for="p in visible" :key="p.prodId" :prod="p" />
      <dm-empty v-if="!visible.length" icon="far fa-box-open" :title="items.length ? '조건에 맞는 물건이 없어요' : '아직 올라온 물건이 없어요'" :desc="items.length ? '필터를 바꿔 보세요' : `${town} 근처에 첫 물건을 올려보세요`" />
      <div ref="sentinel" class="h-1"></div>
      <div v-if="hasMore" class="p-4">
        <button type="button" class="btn-soft w-full" :disabled="loading" @click="handleBtnAction('feed-more')">{{ loading ? "불러오는 중…" : "더 보기" }}</button>
      </div>
      <p v-else-if="items.length" class="muted text-center text-[13px] py-6">{{ town }} 근처 물건을 모두 봤어요</p>
    </template>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTopBar from "~/components/danmoo1/dm/DmTopBar.vue";
import DmChips, { type DmChipItem } from "~/components/danmoo1/dm/DmChips.vue";
import DmFilterBar, { type DmFilterValue } from "~/components/danmoo1/dm/DmFilterBar.vue";
import DmProdCard from "~/components/danmoo1/dm/DmProdCard.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useDmTown } from "~/composables/useDmTown";
import { DM_HOME_SHORTCUTS, DM_SORTS, dmStatusOf } from "~/conts/tenant/danmoo1";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import type { PdProdType } from "~/types/pd/pdProdType";

/* ##### [01] 초기 변수 정의 ################################################## */

// nuxt.config app.keepalive.include 의 이름 — 상세에서 뒤로 오면 목록·스크롤 그대로
defineOptions({ name: "HomePage" });
useHead({ title: "홈" });

const { town } = useDmTown();
const { openAlert } = useAlert();
const cateId = ref("");
const filter = ref<DmFilterValue>({ sort: DM_SORTS[0]!.value, onlyAvailable: false });
const cateChips = ref<DmChipItem[]>([]);
const items = ref<PdProdType[]>([]);
const page = ref(0);
const hasMore = ref(false);
const loading = ref(false);
const sentinel = ref<HTMLElement | null>(null);
let seq = 0; // 늦게 온 이전 응답이 최신 결과를 덮지 않게

// 알바·부동산 바로가기 + 사이트 카테고리(1단계)
const chips = computed<DmChipItem[]>(() => [...DM_HOME_SHORTCUTS.filter((s) => s.external).map((s) => ({ value: s.to, label: s.label, to: s.to })), ...cateChips.value]);
// "거래 가능만"은 서버 조건이 없어 화면에서 거른다
const visible = computed(() => (filter.value.onlyAvailable ? items.value.filter((p) => !dmStatusOf(p)) : items.value));

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "feed-more") return fnLoadFeed(false);
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadCates — 이 사이트의 1단계 카테고리 → 칩 */
const fnLoadCates = async () => {
  try {
    const list = await pdMyProdSvc.getCategories();
    cateChips.value = list
      .filter((c) => c.categoryDepth === 1 && (c.categoryStatusCd ?? "ACTIVE") === "ACTIVE")
      .sort((a, b) => (a.sortOrd ?? 0) - (b.sortOrd ?? 0))
      .map((c) => ({ value: c.categoryId, label: c.categoryNm }));
  } catch (e) {
    console.error("[danmoo1/index] 카테고리 조회 실패", e);
  }
};

/* fnLoadFeed — 중고거래 피드. reset=true 면 1페이지부터 */
const fnLoadFeed = async (reset: boolean) => {
  if (loading.value && !reset) return;
  const my = ++seq;
  loading.value = true;
  try {
    const r = await pdProductSvc.getPaged({
      pageNo: reset ? 1 : page.value + 1,
      pageSize: 20,
      categoryIds: cateId.value ? [cateId.value] : undefined,
      sort: filter.value.sort,
      priceMin: filter.value.priceMin,
      priceMax: filter.value.priceMax,
      tradeMethodCd: filter.value.tradeMethodCd,
    });
    if (my !== seq) return;
    items.value = reset ? r.items : [...items.value, ...r.items];
    page.value = r.pageNo;
    hasMore.value = r.hasMore;
  } catch (e) {
    console.error("[danmoo1/index] 물건 목록 조회 실패", e);
    await openAlert("물건 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  } finally {
    if (my === seq) loading.value = false;
  }
};

watch([cateId, () => filter.value.sort, () => filter.value.priceMin, () => filter.value.priceMax, () => filter.value.tradeMethodCd], () => fnLoadFeed(true));

/* initPage — 카테고리와 첫 페이지를 같이 조회, 바닥에 닿으면 다음 페이지(무한 스크롤) */
let io: IntersectionObserver | null = null;
const initPage = async () => {
  await Promise.all([fnLoadCates(), fnLoadFeed(true)]);
  if (import.meta.client && "IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting) && hasMore.value && !loading.value) fnLoadFeed(false); }, { rootMargin: "300px" });
    if (sentinel.value) io.observe(sentinel.value);
  }
};
onMounted(initPage);
onBeforeUnmount(() => io?.disconnect());
</script>
