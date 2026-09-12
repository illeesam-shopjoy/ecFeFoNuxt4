<template>
  <div class="admin-layout flex min-h-screen bg-gray-100">
    <aside class="admin-sidebar w-56 flex-shrink-0 bg-slate-800 text-white">
      <div class="p-4 border-b border-slate-700">
        <NuxtLink to="/" class="text-lg font-semibold text-white hover:text-amber-400">Outstock</NuxtLink>
        <span class="block text-xs text-slate-400 mt-1">관리자</span>
      </div>
      <nav class="p-2">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="admin-nav-item flex items-center gap-2 px-3 py-2 rounded-md text-sm transition"
          :class="{ 'bg-slate-700 text-amber-400': route.path.startsWith(item.path) }"
        >
          <span class="opacity-80">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>
    <main class="admin-main flex-1 overflow-auto min-h-0">
      <div class="admin-main-inner pt-10 px-10 pb-8 min-h-full">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
// 2026-09-13: adminSy/adminEc/adminCo/popupAdmin 스캐폴드 전부 제거(요청사항) —
// 실사용 중인 전시패널관리만 남김. [[ecfefonuxt4-dp-widget-migration]] 참조.
const menuItems = [{ path: "/dp/panels", label: "전시패널관리", icon: "🖼️" }];
</script>

<style scoped>
.admin-nav-item {
  color: rgba(255, 255, 255, 0.85);
}
.admin-nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
