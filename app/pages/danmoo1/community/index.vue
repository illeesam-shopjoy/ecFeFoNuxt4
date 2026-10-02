<template>
  <!-- 커뮤니티(동네생활) — 상단 탭(동네생활만 글이 있다) · 주제 칩(추천/인기=정렬, 나머지=주제 필터) · 글 목록(블로그 카테고리 DM_BLOG_CATE_ID) · 공감(실제 저장)·댓글 수, 글쓰기 FAB -->
  <layout :fab="true" fab-to="/write?type=community">
    <template #top>
      <div class="flex items-center h-14 px-2">
        <div class="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
          <button v-for="t in DM_COMMUNITY_TABS" :key="t" type="button" class="h-14 px-3 text-[18px] font-extrabold whitespace-nowrap border-b-2" :class="tab === t ? 'border-[var(--dm-text)]' : 'border-transparent text-[var(--dm-text-3)]'" @click="tab = t">{{ t }}</button>
        </div>
        <nuxt-link :to="{ path: '/search', query: { tab: 'post' } }" class="icon-btn" aria-label="검색"><i class="far fa-search"></i></nuxt-link>
        <nuxt-link to="/noti" class="icon-btn" aria-label="알림"><i class="far fa-bell"></i></nuxt-link>
      </div>
      <dm-chips v-if="tab === '동네생활'" v-model="chip" :items="chipItems" />
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <dm-empty v-if="tab !== '동네생활'" icon="far fa-users" :title="`${tab}은 준비 중이에요`" desc="지금은 동네생활 글만 볼 수 있어요" />
    <template v-else>
      <div v-if="loading && !posts.length" class="p-8 text-center muted">불러오는 중…</div>
      <article v-for="p in filtered" :key="p.blogId" class="px-4 py-4 border-b border-[var(--dm-line)]">
        <nuxt-link :to="`/community/${p.blogId}`" class="block">
          <div class="flex items-center gap-2 text-[12.5px] muted">
            <span class="w-6 h-6 rounded-full bg-[var(--dm-chip)] inline-flex items-center justify-center text-[11px] font-bold text-[var(--dm-text)]">{{ (p.blogAuthor || "익").slice(0, 1) }}</span>
            <span class="font-semibold text-[var(--dm-text)]">{{ p.blogAuthor || "이웃" }}</span><span>·</span><span>{{ town }}</span><span>·</span><span>{{ timeAgo(p.regDate) }}</span>
            <span v-if="p.viewCount" class="ml-auto">조회 {{ p.viewCount }}</span>
          </div>
          <div class="flex gap-3 mt-2">
            <div class="flex-1 min-w-0">
              <h3 class="text-[16px] font-bold leading-snug">{{ p.blogTitle }}</h3>
              <p class="text-[14px] muted clamp-2 mt-1">{{ p.blogSummary }}</p>
            </div>
            <img v-if="p.img" :src="p.img" alt="" class="w-[72px] h-[72px] rounded-lg object-cover flex-none" loading="lazy" />
          </div>
        </nuxt-link>
        <div class="flex gap-4 mt-3 text-[13px]">
          <button type="button" :class="liked.has(p.blogId) ? 'primary font-bold' : 'muted'" @click="handleSelectAction('post-like', p)"><i :class="liked.has(p.blogId) ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'" class="mr-1"></i>{{ liked.has(p.blogId) ? "공감함" : "공감" }}</button>
          <nuxt-link :to="`/community/${p.blogId}#comments`" class="muted"><i class="far fa-comment mr-1"></i>댓글 {{ p.replies?.length ?? 0 }}</nuxt-link>
        </div>
      </article>
      <dm-empty v-if="!loading && !filtered.length" icon="far fa-comments" :title="isTopic ? `'${chip}' 글이 없어요` : '아직 글이 없어요'" desc="우리 동네 첫 소식을 올려보세요">
        <nuxt-link to="/write?type=community" class="btn-primary mt-3 px-8">글쓰기</nuxt-link>
      </dm-empty>
      <div v-if="hasMore" class="p-4"><button type="button" class="btn-soft w-full" :disabled="loading" @click="handleBtnAction('post-more')">더 보기</button></div>
    </template>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmChips, { type DmChipItem } from "~/components/danmoo1/dm/DmChips.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_BLOG_CATE_ID, DM_COMMUNITY_CHIPS, DM_COMMUNITY_TABS } from "~/conts/tenant/danmoo1";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { mbLikeSvc } from "~/svc/fo/ec/mb/mbLikeSvc";
