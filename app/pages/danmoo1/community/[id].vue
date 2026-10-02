<template>
  <!-- 동네생활 글 상세 — 작성자·시간, 제목, 본문(정화한 HTML), 공감(실제 저장)·공유, 댓글 목록·작성·내 댓글 삭제 -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="동네생활" fallback="/community">
        <template #right><button type="button" class="icon-btn" aria-label="공유" @click="handleBtnAction('post-share')"><i class="far fa-share-square"></i></button></template>
      </dm-title-bar>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <div v-if="pending" class="p-4 space-y-3"><div class="skeleton h-5 w-1/3 rounded"></div><div class="skeleton h-7 w-4/5 rounded"></div><div class="skeleton h-40 rounded"></div></div>
    <template v-else-if="post">
      <article class="px-4 py-5">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-full bg-[var(--dm-chip)] inline-flex items-center justify-center font-bold">{{ (post.blogAuthor || "익").slice(0, 1) }}</span>
          <div class="leading-tight flex-1"><b class="text-[15px]">{{ post.blogAuthor || "이웃" }}</b><p class="text-[12.5px] muted mt-0.5">{{ town }} · {{ timeAgo(post.regDate) }} · 조회 {{ post.viewCount ?? 0 }}</p></div>
          <span v-if="isMinePost" class="text-[11px] px-1.5 py-0.5 rounded bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] font-bold">내 글</span>
        </div>
        <h1 class="text-[20px] font-extrabold leading-snug mt-5">{{ post.blogTitle }}</h1>
        <div class="dm-content text-[15.5px] leading-[1.7] mt-4 break-words" v-html="contentHtml"></div>
        <img v-if="post.img" :src="post.img" alt="" class="w-full rounded-xl mt-4" />
        <div class="flex gap-2 mt-8">
          <button type="button" class="btn-soft flex-1" :class="{ 'text-[var(--dm-primary)]': liked }" @click="handleBtnAction('post-like')"><i :class="liked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>{{ liked ? "공감함" : "공감" }}</button>
          <a href="#comments" class="btn-soft flex-1"><i class="far fa-comment"></i>댓글 {{ comments.length }}</a>
          <button type="button" class="btn-soft flex-1" @click="handleBtnAction('post-share')"><i class="far fa-share-square"></i>공유</button>
        </div>
      </article>

      <!-- 댓글 -->
      <section id="comments" class="border-t border-[var(--dm-line)] px-4 pt-5 pb-28">
        <h2 class="text-[16px] font-extrabold mb-3">댓글 {{ comments.length }}</h2>
        <p v-if="!comments.length" class="muted text-[14px] py-4 text-center">첫 댓글을 남겨 보세요.</p>
        <ul class="space-y-4">
          <li v-for="c in comments" :key="c.blogReplyId" class="flex gap-3">
            <span class="w-8 h-8 rounded-full bg-[var(--dm-chip)] inline-flex items-center justify-center text-[12px] font-bold flex-none">{{ (c.writerNm || "익").slice(0, 1) }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 text-[12.5px] muted"><b class="text-[var(--dm-text)]">{{ c.writerNm || "이웃" }}</b><span>{{ timeAgo(c.regDate) }}</span>
                <button v-if="c.writerId && c.writerId === authStore.user?.memberId" type="button" class="ml-auto text-[12px] muted" @click="handleSelectAction('comment-remove', c)">삭제</button>
              </div>
              <p class="text-[14.5px] mt-0.5 whitespace-pre-wrap break-words">{{ c.blogCommentContent }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- 댓글 입력 -->
      <form class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] flex items-center gap-2 px-3 py-2 bg-[var(--dm-bg)] border-t border-[var(--dm-line)] z-40" style="padding-bottom: calc(8px + env(safe-area-inset-bottom))" @submit.prevent="handleBtnAction('comment-send')">
        <input v-model="commentText" class="input !h-11 flex-1 !rounded-full" :placeholder="authStore.isStLoggedIn ? '댓글을 입력해 주세요' : '로그인하면 댓글을 쓸 수 있어요'" :disabled="sending" maxlength="500" @focus="handleBtnAction('comment-focus')" />
        <button type="submit" class="w-11 h-11 rounded-full bg-[var(--dm-primary)] text-white flex-none disabled:opacity-40" :disabled="!commentText.trim() || sending" aria-label="등록"><i class="fas fa-arrow-up"></i></button>
      </form>
    </template>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { mbLikeSvc } from "~/svc/fo/ec/mb/mbLikeSvc";
import { toSafeHtml } from "~/utils/htmlSafe";
import { timeAgo } from "~/utils/timeAgo";
import type { CmBlogType } from "~/types/cm/cmBlogType";
import type { CmBlogReplyType } from "~/types/cm/cmBlogReplyType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
const route = useRoute();
const authStore = useAuthStore();
const { town } = useDmTown();
const { openAlert } = useAlert();
const { openConfirm } = useConfirm();
const blogId = String(route.params.id);
const post = ref<CmBlogType | null>(null);
const comments = ref<CmBlogReplyType[]>([]);
const pending = ref(true);
const liked = ref(false);
const commentText = ref("");
const sending = ref(false);
const isMinePost = computed(() => !!post.value?.regBy && post.value.regBy === authStore.user?.memberId);
// 본문이 HTML 이 아니면(시드 글은 줄바꿈 텍스트) 줄바꿈을 <br> 로
const contentHtml = computed(() => {
  const c = post.value?.blogContent ?? "";
  return toSafeHtml(/<[a-z][\s\S]*>/i.test(c) ? c : c.replace(/\n/g, "<br>"));
});
useHead({ title: () => post.value?.blogTitle ?? "동네생활" });

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* fnAskLogin — 로그인 화면으로(돌아올 주소 포함) */
const fnAskLogin = async (msg: string) => {
  if (await openConfirm({ title: "로그인", message: msg, confirmText: "로그인" })) return navigateTo({ path: "/login", query: { redirect: route.fullPath } });
};

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "post-share") {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post.value?.blogTitle, url });
      else {
        await navigator.clipboard.writeText(url);
        await openAlert({ title: "공유", message: "링크를 복사했어요.", variant: "success" });
      }
    } catch { /* 사용자가 공유를 취소함 */ }
    return;
  }
  if (cmd === "post-like") {
    if (!authStore.isStLoggedIn) return fnAskLogin("공감은 로그인 후 할 수 있어요.");
    try {
      liked.value = await mbLikeSvc.toggle(blogId, "BLOG");
    } catch (e) {
      console.error("[danmoo1/community/[id]] 공감 실패", e);
      await openAlert("공감 처리에 실패했어요.");
    }
    return;
  }
  if (cmd === "comment-focus") {
    if (!authStore.isStLoggedIn) return fnAskLogin("댓글은 로그인 후 쓸 수 있어요.");
    return;
  }
  if (cmd === "comment-send") {
    const t = commentText.value.trim();
    if (!t) return;
    if (!authStore.isStLoggedIn) return fnAskLogin("댓글은 로그인 후 쓸 수 있어요.");
    sending.value = true;
    try {
      const saved = await coBlogSvc.createReply(blogId, t);
      comments.value.push({ ...saved, writerNm: saved.writerNm || authStore.user?.userNm, writerId: saved.writerId || authStore.user?.memberId, regDate: saved.regDate || new Date().toISOString() });
      commentText.value = "";
    } catch (e) {
      console.error("[danmoo1/community/[id]] 댓글 등록 실패", e);
      await openAlert(String((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "").split("::")[0] || "댓글을 등록하지 못했어요.");
    } finally {
      sending.value = false;
    }
    return;
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 댓글 단위 액션 dispatch */
const handleSelectAction = async (cmd: string, c: CmBlogReplyType) => {
  if (cmd === "comment-remove") {
    if (!(await openConfirm({ title: "댓글 삭제", message: "이 댓글을 삭제할까요?", variant: "danger", confirmText: "삭제" }))) return;
    try {
      await coBlogSvc.deleteReply(blogId, c.blogReplyId);
      comments.value = comments.value.filter((x) => x.blogReplyId !== c.blogReplyId);
    } catch (e) {
      console.error("[danmoo1/community/[id]] 댓글 삭제 실패", e);
      await openAlert("댓글을 삭제하지 못했어요.");
    }
    return;
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadLiked — 이 글에 공감했는지 */
const fnLoadLiked = async () => {
  await useAuthReady();
  if (!authStore.isStLoggedIn) return;
  try {
    liked.value = (await mbLikeSvc.getMyLikes("BLOG")).some((l) => l.targetId === blogId);
  } catch (e) {
    console.error("[danmoo1/community/[id]] 공감 여부 조회 실패", e);
  }
};

/* initPage — 글 1건(댓글 포함) 조회, 없으면 404 */
const initPage = async () => {
  try {
    const p = await coBlogSvc.getById(blogId);
    post.value = p;
    comments.value = [...(p.replies ?? [])].sort((a, b) => String(a.regDate ?? "").localeCompare(String(b.regDate ?? "")));
    await fnLoadLiked();
  } catch (e) {
    console.error("[danmoo1/community/[id]] 글 조회 실패", e);
    showError({ statusCode: 404, statusMessage: "글을 찾을 수 없어요" });
  } finally {
    pending.value = false;
  }
};
onMounted(initPage);
</script>

<style scoped>
.dm-content :deep(img) { max-width: 100%; border-radius: 12px; margin: 12px 0; }
.dm-content :deep(p) { margin: 0 0 10px; }
</style>
