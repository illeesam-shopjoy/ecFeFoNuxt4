<template>
  <my-shell active="review" title="상품평 관리" :file-path="currentFilePath">
    <div v-if="loading" class="py-12 text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">작성한 상품평이 없습니다.</div>
    <ul v-else class="m-0 grid list-none gap-3 p-0">
      <li v-for="r in list" :key="r.reviewId" class="rounded-2xl border border-[#e5e7eb] bg-white p-4">
        <div class="flex flex-wrap items-center gap-2">
          <nuxt-link :to="`/prod-dtl/${r.prodId}`" class="font-bold text-gray-900 no-underline hover:underline">{{ r.prodNm || r.prodId }}</nuxt-link>
          <span class="text-[#f5a623]"><i v-for="n in 5" :key="n" :class="n <= Math.round(Number(r.rating || 0)) ? 'fas fa-star' : 'fal fa-star'"></i></span>
          <span v-if="r.reviewStatusCd && r.reviewStatusCd !== 'ACTIVE'" class="rounded-full bg-[#f3f4f6] px-2 py-px text-[0.72rem] text-gray-500">{{ r.reviewStatusCd === "HIDDEN" ? "숨김" : r.reviewStatusCd }}</span>
          <span class="ml-auto text-[0.78rem] text-gray-400">{{ String(r.reviewDate ?? "").slice(0, 10) }}</span>
        </div>
        <div v-if="showTitle(r)" class="mt-2 text-[0.92rem] font-bold text-gray-900">{{ r.reviewTitle }}</div>
        <client-only><div class="he-view mt-1" v-html="toSafeHtml(r.reviewContent)"></div></client-only>
        <div class="mt-3 flex gap-3 text-[0.8rem]">
          <nuxt-link :to="`/prod-dtl/${r.prodId}`" class="text-gray-600 underline">상품에서 수정</nuxt-link>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-red-500 underline" @click="remove(r)">삭제</button>
        </div>
      </li>
    </ul>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/my/MyShell.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { myBoardSvc } from "~/svc/fo/ec/my/myBoardSvc";
import { pdReviewSvc } from "~/svc/fo/ec/pd/pdReviewSvc";
import { htmlToText, toSafeHtml } from "~/utils/htmlSafe";
import type { PdMyReviewType } from "~/types/pd/pdMyReviewType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 상품평 관리" });
usePageTitle("마이페이지 - 상품평 관리");

const loading = ref(true);
const list = ref<PdMyReviewType[]>([]);
/** 내용 앞부분으로 자동 생성된 제목이면 따로 보이지 않는다 */
const showTitle = (r: PdMyReviewType) => {
  const t = (r.reviewTitle ?? "").replace(/…$/, "").trim();
  return !!t && !htmlToText(r.reviewContent).startsWith(t);
};
async function load() {
  try {
    list.value = await myBoardSvc.getReviews();
  } finally {
    loading.value = false;
  }
}
async function remove(r: PdMyReviewType) {
  if (!(await useConfirm().openConfirm({ title: "상품평 삭제", message: "이 상품평을 삭제할까요?", confirmText: "삭제", cancelText: "취소", variant: "danger" }))) return;
  try {
    await pdReviewSvc.deleteReview(r.reviewId);
    await load();
    useNuxtApp().$toast.success("삭제되었습니다.");
  } catch (e) {
    useNuxtApp().$toast.error(String((e as { data?: { message?: string } })?.data?.message ?? "삭제에 실패했습니다.").split("::")[0]!);
  }
}
onMounted(async () => {
  useAuthStore().loadStToken();
  if (!useAuthStore().isStLoggedIn) return void (await navigateTo("/login"));
  await load();
});
</script>
