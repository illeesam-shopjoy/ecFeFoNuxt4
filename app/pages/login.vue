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
              <h3 class="text-center mb-60">로그인</h3>
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

                <!-- 소셜 로그인 -->
                <div class="social-login mt-20">
                  <div class="flex flex-wrap gap-2 justify-center">
                    <!-- 2026-09-14(요청사항: "구글 로그인 구글 바탕색상으로 변경해줘" →
                         "모든 버튼이 스타일이 딱딱한데 약간의 그라데이션을 주든해서 이쁘면 좋겠어") —
                         평면 bg-[색상]을 대각선 그라데이션 + 그림자로 교체. -->
                    <a
                      href="/api/auth/google"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-br from-[#5a9cf8] to-[#4285F4] hover:from-[#4285F4] hover:to-[#3367d6] text-white text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      <span class="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4285F4] text-xs font-bold">G</span>
                      구글 로그인
                    </a>
                    <a
                      href="/api/auth/naver"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-br from-[#2ed769] to-[#03C75A] hover:from-[#03C75A] hover:to-[#02b350] text-white text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[#03C75A] bg-white text-[10px] font-bold">N</span>
                      네이버 로그인
                    </a>
                    <a
                      href="/api/auth/kakao"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-br from-[#FFEB6E] to-[#FEE500] hover:from-[#FEE500] hover:to-[#f5d900] text-[#191919] text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[12px] font-bold">K</span>
                      카카오 로그인
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
