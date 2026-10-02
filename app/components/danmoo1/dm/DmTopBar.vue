<template>
  <!-- 홈형 상단바 — 왼쪽 동네 ▾, 오른쪽 검색·메뉴·알림. 동네를 누르면 내 동네·동네 범위 선택 시트 -->
  <div class="dm-topbar">
    <button type="button" class="dm-topbar__town" @click="townOpen = true">
      <span class="truncate">{{ town }}</span>
      <i class="fas fa-chevron-down text-[13px]" aria-hidden="true"></i>
    </button>
    <div class="dm-topbar__right">
      <slot name="right">
        <nuxt-link to="/search" class="icon-btn" aria-label="검색"><i class="far fa-search"></i></nuxt-link>
        <nuxt-link to="/services" class="icon-btn" aria-label="전체 서비스"><i class="far fa-bars"></i></nuxt-link>
        <nuxt-link to="/noti" class="icon-btn relative" aria-label="알림">
          <i class="far fa-bell"></i>
          <span v-if="unread > 0" class="dm-badge">{{ unread > 99 ? "99+" : unread }}</span>
        </nuxt-link>
      </slot>
    </div>

    <dm-sheet :open="townOpen" title="내 동네 설정" @close="townOpen = false">
      <p class="muted text-[13px] mb-3">위치 인증은 하지 않아요 — 선택한 동네와 범위는 이 브라우저에만 저장돼요.</p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="n in DM_NEIGHBORHOODS" :key="n" type="button" class="h-11 rounded-lg text-[15px] font-semibold" :class="n === town ? 'bg-[var(--dm-primary)] text-white' : 'bg-[var(--dm-chip)]'" @click="setTown(n)">{{ n }}</button>
      </div>
      <b class="block text-[15px] mt-6 mb-2">동네 범위</b>
      <div class="grid grid-cols-4 gap-1.5">
        <button v-for="r in DM_RANGE_OPTIONS" :key="r.value" type="button" class="h-10 rounded-lg text-[13.5px] font-semibold" :class="r.value === range ? 'bg-[var(--dm-text)] text-[var(--dm-bg)]' : 'bg-[var(--dm-chip)]'" @click="setRange(r.value)">{{ r.label }}</button>
      </div>
      <p class="muted text-[12.5px] mt-2">{{ town }} 외 근처 동네 {{ rangeCount }}곳의 물건을 함께 보여줘요.</p>
      <template #foot><button type="button" class="btn-primary w-full" @click="townOpen = false">완료</button></template>
    </dm-sheet>
  </div>
</template>

<script setup lang="ts">
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import { DM_NEIGHBORHOODS, DM_RANGE_OPTIONS } from "~/conts/tenant/danmoo1";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthStore } from "~/store/useAuthStore";
import { useAuthReady } from "~/composables/useAuthReady";
import { myNotiSvc } from "~/svc/fo/my/myNotiSvc";

const { town, setTown, range, setRange } = useDmTown();
const townOpen = ref(false);
const unread = ref(0);
const authStore = useAuthStore();
const rangeCount = computed(() => DM_RANGE_OPTIONS.find((r) => r.value === range.value)?.count ?? 0);

onMounted(async () => {
  await useAuthReady();
  if (!authStore.isStLoggedIn) return;
  try { unread.value = await myNotiSvc.getUnreadCount(); } catch { unread.value = 0; }
});
</script>

<style scoped>
.dm-topbar { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 8px 0 16px; }
.dm-topbar__town { display: inline-flex; align-items: center; gap: 6px; font-size: 19px; font-weight: 800; max-width: 60%; }
.dm-topbar__right { display: flex; align-items: center; }
.dm-badge { position: absolute; top: 6px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: var(--dm-primary); color: #fff; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
</style>
