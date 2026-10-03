<template>
  <!-- 홈형 상단바 — 왼쪽 동네 ▾, 오른쪽 검색·메뉴·알림. 동네를 누르면 내 동네·동네 범위 선택 시트 -->
  <div class="dm-topbar">
    <button type="button" class="dm-topbar__town" @click="townOpen = true">
      <span class="truncate">{{ town }}</span>
      <i class="fas fa-chevron-down text-[13px]" aria-hidden="true"></i>
    </button>
    <!-- 2026-10-03: 사이트·모듈 짝이 맞지 않으면 (X) — 마우스를 올리면 사유 -->
    <span v-if="smc.mismatch" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;margin-left:6px;border-radius:50%;background:#e53935;color:#fff;font-size:10px;font-weight:700;line-height:1;vertical-align:middle;cursor:help" :title="smc.message" role="img" :aria-label="smc.message">✕</span>
    <div class="dm-topbar__right">
      <slot name="right">
        <nuxt-link to="/search" class="icon-btn" aria-label="검색"><i class="far fa-search"></i></nuxt-link>
        <nuxt-link to="/services" class="icon-btn" aria-label="전체 서비스"><i class="far fa-bars"></i></nuxt-link>
        <!-- 2026-10-03(사용자 "공통적으로 로그인버튼 추가") — 로그인 전에만 -->
        <nuxt-link v-if="!authStore.isStLoggedIn" :to="{ path: '/login', query: { redirect: route.fullPath } }" class="dm-login-btn">로그인</nuxt-link>
        <nuxt-link to="/noti" class="icon-btn relative" aria-label="알림">
          <i class="far fa-bell"></i>
          <span v-if="unread > 0" class="dm-badge">{{ unread > 99 ? "99+" : unread }}</span>
        </nuxt-link>
        <!-- 2026-10-03(사용자 "상단 제일 우측에 설정아이콘 … site+모듈체크 토글(default:false)") — 맨 오른쪽 설정: 다크 모드 · 사이트 정상여부 체크 -->
        <button type="button" class="icon-btn" aria-label="설정" title="설정" @click="setOpen = true"><i class="far fa-cog"></i></button>
      </slot>
    </div>

    <dm-sheet :open="setOpen" title="설정" @close="setOpen = false">
      <button type="button" class="dm-set-row" :aria-pressed="dark" @click="toggleTheme()"><span><i class="far fa-moon"></i>다크 모드</span><span class="r"><span class="w-11 h-6 rounded-full relative transition" :class="dark ? 'bg-[var(--dm-primary)]' : 'bg-[var(--dm-line)]'"><span class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" :class="dark ? 'left-[22px]' : 'left-0.5'"></span></span></span></button>
      <button type="button" class="dm-set-row" :aria-pressed="siteCheck.on.value" @click="siteCheck.toggle()"><span><i class="far fa-shield-check"></i>사이트 정상여부 체크</span><span class="r"><span class="w-11 h-6 rounded-full relative transition" :class="siteCheck.on.value ? 'bg-[var(--dm-primary)]' : 'bg-[var(--dm-line)]'"><span class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" :class="siteCheck.on.value ? 'left-[22px]' : 'left-0.5'"></span></span></span></button>
      <p class="muted text-[12.5px] mt-2 leading-relaxed">켜면 로그인할 때 서버가 이 화면의 사이트({{ tenant.siteId }})와 모듈({{ tenant.moduleId }})이 맞는지 확인하고, 맞지 않으면 로그인을 막습니다. 기본은 꺼짐이며 이 브라우저에 저장됩니다.</p>
      <template #foot><nuxt-link to="/my/settings" class="btn-primary w-full inline-flex items-center justify-center" @click="setOpen = false">설정 더보기</nuxt-link></template>
    </dm-sheet>

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
const { state: smc } = useSiteModuleCheck(); // 사이트·모듈 짝 — 맞지 않으면 로고 옆 (X) (2026-10-03)

const { town, setTown, range, setRange } = useDmTown();
const townOpen = ref(false);
// 2026-10-03: 맨 오른쪽 설정 시트 — 다크 모드(기본 다크)·사이트 정상여부 체크(기본 꺼짐, localStorage)
const setOpen = ref(false);
const { dark, toggle: toggleTheme } = useTheme();
const siteCheck = useSiteCheckToggle();
const tenant = useTenant();
const route = useRoute();
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
/* 설정 시트 행 — 시트는 body 로 옮겨 그려져 레이아웃의 .dm-app .dm-menu 규칙이 닿지 않는다(같은 모양을 여기 둔다) */
.dm-set-row { width: 100%; display: flex; align-items: center; justify-content: space-between; height: 50px; font-size: 15.5px; text-align: left; color: var(--dm-text); }
.dm-set-row > span:first-child i { width: 28px; color: var(--dm-text-2); }
.dm-set-row .r { display: inline-flex; align-items: center; gap: 8px; }
.dm-login-btn { display: inline-flex; align-items: center; height: 30px; margin: 0 4px; padding: 0 12px; border-radius: 15px; background: var(--dm-primary); color: #fff; font-size: 13px; font-weight: 700; white-space: nowrap; }
.dm-badge { position: absolute; top: 6px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: var(--dm-primary); color: #fff; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
.truncate { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
</style>
