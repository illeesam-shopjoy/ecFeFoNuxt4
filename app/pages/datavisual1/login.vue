<template>
  <!-- 로그인 — 아이디·비밀번호(ecBeBo FoAuth) + 테스트 회원 모달(비밀번호 1111). ?redirect= 로 돌아가고, 이미 로그인돼 있으면 바로 돌아간다.
       2026-10-03(요청사항: "공통적으로 로그인버튼 추가해주고") — 상단 [로그인] 버튼이 여는 화면. 비밀번호 길이는 화면에서 막지 않는다
       (서버의 기본 통과 비밀번호 1111 이 서버까지 가야 한다 — 사용자 규칙 "기본통과비밀번호는 1111"). -->
  <layout>
    <div class="page-wrap">
      <div class="dv-login">
        <!-- 왼쪽: 대시보드 느낌의 안내 패널(지표 카드 + 장식용 추이선) -->
        <section class="card dv-login-side">
          <div class="dv-login-brand">
            <div class="dv-logo-mark" aria-hidden="true">📊</div>
            <div>
              <div class="dv-logo-name">DataVisual</div>
              <div class="dv-logo-sub">DASHBOARD</div>
            </div>
            <span class="rt-badge dv-login-live"><span class="rt-dot"></span>{{ tenant.siteId }}</span>
          </div>
          <h1 class="dv-login-title">로그인하고<br /><span class="gradient-text">알림을 받아 보세요</span></h1>
          <p class="section-subtitle">상단 🔔 알림에서 최근 소식을 확인하고, ⚙ 설정에서 사이트 정상여부 체크·다크 모드를 바꿀 수 있어요.</p>
          <div class="dv-login-kpis">
            <div class="dv-login-kpi"><span aria-hidden="true">🔔</span><b>알림</b><small>최근 10건</small></div>
            <div class="dv-login-kpi"><span aria-hidden="true">🛡️</span><b>사이트 체크</b><small>⚙ 설정</small></div>
            <div class="dv-login-kpi"><span aria-hidden="true">🌙</span><b>테마</b><small>다크·라이트</small></div>
          </div>
          <svg class="dv-login-spark" viewBox="0 0 320 64" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="dv-login-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style="stop-color: var(--blue); stop-opacity: 0.35" />
                <stop offset="100%" style="stop-color: var(--blue); stop-opacity: 0" />
              </linearGradient>
            </defs>
            <path d="M0 50 L32 44 L64 47 L96 34 L128 38 L160 24 L192 29 L224 16 L256 21 L288 9 L320 13 L320 64 L0 64 Z" fill="url(#dv-login-spark-fill)" />
            <polyline points="0,50 32,44 64,47 96,34 128,38 160,24 192,29 224,16 256,21 288,9 320,13" fill="none" style="stroke: var(--blue)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          </svg>
        </section>

        <!-- 오른쪽: 로그인 양식 -->
        <form class="card dv-login-card" novalidate @submit.prevent="handleBtnAction('login-submit')">
          <h2 class="dv-login-card-title">🔐 로그인</h2>
          <p class="dv-login-card-sub">아이디와 비밀번호를 입력하세요</p>
          <div class="dv-login-field">
            <label class="form-label" for="dv-login-id">아이디</label>
            <input
              id="dv-login-id"
              v-model="form.loginId"
              class="form-input"
              :class="{ 'is-invalid': errors.loginId }"
              placeholder="아이디(이메일)"
              autocomplete="username"
              autocapitalize="off"
              spellcheck="false"
              @input="errors.loginId = ''"
            />
            <div v-if="errors.loginId" class="dv-login-field-err">{{ errors.loginId }}</div>
          </div>
          <div class="dv-login-field">
            <label class="form-label" for="dv-login-pw">비밀번호</label>
            <input id="dv-login-pw" v-model="form.password" type="password" class="form-input" :class="{ 'is-invalid': errors.password }" placeholder="비밀번호" autocomplete="current-password" @input="errors.password = ''" />
            <div v-if="errors.password" class="dv-login-field-err">{{ errors.password }}</div>
          </div>
          <p v-if="errorMsg" class="dv-login-error" role="alert">⚠️ {{ errorMsg }}</p>
          <button type="submit" class="btn-primary dv-login-submit" :disabled="loading">{{ loading ? "로그인 중…" : "로그인" }}</button>

          <div class="dv-login-or"><span>또는</span></div>
          <button type="button" class="btn-outline dv-login-demo" @click="handleBtnAction('login-demo')">👥 테스트 회원으로 로그인</button>
          <p class="dv-login-foot">둘러보기만 하려면 테스트 회원(비밀번호 <b>1111</b>)으로 로그인해도 돼요.</p>
        </form>
      </div>
    </div>

    <demo-member-login-modal ref="demoRef" :redirect="redirectTo" @logged-in="fnWelcome" />
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/datavisual1/Layout.vue";
import DemoMemberLoginModal from "~/components/datavisual1/modals/DemoMemberLoginModal.vue";
import { dvToast } from "~/layout/datavisual1/dvUi";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "로그인" });
const route = useRoute();
const tenant = useTenant();
const authStore = useAuthStore();
const demoRef = ref<InstanceType<typeof DemoMemberLoginModal> | null>(null);
const form = reactive({ loginId: "", password: "" });
const errors = reactive({ loginId: "", password: "" });
const errorMsg = ref("");
const loading = ref(false);
/** 로그인 후 돌아갈 곳(?redirect=) — 사이트 밖 주소·로그인 화면 자신은 받지 않는다 */
const redirectTo = computed(() => {
  const r = String(route.query.redirect ?? "/");
  return r.startsWith("/") && !r.startsWith("//") && !r.startsWith("/login") ? r : "/";
});

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "login-submit") {
    if (loading.value) return;
    errorMsg.value = "";
    // 빈 값만 막는다 — 비밀번호 길이·형식은 서버가 판단(기본 통과 비밀번호 1111)
    errors.loginId = form.loginId.trim() ? "" : "아이디를 입력해 주세요.";
    errors.password = form.password ? "" : "비밀번호를 입력해 주세요.";
    if (errors.loginId || errors.password) return;
    loading.value = true;
    try {
      const r = await authStore.login(form.loginId.trim(), form.password);
      if (!r.ok) return (errorMsg.value = r.message ?? "로그인에 실패했습니다.");
      form.password = "";
      fnWelcome();
      return navigateTo(redirectTo.value, { replace: true });
    } finally {
      loading.value = false;
    }
  }
  if (cmd === "login-demo") return demoRef.value?.show();
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnWelcome — 로그인 인사 토스트(테스트 회원 모달은 스스로 redirect 로 이동하므로 여기선 토스트만) */
const fnWelcome = () => dvToast(`${authStore.user?.userNm || "회원"}님, 환영합니다.`);

