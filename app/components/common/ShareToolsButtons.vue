<template>
  <!-- 2026-09-15(요청사항: "링크복사, 카카오공유하기, PDF다운로드 기능 추가하고 싶어
       2번째 이미지 최상단처럼 저 최상단은 모바일보기에서는 설정안에서보여") — ecFeBo 헤더
       최상단의 고정 아이콘 3개를 포팅. variant="icons"는 데스크탑 헤더에 hidden 처리해
       모바일에서 숨기고(sm 이상만 표시), variant="menu"는 ExtraInfo(설정) 드롭다운 안에
       동일 기능을 목록형으로 노출해 모바일에서도 항상 쓸 수 있게 한다. -->
  <div v-if="variant === 'icons'" class="hidden sm:flex items-center gap-1.5">
    <button
      type="button"
      class="w-6 h-6 rounded-md inline-flex items-center justify-center text-xs bg-blue-50 text-blue-600 border border-blue-300 hover:bg-blue-100 transition"
      title="링크 공유(URL 복사)"
      @click="copyLink"
    >
      🔗
    </button>
    <button
      type="button"
      class="w-6 h-6 rounded-md inline-flex items-center justify-center text-xs bg-[#FEE500] text-[#191919] shadow-sm hover:shadow transition"
      title="카카오톡 공유"
      @click="shareKakao"
    >
      💬
    </button>
    <button type="button" class="w-6 h-6 inline-flex items-center justify-center disabled:opacity-50" title="PDF 다운로드" :disabled="pdfExporting" @click="exportPdf">
      <span v-if="pdfExporting" class="text-xs">⏳</span>
      <span v-else class="text-base leading-none">📄</span>
    </button>
  </div>
  <template v-else>
    <button type="button" class="w-full flex items-center gap-2 py-1.5 text-left text-[0.85rem] text-[#666] hover:text-theme transition" @click="copyLink">
      <span>🔗</span><span>링크 공유(URL 복사)</span>
    </button>
    <button type="button" class="w-full flex items-center gap-2 py-1.5 text-left text-[0.85rem] text-[#666] hover:text-theme transition" @click="shareKakao">
      <span>💬</span><span>카카오톡 공유</span>
    </button>
    <button
      type="button"
      class="w-full flex items-center gap-2 py-1.5 text-left text-[0.85rem] text-[#666] hover:text-theme transition disabled:opacity-50"
      :disabled="pdfExporting"
      @click="exportPdf"
    >
      <span>{{ pdfExporting ? "⏳" : "📄" }}</span><span>PDF 다운로드</span>
    </button>
  </template>
</template>

<script setup lang="ts">
import { useShareTools } from "~/composables/useShareTools";

defineProps<{ variant: "icons" | "menu" }>();

const { copyLink, shareKakao, exportPdf, pdfExporting } = useShareTools();
</script>
