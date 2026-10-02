<template>
  <!-- 중고거래 목록 한 줄 — 사진(정방형) · 상품명 · 동네·시간(끌올) · 가격 · 예약중/판매완료 (당근 홈 피드) -->
  <nuxt-link :to="`/prod/${prod.prodId}`" class="dm-card">
    <div class="dm-card__img">
      <img v-if="prod.img" :src="prod.img" :alt="prod.prodNm" loading="lazy" />
      <div v-else class="w-full h-full flex items-center justify-center text-[var(--dm-text-3)]"><i class="far fa-image text-2xl"></i></div>
    </div>
    <div class="dm-card__body">
      <div class="dm-card__title clamp-2">{{ prod.prodNm }}</div>
      <div class="dm-card__meta">{{ town }} · <span v-if="bumped" class="font-semibold">끌올 </span>{{ when }}</div>
      <div class="dm-card__price">
        <span v-if="status" class="dm-card__status" :class="status.cls">{{ status.label }}</span>
        <b>{{ price }}</b>
        <span v-if="prod.stdPrice && prod.stdPrice > prod.salePrice" class="dm-card__std">{{ formatWon(prod.stdPrice) }}</span>
      </div>
      <div class="dm-card__foot">
        <span v-if="(prod.reviewCnt ?? 0) > 0"><i class="far fa-comment-dots"></i> {{ prod.reviewCnt }}</span>
        <span v-if="likeCnt > 0"><i class="far fa-heart"></i> {{ likeCnt }}</span>
      </div>
    </div>
  </nuxt-link>
</template>

<script setup lang="ts">
import type { PdProdType } from "~/types/pd/pdProdType";
import { formatWon, timeAgo } from "~/utils/timeAgo";
import { useDmTown } from "~/composables/useDmTown";
import { dmStatusOf, townOf } from "~/conts/tenant/danmoo1";

const props = defineProps<{ prod: PdProdType; likeCnt?: number }>();
const { town: myTown } = useDmTown();
const likeCnt = computed(() => props.likeCnt ?? 0);
const town = computed(() => townOf(props.prod.prodId, myTown.value));
const status = computed(() => dmStatusOf(props.prod));
const price = computed(() => formatWon(props.prod.discntPrice ?? props.prod.salePrice));
// 등록 뒤 한 시간 넘게 지나서 수정됐으면 당근의 "끌올"처럼 표시
const bumped = computed(() => {
  const r = Date.parse(String(props.prod.regDate ?? "").replace(" ", "T"));
  const u = Date.parse(String(props.prod.updDate ?? "").replace(" ", "T"));
  return !Number.isNaN(r) && !Number.isNaN(u) && u - r > 3600_000;
});
const when = computed(() => timeAgo(bumped.value ? props.prod.updDate : props.prod.regDate) || "최근");
</script>

<style scoped>
.dm-card { display: flex; gap: 14px; padding: 14px 16px; border-bottom: 1px solid var(--dm-line); }
.dm-card:active { background: var(--dm-bg-soft); }
.dm-card__img { position: relative; width: 112px; height: 112px; flex: none; border-radius: 10px; overflow: hidden; background: var(--dm-chip); }
.dm-card__img img { width: 100%; height: 100%; object-fit: cover; }
.dm-card__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.dm-card__title { font-size: 16px; line-height: 1.35; }
.dm-card__meta { margin-top: 3px; font-size: 13px; color: var(--dm-text-2); }
.dm-card__price { margin-top: 6px; font-size: 16px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.dm-card__status { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; color: #fff; }
.dm-card__status.reserved { background: #2f9e44; }
.dm-card__status.sold { background: var(--dm-text-2); }
.dm-card__std { font-size: 12px; color: var(--dm-text-3); text-decoration: line-through; }
.dm-card__foot { margin-top: auto; display: flex; justify-content: flex-end; gap: 10px; font-size: 13px; color: var(--dm-text-2); }
@media (min-width: 480px) {
  .dm-card__img { width: 128px; height: 128px; }
}
</style>
