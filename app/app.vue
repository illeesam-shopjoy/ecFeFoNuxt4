<template>
  <!-- 2026-10-03: 개발 전용 표시(운영 빌드에는 그리지 않는다) — 사이트·모듈·실행모드. 사이트·모듈을 누르면 아래에 바꾸는 칸 + [변경]:
       사이트는 로그아웃 후 새로고침(쿠키, plugins/0.devSite.ts), 모듈은 빌드마다 고정이라 그 모듈의 개발 주소로 이동.
       (사용자 요청: "개발에서는 상단에 siteId, module 값 표시해줘 … 클릭하면 항목하단에 수정 후 변경 버튼 … 변경하면 강제 로그아웃 … 개발에서만")
       2026-10-04(사용자 "상단 [DEV] 바가 공간 차지 — 왼쪽 상단에 쬐그만하게 버튼처럼, [DEV] >> 누르면 글씨 보이는 정도까지만 펼치고 << 로 줄이기"):
       화면 흐름 밖(fixed) 왼쪽 위 작은 버튼. 접힘 "DEV »", 펼침 "DEV 사이트 … 모듈 … 실행모드 … «"(글자 폭만큼). 펼침 여부는 이 브라우저에 기억(localStorage).
       사이트를 바꿔 보는 중이면 접혀 있어도 빨간 점. -->
  <div v-if="devBarOn" class="devbar" :class="{ 'devbar--override': tenant.siteOverridden }" role="region" aria-label="개발 정보">
    <div class="devbar__row">
      <button type="button" class="devbar__tag" :aria-expanded="devBar.expanded" :title="devBar.expanded ? '접기' : `펼치기 — 사이트 ${tenant.siteId} · 모듈 ${tenant.moduleId} · 실행모드 ${runModeLabel}`" @click="handleDevBar('expand')">
        DEV<span v-if="tenant.siteOverridden" class="devbar__dot" aria-hidden="true"></span><span v-if="!devBar.expanded" class="devbar__chev" aria-hidden="true">»</span>
      </button>
      <template v-if="devBar.expanded">
        <button type="button" class="devbar__item" :aria-expanded="devBar.open" title="사이트 바꿔 보기" @click="handleDevBar('toggle')">
          사이트 <b>{{ tenant.siteId }}</b>
          <span v-if="tenant.siteOverridden" class="devbar__warn">변경됨 · 빌드 {{ tenant.buildSiteId }}</span>
          <span aria-hidden="true">▾</span>
        </button>
        <button type="button" class="devbar__item" :aria-expanded="devBar.open" title="모듈 바꾸기 — 그 모듈의 개발 주소로 이동" @click="handleDevBar('toggle')">
          모듈 <b>{{ tenant.moduleId }}</b> <span aria-hidden="true">▾</span>
        </button>
        <span class="devbar__item devbar__item--static" :title="`환경파일 ${envNm}`">실행모드 <b>{{ runModeLabel }}</b></span>
        <button type="button" class="devbar__fold" title="접기" aria-label="개발 정보 접기" @click="handleDevBar('expand')">«</button>
      </template>
    </div>
    <div v-if="devBar.expanded && devBar.open" class="devbar__panel">
      <label class="devbar__field">
        <span>사이트</span>
        <select v-if="devBar.sites.length" v-model="devBar.site" class="devbar__input">
          <option v-for="s in devBar.sites" :key="s.siteId" :value="s.siteId">{{ s.siteId }} · {{ s.siteNm }}{{ s.tenantModule ? ` (${s.tenantModule})` : " (모듈 없음)" }}</option>
        </select>
        <input v-else v-model="devBar.site" class="devbar__input" placeholder="SI260001" maxlength="21" />
      </label>
      <label class="devbar__field">
        <span>모듈</span>
        <select v-model="devBar.module" class="devbar__input">
          <option v-for="m in devModules" :key="m" :value="m">{{ m }}{{ DEV_MODULE_PORTS[m] ? ` (:${DEV_MODULE_PORTS[m]})` : "" }}</option>
        </select>
      </label>
      <button type="button" class="devbar__btn devbar__btn--primary" :disabled="!devBarChanged" @click="handleDevBar('apply')">변경</button>
      <button v-if="tenant.siteOverridden" type="button" class="devbar__btn" @click="handleDevBar('reset')">빌드 값으로</button>
      <button type="button" class="devbar__btn" @click="handleDevBar('close')">닫기</button>
      <p class="devbar__hint">
        사이트를 바꾸면 로그아웃한 뒤 새로고침합니다(이 브라우저에만 적용, 쿠키). 고른 사이트의 모듈이 이 빌드와 다르면 로고 옆에 (X)가 뜹니다.
        모듈은 빌드마다 고정이라 바꾸면 그 모듈의 개발 주소로 이동합니다.
      </p>
    </div>
  </div>
  <NuxtPage />
  <!-- 전역 확인/알림 다이얼로그 (useConfirm / useAlert) -->
  <ConfirmModal
    :open="confirmState.open"
    :title="confirmState.title"
    :message="confirmState.message"
    :confirm-text="confirmState.confirmText"
    :cancel-text="confirmState.cancelText"
    :variant="confirmState.variant"
    @confirm="confirmHandleConfirm"
    @cancel="confirmHandleCancel"
  />
  <AlertModal
    :open="alertState.open"
    :title="alertState.title"
    :message="alertState.message"
    :confirm-text="alertState.confirmText"
    :variant="alertState.variant"
    :details="alertState.details"
    @close="alertHandleClose"
  />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
