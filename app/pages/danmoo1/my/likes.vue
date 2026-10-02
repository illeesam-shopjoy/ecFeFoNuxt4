<template>
  <!-- 관심목록 — 내 찜(mb_like PRODUCT) 목록(2열 격자). 하트를 다시 누르면 해제 -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="관심목록" fallback="/my" /></template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-heart" title="로그인하면 관심목록을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/my/likes' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!likes.length" icon="far fa-heart" title="관심 물건이 없어요" desc="물건 상세에서 하트를 누르면 여기에 모여요">
      <nuxt-link to="/" class="btn-primary mt-3 px-8">물건 둘러보기</nuxt-link>
    </dm-empty>
    <ul v-else class="grid grid-cols-2 gap-x-3 gap-y-5 p-4">
      <li v-for="l in likes" :key="l.likeId" class="relative">
        <nuxt-link :to="`/prod/${l.targetId}`" class="block">
          <span class="block aspect-square rounded-xl bg-[var(--dm-chip)] overflow-hidden"><img v-if="imgOf(l)" :src="imgOf(l)" :alt="l.prod?.prodNm" class="w-full h-full object-cover" loading="lazy" /></span>
          <p class="text-[14.5px] mt-2 clamp-2">{{ l.prod?.prodNm || `상품 ${l.targetId}` }}</p>
          <p class="text-[15px] font-bold mt-0.5">{{ formatWon(l.prod?.discntPrice ?? l.prod?.salePrice) }}</p>
          <p class="text-[12px] muted">관심 {{ timeAgo(l.regDate) }}</p>
        </nuxt-link>
        <button type="button" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white inline-flex items-center justify-center" aria-label="관심 해제" @click="handleSelectAction('like-remove', l)"><i class="fas fa-heart text-[var(--dm-primary)]"></i></button>
      </li>
    </ul>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { mbLikeSvc } from "~/svc/fo/ec/mb/mbLikeSvc";
import { formatWon, timeAgo } from "~/utils/timeAgo";
import type { MbLikeType } from "~/types/mb/mbLikeType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
useHead({ title: "관심목록" });
const authStore = useAuthStore();
const { openAlert } = useAlert();
const likes = ref<MbLikeType[]>([]);
const loading = ref(false);
const ready = ref(false);
const imgOf = (l: MbLikeType) => l.prod?.thumbnailUrl || l.prod?.prodImgs?.find((i) => i.isThumb === "Y")?.cdnImgUrl || l.prod?.prodImgs?.[0]?.cdnImgUrl || "";

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleSelectAction — 행 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = async (cmd: string, l: MbLikeType) => {
  if (cmd === "like-remove") {
    try {
      await mbLikeSvc.unlike(l.targetId, "PRODUCT");
      likes.value = likes.value.filter((x) => x.likeId !== l.likeId);
    } catch (e) {
      console.error("[danmoo1/my/likes] 관심 해제 실패", e);
      await openAlert("관심 해제에 실패했어요.");
    }
    return;
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* initPage — 로그인 복원을 기다린 뒤 내 찜 목록(상품) */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  loading.value = true;
  try {
    likes.value = await mbLikeSvc.getMyLikes("PRODUCT");
  } catch (e) {
    console.error("[danmoo1/my/likes] 관심목록 조회 실패", e);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
