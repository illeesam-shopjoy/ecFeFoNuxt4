<template>
  <!-- 검색 — 상단 검색창, 최근 검색어(이 브라우저 저장) · 추천 검색어. 결과는 탭(중고거래=상품명 검색 + 정렬/가격 필터, 동네생활=글 제목·내용 검색). 결과 없으면 키워드 알림 등록 유도 -->
  <layout :tabs="false">
    <template #top>
      <div class="flex items-center gap-1 h-14 px-2">
        <button type="button" class="icon-btn" aria-label="뒤로" @click="handleBtnAction('nav-back')"><i class="fas fa-chevron-left"></i></button>
        <form class="flex-1 relative" @submit.prevent="handleBtnAction('search-submit')">
          <input ref="inputRef" v-model="q" type="search" class="input !h-10 !pr-9" :placeholder="`${town} 근처에서 검색`" enterkeyhint="search" autocomplete="off" />
          <button v-if="q" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--dm-text-3)] text-white text-[11px]" aria-label="지우기" @click="handleBtnAction('search-clear')"><i class="fas fa-times"></i></button>
        </form>
      </div>
      <template v-if="submitted">
        <div class="dm-segs">
          <button v-for="t in TABS" :key="t.key" type="button" class="dm-seg" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}<span v-if="counts[t.key] != null" class="ml-1 text-[12px] muted">{{ counts[t.key] }}</span></button>
        </div>
        <dm-filter-bar v-if="tab === 'prod'" v-model="filter" />
      </template>
    </template>

    <!-- 검색 전: 최근/추천 -->
    <div v-if="!submitted" class="px-4 pt-5">
      <div class="flex items-center justify-between mb-2">
        <b class="text-[15px]">최근 검색</b>
        <button v-if="recent.length" type="button" class="muted text-[13px]" @click="handleBtnAction('recent-clear')">전체 삭제</button>
      </div>
      <p v-if="!recent.length" class="muted text-[14px] py-3">최근 검색어가 없어요.</p>
      <ul v-else class="flex flex-wrap gap-2 mb-1">
        <li v-for="r in recent" :key="r" class="inline-flex items-center gap-1.5 h-9 pl-3.5 pr-2 rounded-full bg-[var(--dm-chip)] text-[14px]">
          <button type="button" @click="handleSelectAction('search-word', r)">{{ r }}</button>
          <button type="button" class="w-5 h-5 rounded-full text-[11px] text-[var(--dm-text-2)]" aria-label="삭제" @click="handleSelectAction('recent-remove', r)"><i class="fas fa-times"></i></button>
        </li>
      </ul>
      <b class="block text-[15px] mt-7 mb-2">추천 검색</b>
      <ul class="flex flex-wrap gap-2">
        <li v-for="s in DM_SEARCH_SUGGEST" :key="s">
          <button type="button" class="h-9 px-3.5 rounded-full border border-[var(--dm-line)] text-[14px]" @click="handleSelectAction('search-word', s)">{{ s }}</button>
        </li>
      </ul>
      <div v-if="keywords.length" class="mt-7">
        <div class="flex items-center justify-between mb-2"><b class="text-[15px]">내 키워드 알림</b><nuxt-link to="/noti?tab=new" class="text-[13px] primary font-bold">새 글 보기</nuxt-link></div>
        <ul class="flex flex-wrap gap-2"><li v-for="k in keywords" :key="k"><button type="button" class="h-9 px-3.5 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] text-[14px] font-semibold" @click="handleSelectAction('search-word', k)"><i class="far fa-bell mr-1"></i>{{ k }}</button></li></ul>
      </div>
    </div>

    <!-- 결과: 중고거래 -->
    <div v-else-if="tab === 'prod'">
      <div class="flex items-center justify-between px-4 py-3 text-[13px] muted">
        <span><b class="text-[var(--dm-text)]">{{ submittedQ }}</b> 물건 {{ total.toLocaleString() }}개</span>
        <button type="button" class="primary font-bold" @click="handleBtnAction('alert-add')"><i class="far fa-bell mr-1"></i>키워드 알림</button>
      </div>
      <div v-if="loading && !items.length" class="p-8 text-center muted">검색 중…</div>
      <template v-else>
        <dm-prod-card v-for="p in visible" :key="p.prodId" :prod="p" />
        <dm-empty v-if="!visible.length" icon="far fa-search" :title="`'${submittedQ}' 물건이 없어요`" desc="키워드 알림을 등록하면 새 글이 올라올 때 알림 탭에서 볼 수 있어요">
          <button type="button" class="btn-primary mt-3" @click="handleBtnAction('alert-add')">키워드 알림 등록</button>
        </dm-empty>
        <div v-if="hasMore" class="p-4"><button type="button" class="btn-soft w-full" :disabled="loading" @click="handleBtnAction('search-more')">더 보기</button></div>
      </template>
    </div>

    <!-- 결과: 동네생활 -->
    <div v-else>
      <div v-if="postLoading" class="p-8 text-center muted">검색 중…</div>
      <template v-else>
        <nuxt-link v-for="p in posts" :key="p.blogId" :to="`/community/${p.blogId}`" class="block px-4 py-4 border-b border-[var(--dm-line)]">
          <div class="text-[12.5px] muted">{{ p.blogAuthor || "이웃" }} · {{ town }} · {{ timeAgo(p.regDate) }}</div>
          <h3 class="text-[16px] font-bold leading-snug mt-1">{{ p.blogTitle }}</h3>
          <p class="text-[14px] muted clamp-2 mt-1">{{ p.blogSummary }}</p>
          <p class="text-[12.5px] muted mt-2"><i class="far fa-comment mr-1"></i>{{ p.replies?.length ?? 0 }} · 조회 {{ p.viewCount ?? 0 }}</p>
        </nuxt-link>
        <dm-empty v-if="!posts.length" icon="far fa-comments" :title="`'${submittedQ}' 동네생활 글이 없어요`" />
      </template>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmProdCard from "~/components/danmoo1/dm/DmProdCard.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import DmFilterBar, { type DmFilterValue } from "~/components/danmoo1/dm/DmFilterBar.vue";
