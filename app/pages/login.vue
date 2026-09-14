<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <!-- 2026-09-14(요청사항: "로그인 화면에서 큰베너 말고 작은배너로 보여도 될거 같아") —
         404/오류 페이지와 같은 compact(얇은 브레드크럼) 배너로 변경. -->
    <breadcrumb-area title="로그인" subtitle="로그인" :compact="true" />
    <section class="login-area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row flex justify-center">
          <div class="col-lg-8 col-12 mx-auto">
            <div class="basic-login">
              <h3 class="text-center mb-60">로그인</h3>
              <!-- 폼 시작 -->
              <Form :validation-schema="schema" @submit="onSubmit">
                <div class="mb-20">
                  <label for="email-id">이메일 주소 <span class="required">*</span></label>
                  <Field name="email" id="email-id" type="text" placeholder="이메일 주소..." />
                  <ErrorMessage name="email" class="text-danger" />
                </div>

                <div class="mb-20">
                  <label for="pass">비밀번호 <span class="required">*</span></label>
                  <Field name="password" id="pass" type="password" placeholder="비밀번호 입력..." />
                  <ErrorMessage name="password" class="text-danger" />
                </div>

                <div class="login-action mb-20 fix">
                  <span class="log-rem f-left">
                    <input id="remember" type="checkbox" />
                    <label for="remember">로그인 상태 유지</label>
                  </span>
                  <span class="forgot-login ml-auto">
                    <a href="#">비밀번호를 잊으셨나요?</a>
                  </span>
                </div>

                <p v-if="errorMsg" class="text-danger mb-10" style="font-size: 0.85rem">{{ errorMsg }}</p>

                <!-- 2026-09-14(요청사항: "로그인 버튼 흰색이라 잘 안보이는데 개선해줄수 있어?") —
                     os-btn(테두리만 있는 투명 버튼)만 쓰고 있어 흰 배경에서 거의 안 보였다.
                     아래 회원가입 링크와 같은 os-btn-black(검정 배경)으로 통일. -->
                <button class="os-btn os-btn-black w-full" :disabled="loading">
                  {{ loading ? "로그인 중..." : "로그인" }}
                </button>

                <!-- 소셜 로그인 -->
                <div class="social-login mt-20">
                  <div class="flex flex-wrap gap-2 justify-center">
                    <!-- 2026-09-14(요청사항: "구글 로그인 구글 바탕색상으로 변경해줘") — 네이버/카카오/Apple처럼
                         브랜드 컬러를 배경으로 채움(기존엔 흰 배경이라 유독 밋밋했음). -->
                    <a
                      href="/api/auth/google"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-[#4285F4] hover:bg-[#3367d6] text-white text-sm font-medium transition"
                    >
                      <span class="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4285F4] text-xs font-bold">G</span>
                      구글 로그인
                    </a>
                    <a
                      href="/api/auth/naver"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-[#03C75A] hover:bg-[#02b350] text-white text-sm font-medium transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[#03C75A] bg-white text-[10px] font-bold">N</span>
                      네이버 로그인
                    </a>
                    <a
                      href="/api/auth/kakao"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-[#FEE500] hover:bg-[#f5d900] text-[#191919] text-sm font-medium transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[12px] font-bold">K</span>
                      카카오 로그인
                    </a>
                    <a
                      href="/api/auth/apple"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-800 bg-black hover:bg-gray-800 text-white text-sm font-medium transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-white text-sm">&#63743;</span>
                      Apple 로그인
                    </a>
                  </div>
                </div>

                <div class="or-divide"><span>또는</span></div>
                <nuxt-link href="/register" class="os-btn os-btn-black w-full"> 회원가입 </nuxt-link>
              </Form>
              <!-- 폼 끝 -->
            </div>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { ref } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import type { SyLoginFormType } from "~/types/syLoginFormType";
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

async function onSubmit(
  values: Record<string, unknown>,
  ctx: { resetForm: () => void }
) {
  const { email, password } = values as unknown as SyLoginFormType;
  loading.value = true;
  errorMsg.value = "";
  const result = await authStore.login(email, password);
  loading.value = false;
  if (result.ok) {
    ctx.resetForm();
    router.push("/");
  } else {
    errorMsg.value = result.message ?? "로그인에 실패했습니다.";
  }
}
</script>
