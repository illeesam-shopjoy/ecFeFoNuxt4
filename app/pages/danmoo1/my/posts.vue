<template>
  <!-- 모아보기 — 내가 쓴 동네생활 글(등록자=내 회원ID). 글 목록 API 에 작성자 조건이 없어 카테고리 글을 받아 화면에서 가른다 -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="모아보기" fallback="/my">
        <template #right><nuxt-link to="/write?type=community" class="text-[14px] primary font-bold px-2">글쓰기</nuxt-link></template>
      </dm-title-bar>
    </template>

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-folder-open" title="로그인하면 내가 쓴 글을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/my/posts' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!mine.length" icon="far fa-edit" title="아직 쓴 글이 없어요" desc="동네 이웃에게 첫 소식을 전해 보세요">
      <nuxt-link to="/write?type=community" class="btn-primary mt-3 px-8">글쓰기</nuxt-link>
    </dm-empty>
    <ul v-else>
      <li v-for="p in mine" :key="p.blogId">
        <nuxt-link :to="`/community/${p.blogId}`" class="block px-4 py-4 border-b border-[var(--dm-line)]">
          <div class="text-[12.5px] muted">{{ timeAgo(p.regDate) }} · 조회 {{ p.viewCount ?? 0 }} · 댓글 {{ p.replies?.length ?? 0 }}</div>
          <h3 class="text-[16px] font-bold leading-snug mt-1">{{ p.blogTitle }}</h3>
          <p class="text-[14px] muted clamp-2 mt-1">{{ p.blogSummary }}</p>
        </nuxt-link>
      </li>
    </ul>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_BLOG_CATE_ID } from "~/conts/tenant/danmoo1";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { timeAgo } from "~/utils/timeAgo";
import type { CmBlogType } from "~/types/cm/cmBlogType";

useHead({ title: "모아보기" });
const authStore = useAuthStore();
const mine = ref<CmBlogType[]>([]);
const loading = ref(false);
const ready = ref(false);

/* initPage — 로그인 복원 후 동네생활 글 중 내 글만 */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  loading.value = true;
  try {
    const me = authStore.user?.memberId;
    const r = await coBlogSvc.getPagedWith({ pageNo: 1, pageSize: 200, blogCateId: DM_BLOG_CATE_ID });
    mine.value = r.items.filter((p) => p.regBy && p.regBy === me);
  } catch (e) {
    console.error("[danmoo1/my/posts] 내 글 조회 실패", e);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
