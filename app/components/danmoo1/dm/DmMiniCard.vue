<template>
  <!-- 2열 격자용 작은 카드 — 상세의 "판매자의 다른 물건 / 이런 물건은 어때요", 관심목록 등 -->
  <nuxt-link :to="`/prod/${prod.prodId}`" class="block">
    <span class="relative block aspect-square rounded-xl bg-[var(--dm-chip)] overflow-hidden">
      <img v-if="prod.img" :src="prod.img" :alt="prod.prodNm" class="w-full h-full object-cover" loading="lazy" />
      <span v-if="status" class="absolute left-2 top-2 text-[11px] font-bold px-1.5 py-0.5 rounded text-white" :class="status.cls === 'sold' ? 'bg-black/60' : 'bg-[#2f9e44]'">{{ status.label }}</span>
    </span>
    <p class="text-[14.5px] mt-2 clamp-2">{{ prod.prodNm }}</p>
    <p class="text-[15px] font-bold mt-0.5">{{ formatWon(prod.discntPrice ?? prod.salePrice) }}</p>
    <p class="text-[12px] muted">{{ townOf(prod.prodId, town) }} · {{ timeAgo(prod.regDate) || "최근" }}</p>
  </nuxt-link>
</template>

<script setup lang="ts">
import type { PdProdType } from "~/types/pd/pdProdType";
import { formatWon, timeAgo } from "~/utils/timeAgo";
import { useDmTown } from "~/composables/useDmTown";
import { dmStatusOf, townOf } from "~/conts/tenant/danmoo1";

const props = defineProps<{ prod: PdProdType }>();
const { town } = useDmTown();
const status = computed(() => dmStatusOf(props.prod));
</script>
