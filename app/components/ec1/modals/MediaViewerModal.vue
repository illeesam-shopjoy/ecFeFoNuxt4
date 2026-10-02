<template>
  <Teleport to="body">
    <Transition name="media-viewer-fade">
      <div
        v-show="open"
        class="fixed inset-0 z-[10010] flex flex-col bg-black/95"
        role="dialog"
        aria-modal="true"
        aria-label="미디어 보기"
      >
        <!-- 닫기 -->
        <div class="absolute top-4 right-4 z-20">
          <button
            type="button"
            class="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="닫기"
            @click="close"
          >
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>

        <!-- 가운데: 큰 이미지 또는 동영상 + 좌/우 버튼 -->
        <div class="flex-1 flex items-center justify-center min-h-0 relative px-14 py-4">
          <button
            v-if="normalizedItems.length > 1"
            type="button"
            class="absolute top-1/2 -translate-y-1/2 left-3 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white border-0 cursor-pointer z-20 transition-colors hover:bg-white/20"
            aria-label="이전"
            @click="prev"
          >
            <i class="fa fa-chevron-left"></i>
          </button>
          <!-- 2026-09-22(요청사항: "이 모달도 좌/우 제스처로 이미지 이동, 이동 시 좌로/우로 이미지 효과") — 마우스 드래그·손가락 스와이프로도 넘기고,
               다음/이전 모두 살짝 슬라이드+페이드 되는 방향성 있는 전환을 준다(동영상 재생 중엔 스와이프로 컨트롤 조작이 씹히지 않게 건드리지 않음). -->
          <div
            class="flex-1 flex items-center justify-center max-w-4xl max-h-full overflow-hidden select-none"
            @pointerdown="swDown"
            @pointerup="swUp"
            @pointercancel="swCancel"
            @dragstart.prevent
          >
            <Transition :name="dir > 0 ? 'mv-next' : 'mv-prev'" mode="out-in">
              <img
                v-if="currentItem?.type === 'image'"
                :key="currentIndex"
                :src="currentItem.url"
                :alt="`첨부 ${currentIndex + 1}`"
                class="max-w-full max-h-[60vh] object-contain"
                draggable="false"
              />
              <video
                v-else-if="currentItem"
                :key="'v' + currentIndex"
                :src="currentItem.url"
                controls
                class="max-w-full max-h-[60vh]"
                @click.stop
              />
            </Transition>
          </div>
          <button
            v-if="normalizedItems.length > 1"
            type="button"
            class="absolute top-1/2 -translate-y-1/2 right-3 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white border-0 cursor-pointer z-20 transition-colors hover:bg-white/20"
            aria-label="다음"
            @click="next"
          >
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>

        <!-- 하단: 썸네일 한 줄 + 페이징 -->
        <div class="flex-shrink-0 border-t border-white/20 bg-black/50 px-4 py-3">
          <div class="flex justify-center gap-2 overflow-x-auto pb-2 max-w-4xl mx-auto" style="scrollbar-width: thin;">
            <button
              v-for="(item, i) in normalizedItems"
              :key="item.url"
              type="button"
              :class="[
                'flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition',
                i === currentIndex ? 'border-white ring-2 ring-white/50' : 'border-transparent opacity-70 hover:opacity-100',
              ]"
              @click="goTo(i)"
            >
              <img
                v-if="item.type === 'image'"
                :src="item.url"
                :alt="`${i + 1}`"
                class="w-full h-full object-cover"
              />
              <!-- 2026-09-22(요청사항: "동영상배경이미지로 썸네일이 표시되어야 해") — item.thumb(ecBeBo가 ffmpeg로 만든 실제 프레임)이 있으면 배경으로, 없으면 기존 회색 박스로 폴백 -->
              <div v-else class="relative w-full h-full bg-gray-700 flex items-center justify-center text-white text-lg">
                <img v-if="item.thumb" :src="item.thumb" :alt="`${i + 1}`" class="absolute inset-0 w-full h-full object-cover" />
                <span v-if="item.thumb" class="absolute inset-0 bg-black/25"></span>
                <i class="fa fa-play relative"></i>
              </div>
            </button>
          </div>
          <div class="flex items-center justify-center gap-2 text-white/80 text-sm">
            <span>{{ currentIndex + 1 }} / {{ normalizedItems.length }}</span>
            <template v-if="normalizedItems.length > thumbPerPage">
              <button
                type="button"
                class="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-40"
                :disabled="currentPage === 0"
                @click="prevPage"
              >
                이전
              </button>
              <span class="px-2">{{ pageStart + 1 }}-{{ Math.min(pageStart + thumbPerPage, normalizedItems.length) }}</span>
              <button
                type="button"
                class="px-2 py-1 rounded hover:bg-white/10 disabled:opacity-40"
                :disabled="currentPage >= maxPage"
                @click="nextPage"
              >
                다음
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov']);

function mediaType(url: string): 'image' | 'video' {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  return VIDEO_EXT.has(ext) ? 'video' : 'image';
}

const props = withDefaults(
  defineProps<{
    open: boolean;
    /** URL 목록(이미지/동영상 구분은 확장자로 자동) 또는 {url, thumb} 목록 — thumb이 있으면(동영상 실제 프레임 등) 썸네일 줄에 그걸 쓴다 */
    items: (string | { url: string; thumb?: string })[];
    /** 처음 열 때 보여줄 인덱스 */
    initialIndex?: number;
  }>(),
  { initialIndex: 0 }
);

const emit = defineEmits<{ (e: 'close'): void }>();