// 확인/알림 창도 모듈마다 모양이 다르다 — 이 빌드의 모듈 것(app/components/<모듈>)을 쓴다
import ConfirmModal from "#tenant-components/modals/ConfirmModal.vue";
import AlertModal from "#tenant-components/modals/AlertModal.vue";
import { coSySiteSvc } from "~/svc/co/sy/coSySiteSvc";
import type { SySiteType } from "~/types/sy/sySiteType";
import { DEV_MODULE_PORTS, DEV_SITE_COOKIE_PREFIX, DEV_SITE_ID_RE, isProdRunMode } from "~/utils/devSite";

const { public: { appTitle, mode, envNm } } = useRuntimeConfig();

const { state: confirmState, openConfirm, handleConfirm: confirmHandleConfirm, handleCancel: confirmHandleCancel } = useConfirm();
const { state: alertState, openAlert, handleClose: alertHandleClose } = useAlert();
useHead({
  titleTemplate: (title) => title ? `${title} | ${appTitle}` : appTitle,
});
import { useCartStore } from "~/store/useCartStore";
import { useAuthStore } from "~/store/useAuthStore";

const cartStore = useCartStore();
const authStore = useAuthStore();

onMounted(async () => {
  // 장바구니 복원 (localStorage)
  void cartStore.loadStCartProducts;

  // 토큰 로드 후 사용자 정보 조회
  authStore.loadStToken();
  await authStore.loadStAuthInfo();
});

// ── 개발 전용 상단 표시줄 (2026-10-03) ──────────────────────────────
const tenant = useTenant();
const devBarOn = !isProdRunMode(mode);
/** 실행모드 표시 — HeaderLogo 와 같은 규칙(production/prod → prod, development/dev → dev) */
const runModeLabel = (() => {
  const m = String(mode ?? "");
  if (m === "production" || m === "prod") return "prod";
  if (m === "development" || m === "dev") return "dev";
  return m || "prod";
})();
/** 펼침 여부 저장 키(이 브라우저에만) — 기본은 접힘 */
const DEV_BAR_OPEN_KEY = "modu-dev-bar-open";
const devBar = reactive({ expanded: false, open: false, site: tenant.siteId, module: tenant.moduleId, sites: [] as SySiteType[] });
onMounted(() => {
  if (!devBarOn) return;
  try {
    devBar.expanded = localStorage.getItem(DEV_BAR_OPEN_KEY) === "Y";
  } catch {
    /* 저장소를 못 쓰면 접힌 채로 */
  }
});
/** 모듈 목록 — 개발 배포가 있는 모듈 + 사이트에 등록된 모듈 */
const devModules = computed(() => {
  const set = new Set<string>([tenant.moduleId, ...Object.keys(DEV_MODULE_PORTS)]);
  devBar.sites.forEach((s) => {
    if (s.tenantModule) set.add(String(s.tenantModule));
  });
  return [...set];
});
const devBarChanged = computed(() => devBar.site.trim() !== tenant.siteId || devBar.module !== tenant.moduleId);

