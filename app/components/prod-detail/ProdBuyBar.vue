<template>
  <!-- 2026-09-20(요청사항: "스크롤 내리면 하단에 구매하기 탭 나오는거") — ecFeBo 하단 고정 구매바 이식.
       본문의 구매 버튼이 화면 위로 지나가면 나타나고(show), 담기/구매하기는 부모가 옵션 검증을 거쳐 처리한다.
       우하단 채팅 버튼(z-[8801])과 겹치지 않게 오른쪽 여백을 둔다. -->
  <div
    ref="barRef"
    class="fixed inset-x-0 bottom-0 z-[900] border-t-[3px] border-solid border-[#bc8246] bg-[#fffaf3]/95 backdrop-blur-md shadow-[0_-6px_22px_rgba(60,40,10,0.16)] transition-transform duration-200 pl-4 pr-20 py-2.5 sm:px-6"
    :class="show ? 'translate-y-0' : 'translate-y-full pointer-events-none'"
    :aria-hidden="!show"
  >
    <div class="mx-auto flex w-full max-w-[760px] items-center gap-2.5">
      <div class="min-w-0 flex-1">
        <!-- 2026-09-22(요청사항: "제목 왼쪽에 상품유형 뱃지 — 옵션상품의 경우 표시") -->
        <div class="flex items-center gap-1.5 text-[0.8rem] text-[#8a8a8a]">
          <span v-if="isOptionProd" class="shrink-0 rounded-full border border-solid border-[#d9c3a3] bg-white px-2 py-px text-[0.68rem] font-semibold text-[#8a5a25]">{{ prodTypeNm }}</span>
          <span class="min-w-0 truncate" v-html="item.prodNm"></span>
        </div>
        <div class="truncate text-[1.05rem] font-black text-[#222]">{{ formatPrice(item.salePrice) }}</div>
      </div>
      <div class="flex shrink-0 gap-1.5">
        <button type="button" class="h-10 cursor-pointer whitespace-nowrap rounded-lg border-2 border-solid border-[#222] bg-white px-4 text-[0.88rem] font-semibold text-[#222] hover:bg-[#f4f4f4]" :tabindex="show ? 0 : -1" @click="emit('cart')">담기</button>
        <button type="button" class="h-10 cursor-pointer whitespace-nowrap rounded-lg border-2 border-solid border-[#222] bg-[#222] px-4 text-[0.88rem] font-semibold text-white hover:bg-black" :tabindex="show ? 0 : -1" @click="emit('buy')">구매하기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { prodTypeLabel } from "~/conts/pdConst";
import type { PdProdType } from "~/types/pd/pdProdType";

const props = defineProps<{ item: PdProdType; show: boolean }>();
const isOptionProd = computed(() => props.item.prodTypeCd === "OPTION");
const prodTypeNm = computed(() => prodTypeLabel(props.item.prodTypeCd));
const barRef = ref<HTMLElement | null>(null);

// 2026-09-20(요청사항: "하단 구매하기바와 채팅아이콘이 겹쳐보이는데 채팅아이콘이 약간 위로") — 구매바가 나타나면 우하단 플로팅 요소
// (채팅 버튼/패널: ChatWidget, "맨 위로": _common.scss #scroll)가 구매바 높이 + 여백만큼 올라가도록 <html> 의 --fab-lift 를 설정한다.
function setLift(px: number) {
  if (import.meta.client) document.documentElement.style.setProperty("--fab-lift", `${px}px`);
}
watch(
  () => props.show,
  (v) => setLift(v ? (barRef.value?.offsetHeight ?? 62) + 8 : 0),
  { immediate: true, flush: "post" }
);
onBeforeUnmount(() => setLift(0));
const emit = defineEmits<{ (e: "cart"): void; (e: "buy"): void }>();
const { formatPrice } = usePrice();
</script>
