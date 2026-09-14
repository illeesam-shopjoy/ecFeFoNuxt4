<template>
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — 커스텀 클래스를 전부
       Tailwind 유틸리티로 대체. var(--theme-color, #0989ff)는 사이트 테마색(theme, #bc8246)으로 통일. -->
  <div class="relative inline-flex items-center" ref="wrapRef">
    <!-- 로그인 상태: 이름 버튼 + 드롭다운 -->
    <template v-if="authStore.isStLoggedIn">
      <button class="bg-transparent border-0 cursor-pointer flex items-center gap-[5px] text-[0.88rem] text-inherit font-medium p-0 whitespace-nowrap" @click.stop="open = !open">
        <i class="fas fa-user"></i>
        <span>{{ authStore.user?.userNm }}</span>
        <i :class="`fas fa-chevron-${open ? 'up' : 'down'} text-[0.65rem]`"></i>
      </button>

      <div v-show="open" class="absolute top-[calc(100%+14px)] right-0 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)] px-6 py-5 min-w-[200px] z-[9999] border-t-2 border-theme">
        <div class="pb-3.5 mb-3.5 border-b border-[#f0f0f0]">
          <p class="font-bold text-[0.95rem] text-[#1a1a1a] m-0">{{ authStore.user?.userNm }}</p>
          <p class="text-[0.78rem] text-[#999] mt-[3px] mb-0">{{ authStore.user?.userEmail }}</p>
        </div>
        <ul class="list-none p-0 m-0">
          <li class="my-2">
            <nuxt-link href="/account" class="text-[0.85rem] text-[#444] no-underline flex items-center gap-2 transition-colors hover:text-theme" @click="open = false"> <i class="fa fa-user"></i> 마이페이지 </nuxt-link>
          </li>
          <li class="my-2">
            <a href="#" class="text-[0.85rem] text-[#444] no-underline flex items-center gap-2 transition-colors hover:text-theme" @click.prevent="handleLogout"> <i class="fa fa-sign-out"></i> 로그아웃 </a>
          </li>
        </ul>
      </div>
    </template>

    <!-- 비로그인 상태: 로그인 링크 -->
    <nuxt-link v-else href="/login" class="flex items-center gap-[5px] text-[0.88rem] whitespace-nowrap text-inherit no-underline"> <i class="fas fa-user"></i> 로그인 </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const open = ref(false);
const wrapRef = ref<HTMLElement | null>(null);

function handleLogout() {
  authStore.setStLogout();
  open.value = false;
  router.push("/");
}

function handleOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutside));
onUnmounted(() => document.removeEventListener("click", handleOutside));
</script>
