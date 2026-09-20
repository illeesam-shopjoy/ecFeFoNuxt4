<template>
  <!-- 2026-09-20(요청사항: "메인이미지 확대보기 / 썸네일 이미지 메인이미지 하단에 표시 / 썸네일 이미지 기본이미지 뱃지표시") — ecFeBo 상품상세 갤러리 이식.
       메인 이미지(우상단 확대 버튼, 마우스를 올리면 좌우 화살표) + 하단 가로 썸네일(첫 번째=기본이미지 뱃지) + 확대 라이트박스. -->
  <div class="flex flex-col gap-2.5 min-w-0">
    <div class="group relative">
      <div class="relative rounded-xl border border-[#e0e0e0] overflow-hidden bg-[#f4f5f5] cursor-zoom-in" @click="openZoom">
        <app-image :src="current" :alt="item.prodNm" wrap-class="w-full" :skeleton-style="{ width: '100%', aspectRatio: '3/4' }" />
        <!-- 배지: 신상품 / 할인율 (실제 값만 — 예전엔 "new / -16%" 가 고정 문구였다) -->
        <div v-if="item.isNew || item.saleDiscntRate" class="absolute top-3.5 left-3.5 flex gap-1.5 pointer-events-none">
          <span v-if="item.isNew" class="rounded-full bg-[#222] px-2.5 py-[3px] text-[0.72rem] font-bold text-white">NEW</span>
          <span v-if="item.saleDiscntRate" class="rounded-full bg-[#e8587a] px-2.5 py-[3px] text-[0.72rem] font-bold text-white">-{{ item.saleDiscntRate }}%</span>
        </div>
      </div>

      <!-- 확대 버튼 (우상단) -->
      <button
        type="button"
        class="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#555] shadow-[0_1px_4px_rgba(0,0,0,0.12)] cursor-pointer hover:text-black"
        aria-label="이미지 확대 보기"
        title="확대 보기"
        @click.stop="openZoom"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </button>

      <!-- 좌/우 화살표 (마우스를 올렸을 때) -->
      <template v-if="images.length > 1">
        <button type="button" class="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" aria-label="이전 이미지" @click.stop="move(-1)">
          <i class="fas fa-chevron-left text-[#333] text-sm"></i>
        </button>
        <button type="button" class="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/85 shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100" aria-label="다음 이미지" @click.stop="move(1)">
          <i class="fas fa-chevron-right text-[#333] text-sm"></i>
        </button>
      </template>
    </div>

    <!-- 썸네일 가로 목록 (메인 이미지 하단). 첫 번째(기본이미지)에 뱃지 -->
    <div v-if="images.length" class="flex flex-row gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
      <button
        v-for="(src, i) in images"
        :key="src"
        type="button"
        role="tab"
        :aria-selected="i === index"
        :title="i === 0 ? '기본이미지' : `이미지 ${i + 1}`"
        :class="['relative m-0 h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 bg-[#f4f5f5] p-0 cursor-pointer transition-colors', i === index ? 'border-[#666]' : 'border-[#e5e7eb] hover:border-[#bbb]']"
        @click="index = i"
      >
        <img :src="src" :alt="`${item.prodNm} 썸네일 ${i + 1}`" class="block h-full w-full object-cover" loading="lazy" />
        <span v-if="i === 0" class="absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8587a] shadow-[0_1px_3px_rgba(0,0,0,0.25)]" aria-label="기본이미지">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.6z" /></svg>
        </span>
      </button>
    </div>

    <!-- 확대 라이트박스 -->
    <Teleport to="body">
      <div v-if="zoomOpen" class="fixed inset-0 z-[9500] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="이미지 확대 보기" @click.self="closeZoom">
        <button type="button" class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/15 text-2xl text-white cursor-pointer hover:bg-white/30" aria-label="닫기" @click="closeZoom">×</button>
        <button v-if="images.length > 1" type="button" class="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-white/15 text-white cursor-pointer hover:bg-white/30" aria-label="이전 이미지" @click="move(-1)">
          <i class="fas fa-chevron-left"></i>
        </button>
        <img :src="current" :alt="item.prodNm" class="h-[88vh] max-w-[92vw] select-none object-contain" draggable="false" />
        <button v-if="images.length > 1" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-white/15 text-white cursor-pointer hover:bg-white/30" aria-label="다음 이미지" @click="move(1)">
          <i class="fas fa-chevron-right"></i>
        </button>
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">{{ index + 1 }} / {{ images.length }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * ProdGallery — 상품 상세 이미지 갤러리.
 * 이미지 목록 = 기본이미지(bigImg) → 보조(thumbImg) → 나머지(relatedImages), 중복 제거. 서버 렌더(SEO 최소 정보)에는 relatedImages 가 비어 있어
 * 기본/보조 이미지만 보이다가 브라우저가 전체 정보를 받으면 나머지 썸네일이 채워진다(useSeoDetail).
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import AppImage from "~/components/ui/AppImage.vue";
import type { PdProductType } from "~/types/pdProductType";

const props = defineProps<{ item: PdProductType }>();

const images = computed<string[]>(() => {
  const list = [props.item.bigImg || props.item.img, props.item.thumbImg, ...(props.item.relatedImages ?? [])].filter((u): u is string => Boolean(u));
  return [...new Set(list)];
});

const index = ref(0);
const current = computed(() => images.value[index.value] ?? images.value[0] ?? "");
watch(() => props.item.prodId, () => { index.value = 0; });
watch(images, (list) => { if (index.value >= list.length) index.value = 0; });

function move(step: number) {
  const n = images.value.length;
  if (n < 2) return;
  index.value = (index.value + step + n) % n;
}

const zoomOpen = ref(false);
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") closeZoom();
  else if (e.key === "ArrowLeft") move(-1);
  else if (e.key === "ArrowRight") move(1);
}
function openZoom() {
  if (!current.value) return;
  zoomOpen.value = true;
  document.body.style.overflow = "hidden"; // 뒤 화면 스크롤 잠금
  window.addEventListener("keydown", onKey);
}
function closeZoom() {
  zoomOpen.value = false;
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKey);
}
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  }
});
</script>
