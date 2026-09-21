<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- 2026-09-14(요청사항: "로그인 화면에서 큰베너 말고 작은배너로 보여도 될거 같아") —
         404/오류 페이지와 같은 compact(얇은 브레드크럼) 배너로 변경. -->
    <!-- 2026-09-21(요청사항: "로그인도 배너 넣어줘") — 다른 화면처럼 큰 배너(제목 + 경로)를 다시 보여준다. -->
    <breadcrumb-area title="로그인" subtitle="로그인" />
    <section class="login-area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row flex justify-center">
          <div class="col-lg-8 col-12 mx-auto">
            <div class="basic-login">
              <h3 class="text-center mb-6 md:mb-8">로그인</h3>
              <!-- 폼 시작 -->
              <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — vee-validate <Form>/<Field> 를 <fo-form> + yup(useFoValidate)로 교체.
                   입력칸은 fo-form 이 그리고, 그 아래 로그인 유지/버튼/소셜/회원가입 영역은 #actions 슬롯(같은 form 안)에 둔다. -->
              <fo-form :columns="formCols" :form="form" :errors="errors" :cols="1" :gap="20" @submit="handleBtnAction('form-submit')">
                <template #actions>
                <div class="login-action mb-20 fix flex items-center justify-between">
                  <span class="log-rem f-left">
                    <input id="remember" type="checkbox" />
                    <label for="remember">로그인 상태 유지</label>
                  </span>
                  <span class="forgot-login ml-auto">
                    <nuxt-link href="/find-account">아이디 찾기</nuxt-link>
                    <span class="mx-1 text-gray-300">|</span>
                    <nuxt-link href="/find-account?tab=pw">비밀번호 찾기</nuxt-link>
                  </span>
                </div>

                <p v-if="errorMsg" class="text-danger mb-10" style="font-size: 0.85rem">{{ errorMsg }}</p>

                <!-- 2026-09-14(요청사항: "로그인 버튼 흰색이라 잘 안보이는데 개선해줄수 있어?" →
                     "검정색 로그인 버튼으로 변경했네 좀 안이쁘다" → "이 색도 안이뻐 밝은 연두,
                     밝은회색 쪽이 나을거 같아" → 밝은 연두 선택) — os-btn-green 적용. -->
                <button type="submit" class="os-btn os-btn-green w-full" :disabled="loading">
                  {{ loading ? "로그인 중..." : "로그인" }}
                </button>

                <!-- 소셜 로그인 — 2026-09-22(요청사항: "구글/네이버/카카오 로그인 버튼 스타일, 한 줄에, 로고 표시") — 세 버튼을 같은 너비로 한 줄에 놓고 각 서비스 로고를 넣었다.
                     구글은 흰 바탕+테두리(구글 가이드), 네이버·카카오는 브랜드색 바탕. 좁은 폰에서도 한 줄에 들어가도록 글자는 짧게(구글/네이버/카카오). -->
                <div class="social-login mt-6">
                  <div class="mb-2.5 text-center text-[0.78rem] text-gray-400">간편 로그인</div>
                  <div class="grid grid-cols-3 gap-2">
                    <a href="/api/auth/google" aria-label="구글 로그인" title="구글 로그인" class="sl-btn border border-solid border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f8f9fa]">
                      <svg class="h-[18px] w-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>구글</span>
                    </a>
                    <a href="/api/auth/naver" aria-label="네이버 로그인" title="네이버 로그인" class="sl-btn border border-solid border-[#03c75a] bg-[#03c75a] text-white hover:bg-[#02b350]">
                      <svg class="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M16.27 12.85 7.44 0H0v24h7.73V11.15L16.56 24H24V0h-7.73z" /></svg>
                      <span>네이버</span>
                    </a>
                    <a href="/api/auth/kakao" aria-label="카카오 로그인" title="카카오 로그인" class="sl-btn border border-solid border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]">
                      <svg class="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.86 5.32 4.66 6.74-.2.73-.74 2.64-.85 3.05-.13.5.18.5.39.36.16-.11 2.6-1.77 3.65-2.49.7.1 1.42.15 2.15.15 5.52 0 10-3.58 10-8S17.52 3 12 3z" /></svg>
                      <span>카카오</span>
                    </a>
                  </div>
                </div>

                <div class="or-divide"><span>또는</span></div>
                <!-- 2026-09-15(요청사항: "회원가입 버튼 클릭하면 약관동의 페이지 중간에 넣어줘") —
                     /register로 바로 이동하지 않고 이용약관 동의 모달을 먼저 띄운다. -->
                <button type="button" class="os-btn os-btn-black w-full" @click="termsModalRef?.show()">회원가입</button>
                <!-- 2026-09-14(요청사항: "회원가입 아래 회원목록 모달 호출해줘 그 중에서
                     한명 선택하여 로그인되게 해줘 비밀번호 1111 로 보내면 로그인될거야") -->
                <button
                  type="button"
                  class="w-full mt-10 py-3 rounded border-2 border-dashed border-gray-300 text-gray-600 text-sm hover:border-theme hover:text-theme transition"
                  @click="demoLoginModalRef?.show()"
                >
                  테스트 계정으로 로그인
                </button>
                </template>
              </fo-form>
              <!-- 폼 끝 -->
            </div>
          </div>
        </div>
      </div>
    </section>
    <demo-member-login-modal ref="demoLoginModalRef" />
    <terms-agreement-modal ref="termsModalRef" />
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import DemoMemberLoginModal from "~/components/modals/DemoMemberLoginModal.vue";
import TermsAgreementModal from "~/components/modals/TermsAgreementModal.vue";
import { ref } from "vue";
import FoForm from "~/components/fo/FoForm.vue";
import { useFoValidate } from "~/composables/useFoValidate";
import type { FoFormColumn } from "~/types/fo/foCompType";
import * as yup from "yup";
import type { SyLoginFormType } from "~/types/sy/syLoginFormType";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "로그인",
});
usePageTitle("로그인");

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const errorMsg = ref("");
const loading = ref(false);
const demoLoginModalRef = ref<InstanceType<typeof DemoMemberLoginModal> | null>(null);
const termsModalRef = ref<InstanceType<typeof TermsAgreementModal> | null>(null);

