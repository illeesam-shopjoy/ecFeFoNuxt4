<template>
  <!-- 로그인 — 이메일/비밀번호(ecBeBo FoAuth) + 테스트 계정 모달. 회원가입은 danmoo1 에 아직 없다(ShopJoy 가입 계정·시드 계정으로 로그인) -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="로그인" :back="false" close fallback="/" /></template>

    <div class="px-5 pt-10 pb-8 max-w-[420px] mx-auto">
      <div class="text-center mb-8">
        <span class="inline-flex w-16 h-16 rounded-2xl bg-[var(--dm-primary)] text-white items-center justify-center text-[30px] font-black">d</span>
        <h1 class="text-[22px] font-extrabold mt-4">{{ tenant.name }}</h1>
        <p class="muted text-[14px] mt-1">{{ tenant.tagline }} · {{ town }}</p>
      </div>

      <form class="space-y-3" @submit.prevent="handleBtnAction('login-submit')">
        <input v-model="form.email" type="email" class="input" placeholder="이메일" autocomplete="username" required />
        <input v-model="form.password" type="password" class="input" placeholder="비밀번호" autocomplete="current-password" required />
        <p v-if="errorMsg" class="text-danger text-[13px]">{{ errorMsg }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="loading">{{ loading ? "로그인 중…" : "로그인" }}</button>
      </form>

      <div class="flex items-center gap-3 my-6 text-[12px] muted"><span class="flex-1 line"></span>또는<span class="flex-1 line"></span></div>
      <button type="button" class="btn-soft w-full border border-dashed border-[var(--dm-text-3)] !bg-transparent" @click="handleBtnAction('login-demo')"><i class="far fa-user-friends"></i>테스트 계정으로 로그인</button>
      <nuxt-link :to="{ path: '/signup', query: route.query }" class="btn-soft w-full mt-2"><i class="far fa-user-plus"></i>이메일로 회원가입</nuxt-link>
      <p class="muted text-[12.5px] text-center mt-6">둘러보기만 하려면 테스트 계정(비밀번호 1111)으로 로그인해도 돼요.</p>
    </div>

    <client-only><demo-member-login-modal ref="demoRef" @logged-in="fnAfterLogin" /></client-only>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DemoMemberLoginModal from "~/components/danmoo1/modals/DemoMemberLoginModal.vue";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "로그인" });
const route = useRoute();
const authStore = useAuthStore();
const tenant = useTenant();
const { town } = useDmTown();
const demoRef = ref<InstanceType<typeof DemoMemberLoginModal> | null>(null);
const form = reactive({ email: "", password: "" });
const errorMsg = ref("");
const loading = ref(false);
// 로그인 후 돌아갈 곳(?redirect=) — 외부 주소는 받지 않는다
const redirectTo = computed(() => {
  const r = String(route.query.redirect ?? "/");
  return r.startsWith("/") && !r.startsWith("//") ? r : "/";
});

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "login-submit") {
    errorMsg.value = "";
    loading.value = true;
    try {
      const r = await authStore.login(form.email.trim(), form.password);
      if (!r.ok) return (errorMsg.value = r.message ?? "로그인에 실패했어요.");
      return fnAfterLogin();
    } finally {
      loading.value = false;
    }
  }
  if (cmd === "login-demo") return demoRef.value?.show();
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnAfterLogin — 돌아갈 주소로(이력 교체) */
const fnAfterLogin = () => navigateTo(redirectTo.value, { replace: true });

onMounted(async () => {
  await useAuthReady();
  if (authStore.isStLoggedIn) fnAfterLogin();
});
</script>
