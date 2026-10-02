<template>
  <!-- 하단 탭 — 당근 하단 메뉴 5개. 채팅 탭에는 안 읽은 방 수(운영자 답장이 왔는데 아직 안 읽은 방) -->
  <nav class="dm-tabs" aria-label="하단 메뉴">
    <nuxt-link v-for="t in DM_TABS" :key="t.key" :to="t.to" class="dm-tab" :class="{ on: isOn(t) }">
      <span class="relative inline-flex">
        <i :class="t.icon" aria-hidden="true"></i>
        <span v-if="t.key === 'chat' && unread > 0" class="dm-tab__badge">{{ unread > 9 ? "9+" : unread }}</span>
      </span>
      <span>{{ t.label }}</span>
    </nuxt-link>
  </nav>
</template>

<script setup lang="ts">
import { DM_TABS } from "~/conts/tenant/danmoo1";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";

const route = useRoute();
const authStore = useAuthStore();
const isOn = (t: (typeof DM_TABS)[number]) => (t.to === "/" ? route.path === "/" : route.path === t.to || route.path.startsWith(`${t.to}/`));

// 안 읽은 채팅 수 — 화면마다 다시 조회하지 않게 60초 캐시(useState 공유)
const unread = useState<number>("dm-chat-unread", () => 0);
const checkedAt = useState<number>("dm-chat-unread-at", () => 0);
onMounted(async () => {
  await useAuthReady();
  if (!authStore.isStLoggedIn) return (unread.value = 0);
  if (Date.now() - checkedAt.value < 60_000) return;
  checkedAt.value = Date.now();
  try {
    const rooms = await myChatSvc.getMyList();
    unread.value = rooms.filter((r) => r.chattStatusCd !== "DONE" && !!r.lastMsg && r.lastMsg.senderTypeCd !== "MEMBER" && r.lastMsg.readYn !== "Y").length;
  } catch {
    unread.value = 0;
  }
});
</script>

<style scoped>
.dm-tabs {
  position: fixed; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 100%; max-width: 640px; height: 64px; padding-bottom: env(safe-area-inset-bottom);
  display: grid; grid-template-columns: repeat(5, 1fr);
  background: var(--dm-bg); border-top: 1px solid var(--dm-line); z-index: 40;
}
.dm-tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 11px; color: var(--dm-text-2); }
.dm-tab i { font-size: 20px; }
.dm-tab.on { color: var(--dm-text); font-weight: 700; }
.dm-tab__badge { position: absolute; top: -6px; right: -10px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: var(--dm-primary); color: #fff; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
</style>