onMounted(async () => {
  await useAuthReady(); // 새로고침으로 들어오면 로그인 복원을 기다린 뒤 판단
  if (authStore.isStLoggedIn) navigateTo(redirectTo.value, { replace: true });
});
</script>

<style scoped>
.dv-login {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 16px;
  max-width: 940px;
  margin: 16px auto 8px;
}
.dv-login-side {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 26px 26px 0;
  background:
    radial-gradient(ellipse 70% 60% at 100% 0%, var(--blue-dim) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 0% 100%, var(--purple-dim) 0%, transparent 70%),
    var(--bg-card);
}
.dv-login-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 26px;
}
.dv-login-live {
  margin-left: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.dv-login-title {
  font-size: clamp(1.4rem, 2.6vw, 1.85rem);
  font-weight: 900;
  line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.dv-login-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 22px;
}
.dv-login-kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-base);
}
.dv-login-kpi span {
  font-size: 1.1rem;
  margin-bottom: 4px;
}
.dv-login-kpi b {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-primary);
}
.dv-login-kpi small {
  font-size: 0.68rem;
  color: var(--text-muted);
}
.dv-login-spark {
  display: block;
  width: calc(100% + 52px);
  height: 64px;
  margin: 22px -26px 0;
}
.dv-login-card {
  padding: 28px 26px;
  background: var(--bg-modal);
}
.dv-login-card-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: var(--text-primary);
}
.dv-login-card-sub {
  margin: 4px 0 20px;
  font-size: 0.8rem;
  color: var(--text-muted);
}
.dv-login-field {
  margin-bottom: 14px;
}
.dv-login-field .form-input {
  height: 40px;
}
.dv-login-field .form-input.is-invalid {
  border-color: var(--red);
}
.dv-login-field-err {
  margin-top: 4px;
  font-size: 0.72rem;
  color: var(--red);
}
.dv-login-error {
  margin: -2px 0 12px;
  padding: 9px 12px;
  border-radius: 8px;
  background: var(--red-dim);
  border: 1px solid var(--red);
  color: var(--red);
  font-size: 0.78rem;
  line-height: 1.5;
}
.dv-login-submit {
  width: 100%;
  justify-content: center;
  padding: 11px 18px;
  font-size: 0.88rem;
}
.dv-login-or {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
  font-size: 0.72rem;
  color: var(--text-muted);
}
.dv-login-or::before,
.dv-login-or::after {
  content: "";
  flex: 1;
  border-top: 1px solid var(--border);
}
.dv-login-demo {
  width: 100%;
  justify-content: center;
  padding: 10px 14px;
  border-style: dashed;
}
.dv-login-foot {
  margin-top: 12px;
  text-align: center;
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--text-muted);
}
.dv-login-foot b {
  color: var(--blue);
}
@media (max-width: 767px) {
  .dv-login {
    grid-template-columns: 1fr;
    margin-top: 0;
  }
  .dv-login-kpis,
  .dv-login-spark {
    display: none;
  }
  .dv-login-side {
    padding-bottom: 22px;
  }
}
</style>
