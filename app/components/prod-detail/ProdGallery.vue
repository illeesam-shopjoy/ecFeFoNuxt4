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

    <!-- 썸네일 가로 목록 (메인 이미지 하단). 첫 번째(기본이미지)에 뱃지, 지금 보고 있는 이미지는 진한 테두리+그림자로 강조하고 나머지는 흐리게.
         2026-09-20(요청사항: "선택된 이미지의 썸네일 강조표시 / 썸네일이 너무 많으면 좌우 화살표") — 넘치면 좌/우 화살표가 나타난다. -->
    <div v-if="images.length" class="relative">
      <div
        ref="stripRef"
        class="flex flex-row gap-2 overflow-x-auto py-1 px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        @scroll.passive="updateArrows"
      >
        <button
          v-for="(src, i) in images"
          :key="src"
          ref="thumbRefs"
          type="button"
          role="tab"
          :aria-selected="i === index"
          :title="src === defaultUrl ? '기본이미지' : (colorDot(src)?.nm ?? `이미지 ${i + 1}`)"
          :class="[
            'relative m-0 h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 bg-[#f4f5f5] p-0 cursor-pointer transition-all duration-150',
            i === index ? 'border-[#222] opacity-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)] scale-[1.04]' : 'border-[#e5e7eb] opacity-55 hover:opacity-100 hover:border-[#bbb]',
          ]"
          @click="index = i"
        >
          <img :src="src" :alt="`${item.prodNm} 썸네일 ${i + 1}`" class="block h-full w-full object-cover" loading="lazy" />
          <span v-if="src === defaultUrl" class="absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8587a] shadow-[0_1px_3px_rgba(0,0,0,0.25)]" aria-label="기본이미지">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.6z" /></svg>
          </span>
          <!-- 색상 이미지: 우측 아래에 그 색상 표시 -->
          <span v-if="colorDot(src)" class="absolute bottom-0.5 right-0.5 h-[14px] w-[14px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" :style="{ background: colorDot(src)!.color }" :title="colorDot(src)!.nm"></span>
        </button>
      </div>
      <button
        v-if="canLeft"
        type="button"
        aria-label="이전 썸네일"
        class="absolute left-0 top-0 z-10 flex h-full w-9 items-center justify-start border-0 bg-gradient-to-r from-white via-white/90 to-transparent pl-1 text-[#444] cursor-pointer"
        @click="scrollStrip(-1)"
      >
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.25)]"><i class="fas fa-chevron-left text-[0.7rem]"></i></span>
      </button>
      <button
        v-if="canRight"
        type="button"
        aria-label="다음 썸네일"
        class="absolute right-0 top-0 z-10 flex h-full w-9 items-center justify-end border-0 bg-gradient-to-l from-white via-white/90 to-transparent pr-1 text-[#444] cursor-pointer"
        @click="scrollStrip(1)"
      >
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,0.25)]"><i class="fas fa-chevron-right text-[0.7rem]"></i></span>
      </button>
    </div>

    <!-- 확대 라이트박스 -->
    <Teleport to="body">
      <div v-if="zoomOpen" class="fixed inset-0 z-[9500] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="이미지 확대 보기" @click.self="closeZoom">
        <button type="button" class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/15 text-2xl text-white cursor-pointer hover:bg-white/30" aria-label="닫기" @click="closeZoom">×</button>
        <button v-if="images.length > 1" type="button" class="absolute left-4 top-[calc(50%-40px)] -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-white/15 text-white cursor-pointer hover:bg-white/30" aria-label="이전 이미지" @click="move(-1)">
          <i class="fas fa-chevron-left"></i>
        </button>
        <img :src="current" :alt="item.prodNm" class="h-[calc(100vh-190px)] max-w-[92vw] select-none object-contain" draggable="false" />
        <button v-if="images.length > 1" type="button" class="absolute right-4 top-[calc(50%-40px)] -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-white/15 text-white cursor-pointer hover:bg-white/30" aria-label="다음 이미지" @click="move(1)">
          <i class="fas fa-chevron-right"></i>
        </button>
        <!-- 하단: 페이지 번호 + 썸네일 목록 (지금 보는 이미지 강조) -->
        <div class="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-6" @click.stop>
          <div class="rounded-full bg-black/50 px-3 py-0.5 text-xs text-white">{{ index + 1 }} / {{ images.length }}</div>
          <div ref="zoomStripRef" class="flex max-w-full gap-2 overflow-x-auto py-1 [scrollbar-width:thin]">
            <button
              v-for="(src, i) in images"
              :key="'z' + src"
              ref="zoomThumbRefs"
              type="button"
              :aria-label="`이미지 ${i + 1}`"
              :class="[
                'relative m-0 h-[56px] w-[56px] shrink-0 overflow-hidden rounded-md border-2 bg-[#222] p-0 cursor-pointer transition',
                i === index ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100',
              ]"
              @click="index = i"
            >
              <img :src="src" :alt="`${item.prodNm} ${i + 1}`" class="block h-full w-full object-cover" loading="lazy" />
              <span v-if="colorDot(src)" class="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-[1.5px] border-white" :style="{ background: colorDot(src)!.color }"></span>
            </button>
          </div>
        </div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AppImage from "~/components/ui/AppImage.vue";
