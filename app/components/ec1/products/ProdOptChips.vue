<template>
  <!-- 2026-09-20(요청사항: "옵션상품은 이미지 안 좌측 아래에 색상 한 줄, 사이즈 한 줄") — 옵션상품(OPTION)만. 부모(.product__thumb)가 relative 라
       이미지 위 좌측 하단에 겹쳐 그린다. 색상은 색 동그라미, 사이즈는 작은 칩. 클릭은 이미지 링크로 통과(pointer-events-none).
       2026-09-22(요청사항: "너무 개수가 작네 — ... 은 어느정도 나오고 넘칠 때만 나오게") — 예전엔 색상 6개/사이즈 4개 고정으로 잘랐다. 이제 한 줄에 실제로 들어가는 만큼
       보여주고, 넘칠 때만 마지막에 "…" 를 붙인다(카드 폭/화면 크기가 바뀌면 다시 계산). 판매 안 하는(useYn=N) 옵션은 뺀다. -->
  <div v-if="isOptionProd && (colors.length || sizes.length)" ref="wrapRef" class="pointer-events-none absolute bottom-2 left-2 z-[2] flex max-w-[calc(100%-44px)] flex-col items-start gap-1" :class="{ invisible: !fitted }">
    <div v-if="colors.length" ref="colorRow" class="flex max-w-full items-center gap-1.5 overflow-hidden rounded-full bg-white/85 px-2 py-1 shadow-sm backdrop-blur-[2px]">
      <span
        v-for="o in shownColors"
        :key="o.prodOptStdCd ?? o.prodOptId"
        data-chip
        class="inline-block h-[14px] w-[14px] shrink-0 rounded-full border border-black/15 bg-[var(--swatch-color)]"
        :style="{ '--swatch-color': prodOptSwatchColor(o.prodOptStdCd) }"
      ></span>
      <span v-if="colorCut < colors.length" class="shrink-0 text-[12px] leading-none tracking-widest text-[#666]">…</span>
    </div>
    <div v-if="sizes.length" ref="sizeRow" class="flex max-w-full items-center gap-1.5 overflow-hidden rounded-full bg-white/85 px-2 py-1 shadow-sm backdrop-blur-[2px]">
      <span v-for="o in shownSizes" :key="o.prodOptStdCd ?? o.prodOptId" data-chip class="shrink-0 text-[10.5px] font-medium leading-none text-[#444]">{{ o.prodOptNm }}</span>
      <span v-if="sizeCut < sizes.length" class="shrink-0 text-[12px] leading-none tracking-widest text-[#666]">…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { PdProdType } from "~/types/pd/pdProdType";
import { prodOptSwatchColor } from "~/utils/prodOptColor";

const props = defineProps<{ item: PdProdType }>();
const isOptionProd = computed(() => props.item.prodTypeCd === "OPTION");
const colors = computed(() => (props.item.prodOpt2List ?? []).filter((o) => o.useYn !== "N"));
const sizes = computed(() => (props.item.prodOpt1List ?? []).filter((o) => o.useYn !== "N"));

// 각 줄에 실제로 그릴 개수 — 처음엔 전부 그려 폭을 잰 뒤(fitted 전에는 invisible) 넘치면 들어가는 만큼으로 줄인다
const colorCut = ref(Number.MAX_SAFE_INTEGER);
const sizeCut = ref(Number.MAX_SAFE_INTEGER);
const fitted = ref(false);
const shownColors = computed(() => colors.value.slice(0, colorCut.value));
const shownSizes = computed(() => sizes.value.slice(0, sizeCut.value));

const wrapRef = ref<HTMLElement | null>(null);
const colorRow = ref<HTMLElement | null>(null);
const sizeRow = ref<HTMLElement | null>(null);

/** row 안에 total 개가 다 안 들어가면 "…"(약 14px) 자리를 남기고 들어가는 개수를 돌려준다. 다 들어가면 total. */
function fitCount(row: HTMLElement | null, total: number): number {
  if (!row) return total;
  if (row.scrollWidth <= row.clientWidth + 1) return total;
  const cs = getComputedStyle(row);
  const gap = parseFloat(cs.columnGap) || 0;
  const avail = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 14 - gap;
  let used = 0;
  let n = 0;
  for (const el of Array.from(row.querySelectorAll<HTMLElement>("[data-chip]"))) {
    const w = el.offsetWidth + (n ? gap : 0);
    if (used + w > avail) break;
    used += w;
    n++;
  }
  return Math.max(1, n);
}

// 2026-09-22(요청사항: "단품에서 옵션상품 클릭하면 엄청 느리던데 특히 핸드폰은 pc보다 몇배 느려") — 옵션상품 목록 페이지는
// 카드마다 이 컴포넌트가 마운트되는데, fitCount()가 scrollWidth/clientWidth/offsetWidth를 읽어(강제 동기 리플로우)
// 색상줄·사이즈줄 2번씩 측정한다. 카드가 수십 개면 필터 전환 즉시 전부가 같은 프레임에 리플로우를 강제해 멈춘 것처럼
// 느려지고, 리플로우는 CPU 비용이라 저성능 모바일에서 PC보다 훨씬 크게 느려진다. 화면에 보이는(또는 곧 보일) 카드만
// IntersectionObserver로 지연 측정하고, 측정도 requestAnimationFrame으로 한 프레임 미뤄 초기 렌더와 겹치지 않게 한다.
async function refit() {
  if (!isOptionProd.value) return;
  colorCut.value = Number.MAX_SAFE_INTEGER; // 전부 다시 그려서 잰다
  sizeCut.value = Number.MAX_SAFE_INTEGER;
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  colorCut.value = fitCount(colorRow.value, colors.value.length);
  sizeCut.value = fitCount(sizeRow.value, sizes.value.length);
  fitted.value = true;
}

let ro: ResizeObserver | null = null;
let io: IntersectionObserver | null = null;
function startWatchingResize() {
  // 카드 폭(=부모 .product__thumb)이 바뀔 때(반응형/창 크기)만 다시 계산 — 우리 줄 자체를 관찰하면 줄이는 순간 다시 트리거돼 루프가 된다
  const host = wrapRef.value?.parentElement;
  if (host && typeof ResizeObserver !== "undefined") {
    let lastW = host.clientWidth;
    ro = new ResizeObserver(() => {
      if (host.clientWidth !== lastW) {
        lastW = host.clientWidth;
        refit();
      }
    });
    ro.observe(host);
  }
}
onMounted(() => {
  if (!wrapRef.value || typeof IntersectionObserver === "undefined") {
    refit();
    startWatchingResize();
    return;
  }
  // 뷰포트 밖(스크롤 전) 카드는 화면에 들어오기 전까지 측정을 미룬다 — 필터 전환 시 한 페이지(수십 장) 전체가
  // 동시에 리플로우를 강제하던 것을, 실제로 보이는 카드 수 만큼으로 줄인다.
  io = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      io?.disconnect();
      io = null;
      refit();
      startWatchingResize();
    },
    { rootMargin: "200px 0px" }
  );
  io.observe(wrapRef.value);
});
onBeforeUnmount(() => {
  ro?.disconnect();
  io?.disconnect();
});
watch([colors, sizes], () => refit());
</script>
