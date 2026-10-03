<template>
  <!-- 회원가입 — 이름·이메일·비밀번호(정책 검사)·약관 동의. 가입 사이트는 이 배포의 사이트(X-Site-Id, body.siteId). 가입 후 바로 로그인해 돌아갈 곳으로 -->
  <layout :tabs="false">
    <template #top><dm-title-bar title="회원가입" fallback="/login" /></template>

    <form class="px-5 pt-6 pb-10 max-w-[420px] mx-auto space-y-4" @submit.prevent="handleBtnAction('signup-submit')">
      <p class="text-[14px] muted">{{ town }} 이웃이 되어 보세요. 이메일로 가입하면 바로 시작할 수 있어요.</p>
      <div>
        <label class="block text-[13px] font-bold mb-1">이름(닉네임)</label>
        <input v-model="form.name" class="input" placeholder="이웃에게 보일 이름" maxlength="50" autocomplete="nickname" />
      </div>
      <div>
        <label class="block text-[13px] font-bold mb-1">이메일</label>
        <input v-model="form.email" type="email" class="input" placeholder="로그인에 쓸 이메일" autocomplete="username" />
      </div>
      <div>
        <label class="block text-[13px] font-bold mb-1">비밀번호</label>
        <input v-model="form.password" type="password" class="input" placeholder="8자 이상, 대·소문자·숫자·특수문자" autocomplete="new-password" />
        <ul class="flex flex-wrap gap-1.5 mt-2">
          <li v-for="r in pwRules" :key="r.label" class="text-[11.5px] px-2 py-0.5 rounded-full" :class="r.ok ? 'bg-[#e6f6ec] text-[#2f9e44]' : 'bg-[var(--dm-chip)] muted'"><i :class="r.ok ? 'fas fa-check' : 'far fa-circle'" class="mr-1"></i>{{ r.label }}</li>
        </ul>
      </div>
      <div>
        <label class="block text-[13px] font-bold mb-1">비밀번호 확인</label>
        <input v-model="form.password2" type="password" class="input" placeholder="한 번 더 입력" autocomplete="new-password" />
        <p v-if="form.password2 && form.password2 !== form.password" class="text-danger text-[12.5px] mt-1">비밀번호가 일치하지 않아요.</p>
      </div>
      <div class="rounded-xl bg-[var(--dm-bg-soft)] p-4 space-y-2.5 text-[14px]">
        <label class="flex items-center gap-2 font-bold"><input v-model="agreeAll" type="checkbox" class="w-4 h-4 accent-[var(--dm-primary)]" />전체 동의</label>
        <label class="flex items-center gap-2"><input v-model="agree.terms" type="checkbox" class="w-4 h-4 accent-[var(--dm-primary)]" />[필수] 이용약관 동의</label>
        <label class="flex items-center gap-2"><input v-model="agree.privacy" type="checkbox" class="w-4 h-4 accent-[var(--dm-primary)]" />[필수] 개인정보 수집·이용 동의</label>
        <label class="flex items-center gap-2"><input v-model="agree.marketing" type="checkbox" class="w-4 h-4 accent-[var(--dm-primary)]" />[선택] 혜택·소식 알림 받기</label>
      </div>
      <p v-if="errorMsg" class="text-danger text-[13.5px]">{{ errorMsg }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="!canSubmit || loading">{{ loading ? "가입 중…" : "가입하고 시작하기" }}</button>
      <p class="muted text-[12.5px] text-center">이미 계정이 있나요? <nuxt-link :to="{ path: '/login', query: route.query }" class="primary font-bold">로그인</nuxt-link></p>
    </form>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { checkPassword, isPasswordValid } from "~/utils/passwordPolicy";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "회원가입" });
const route = useRoute();
const authStore = useAuthStore();
const tenant = useTenant();
const { town } = useDmTown();
const { openAlert } = useAlert();
const form = reactive({ name: "", email: "", password: "", password2: "" });
const agree = reactive({ terms: false, privacy: false, marketing: false });
const errorMsg = ref("");
const loading = ref(false);
const pwRules = computed(() => checkPassword(form.password));
const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()));
const canSubmit = computed(() => form.name.trim().length > 0 && emailOk.value && isPasswordValid(form.password) && form.password === form.password2 && agree.terms && agree.privacy);
const agreeAll = computed({
  get: () => agree.terms && agree.privacy && agree.marketing,
  set: (v: boolean) => { agree.terms = agree.privacy = agree.marketing = v; },
});
// 로그인 후 돌아갈 곳(?redirect=) — 외부 주소는 받지 않는다
const redirectTo = computed(() => {
  const r = String(route.query.redirect ?? "/");
  return r.startsWith("/") && !r.startsWith("//") ? r : "/";
});

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "signup-submit") {
    if (!canSubmit.value || loading.value) return;
    errorMsg.value = "";
    loading.value = true;
    try {
      const name = form.name.trim();
      const email = form.email.trim();
      // 가입 사이트 = 이 배포의 사이트(sy_site.site_id). 마케팅 동의는 recvAdYn 로
      const r = await authStore.register(name, email, form.password, undefined, { siteId: tenant.siteId, recvAdYn: agree.marketing ? "Y" : "N", recvEmailYn: agree.marketing ? "Y" : "N" });
      if (!r.ok) return (errorMsg.value = r.message ?? "가입에 실패했어요.");
      const l = await authStore.login(email, form.password);
      if (!l.ok) {
        await openAlert({ title: "가입 완료", message: "가입이 완료됐어요. 로그인해 주세요.", variant: "success" });
        return navigateTo({ path: "/login", query: { redirect: redirectTo.value } }, { replace: true });
      }
      await openAlert({ title: "환영해요!", message: `${name}님, ${town.value} 이웃이 되신 걸 환영해요.`, variant: "success" });
      return navigateTo(redirectTo.value, { replace: true });
    } finally {
      loading.value = false;
    }
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

onMounted(async () => {
  await useAuthReady();
  if (authStore.isStLoggedIn) navigateTo(redirectTo.value, { replace: true });
});
</script>
