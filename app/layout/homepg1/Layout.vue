<template>
  <!-- homepg1(모두누리 홈페이지) 공통 틀 — 원본 홈페이지의 헤더(로고·상단 메뉴·테마)·왼쪽 사이드바(데스크톱 접기, 모바일 서랍)·푸터·토스트. 스타일은 app/assets/homepg1/style.css -->
  <div class="hp-app">
    <header class="glass hp-header">
      <!-- 모바일: 햄버거 -->
      <button type="button" class="hp-burger mobile-only" aria-label="메뉴" @click="handleBtnAction('menu-mobile')">
        <span></span><span></span><span></span>
      </button>
      <!-- 데스크톱: 사이드바 접기 -->
      <button type="button" class="hp-collapse-btn hidden-sm" style="display: none" aria-label="사이드바 토글" @click="handleBtnAction('menu-collapse')">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <nuxt-link to="/" class="hp-logo" aria-label="홈">
        <div class="hp-logo-mark">🌐</div>
        <div class="hp-logo-text">
          <span class="hp-logo-name">{{ HP_SITE.name }}<span v-if="smc.mismatch" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;margin-left:6px;border-radius:50%;background:#e53935;color:#fff;font-size:10px;font-weight:700;line-height:1;vertical-align:middle;cursor:help" :title="smc.message" role="img" :aria-label="smc.message">✕</span></span>
          <span class="hp-logo-en">{{ HP_SITE.nameEn }}</span>
        </div>
      </nuxt-link>
      <nav class="hp-topnav">
        <nuxt-link v-for="m in HP_TOP_MENU" :key="m.key" :to="menuTo(m)" class="nav-link" :class="{ active: isActive(m) }">{{ m.label }}</nuxt-link>
      </nav>
      <button type="button" class="theme-toggle" :title="theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'" @click="handleBtnAction('theme-toggle')">
        <span>{{ theme === "light" ? "🌙" : "☀️" }}</span>
      </button>
    </header>

    <div class="hp-body">
      <aside id="sidebar" :class="[sidebarOpen ? '' : 'collapsed', mobileOpen ? 'open' : '']" @click.stop>
        <div class="sidebar-inner">
          <template v-for="sec in HP_SIDEBAR_MENU" :key="sec.section">
            <div v-if="sidebarOpen" class="sidebar-section">{{ sec.section }}</div>
            <!-- 원본처럼 사이드바 이동은 방문 기록을 쌓지 않는다(replace) -->
            <nuxt-link
              v-for="item in sec.items"
              :key="item.key"
              :to="item.to"
              replace
              class="sidebar-link"
              :class="{ active: isActive(item) }"
              :data-tip="item.label"
              :aria-label="item.label"
              @click="mobileOpen = false"
            >
              <span class="sidebar-link-icon">{{ item.icon }}</span>
              <span v-if="sidebarOpen" class="sidebar-link-label">{{ item.label }}</span>
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

      <main class="layout-main">
        <div class="hp-page"><slot /></div>
        <footer class="hp-footer">
          <div class="hp-footer-inner">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
              <div class="hp-logo-mark" style="width: 28px; height: 28px; border-radius: 8px; font-size: 0.85rem">🌐</div>
              <span style="font-weight: 700; color: var(--text-secondary); font-size: 0.85rem">{{ HP_SITE.name }}</span>
              <span style="color: var(--text-muted); font-size: 0.75rem">|</span>
              <span style="color: var(--text-muted); font-size: 0.8rem">{{ HP_SITE.address }}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap">
              <span style="font-size: 0.75rem">{{ HP_SITE.tel }}</span>
              <span style="font-size: 0.75rem">{{ HP_SITE.email }}</span>
              <span style="font-size: 0.75rem">© 2026 {{ HP_SITE.name }}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>

    <!-- 토스트 (hpToast) -->
    <div v-if="toast.show" class="toast-wrap" :class="'toast-' + toast.type" role="status">
      <span class="toast-icon">{{ TOAST_ICON[toast.type] }}</span>
      <span class="toast-msg">{{ toast.msg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HP_SIDEBAR_MENU, HP_SITE, HP_TOP_MENU, hpLastProductId, type HpMenuItem } from "~/conts/tenant/homepg1";
import { useHpToast } from "~/layout/homepg1/hpUi";
import faviconUrl from "~/assets/homepg1/img/favicon.png";
const { state: smc } = useSiteModuleCheck(); // 사이트·모듈 짝 — 맞지 않으면 로고 옆 (X) (2026-10-03)

const route = useRoute();
const toast = useHpToast();
const TOAST_ICON = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" } as const;

useHead({
  htmlAttrs: { lang: "ko" },
  link: [{ rel: "icon", type: "image/png", href: faviconUrl }],
  meta: [
    { name: "description", content: HP_SITE.description },
    { name: "theme-color", content: "#0099cc" },
  ],
});

/* 테마 — 원본과 같은 저장 키(modunuri-theme), html[data-theme] 로 색을 바꾼다. 화면마다 레이아웃을 새로 그리므로 상태는 useState 로 유지 */
const THEME_KEY = "modunuri-theme";
const theme = useState<"light" | "dark">("homepg1-theme", () => {
  if (import.meta.client) {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      /* 저장소를 못 쓰면 라이트 */
    }
  }
  return "light";
});
if (import.meta.client) document.documentElement.setAttribute("data-theme", theme.value);

/* 사이드바 — 데스크톱 접기(sidebarOpen) / 모바일 서랍(mobileOpen) */
const sidebarOpen = useState("homepg1-sidebar-open", () => true);
const mobileOpen = useState("homepg1-mobile-open", () => false);
watch(() => route.fullPath, () => (mobileOpen.value = false));
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
function onResize() {
  if (window.innerWidth < 1024) mobileOpen.value = false;
}

/* 메뉴 주소·선택 표시 — "상품상세"는 마지막으로 본 상품 */
function menuTo(m: HpMenuItem): string {
  return m.key === "detail" ? `/products/${hpLastProductId()}` : m.to;
}
function isActive(m: HpMenuItem): boolean {
  const p = route.path;
  if (m.key === "detail") return /^\/products\/[^/]+$/.test(p);
  if (m.key === "blog") return p === "/blog" || p.startsWith("/blog/");
  return p === m.to;
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "menu-mobile") {
    if (!mobileOpen.value && window.innerWidth < 1024) sidebarOpen.value = true; // 모바일 서랍은 항상 펼친 모양
    mobileOpen.value = !mobileOpen.value;
    return;
  }
  if (cmd === "menu-collapse") {
    sidebarOpen.value = !sidebarOpen.value;
    return;
  }
  if (cmd === "theme-toggle") {
    theme.value = theme.value === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme.value);
    try {
      localStorage.setItem(THEME_KEY, theme.value);
    } catch {
      /* 저장 못 해도 화면 전환은 유지 */
    }
    return;
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};
</script>