import { timeAgo } from "~/utils/timeAgo";
import type { CmBlogType } from "~/types/cm/cmBlogType";

/* ##### [01] 초기 변수 정의 ################################################## */

defineOptions({ name: "CommunityPage" });
const currentFilePath = useCurrentFilePath();
useHead({ title: "동네생활" });
const route = useRoute();
const authStore = useAuthStore();
const { town } = useDmTown();
const { openAlert } = useAlert();
const { openConfirm } = useConfirm();

const tab = ref<string>(DM_COMMUNITY_TABS.includes(String(route.query.tab)) ? String(route.query.tab) : DM_COMMUNITY_TABS[0]!);
const chip = ref("추천");
const chipItems: DmChipItem[] = DM_COMMUNITY_CHIPS.map((c) => ({ value: c, label: c }));
const posts = ref<CmBlogType[]>([]);
const liked = ref(new Set<string>());
const page = ref(0);
const hasMore = ref(false);
const loading = ref(false);

const isTopic = computed(() => chip.value !== "추천" && chip.value !== "인기");
// 추천=최신순, 인기=조회수순, 그 외 주제 칩은 제목·요약 포함 여부로 가른다
const filtered = computed(() => {
  if (chip.value === "인기") return [...posts.value].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  if (!isTopic.value) return posts.value;
  return posts.value.filter((p) => `${p.blogTitle} ${p.blogSummary}`.includes(chip.value));
});

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "post-more") return fnLoadPosts(false);
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 글 단위 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = async (cmd: string, p: CmBlogType) => {
  if (cmd === "post-like") {
    if (!authStore.isStLoggedIn) {
      if (await openConfirm({ title: "로그인", message: "공감은 로그인 후 할 수 있어요.", confirmText: "로그인" })) return navigateTo({ path: "/login", query: { redirect: route.fullPath } });
      return;
    }
    try {
      const on = await mbLikeSvc.toggle(p.blogId, "BLOG");
      const next = new Set(liked.value);
      on ? next.add(p.blogId) : next.delete(p.blogId);
      liked.value = next;
    } catch (e) {
      console.error("[danmoo1/community] 공감 실패", e);
      await openAlert("공감 처리에 실패했어요.");
    }
    return;
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadPosts — 동네생활 글(최신순 20건) */
const fnLoadPosts = async (reset: boolean) => {
  loading.value = true;
  try {
    const r = await coBlogSvc.getPagedWith({ pageNo: reset ? 1 : page.value + 1, pageSize: 20, blogCateId: DM_BLOG_CATE_ID });
    posts.value = reset ? r.items : [...posts.value, ...r.items];
    page.value = r.pageNo;
    hasMore.value = r.hasMore;
  } catch (e) {
    console.error("[danmoo1/community] 글 목록 조회 실패", e);
    await openAlert("글 목록을 불러오지 못했어요.");
  } finally {
    loading.value = false;
  }
};

/* fnLoadLiked — 내가 공감한 글 */
const fnLoadLiked = async () => {
  await useAuthReady();
  if (!authStore.isStLoggedIn) return;
  try {
    liked.value = new Set((await mbLikeSvc.getMyLikes("BLOG")).map((l) => l.targetId));
  } catch (e) {
    console.error("[danmoo1/community] 공감 목록 조회 실패", e);
  }
};

onMounted(() => Promise.all([fnLoadPosts(true), fnLoadLiked()]));
</script>
