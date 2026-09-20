<template>
  <!-- 2026-09-20(요청사항: "옵션상품은 이미지 안 좌측 아래에 색상 한 줄, 사이즈 한 줄") — 옵션상품(OPTION)만. 부모(.product__thumb)가 relative 라
       이미지 위 좌측 하단에 겹쳐 그린다. 색상은 색 동그라미, 사이즈는 작은 칩이고 개수가 넘으면 "…" 로 줄인다. 클릭은 이미지 링크로 통과(pointer-events-none). -->
  <div v-if="isOptionProd && (colors.length || sizes.length)" class="pointer-events-none absolute bottom-2 left-2 z-[2] flex max-w-[calc(100%-44px)] flex-col items-start gap-1">
    <div v-if="colors.length" class="flex items-center gap-1.5 rounded-full bg-white/85 px-2 py-1 shadow-sm backdrop-blur-[2px]">
      <span
        v-for="o in shownColors"
        :key="o.prodOptStdCd ?? o.prodOptId"
        class="inline-block h-[14px] w-[14px] rounded-full border border-black/15 bg-[var(--swatch-color)]"
        :style="{ '--swatch-color': prodOptSwatchColor(o.prodOptStdCd) }"
      ></span>
      <span v-if="colors.length > colorMax" class="text-[12px] leading-none tracking-widest text-[#666]">…</span>
    </div>
    <div v-if="sizes.length" class="flex items-center gap-1.5 rounded-full bg-white/85 px-2 py-1 shadow-sm backdrop-blur-[2px]">
      <span v-for="o in shownSizes" :key="o.prodOptStdCd ?? o.prodOptId" class="text-[10.5px] font-medium leading-none text-[#444]">{{ o.prodOptNm }}</span>
      <span v-if="sizes.length > sizeMax" class="text-[12px] leading-none tracking-widest text-[#666]">…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import type { PdProdType } from "~/types/pd/pdProdType";
import { prodOptSwatchColor } from "~/utils/prodOptColor";

const props = withDefaults(defineProps<{ item: PdProdType; colorMax?: number; sizeMax?: number }>(), { colorMax: 6, sizeMax: 4 });
const { colorMax, sizeMax } = toRefs(props);
const isOptionProd = computed(() => props.item.prodTypeCd === "OPTION");
const colors = computed(() => props.item.prodOpt2List ?? []);
const sizes = computed(() => props.item.prodOpt1List ?? []);
const shownColors = computed(() => colors.value.slice(0, props.colorMax));
const shownSizes = computed(() => sizes.value.slice(0, props.sizeMax));
</script>
