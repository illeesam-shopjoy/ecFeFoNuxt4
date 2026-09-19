<template>
  <!-- 2026-09-19(요청사항: "상품상세 썸네일이미지 이런경우 더보기아이콘 popover 또는 스크롤 또는 위 아래로 화살표로 해줘") —
       썸네일이 많으면(15장 등) 메인 이미지보다 세로로 길게 늘어나 페이지가 어색했다. 이제 스트립 높이는 메인 이미지 높이에
       맞추고(absolute 로 그리드 행 높이에 기여하지 않음), 넘치는 만큼은 세로 스크롤 + 위/아래 화살표로 넘긴다.
       화살표는 스크롤 여지가 있는 방향에만 나타난다. 스크롤바는 숨기고(휠/터치 스크롤은 그대로 동작) 화살표가 대신한다. -->
  <div class="relative self-stretch w-[103px] min-h-[360px]">
    <div
      ref="stripRef"
      class="absolute inset-0 flex flex-col gap-2 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      @scroll.passive="updateArrows"
    >
      <button
        v-for="(img, i) in images"
        :key="i"
        ref="thumbRefs"
        type="button"
        role="tab"
        :aria-selected="img === active"
        :class="['m-0 p-0 border-2 rounded block shrink-0 bg-transparent cursor-pointer', img === active ? 'border-theme' : 'border-transparent']"
        @click="emit('select', img)"
      >
        <div class="product__nav-img w-img">
          <app-image
            :src="img"
            alt="product-thumb"
            :img-style="{ width: '95px', height: '120px', objectFit: 'cover', display: 'block', borderRadius: '2px' }"
            :skeleton-style="{ width: '95px', height: '120px' }"
          />
        </div>
      </button>
    </div>

    <button
      v-if="canUp"
      type="button"
      aria-label="이전 썸네일"
      class="absolute top-0 inset-x-0 h-8 z-10 flex items-center justify-center border-0 cursor-pointer text-[#444] bg-gradient-to-b from-white via-white/90 to-transparent"
      @click="scrollByPage(-1)"
    >
      <i class="fas fa-chevron-up text-[0.75rem]"></i>
    </button>
    <button
      v-if="canDown"
      type="button"
      aria-label="다음 썸네일"
      class="absolute bottom-0 inset-x-0 h-8 z-10 flex items-center justify-center border-0 cursor-pointer text-[#444] bg-gradient-to-t from-white via-white/90 to-transparent"
      @click="scrollByPage(1)"
    >
      <i class="fas fa-chevron-down text-[0.75rem]"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import AppImage from "~/components/ui/AppImage.vue"; // 자동 등록명이 UiAppImage 라 <app-image> 를 쓰려면 명시 import 가 필요하다

const props = defineProps<{
  images: string[];
  active: string;
}>();
const emit = defineEmits<{ (e: "select", img: string): void }>();

const stripRef = ref<HTMLElement | null>(null);
const thumbRefs = ref<HTMLElement[]>([]);
const canUp = ref(false);
const canDown = ref(false);

function updateArrows() {
  const el = stripRef.value;
  if (!el) return;
  canUp.value = el.scrollTop > 2;
  canDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
}

// 화살표 한 번에 보이는 높이의 60%만큼 부드럽게 이동
function scrollByPage(dir: 1 | -1) {
  const el = stripRef.value;
  if (!el) return;
  el.scrollBy({ top: dir * el.clientHeight * 0.6, behavior: "smooth" });
}

// 선택된 썸네일이 스트립 밖이면 스트립 안에서만 스크롤(페이지 전체는 움직이지 않는다)
function revealActive() {
  const el = stripRef.value;
  const idx = props.images.indexOf(props.active);
  const btn = thumbRefs.value[idx];
  if (!el || !btn) return;
  const top = btn.offsetTop;
  const bottom = top + btn.offsetHeight;
  if (top < el.scrollTop) el.scrollTo({ top: top - 4, behavior: "smooth" });
  else if (bottom > el.scrollTop + el.clientHeight) el.scrollTo({ top: bottom - el.clientHeight + 4, behavior: "smooth" });
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  updateArrows();
  if (typeof ResizeObserver !== "undefined" && stripRef.value) {
    ro = new ResizeObserver(updateArrows); // 메인 이미지가 로드되며 높이가 바뀔 때 화살표 재계산
    ro.observe(stripRef.value);
  }
});
onBeforeUnmount(() => ro?.disconnect());

watch(() => props.images, () => nextTick(updateArrows));
watch(() => props.active, () => nextTick(revealActive));
</script>
