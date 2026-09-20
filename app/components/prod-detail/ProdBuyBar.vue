<template>
  <!-- 2026-09-20(요청사항: "스크롤 내리면 하단에 구매하기 탭 나오는거") — ecFeBo 하단 고정 구매바 이식.
       본문의 구매 버튼이 화면 위로 지나가면 나타나고(show), 담기/구매하기는 부모가 옵션 검증을 거쳐 처리한다.
       우하단 채팅 버튼(z-[8801])과 겹치지 않게 오른쪽 여백을 둔다. -->
  <div
    class="fixed inset-x-0 bottom-0 z-[900] border-t border-[#e5e7eb] bg-white/95 backdrop-blur-md shadow-[0_-4px_18px_rgba(80,100,160,0.08)] transition-transform duration-200 pl-4 pr-20 py-2.5 sm:px-6"
    :class="show ? 'translate-y-0' : 'translate-y-full pointer-events-none'"
    :aria-hidden="!show"
  >
    <div class="mx-auto flex w-full max-w-[760px] items-center gap-2.5">
      <div class="min-w-0 flex-1">
        <div class="truncate text-[0.8rem] text-[#8a8a8a]" v-html="item.prodNm"></div>
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
import type { PdProductType } from "~/types/pdProductType";

defineProps<{ item: PdProductType; show: boolean }>();
const emit = defineEmits<{ (e: "cart"): void; (e: "buy"): void }>();
const { formatPrice } = usePrice();
</script>