/** handleDevBar — 표시 동작: 펼치기/접기 · 바꾸는 칸 열기/닫기 · 변경(사이트=로그아웃+새로고침, 모듈=그 모듈 개발 주소로 이동) · 빌드 값으로 */
async function handleDevBar(cmd: "expand" | "toggle" | "close" | "apply" | "reset") {
  if (cmd === "expand") {
    devBar.expanded = !devBar.expanded;
    if (!devBar.expanded) devBar.open = false;
    try {
      localStorage.setItem(DEV_BAR_OPEN_KEY, devBar.expanded ? "Y" : "N");
    } catch {
      /* 저장소를 못 써도 이번 화면에서는 동작 */
    }
    return;
  }
  if (cmd === "toggle" || cmd === "close") {
    devBar.open = cmd === "toggle" ? !devBar.open : false;
    if (devBar.open) {
      devBar.site = tenant.siteId;
      devBar.module = tenant.moduleId;
      if (!devBar.sites.length) {
        try {
          devBar.sites = await coSySiteSvc.getActiveSites();
        } catch (e) {
          console.warn("[개발 표시줄] 사이트 목록을 불러오지 못했습니다 — 사이트 ID 를 직접 입력하세요:", e);
        }
      }
    }
    return;
  }
  const site = cmd === "reset" ? tenant.buildSiteId : devBar.site.trim();
  if (!DEV_SITE_ID_RE.test(site)) {
    await openAlert({ title: "사이트 바꿔 보기", message: `사이트 ID 모양이 아닙니다: ${site || "(빈 값)"}`, variant: "warning" });
    return;
  }
  // 모듈을 바꿨으면 그 모듈의 개발 주소로 — 모듈은 빌드마다 고정이라 이 화면에서는 바꿀 수 없다
  if (cmd === "apply" && devBar.module !== tenant.moduleId) {
    const port = DEV_MODULE_PORTS[devBar.module];
    const onDevPorts = Object.values(DEV_MODULE_PORTS).includes(Number(window.location.port));
    if (!port || !onDevPorts) {
      await openAlert({
        title: "모듈 바꾸기",
        message: `모듈은 빌드마다 고정입니다.\n이 주소에서는 ${devBar.module} 모듈로 바꿀 수 없습니다 — 로컬은 "npm run local:${devBar.module}" 로 따로 실행하세요.`,
        variant: "warning",
      });
      return;
    }
    const ok = await openConfirm({ title: "모듈 바꾸기", message: `${devBar.module} 모듈의 개발 주소(:${port})로 이동합니다.\n이 화면에서는 로그아웃합니다.`, confirmText: "이동", cancelText: "취소" });
    if (!ok) return;
    await authStore.setStLogout();
    window.location.href = `${window.location.protocol}//${window.location.hostname}:${port}/?devSite=${encodeURIComponent(site)}`;
    return;
  }
  const ok = await openConfirm({
    title: "사이트 바꿔 보기",
    message: cmd === "reset" ? `빌드 사이트(${site})로 되돌립니다.\n로그아웃한 뒤 화면을 새로 불러옵니다.` : `사이트를 ${site} 로 바꿉니다.\n로그아웃한 뒤 화면을 새로 불러옵니다.`,
    confirmText: "변경",
    cancelText: "취소",
  });
  if (!ok) return;
  await authStore.setStLogout(); // 사용자 요청: 사이트를 바꾸면 강제 로그아웃(다른 사이트 회원 토큰으로 요청하면 백엔드가 403)
  const name = DEV_SITE_COOKIE_PREFIX + tenant.moduleId;
  document.cookie = site === tenant.buildSiteId
    ? `${name}=; path=/; max-age=0; samesite=lax`
    : `${name}=${encodeURIComponent(site)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  window.location.reload();
}

// 2026-09-13 버그수정: "블로그 상세 페이지에서 category-tree/sy/code가 조회되면 안 되는데"
// — useCodeStore(공통코드 1200개+, /api/co/sy/code)를 여기서 무조건 로드했었는데 실제로
// 이 값을 쓰는 화면이 어디에도 없다(useCodeStore를 import하는 곳이 app.vue 자신뿐이었음).
// 페이지 성격과 무관하게 앱이 뜰 때마다 무거운 호출이 나가 자택 NAS 백엔드 부하만 키우고
// 있었던 것 — 제거. 나중에 실제로 공통코드가 필요한 화면이 생기면 그 화면에서
// useCodeStore().loadStCodes()를 직접 호출할 것(전역 강제 로드 X).
</script>

<style scoped>
/* 개발 전용 표시 — 화면 흐름 밖(fixed) 왼쪽 위 작은 버튼(2026-10-04). 모듈 스타일과 섞이지 않게 값을 모두 직접 준다(글꼴·버튼 초기화 포함) */
.devbar {
  position: fixed;
  top: 4px;
  left: 4px;
  z-index: 10000;
  max-width: calc(100vw - 8px);
  background: rgba(31, 41, 55, 0.92);
  color: #e5e7eb;
  font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}
.devbar--override {
  border-color: #f87171;
}
.devbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 6px;
  padding: 2px;
}
.devbar__tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin: 0;
  padding: 1px 6px;
  border: 0;
  border-radius: 4px;
  background: #f59e0b;
  color: #1f2937;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.devbar__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #dc2626;
}
.devbar__chev {
  font-weight: 800;
}
.devbar__fold {
  margin: 0;
  padding: 1px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #fbbf24;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}
.devbar__fold:hover {
  background: #374151;
}
.devbar__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 1px 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.devbar__item:hover {
  border-color: #4b5563;
}
.devbar__item--static {
  cursor: default;
}
.devbar__item--static:hover {
  border-color: transparent;
}
.devbar__item b {
  color: #fbbf24;
}
.devbar__warn {
  color: #fca5a5;
}
.devbar__panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: min(560px, calc(100vw - 16px));
  padding: 8px 10px 10px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}
.devbar__field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.devbar__input {
  height: 24px;
  min-width: 120px;
  max-width: 340px;
  padding: 0 6px;
  border: 1px solid #4b5563;
  border-radius: 4px;
  background: #111827;
  color: #f9fafb;
  font: inherit;
}
.devbar__btn {
  height: 24px;
  margin: 0;
  padding: 0 10px;
  border: 1px solid #4b5563;
  border-radius: 4px;
  background: #374151;
  color: #f9fafb;
  font: inherit;
  cursor: pointer;
}
.devbar__btn--primary {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #1f2937;
  font-weight: 700;
}
.devbar__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.devbar__hint {
  flex-basis: 100%;
  margin: 0;
  color: #9ca3af;
}
</style>
