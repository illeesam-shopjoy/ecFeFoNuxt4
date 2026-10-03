<template>
  <!-- datavisual1(DataVisual 대시보드) 공통 틀 — 원본 대시보드의 헤더(로고·상단 메뉴·테마)·왼쪽 사이드바(데스크톱 접기, 모바일 서랍)·푸터·토스트. 스타일은 app/assets/datavisual1/style.css -->
  <div class="dv-app">
    <header class="dv-header">
      <button type="button" class="theme-toggle hidden-sm" title="사이드바 토글" aria-label="사이드바 토글" @click="handleBtnAction('menu-collapse')">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <button type="button" class="theme-toggle mobile-only" aria-label="메뉴" @click="handleBtnAction('menu-mobile')">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path v-if="!mobileOpen" d="M3 6h18M3 12h18M3 18h18" />
          <path v-else d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <nuxt-link to="/" class="dv-logo" aria-label="대시보드">
        <div class="dv-logo-mark">📊</div>
        <div>
          <div class="dv-logo-name">DataVisual</div>
          <div class="dv-logo-sub">DASHBOARD</div>
        </div>
      </nuxt-link>

      <nav class="dv-topnav hidden-sm" style="display: none">
        <nuxt-link v-for="m in DV_TOP_MENU" :key="m.key" :to="m.to" class="nav-link" :class="{ active: route.path === m.to }">{{ m.label }}</nuxt-link>
      </nav>
      <div style="flex: 1" class="mobile-only"></div>

      <button type="button" class="theme-toggle" :title="theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'" @click="handleBtnAction('theme-toggle')">
        <span>{{ theme === "light" ? "🌙" : "☀️" }}</span>
      </button>
    </header>

    <div class="dv-body">
      <aside id="sidebar" :class="[sidebarOpen ? '' : 'collapsed', mobileOpen ? 'open' : '']" @click.stop>
        <div class="sidebar-inner">
          <template v-for="sec in DV_SIDEBAR_MENU" :key="sec.section">
            <div v-if="sidebarOpen || mobileOpen" class="sidebar-section">{{ sec.section }}</div>
            <nuxt-link
              v-for="item in sec.items"
              :key="item.key"
              :to="item.to"
              class="sidebar-link"
              :class="{ active: route.path === item.to }"
              :data-tip="item.label"
              :aria-label="item.label"
              @click="mobileOpen = false"
            >
              <span class="sidebar-link-icon">{{ item.icon }}</span>
              <span v-if="sidebarOpen || mobileOpen" class="sidebar-link-label">{{ item.label }}</span>
            </nuxt-link>
          </template>
          <div style="flex: 1"></div>
          <button
            type="button"
            class="sidebar-collapse-toggle hidden-sm"
            :title="sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'"
            :aria-label="sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'"
            @click.stop="handleBtnAction('menu-collapse')"
          >
            <span>{{ sidebarOpen ? "◀" : "▶" }}</span>
            <span v-if="sidebarOpen">접기</span>
          </button>
        </div>
      </aside>
      <div class="sidebar-overlay" :class="{ show: mobileOpen }" @click="mobileOpen = false"></div>

      <main class="dv-main">
        <div class="dv-page"><slot /></div>
        <footer class="dv-footer">
          <span>© 2026 DataVisual — {{ DV_VERSION }}</span>
          <span>Chart.js 4 · 실시간 데이터 시각화</span>
        </footer>
      </main>
    </div>

    <div v-if="toast.show" class="toast-wrap" :class="{ 'is-success': toast.success }" role="status">{{ toast.success ? "✅" : "ℹ️" }} {{ toast.msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { DV_SIDEBAR_MENU, DV_TOP_MENU, DV_VERSION } from "~/conts/tenant/datavisual1";
import { dvApplyTheme, useDvTheme, useDvToast } from "~/layout/datavisual1/dvUi";

const route = useRoute();
const toast = useDvToast();

useHead({
  htmlAttrs: { lang: "ko" },
  meta: [
    { name: "description", content: "데이터 시각화 대시보드 — 차트 위젯, 실시간 시계열, 레이아웃 편집기" },
    { name: "theme-color", content: "#0d1117" },
  ],
});

/* 테마 — 화면마다 레이아웃을 새로 그리므로 상태는 useState(dvUi). 첫 그리기 전에 html[data-theme] 를 맞춘다 */
const theme = useDvTheme();
if (import.meta.client) document.documentElement.setAttribute("data-theme", theme.value);

/* 사이드바 — 데스크톱 접기(sidebarOpen) / 모바일 서랍(mobileOpen). 원본처럼 좁은 화면에서 시작하면 접힌 상태 */
const sidebarOpen = useState("datavisual1-sidebar-open", () => !(import.meta.client && window.innerWidth < 1024));
const mobileOpen = useState("datavisual1-mobile-open", () => false);
watch(() => route.fullPath, () => (mobileOpen.value = false));
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
function onResize() {
  if (window.innerWidth < 1024) mobileOpen.value = false;
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "menu-mobile") {
    mobileOpen.value = !mobileOpen.value;
    return;
  }
  if (cmd === "menu-collapse") {
    sidebarOpen.value = !sidebarOpen.value;
    return;
  }
  if (cmd === "theme-toggle") {
    const next = theme.value === "light" ? "dark" : "light";
    dvApplyTheme(next); // 속성 먼저 — 차트가 테마 변경을 보고 새 색을 읽는다
    theme.value = next;
    return;
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
