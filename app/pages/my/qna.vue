<template>
  <my-shell active="qna" title="상품문의 관리" :file-path="currentFilePath">
    <div v-if="loading" class="py-12 text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">작성한 상품문의가 없습니다.</div>
    <ul v-else class="m-0 grid list-none gap-3 p-0">
      <li v-for="q in list" :key="q.prodQnaId" class="rounded-2xl border border-[#e5e7eb] bg-white p-4">
        <div class="flex flex-wrap items-center gap-2">
          <nuxt-link :to="`/prod-dtl/${q.prodId}`" class="font-bold text-gray-900 no-underline hover:underline">{{ q.prodNm || q.prodId }}</nuxt-link>
          <span v-if="q.scrtYn === 'Y'" class="rounded-full bg-[#f3f4f6] px-2 py-px text-[0.72rem] text-gray-500">🔒 비밀글</span>
          <span class="rounded-full px-2 py-px text-[0.72rem] font-semibold" :class="q.answYn === 'Y' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fef3c7] text-[#b45309]'">{{ q.answYn === "Y" ? "답변 완료" : "답변 대기" }}</span>
          <span class="ml-auto text-[0.78rem] text-gray-400">{{ String(q.regDate ?? "").slice(0, 10) }}</span>
        </div>
        <client-only><div class="he-view mt-2" v-html="toSafeHtml(q.prodQnaContent || q.prodQnaTitle)"></div></client-only>
        <div v-if="q.answYn === 'Y' && q.answContent" class="mt-3 rounded-lg bg-[#f9fafb] p-3">
          <div class="mb-1 text-[0.75rem] font-bold text-[#bc8246]">답변 · {{ String(q.answDate ?? "").slice(0, 10) }}</div>
          <client-only><div class="he-view" v-html="toSafeHtml(q.answContent)"></div></client-only>
        </div>
        <div class="mt-3 flex gap-3 text-[0.8rem]">
          <nuxt-link :to="`/prod-dtl/${q.prodId}`" class="text-gray-600 underline">상품에서 보기·수정</nuxt-link>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-red-500 underline" @click="remove(q)">삭제</button>
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
import { pdQnaSvc } from "~/svc/fo/ec/pd/pdQnaSvc";
import { toSafeHtml } from "~/utils/htmlSafe";
import type { PdMyQnaType } from "~/types/pd/pdMyReviewType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 상품문의 관리" });
usePageTitle("마이페이지 - 상품문의 관리");

const loading = ref(true);
const list = ref<PdMyQnaType[]>([]);
async function load() {
  try {
    list.value = await myBoardSvc.getQna();
  } finally {
    loading.value = false;
  }
}
async function remove(q: PdMyQnaType) {
  if (!(await useConfirm().openConfirm({ title: "문의 삭제", message: "이 상품문의를 삭제할까요?", confirmText: "삭제", cancelText: "취소", variant: "danger" }))) return;
  try {
    await pdQnaSvc.remove(q.prodQnaId);
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
