<template>
  <layout :transparent="true">
    <breadcrumb-area title="아이디 · 비밀번호 찾기" subtitle="아이디 · 비밀번호 찾기" />
    <section class="login-area pt-[16px] md:pt-[100px] pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="mx-auto max-w-[560px]">
          <div class="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-[#f3f4f6] p-1">
            <button v-for="t in TABS" :key="t.key" type="button" class="cursor-pointer rounded-lg border-0 py-3 text-[0.95rem] font-bold transition" :class="tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500'" @click="switchTab(t.key)">{{ t.label }}</button>
          </div>

          <div class="rounded-2xl border border-[#e5e7eb] bg-white p-7">
            <!-- 아이디 찾기 -->
            <template v-if="tab === 'id'">
              <p class="mt-0 text-[0.88rem] text-gray-500">가입한 이메일을 입력하고 이메일 인증을 하면 아이디를 알려드립니다.</p>
              <template v-if="!foundIds.length">
                <label class="lb">가입한 이메일</label>
                <input v-model="idEmail" class="in mb-3" type="text" autocomplete="email" placeholder="가입한 이메일" />
                <email-verify-box purpose-cd="FIND_ACCOUNT" :email="idEmail" title="이메일 인증" @verified="findId" @reset="idVerifyId = ''" />
                <p v-if="busy" class="m-0 mt-2 text-[0.8rem] text-gray-500">아이디를 찾는 중...</p>
              </template>
              <div v-else class="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                <div class="mb-2 text-[0.85rem] font-semibold text-[#15803d]">가입된 아이디</div>
                <ul class="m-0 list-none p-0"><li v-for="i in foundIds" :key="i" class="py-1 font-mono text-[1rem] font-bold text-gray-900">{{ i }}</li></ul>
                <div class="mt-3 flex gap-2"><nuxt-link to="/login" class="btn-sub no-underline">로그인</nuxt-link><button type="button" class="btn-sub" @click="switchTab('pw')">비밀번호 찾기</button></div>
              </div>
            </template>

            <!-- 비밀번호 찾기 -->
            <template v-else>
              <ol class="mb-5 mt-0 flex list-none gap-2 p-0 text-[0.75rem] font-semibold">
                <li v-for="(s, i) in STEPS" :key="s" class="flex-1 rounded-full py-1.5 text-center" :class="step === i + 1 ? 'bg-gray-900 text-white' : step > i + 1 ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#f3f4f6] text-gray-400'">{{ i + 1 }}. {{ s }}</li>
              </ol>

              <template v-if="step === 1">
                <p class="mt-0 text-[0.88rem] text-gray-500">아이디(이메일)를 입력하고 이메일 인증을 하면, 새 비밀번호를 설정할 수 있습니다.</p>
                <label class="lb">아이디(이메일)</label>
                <input v-model="loginId" class="in mb-3" type="text" autocomplete="username" placeholder="가입한 이메일" />
                <email-verify-box purpose-cd="FIND_ACCOUNT" :email="loginId" title="이메일 인증" @verified="requestReset" @reset="pwVerifyId = ''" />
                <p v-if="busy" class="m-0 mt-2 text-[0.8rem] text-gray-500">확인 중...</p>
              </template>

              <template v-else-if="step === 2">
                <p class="mt-0 text-[0.88rem] text-gray-500">이메일 인증이 완료되었습니다. 새 비밀번호를 설정해 주세요.</p>
                <label class="lb">새 비밀번호</label>
                <password-input v-model="pw1" class="in" autocomplete="new-password" />
                <password-rules class="mt-2" :value="pw1" />
                <label class="lb mt-3">새 비밀번호 확인</label>
                <password-input v-model="pw2" class="in" autocomplete="new-password" @keyup.enter="confirm" />
                <field-msg v-if="pw2" class="mt-2" :ok="pw1 === pw2" :text="pw1 === pw2 ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'" />
                <button type="button" class="btn-main mt-4" :disabled="busy" @click="confirm">{{ busy ? "저장 중..." : "비밀번호 초기화" }}</button>
              </template>

              <div v-else class="py-4 text-center">
                <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4] text-[1.5rem] text-[#16a34a]"><i class="fas fa-check"></i></div>
                <p class="m-0 mb-4 font-semibold text-gray-800">비밀번호가 재설정되었습니다.</p>
                <nuxt-link to="/login" class="btn-main inline-block !w-auto px-8 no-underline">로그인하러 가기</nuxt-link>
              </div>
              <p v-if="err" class="m-0 mt-3 whitespace-pre-line text-[0.82rem] text-red-500">{{ err }}</p>
            </template>
            <p v-if="err && tab === 'id'" class="m-0 mt-3 whitespace-pre-line text-[0.82rem] text-red-500">{{ err }}</p>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/ec1/Layout.vue";
import BreadcrumbArea from "~/components/ec1/common/breadcrumb/BreadcrumbArea.vue";
import EmailVerifyBox from "~/components/ec1/fo/EmailVerifyBox.vue";
import { authSvc } from "~/svc/co/auth/authSvc";

useHead({ title: "아이디 · 비밀번호 찾기" });

// 2026-10-02: PASS 본인인증 → 이메일 링크 인증. 비밀번호 찾기는 이메일 인증 한 번으로 본인확인이 끝나므로 "확인번호" 단계가 없다.
const TABS = [{ key: "id", label: "아이디 찾기" }, { key: "pw", label: "비밀번호 찾기" }] as const;
const STEPS = ["이메일 인증", "새 비밀번호"];
const route = useRoute();
const tab = ref<"id" | "pw">(route.query.tab === "pw" ? "pw" : "id");
const busy = ref(false);
const err = ref("");

const idEmail = ref("");
const idVerifyId = ref("");
const foundIds = ref<string[]>([]);
const step = ref(1);
const loginId = ref("");
const pwVerifyId = ref("");
const resetToken = ref("");
import PasswordInput from "~/components/ec1/fo/PasswordInput.vue";
import PasswordRules from "~/components/ec1/fo/PasswordRules.vue";
import FieldMsg from "~/components/ec1/fo/FieldMsg.vue";
import { isPasswordValid, PASSWORD_RULE_MESSAGE } from "~/utils/passwordPolicy";

const pw1 = ref("");
const pw2 = ref("");

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;
function switchTab(k: "id" | "pw") {
  tab.value = k;
  err.value = "";
}

/** 아이디 찾기: 이메일 인증 완료 → 서버가 인증된 이메일로 가입 회원 조회 */
async function findId(verifyId: string) {
  err.value = "";
  idVerifyId.value = verifyId;
  busy.value = true;
  try {
    foundIds.value = (await authSvc.findId(verifyId)).maskedIds;
  } catch (e) {
    err.value = errText(e, "아이디를 찾지 못했습니다.");
  } finally {
    busy.value = false;
  }
}
/** 비밀번호 ①: 아이디 + 이메일 인증 완료 → 1회용 재설정 토큰 */
async function requestReset(verifyId: string) {
  err.value = "";
  pwVerifyId.value = verifyId;
  busy.value = true;
  try {
    resetToken.value = (await authSvc.requestPwReset(loginId.value.trim(), verifyId)).resetToken;
    step.value = 2;
  } catch (e) {
    err.value = errText(e, "본인 확인에 실패했습니다.");
  } finally {
    busy.value = false;
  }
}
/** ②: 새 비밀번호 설정 */
async function confirm() {
  err.value = "";
  if (!isPasswordValid(pw1.value)) return void (err.value = PASSWORD_RULE_MESSAGE);
  if (pw1.value !== pw2.value) return void (err.value = "새 비밀번호가 서로 다릅니다.");
  busy.value = true;
  try {
    await authSvc.confirmPwReset(loginId.value.trim(), resetToken.value, pw1.value);
    step.value = 3;
  } catch (e) {
    err.value = errText(e, "비밀번호를 재설정하지 못했습니다.");
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.lb { display: block; margin-bottom: 4px; font-size: 0.8rem; color: #6b7280; }
.in { width: 100%; height: 44px; padding: 0 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.95rem; outline: none; }
.in:focus { border-color: #bc8246; }
.btn-main { display: block; width: 100%; padding: 13px 16px; border: 0; border-radius: 10px; background: #111827; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer; text-align: center; }
.btn-main:disabled { opacity: 0.55; cursor: default; }
.btn-sub { padding: 8px 16px; border: 1px solid #c9ced6; border-radius: 8px; background: #f3f4f6; color: #374151; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
