<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="회원가입" subtitle="회원가입" />
    <section class="login-area pt-100 pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row flex justify-center">
          <div class="col-lg-8 col-12 mx-auto">
            <div class="basic-login">
              <h3 class="text-center mb-60">회원가입</h3>
              <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — vee-validate <Form>/<Field> 를 <fo-form> + yup(useFoValidate)로 교체 -->
              <fo-form :columns="formCols" :form="form" :errors="errors" :cols="1" :gap="20" @submit="onSubmit">
                <template #actions>
                <p v-if="errorMsg" class="text-danger mb-10" style="font-size: 0.85rem">{{ errorMsg }}</p>

                <div class="mt-10"></div>
                <!-- 2026-09-14(요청사항: "회원가입 버튼 흰색이라 잘 안보이는데 개선해줄수 있어?" →
                     "검정색 로그인 버튼으로 변경했네 좀 안이쁘다" → "이 색도 안이뻐 밝은 연두,
                     밝은회색 쪽이 나을거 같아" → 밝은 연두 선택) — os-btn-green 적용. -->
                <button type="submit" class="os-btn os-btn-green w-full" :disabled="loading">{{ loading ? "가입 중..." : "회원가입" }}</button>

                <!-- 소셜 회원가입 — 소셜 로그인과 동일 엔드포인트(최초 로그인 시 자동 가입) -->
                <div class="social-login mt-20">
                  <div class="flex flex-wrap gap-2 justify-center">
                    <a
                      href="/api/auth/google"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-br from-[#5a9cf8] to-[#4285F4] hover:from-[#4285F4] hover:to-[#3367d6] text-white text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      <span class="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4285F4] text-xs font-bold">G</span>
                      구글로 시작하기
                    </a>
                    <a
                      href="/api/auth/naver"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-br from-[#2ed769] to-[#03C75A] hover:from-[#03C75A] hover:to-[#02b350] text-white text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[#03C75A] bg-white text-[10px] font-bold">N</span>
                      네이버로 시작하기
                    </a>
                    <a
                      href="/api/auth/kakao"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-gradient-to-br from-[#FFEB6E] to-[#FEE500] hover:from-[#FEE500] hover:to-[#f5d900] text-[#191919] text-sm font-medium shadow-sm hover:shadow-md transition"
                    >
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[12px] font-bold">K</span>
                      카카오로 시작하기
                    </a>
                  </div>
                </div>

                <div class="or-divide"><span>또는</span></div>
                <nuxt-link href="/login" class="os-btn os-btn-black w-full">로그인</nuxt-link>
                </template>
              </fo-form>
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
import FoForm from "~/components/fo/FoForm.vue";
import { useFoValidate } from "~/composables/useFoValidate";
import type { FoFormColumn } from "~/types/foCompType";
import * as yup from "yup";
import type { MbRegisterFormType } from "~/types/mbRegisterFormType";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "회원가입",
});
usePageTitle("회원가입");

const authStore = useAuthStore();
const router = useRouter();
const errorMsg = ref("");
const loading = ref(false);

const schema = yup.object({
  name: yup.string().required("이름을 입력해 주세요").label("이름"),
  email: yup.string().required("이메일을 입력해 주세요").email("올바른 이메일 주소를 입력해 주세요").label("이메일"),
  password: yup.string().required("비밀번호를 입력해 주세요").min(6, "비밀번호는 6자 이상이어야 합니다").label("비밀번호"),
});

const form = reactive({ name: "", email: "", password: "" });
const formCols: FoFormColumn[] = [
  { key: "name", label: "사용자명", type: "text", required: true, placeholder: "사용자명 입력", autocomplete: "name" },
  { key: "email", label: "이메일 주소", type: "text", required: true, placeholder: "이메일 주소...", autocomplete: "username" },
  { key: "password", label: "비밀번호", type: "password", required: true, placeholder: "비밀번호 입력...", autocomplete: "new-password" },
];
const { errors, validate } = useFoValidate(schema, form);

async function onSubmit() {
  if (!(await validate())) return;
  const { name, email, password } = form as unknown as MbRegisterFormType;
  loading.value = true;
  errorMsg.value = "";
  const result = await authStore.register(name, email, password);
  loading.value = false;
  if (result.ok) {
    Object.assign(form, { name: "", email: "", password: "" });
    await useAlert().openAlert("가입이 완료되었습니다. 로그인해 주세요.");
    router.push("/login");
  } else {
    errorMsg.value = result.message ?? "회원가입에 실패했습니다.";
  }
}
</script>