// OAuth 콜백 실패 시 쿼리로 전달된 에러 표시
onMounted(() => {
  const err = route.query.error as string;
  if (err === "no_code") errorMsg.value = "인증이 취소되었거나 코드를 받지 못했습니다.";
  else if (err === "token_exchange") errorMsg.value = "토큰 교환에 실패했습니다.";
  else if (err === "user_info") errorMsg.value = "사용자 정보를 가져오지 못했습니다.";
  else if (err === "config") errorMsg.value = "소셜 로그인 설정이 없습니다.";
  else if (err) errorMsg.value = decodeURIComponent(err);
});

const schema = yup.object({
  email: yup.string().required("이메일을 입력해 주세요").email("올바른 이메일 주소를 입력해 주세요").label("이메일"),
  password: yup.string().required("비밀번호를 입력해 주세요").min(6, "비밀번호는 6자 이상이어야 합니다").label("비밀번호"),
});

const form = reactive({ email: "", password: "" });
const formCols: FoFormColumn[] = [
  { key: "email", label: "이메일 주소", type: "text", required: true, placeholder: "이메일 주소...", autocomplete: "username" },
  { key: "password", label: "비밀번호", type: "password", required: true, placeholder: "비밀번호 입력...", autocomplete: "current-password" },
];
const { errors, validate } = useFoValidate(schema, form);

async function onSubmit() {
  if (!(await validate())) return;
  const { email, password } = form as unknown as SyLoginFormType;
  loading.value = true;
  errorMsg.value = "";
  const result = await authStore.login(email, password);
  loading.value = false;
  if (result.ok) {
    form.password = "";
    router.push("/");
  } else {
    errorMsg.value = (result.message ?? "로그인에 실패했습니다.").split("::")[0]!;
  }
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ login.vue : handleBtnAction -> ", cmd, param);
  // 로그인 (검증 → authStore.login)
  if (cmd === "form-submit") {
    return onSubmit();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>

<style scoped>
.sl-btn {
  display: inline-flex;
  height: 46px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s, transform 0.15s, background-color 0.15s;
}
.sl-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  transform: translateY(-1px);
}
</style>
