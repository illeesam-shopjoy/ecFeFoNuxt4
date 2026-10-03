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
          <div class="dv-logo-name">DataVisual<span v-if="smc.mismatch" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;margin-left:6px;border-radius:50%;background:#e53935;color:#fff;font-size:10px;font-weight:700;line-height:1;vertical-align:middle;cursor:help" :title="smc.message" role="img" :aria-label="smc.message">✕</span></div>
          <div class="dv-logo-sub">DASHBOARD</div>
        </div>
      </nuxt-link>

      <nav class="dv-topnav hidden-sm" style="display: none">
        <nuxt-link v-for="m in DV_TOP_MENU" :key="m.key" :to="m.to" class="nav-link" :class="{ active: route.path === m.to }">{{ m.label }}</nuxt-link>
      </nav>
      <div style="flex: 1" class="mobile-only"></div>

      <!-- 2026-10-03(요청사항: "상단 제일 우측에 설정아이콘 넣어주고 설정아이콘에는 site+모듈체크 토글넣어주고(default:false) 알림아이콘 표시해주고 / 공통적으로 로그인버튼 추가해주고")
           — 오른쪽 끝: [로그인 | 이름·로그아웃] [🔔 알림] [⚙ 설정(맨 오른쪽)]. 예전 🌙 테마 버튼은 ⚙ 설정 안의 "다크 모드" 줄로 옮겼다. -->
      <div class="dv-actions">
        <template v-if="isLoggedIn">
          <span class="dv-user" :title="authStore.user?.userEmail">
            <span class="dv-user-avatar" aria-hidden="true">{{ userName.slice(0, 1) }}</span>
            <span class="dv-user-name">{{ userName }}<small>님</small></span>
          </span>
          <button type="button" class="dv-hd-btn" @click="handleBtnAction('auth-logout')">로그아웃</button>
        </template>
        <nuxt-link v-else-if="route.path !== '/login'" :to="loginTo" class="dv-hd-btn dv-hd-btn--primary">로그인</nuxt-link>

        <!-- 🔔 알림 — 로그인 회원의 알림(ecBeBo /api/fo/my/noti): 안읽음 배지 + 최근 10건. 비로그인이면 로그인 안내 -->
        <div ref="notiWrapRef" class="dv-pop-wrap">
          <button
            type="button"
            class="theme-toggle dv-icon-btn"
            :class="{ 'is-open': pop === 'noti' }"
            :aria-label="isLoggedIn && notiUnread > 0 ? `알림 (안읽음 ${notiUnread}건)` : '알림'"
            :aria-expanded="pop === 'noti'"
            title="알림"
            @click="handleBtnAction('noti-toggle')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <span v-if="isLoggedIn && notiUnread > 0" class="dv-icon-badge">{{ notiUnread > 99 ? "99+" : notiUnread }}</span>
          </button>
          <div v-show="pop === 'noti'" class="dv-pop dv-pop--noti">
            <div v-if="!isLoggedIn" class="dv-pop-guest">
              <div class="dv-pop-guest-ico" aria-hidden="true">🔔</div>
              <p>로그인하면 알림을 볼 수 있어요</p>
              <nuxt-link :to="loginTo" class="btn-primary btn-sm" @click="pop = ''">로그인</nuxt-link>
            </div>
            <template v-else>
              <div class="dv-pop-head">
                <b>알림</b><span class="badge badge-blue">안읽음 {{ notiUnread }}</span><span style="flex: 1"></span>
                <button type="button" class="dv-pop-link" :disabled="notiUnread === 0" @click="handleBtnAction('noti-read-all')">모두 읽음</button>
              </div>
              <div class="dv-pop-body">
                <p v-if="notiError" class="dv-pop-msg is-error">{{ notiError }}</p>
                <p v-else-if="!notiItems.length" class="dv-pop-msg">{{ notiLoading ? "불러오는 중…" : "받은 알림이 없습니다." }}</p>
                <ul v-else class="dv-noti-list">
                  <li v-for="n in notiItems" :key="n.notiId">
                    <button type="button" class="dv-noti-item" :class="{ 'is-unread': n.readYn !== 'Y' }" @click="handleSelectAction('noti-item', n)">
                      <span class="dv-noti-dot" aria-hidden="true"></span>
                      <span class="dv-noti-text">
                        <span class="dv-noti-title">{{ n.notiTitle || "알림" }}</span>
                        <span v-if="notiOpenId === n.notiId && n.notiContent" class="dv-noti-content">{{ n.notiContent }}</span>
                        <span class="dv-noti-time">{{ fmtNotiTime(n.regDate) }}</span>
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>

        <!-- ⚙ 설정 — 맨 오른쪽. 사이트 정상여부 체크(기본 꺼짐, localStorage modu-fo-site-check) · 다크 모드 -->
        <div ref="setWrapRef" class="dv-pop-wrap">
          <button type="button" class="theme-toggle dv-icon-btn dv-icon-btn--gear" :class="{ 'is-open': pop === 'settings' }" aria-label="설정" :aria-expanded="pop === 'settings'" title="설정" @click="handleBtnAction('settings-toggle')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
          <div v-show="pop === 'settings'" class="dv-pop dv-pop--settings" role="group" aria-label="설정">
            <div class="dv-pop-head"><b>설정</b></div>
            <button type="button" class="dv-set-row" :aria-pressed="siteCheck.on.value" title="켜면 로그인할 때 서버가 이 배포의 사이트와 모듈이 맞는지 확인하고, 맞지 않으면 로그인을 막습니다" @click="handleBtnAction('site-check-toggle')">
              <span class="dv-set-ico" aria-hidden="true">🛡️</span><span class="dv-set-label">사이트 정상여부 체크</span>
              <span class="dv-switch" :class="{ 'is-on': siteCheck.on.value }" aria-hidden="true"><i></i></span>
            </button>
            <p class="dv-set-help">켜면 로그인할 때 서버가 이 배포의 사이트와 모듈이 맞는지 확인하고, 맞지 않으면 로그인을 막습니다.</p>
            <button type="button" class="dv-set-row" :aria-pressed="theme === 'dark'" @click="handleBtnAction('theme-toggle')">
              <span class="dv-set-ico" aria-hidden="true">🌙</span><span class="dv-set-label">다크 모드</span>
              <span class="dv-switch" :class="{ 'is-on': theme === 'dark' }" aria-hidden="true"><i></i></span>
            </button>
            <div class="dv-set-env">
              <span class="dv-set-chip">site <b>{{ tenant.siteId }}</b></span><span class="dv-set-chip">module <b>{{ tenant.moduleId }}</b></span><span class="dv-set-chip">{{ modeLabel }}</span>
              <span v-if="smc.mismatch" class="dv-set-warn">✕ 사이트와 모듈이 맞지 않습니다</span>
            </div>
          </div>
        </div>
      </div>
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
import { dvApplyTheme, dvToast, useDvTheme, useDvToast } from "~/layout/datavisual1/dvUi";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { myNotiSvc } from "~/svc/fo/my/myNotiSvc";
import type { SyNotiType } from "~/types/sy/syNotiType";
const { state: smc } = useSiteModuleCheck(); // 사이트·모듈 짝 — 맞지 않으면 로고 옆 (X) (2026-10-03)
const siteCheck = useSiteCheckToggle(); // 사이트 정상여부 체크 토글 (기본 꺼짐, localStorage — 값은 plugins/siteModuleCheck 가 앱 시작 때 읽는다)

