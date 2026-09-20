<template>
  <!-- 마이페이지 좌측 메뉴 — 메뉴가 많아 탭 바 대신 좌측에 그룹별로 세운다(좁은 화면에서는 위로 접혀 가로 스크롤 없이 쌓인다) -->
  <aside class="mb-6 md:mb-0" aria-label="마이페이지 메뉴">
    <nav class="rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:sticky md:top-[110px]">
      <div v-for="g in MY_MENU_GROUPS" :key="g.title" class="mb-2 last:mb-0">
        <div class="px-3 pb-1 pt-2 text-[0.72rem] font-bold uppercase tracking-wider text-gray-400">{{ g.title }}</div>
        <nuxt-link
          v-for="it in g.items"
          :key="it.key"
          :to="it.to"
          class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.9rem] font-semibold no-underline transition-colors"
          :class="active === it.key ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-[#f5f5f5]'"
        >
          <span class="w-5 text-center">{{ it.icon }}</span>{{ it.label }}
        </nuxt-link>
      </div>
      <button type="button" class="mt-2 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-[0.9rem] font-semibold text-gray-500 hover:bg-[#f5f5f5]" @click="logout">
        <span class="w-5 text-center">🚪</span>로그아웃
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { MY_MENU_GROUPS } from "~/conts/myMenus";
import { useAuthStore } from "~/store/useAuthStore";

defineProps<{ active: string }>();
const router = useRouter();
async function logout() {
  await useAuthStore().setStLogout();
  router.push("/");
}
</script>
