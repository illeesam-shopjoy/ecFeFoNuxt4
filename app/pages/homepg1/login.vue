<template>
  <!-- 로그인 — 아이디·비밀번호(ecBeBo FoAuth) + 테스트 회원 모달(비밀번호 1111). ?redirect= 로 돌아가고, 이미 로그인돼 있으면 바로 돌아간다.
       2026-10-03(요청사항: "공통적으로 로그인버튼 추가해주고") — 상단 [로그인] 버튼이 여는 화면. 비밀번호 길이는 화면에서 막지 않는다
       (서버의 기본 통과 비밀번호 1111 이 서버까지 가야 한다 — 사용자 규칙 "기본통과비밀번호는 1111"). -->
  <layout>
    <div class="page-wrap">
      <div class="hp-login">
        <!-- 왼쪽: 안내(유리 카드 위 격자 배경) -->
        <section class="hero-section hp-login-intro">
          <div class="hp-login-intro-inner">
            <div class="hero-badge"><span>🔐</span><span>회원 로그인</span></div>
            <h1 class="hp-login-title">{{ HP_SITE.name }}에<br /><span class="gradient-text">오신 것을 환영합니다</span></h1>
            <p class="hp-login-lead">로그인하면 상단 🔔 알림에서 문의 답변·주문 진행 소식을 바로 확인할 수 있어요.</p>
            <ul class="hp-login-points">
              <li><span aria-hidden="true">🔔</span>문의·주문 진행 알림</li>
              <li><span aria-hidden="true">🛡️</span>⚙ 설정의 사이트 정상여부 체크</li>
              <li><span aria-hidden="true">🌙</span>⚙ 설정의 다크 모드</li>
            </ul>
          </div>
        </section>

        <!-- 오른쪽: 로그인 양식 -->
        <form class="card card--static hp-login-card" novalidate @submit.prevent="handleBtnAction('login-submit')">
          <div class="hp-pill hp-pill--blue">로그인</div>
          <h2 class="hp-login-card-title">계정으로 로그인</h2>
          <div class="hp-login-field">
            <label class="form-label" for="hp-login-id">아이디<span class="form-required">*</span></label>
            <input
              id="hp-login-id"
              v-model="form.loginId"
              class="form-input"
              :class="{ 'is-invalid': errors.loginId }"
              placeholder="아이디(이메일)"
              autocomplete="username"
              autocapitalize="off"
              spellcheck="false"
              @input="errors.loginId = ''"
            />
            <div v-if="errors.loginId" class="form-error">{{ errors.loginId }}</div>
          </div>
          <div class="hp-login-field">
            <label class="form-label" for="hp-login-pw">비밀번호<span class="form-required">*</span></label>
            <input id="hp-login-pw" v-model="form.password" type="password" class="form-input" :class="{ 'is-invalid': errors.password }" placeholder="비밀번호" autocomplete="current-password" @input="errors.password = ''" />
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>
          <p v-if="errorMsg" class="hp-login-error" role="alert">⚠️ {{ errorMsg }}</p>
          <button type="submit" class="btn-blue hp-login-submit" :disabled="loading">{{ loading ? "로그인 중…" : "로그인" }}</button>

          <div class="hp-login-or"><span>또는</span></div>
          <button type="button" class="btn-outline hp-login-demo" @click="handleBtnAction('login-demo')">👥 테스트 회원으로 로그인</button>
          <p class="hp-login-foot">둘러보기만 하려면 테스트 회원(비밀번호 <b>1111</b>)으로 로그인해도 돼요.</p>
        </form>
      </div>
    </div>

    <demo-member-login-modal ref="demoRef" :redirect="redirectTo" @logged-in="fnWelcome" />
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/homepg1/Layout.vue";
import DemoMemberLoginModal from "~/components/homepg1/modals/DemoMemberLoginModal.vue";
import { HP_SITE } from "~/conts/tenant/homepg1";
import { hpToast } from "~/layout/homepg1/hpUi";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "로그인" });
const route = useRoute();
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
const fnWelcome = () => hpToast(`${authStore.user?.userNm || "회원"}님, 환영합니다.`, "success");

onMounted(async () => {
  await useAuthReady(); // 새로고침으로 들어오면 로그인 복원을 기다린 뒤 판단
  if (authStore.isStLoggedIn) navigateTo(redirectTo.value, { replace: true });
});
</script>

<style scoped>
.hp-login {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 28px;
  align-items: stretch;
  max-width: 980px;
  margin: 12px auto 24px;
}
.hp-login-intro {
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  align-items: center;
}
.hp-login-intro-inner {
  position: relative;
  padding: 44px 40px;
}
.hp-login-title {
  font-size: clamp(1.6rem, 3.2vw, 2.2rem);
  font-weight: 900;
  line-height: 1.25;
  margin-bottom: 16px;
  color: var(--text-primary);
}
.hp-login-lead {
  font-size: 0.92rem;
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.hp-login-points {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hp-login-points li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-secondary);
  backdrop-filter: blur(8px);
}
.hp-login-card {
  padding: 36px 32px;
  border-radius: 20px;
}
.hp-login-card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 22px;
}
.hp-login-field {
  margin-bottom: 16px;
}
.hp-login-error {
  margin: -4px 0 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(229, 62, 62, 0.08);
  border: 1px solid rgba(229, 62, 62, 0.3);
  color: #e53e3e;
  font-size: 0.8rem;
  line-height: 1.5;
  word-break: keep-all;
}
[data-theme="dark"] .hp-login-error {
  color: #fc8181;
}
.hp-login-submit {
  width: 100%;
  padding: 13px;
  font-size: 0.92rem;
}
.hp-login-or {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 0 16px;
  color: var(--text-muted);
  font-size: 0.75rem;
}
.hp-login-or::before,
.hp-login-or::after {
  content: "";
  flex: 1;
  border-top: 1px solid var(--border);
}
.hp-login-demo {
  width: 100%;
  padding: 12px;
  border-style: dashed;
}
.hp-login-foot {
  margin-top: 14px;
  text-align: center;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--text-muted);
}
.hp-login-foot b {
  color: var(--blue);
}
@media (max-width: 767px) {
  .hp-login {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 0;
  }
  .hp-login-intro-inner {
    padding: 24px 22px;
  }
  .hp-login-points {
    display: none;
  }
  .hp-login-lead {
    margin-bottom: 0;
  }
  .hp-login-card {
    padding: 26px 20px;
  }
}
</style>