const route = useRoute();
const toast = useDvToast();
const tenant = useTenant();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isStLoggedIn);
const userName = computed(() => authStore.user?.userNm || "회원");
/** 로그인 화면 주소 — 지금 화면으로 돌아오게(?redirect=). 대시보드(홈)·로그인 화면 자신은 붙이지 않는다 */
const loginTo = computed(() => ({ path: "/login", query: route.path === "/" || route.path === "/login" ? {} : { redirect: route.fullPath } }));
/** 실행 환경 표시(설정 팝오버 아래) — ec1 HeaderSettings 와 같은 표기 */
const MODE_LABEL: Record<string, string> = { production: "prod", prod: "prod", development: "dev", dev: "dev", local: "local" };
const runMode = String(useRuntimeConfig().public.mode ?? "");
const modeLabel = MODE_LABEL[runMode] ?? (runMode || "prod");

/* 상단 오른쪽 팝오버(🔔 알림 / ⚙ 설정) — 한 번에 하나만 연다. 바깥을 누르거나 Esc 면 닫는다 (2026-10-03) */
const pop = ref<"" | "noti" | "settings">("");
const notiWrapRef = ref<HTMLElement | null>(null);
const setWrapRef = ref<HTMLElement | null>(null);

/* 알림 — 안읽음 수는 화면을 옮겨도(레이아웃을 새로 그려도) 남도록 useState, 목록은 열 때마다 최근 10건 */
const NOTI_LIMIT = 10;
const notiUnread = useState<number>("datavisual1-noti-unread", () => 0);
const notiCheckedAt = useState<number>("datavisual1-noti-checked-at", () => 0); // 마지막 안읽음 수 조회 시각 — 화면 이동마다 다시 부르지 않게(30초)
const notiItems = ref<SyNotiType[]>([]);
const notiLoading = ref(false);
const notiError = ref("");
const notiOpenId = ref<string | null>(null); // 내용을 펼친 알림

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
watch(() => route.fullPath, () => {
  mobileOpen.value = false;
  pop.value = "";
});
let notiTimer: ReturnType<typeof setInterval> | null = null;
onMounted(async () => {
  window.addEventListener("resize", onResize);
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onDocKeydown);
  // 1분마다 안읽음 수 갱신(로그인 상태 · 알림 팝오버가 닫혀 있고 · 탭이 보일 때만)
  notiTimer = setInterval(() => {
    if (isLoggedIn.value && pop.value !== "noti" && document.visibilityState === "visible") fnLoadNotiUnread(true);
  }, 60_000);
  await useAuthReady(); // 첫 진입·새로고침이면 app.vue 의 로그인 복원이 끝난 뒤에 로그인 여부를 본다
  fnLoadNotiUnread();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onDocKeydown);
  if (notiTimer) clearInterval(notiTimer);
});
function onResize() {
  if (window.innerWidth < 1024) mobileOpen.value = false;
}
/** 열린 팝오버 바깥을 누르면 닫는다 — 누른 순간의 경로(composedPath)로 본다(누른 뒤 다시 그려져 요소가 바뀌어도 닫히지 않게) */
function onDocClick(e: MouseEvent) {
  if (!pop.value) return;
  const wrap = pop.value === "noti" ? notiWrapRef.value : setWrapRef.value;
  if (wrap && !e.composedPath().includes(wrap)) pop.value = "";
}
function onDocKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && pop.value) pop.value = "";
}
// 로그인하면 안읽음 수를 바로 받고, 로그아웃하면 비운다
watch(isLoggedIn, (v) => {
  notiItems.value = [];
  notiOpenId.value = null;
  notiError.value = "";
  if (v) return fnLoadNotiUnread(true);
  notiUnread.value = 0;
  notiCheckedAt.value = 0;
});

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "menu-mobile") {
    mobileOpen.value = !mobileOpen.value;
    pop.value = "";
    return;
  }
  if (cmd === "menu-collapse") {
    sidebarOpen.value = !sidebarOpen.value;
    return;
  }
  // 2026-10-03: 테마 버튼은 ⚙ 설정 안 "다크 모드" 줄로 옮겼다(전환·저장 방식은 그대로) — 팝오버는 열어 둔 채 바로 반영을 보여준다
  if (cmd === "theme-toggle") {
    const next = theme.value === "light" ? "dark" : "light";
    dvApplyTheme(next); // 속성 먼저 — 차트가 테마 변경을 보고 새 색을 읽는다
    theme.value = next;
    return;
  }
  if (cmd === "site-check-toggle") return siteCheck.toggle();
  if (cmd === "settings-toggle") {
    pop.value = pop.value === "settings" ? "" : "settings";
    mobileOpen.value = false;
    return;
  }
  if (cmd === "noti-toggle") {
    pop.value = pop.value === "noti" ? "" : "noti";
    mobileOpen.value = false;
    if (pop.value === "noti" && isLoggedIn.value) await fnLoadNotiList();
    return;
  }
  if (cmd === "noti-read-all") {
    try {
      await myNotiSvc.markAllRead();
      notiItems.value.forEach((n) => (n.readYn = "Y"));
      notiUnread.value = 0;
    } catch {
      notiError.value = "모두 읽음 처리에 실패했습니다.";
    }
    return;
  }
  if (cmd === "auth-logout") {
    pop.value = "";
    await authStore.setStLogout();
    dvToast("로그아웃되었습니다.");
    return navigateTo("/");
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};

