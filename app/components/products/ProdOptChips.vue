<template>
  <!-- 2026-09-20(요청사항: "옵션상품의 경우 색상옵션·사이즈옵션 이미지 하단에 표시, 개수 넘어가면 ... 으로 마무리") — 옵션상품(OPTION)만.
       색상은 색 동그라미, 사이즈는 작은 칩으로 이미지 바로 아래에 보여주고, 개수가 넘으면 "…" 로 줄인다. 글자 나열(색상 블랙/화이트…)은 쓰지 않는다. -->
  <div v-if="isOptionProd && (colors.length || sizes.length)" class="mt-2.5 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
    <div v-if="colors.length" class="flex items-center gap-1.5">
      <span
        v-for="o in shownColors"
        :key="o.prodOptStdCd ?? o.prodOptId"
        :title="o.prodOptNm"
        class="inline-block h-[16px] w-[16px] rounded-full border border-black/15 bg-[var(--swatch-color)]"
        :style="{ '--swatch-color': prodOptSwatchColor(o.prodOptStdCd) }"
      ></span>
      <span v-if="colors.length > colorMax" class="text-[12px] leading-none tracking-widest text-[#888]" :title="`색상 ${colors.length}개`">…</span>
    </div>
    <div v-if="sizes.length" class="flex items-center gap-1">
      <span v-for="o in shownSizes" :key="o.prodOptStdCd ?? o.prodOptId" class="rounded border border-[#d9d9d9] px-1.5 py-px text-[10.5px] leading-tight text-[#666]">{{ o.prodOptNm }}</span>
      <span v-if="sizes.length > sizeMax" class="text-[12px] leading-none tracking-widest text-[#888]" :title="`사이즈 ${sizes.length}개`">…</span>
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