import type { PdProdType } from "~/types/pd/pdProdType";
import { prodOptSwatchColor } from "~/utils/prodOptColor";

const props = defineProps<{ item: PdProdType; colorOptId?: string }>();

// 기본 순서: 기본이미지(bigImg) → 보조(thumbImg) → 나머지(relatedImages)
const baseImages = computed<string[]>(() => {
  const list = [props.item.bigImg || props.item.img, props.item.thumbImg, ...(props.item.relatedImages ?? [])].filter((u): u is string => Boolean(u));
  return [...new Set(list)];
});
// 이미지 URL → 연결된 옵션ID(색상)
const linkOf = computed(() => {
  const m = new Map<string, string>();
  (props.item.prodImgs ?? []).forEach((i) => {
    const link = i.prodOpt1Id || i.prodOpt2Id;
    if (link && !m.has(i.url)) m.set(i.url, link);
  });
  return m;
});
// 색상을 고르면 그 색상 이미지를 맨 앞에, 그다음 기본(색상 미연결) 이미지만 보여준다 — 다른 색상 이미지는 뺀다(2026-09-22 요청사항: "색상선택된 이미지와 기본이미지들만")
const images = computed<string[]>(() => {
  const base = baseImages.value;
  const sel = props.colorOptId;
  if (!sel) return base;
  const isSel = (u: string) => linkOf.value.get(u) === sel;
  const isDefault = (u: string) => !linkOf.value.has(u);
  return [...base.filter(isSel), ...base.filter(isDefault)];
});
const defaultUrl = computed(() => props.item.bigImg || props.item.img || "");

/** 색상 이미지 표시용 — 그 이미지가 연결된 색상 옵션의 스와치 색 (없으면 null) */
const colorOpts = computed(() => [...(props.item.prodOpt2List ?? []), ...(props.item.prodOpt1List ?? [])]);
function colorDot(src: string): { color: string; nm: string } | null {
  const id = linkOf.value.get(src);
  const opt = id ? colorOpts.value.find((o) => o.prodOptId === id) : undefined;
  return opt ? { color: prodOptSwatchColor(opt.prodOptStdCd), nm: opt.prodOptNm } : null;
}

const index = ref(0);
const current = computed(() => images.value[index.value] ?? images.value[0] ?? "");
watch(() => props.item.prodId, () => { index.value = 0; });
watch(() => props.colorOptId, () => { index.value = 0; }); // 색상을 바꾸면 그 색상의 첫 이미지부터
watch(images, (list) => { if (index.value >= list.length) index.value = 0; });

function move(step: number) {
  const n = images.value.length;
  if (n < 2) return;
  index.value = (index.value + step + n) % n;
}

// ── 썸네일 스트립: 좌/우 화살표 + 선택 썸네일 자동 노출 ─────────────────────
const stripRef = ref<HTMLElement | null>(null);
const thumbRefs = ref<HTMLElement[]>([]);
const canLeft = ref(false);
const canRight = ref(false);
function updateArrows() {
  const el = stripRef.value;
  if (!el) return;
  canLeft.value = el.scrollLeft > 2;
  canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
}
function scrollStrip(dir: -1 | 1) {
  const el = stripRef.value;
  if (!el) return;
  el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 80), behavior: "smooth" });
}
let stripObserver: ResizeObserver | null = null;
onMounted(() => {
  updateArrows();
  if (stripRef.value && typeof ResizeObserver !== "undefined") {
    stripObserver = new ResizeObserver(updateArrows);
    stripObserver.observe(stripRef.value);
  }
});
onBeforeUnmount(() => stripObserver?.disconnect());
watch(images, () => nextTick(updateArrows));
// 화살표(메인 이미지·라이트박스)나 클릭으로 선택이 바뀌면 그 썸네일이 스트립 안에 보이도록 스크롤한다 — 스트립만 움직이고 페이지는 움직이지 않는다
watch(index, () => {
  nextTick(() => {
    const strip = stripRef.value;
    const el = thumbRefs.value?.[index.value];
    if (!strip || !el) return;
    const left = el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  });
});

const zoomOpen = ref(false);
const zoomStripRef = ref<HTMLElement | null>(null);
const zoomThumbRefs = ref<HTMLElement[]>([]);
// 라이트박스에서 이미지가 바뀌면 그 썸네일이 목록 안에 보이도록 가운데로 스크롤
watch([index, zoomOpen], () => {
  if (!zoomOpen.value) return;
  nextTick(() => {
    const strip = zoomStripRef.value;
    const el = zoomThumbRefs.value?.[index.value];
    if (!strip || !el) return;
    strip.scrollTo({ left: Math.max(0, el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2), behavior: "smooth" });
  });
});
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