/* handleSelectAction — 목록 항목 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = async (cmd: string, n: SyNotiType) => {
  if (cmd === "noti-item") {
    // 누르면 내용을 펼치고(다시 누르면 접기), 안 읽은 알림이면 읽음 처리
    notiOpenId.value = notiOpenId.value === n.notiId ? null : n.notiId;
    if (n.readYn === "Y") return;
    try {
      await myNotiSvc.markRead(n.notiId, "Y");
      n.readYn = "Y";
      notiUnread.value = Math.max(0, notiUnread.value - 1);
    } catch {
      /* 읽음 처리에 실패해도 내용 펼침은 그대로 */
    }
    return;
  }
  console.warn("[handleSelectAction] 알 수 없는 명령:", cmd);
};

/* fnLoadNotiUnread — 안읽음 수. force 가 아니면 30초 안에 받은 값은 다시 부르지 않는다 */
async function fnLoadNotiUnread(force = false) {
  if (!isLoggedIn.value) return;
  if (!force && Date.now() - notiCheckedAt.value < 30_000) return;
  notiCheckedAt.value = Date.now();
  try {
    notiUnread.value = Number(await myNotiSvc.getUnreadCount()) || 0;
  } catch (e) {
    // 401 이면(axiosCsr 가 토큰 갱신까지 해 본 뒤에도 인증 실패) 로그아웃 — 로그인 상태로 남아 1분마다 401 을 쌓지 않게(ec1 NotiBell 과 같은 규칙)
    if (fnIs401(e)) await authStore.setStLogout();
    /* 그 외 실패는 조용히 넘긴다(다음 갱신 때 다시) */
  }
}

/* fnLoadNotiList — 팝오버를 열 때 최근 10건 + 안읽음 수 */
async function fnLoadNotiList() {
  notiLoading.value = true;
  notiError.value = "";
  try {
    const [list, unread] = await Promise.all([myNotiSvc.getList(NOTI_LIMIT), myNotiSvc.getUnreadCount()]);
    notiItems.value = list;
    notiUnread.value = Number(unread) || 0;
    notiCheckedAt.value = Date.now();
  } catch (e) {
    if (fnIs401(e)) await authStore.setStLogout();
    else notiError.value = "알림을 불러오지 못했습니다.";
  } finally {
    notiLoading.value = false;
  }
}

function fnIs401(e: unknown): boolean {
  const err = e as { statusCode?: number; response?: { status?: number } };
  return err?.statusCode === 401 || err?.response?.status === 401;
}

/** 알림 시각 — 방금 전 / n분 전 / n시간 전 / n일 전 / 날짜 */
function fmtNotiTime(v?: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v).slice(0, 16).replace("T", " ");
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
</script>