const currentIndex = ref(0);
const thumbPerPage = 10;

const normalizedItems = computed(() =>
  props.items.map((it) => {
    const url = typeof it === 'string' ? it : it.url;
    const thumb = typeof it === 'string' ? undefined : it.thumb;
    return { url, thumb, type: mediaType(url) as 'image' | 'video' };
  })
);

const currentItem = computed(() => normalizedItems.value[currentIndex.value] ?? null);

const maxPage = computed(() => Math.max(0, Math.ceil(normalizedItems.value.length / thumbPerPage) - 1));
const currentPage = computed(() => Math.min(maxPage.value, Math.floor(currentIndex.value / thumbPerPage)));
const pageStart = computed(() => currentPage.value * thumbPerPage);

watch(
  () => [props.open, props.initialIndex] as const,
  ([open, idx]) => {
    if (open) {
      const len = props.items.length;
      currentIndex.value = len ? Math.min(Math.max(0, idx ?? 0), len - 1) : 0;
    }
  },
  { immediate: true }
);

function close() {
  emit('close');
}

// 2026-09-23(요청사항: "모아보기에서 왼쪽 오른쪽 방향키로 이미지이동 안되네 적용해주고") —
// ProdGallery.vue(상품 큰이미지 확대보기)는 이미 ArrowLeft/ArrowRight로 이동했는데 이 모달만
// Escape만 처리하고 있었다. next()/prev()는 기존 전환(mv-next/mv-prev, ProdGallery와 동일한
// 0.08s/0.14s 빠른 슬라이드+페이드)을 그대로 타므로, 방향키를 연결하면 "화면 전환도 큰이미지
// 보기처럼 빠릿하게" 요청도 같이 해결된다(전환 자체는 이미 같은 속도였고, 방향키가 아예 안
// 먹어서 "느리다"고 느껴진 것).
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'ArrowRight') next();
}
const hasDocument = typeof document !== 'undefined';
watch(
  () => props.open,
  (open) => {
    if (!hasDocument) return;
    if (open) {
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  },
  { immediate: true }
);
onUnmounted(() => {
  if (hasDocument) document.removeEventListener('keydown', onKeydown);
});
// 2026-09-22(요청사항: "좌/우 이동시 좌로/우로 이미지 효과") — 이동 방향(1=다음→왼쪽으로 슬라이드, -1=이전→오른쪽으로 슬라이드)
const dir = ref<1 | -1>(1);
function prev() {
  if (normalizedItems.value.length <= 1) return;
  dir.value = -1;
  currentIndex.value = currentIndex.value <= 0 ? normalizedItems.value.length - 1 : currentIndex.value - 1;
}
function next() {
  if (normalizedItems.value.length <= 1) return;
  dir.value = 1;
  currentIndex.value = currentIndex.value >= normalizedItems.value.length - 1 ? 0 : currentIndex.value + 1;
}
function goTo(i: number) {
  if (i === currentIndex.value) return;
  dir.value = i > currentIndex.value ? 1 : -1;
  currentIndex.value = i;
}

// ── 좌우로 밀어서 넘기기 (마우스 드래그 · 터치) — 동영상 재생 컨트롤과 겹치지 않게 비디오는 건드리지 않음 ──
let swipeX: number | null = null;
let swipeY = 0;
function swDown(e: PointerEvent) {
  if (currentItem.value?.type === 'video') return;
  swipeX = e.clientX;
  swipeY = e.clientY;
}
function swUp(e: PointerEvent) {
  if (swipeX == null) return;
  const dx = e.clientX - swipeX;
  const dy = e.clientY - swipeY;
  swipeX = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    if (dx < 0) next();
    else prev();
  }
}
const swCancel = () => (swipeX = null);
function prevPage() {
  if (currentPage.value > 0) currentIndex.value = (currentPage.value - 1) * thumbPerPage;
}
function nextPage() {
  if (currentPage.value < maxPage.value) currentIndex.value = (currentPage.value + 1) * thumbPerPage;
}
</script>

<style scoped>
/* 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — media-viewer-nav*는 Tailwind로
   대체(버튼에 직접 클래스 적용). 아래 fade 트랜지션만 <Transition name="media-viewer-fade">와
   이름이 묶여 있어 남겨둠. */
.media-viewer-fade-enter-active,
.media-viewer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.media-viewer-fade-enter-from,
.media-viewer-fade-leave-to {
  opacity: 0;
}
/* 2026-09-22 — 다음(mv-next)/이전(mv-prev) 방향에 따라 살짝 좌우로 슬라이드+페이드.
   2026-09-22 보강(요청사항: "딜레이 많이 줄여줘, 빠릿빠릿하게") — mode="out-in"이라 leave+enter가 이어져서 느려 보였다.
   leave는 아주 짧게(0.08s), enter만 조금 더(0.14s) — ProdGallery(상품 큰이미지)와 같은 속도로 통일. */
.mv-next-leave-active,
.mv-prev-leave-active {
  transition: transform 0.08s ease-in, opacity 0.08s ease-in;
}
.mv-next-enter-active,
.mv-prev-enter-active {
  transition: transform 0.14s ease-out, opacity 0.14s ease-out;
}
.mv-next-enter-from {
  transform: translateX(24px);
  opacity: 0;
}
.mv-next-leave-to {
  transform: translateX(-24px);
  opacity: 0;
}
.mv-prev-enter-from {
  transform: translateX(-24px);
  opacity: 0;
}
.mv-prev-leave-to {
  transform: translateX(24px);
  opacity: 0;
}
</style>