import { pushLocalList, readLocalList, useDmTown, writeLocalList } from "~/composables/useDmTown";
import { DM_BLOG_CATE_ID, DM_KEYWORD_ALERT_KEY, DM_RECENT_SEARCH_KEY, DM_SEARCH_SUGGEST, DM_SORTS, dmStatusOf } from "~/conts/tenant/danmoo1";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { timeAgo } from "~/utils/timeAgo";
import type { PdProdType } from "~/types/pd/pdProdType";
import type { CmBlogType } from "~/types/cm/cmBlogType";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "검색" });
const route = useRoute();
const router = useRouter();
const { town } = useDmTown();
const { openAlert } = useAlert();

const TABS = [{ key: "prod", label: "중고거래" }, { key: "post", label: "동네생활" }] as const;
const tab = ref<(typeof TABS)[number]["key"]>(route.query.tab === "post" ? "post" : "prod");
const inputRef = ref<HTMLInputElement | null>(null);
const q = ref(String(route.query.q ?? ""));
const submittedQ = ref("");
const submitted = ref(false);
const recent = ref<string[]>([]);
const keywords = ref<string[]>([]);
const filter = ref<DmFilterValue>({ sort: DM_SORTS[0]!.value, onlyAvailable: false });
const items = ref<PdProdType[]>([]);
const total = ref(0);
const page = ref(0);
const hasMore = ref(false);
const loading = ref(false);
const posts = ref<CmBlogType[]>([]);
const postLoading = ref(false);
const counts = reactive<Record<string, number | null>>({ prod: null, post: null });
const visible = computed(() => (filter.value.onlyAvailable ? items.value.filter((p) => !dmStatusOf(p)) : items.value));

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "nav-back") return import.meta.client && window.history.length > 1 ? router.back() : router.push("/");
  if (cmd === "search-submit") return fnSearch(q.value);
  if (cmd === "search-more") return fnLoadProds(false);
  if (cmd === "search-clear") {
    q.value = "";
    submitted.value = false;
    return inputRef.value?.focus();
  }
  if (cmd === "recent-clear") {
    recent.value = [];
    return writeLocalList(DM_RECENT_SEARCH_KEY, []);
  }
  if (cmd === "alert-add") {
    keywords.value = pushLocalList(DM_KEYWORD_ALERT_KEY, submittedQ.value, 10);
    return openAlert({ title: "키워드 알림", message: `'${submittedQ.value}' 키워드를 등록했어요. 알림 > 새 글 탭에서 이 키워드의 새 물건을 모아 볼 수 있어요.`, variant: "success" });
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 선택 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, word: string) => {
  if (cmd === "search-word") {
    q.value = word;
    return fnSearch(word);
  }
  if (cmd === "recent-remove") {
    recent.value = recent.value.filter((r) => r !== word);
    return writeLocalList(DM_RECENT_SEARCH_KEY, recent.value);
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnSearch — 검색어 확정: 최근 검색어 저장 + 두 탭 조회 + 주소(?q=)에 반영 */
const fnSearch = async (word: string) => {
  const w = word.trim();
  if (!w) return inputRef.value?.focus();
  submittedQ.value = w;
  submitted.value = true;
  recent.value = pushLocalList(DM_RECENT_SEARCH_KEY, w, 10);
  router.replace({ query: { q: w, tab: tab.value } });
  inputRef.value?.blur();
  await Promise.all([fnLoadProds(true), fnLoadPosts()]);
};

/* fnLoadProds — 상품명 키워드 검색(정렬·가격 필터 포함) */
const fnLoadProds = async (reset: boolean) => {
  loading.value = true;
  try {
    const r = await pdProductSvc.getPaged({ pageNo: reset ? 1 : page.value + 1, pageSize: 20, keyword: submittedQ.value, sort: filter.value.sort, priceMin: filter.value.priceMin, priceMax: filter.value.priceMax });
    items.value = reset ? r.items : [...items.value, ...r.items];
    total.value = r.pageTotalCount;
    counts.prod = r.pageTotalCount;
    page.value = r.pageNo;
    hasMore.value = r.hasMore;
  } catch (e) {
    console.error("[danmoo1/search] 물건 검색 실패", e);
    await openAlert("검색에 실패했어요. 잠시 후 다시 시도해 주세요.");
  } finally {
    loading.value = false;
  }
};

/* fnLoadPosts — 동네생활 글 검색(제목·내용, 서버 searchValue) */
const fnLoadPosts = async () => {
  postLoading.value = true;
  try {
    const r = await coBlogSvc.getPagedWith({ pageNo: 1, pageSize: 30, blogCateId: DM_BLOG_CATE_ID, searchValue: submittedQ.value });
    posts.value = r.items;
    counts.post = r.pageTotalCount;
  } catch (e) {
    console.error("[danmoo1/search] 동네생활 검색 실패", e);
    posts.value = [];
  } finally {
    postLoading.value = false;
  }
};

watch([() => filter.value.sort, () => filter.value.priceMin, () => filter.value.priceMax], () => { if (submitted.value) fnLoadProds(true); });
watch(tab, (t) => { if (submitted.value) router.replace({ query: { q: submittedQ.value, tab: t } }); });

/* initPage — 최근 검색어·키워드 복원, ?q= 로 들어오면 바로 검색, 아니면 입력칸 포커스 */
const initPage = () => {
  recent.value = readLocalList(DM_RECENT_SEARCH_KEY, 10);
  keywords.value = readLocalList(DM_KEYWORD_ALERT_KEY, 10);
  if (q.value) return fnSearch(q.value);
  inputRef.value?.focus();
};
onMounted(initPage);
</script>
