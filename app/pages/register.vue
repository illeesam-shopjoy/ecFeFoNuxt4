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
              <Form :validation-schema="schema" @submit="onSubmit">
                <div class="mb-20">
                  <label for="name">사용자명 <span>**</span></label>
                  <Field name="name" id="name" type="text" placeholder="사용자명 입력" />
                  <ErrorMessage name="name" class="text-danger" />
                </div>

                <div class="mb-20">
                  <label for="email-id">이메일 주소 <span>**</span></label>
                  <Field name="email" id="email-id" type="text" placeholder="이메일 주소..." />
                  <ErrorMessage name="email" class="text-danger" />
                </div>

                <div class="mb-20">
                  <label for="pass">비밀번호 <span>**</span></label>
                  <Field name="password" id="pass" type="password" placeholder="비밀번호 입력..." />
                  <ErrorMessage name="password" class="text-danger" />
                </div>

                <p v-if="errorMsg" class="text-danger mb-10" style="font-size: 0.85rem">{{ errorMsg }}</p>

                <div class="mt-10"></div>
                <button type="submit" class="os-btn w-full" :disabled="loading">{{ loading ? "가입 중..." : "회원가입" }}</button>
                <div class="or-divide"><span>또는</span></div>
                <nuxt-link href="/login" class="os-btn os-btn-black w-full">로그인</nuxt-link>
              </Form>
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

async function onSubmit(values: MbRegisterFormType, { resetForm }: { resetForm: () => void }) {
  const { name, email, password } = values;
  loading.value = true;
  errorMsg.value = "";
  const result = await authStore.register(name, email, password);
  loading.value = false;
  if (result.ok) {
    resetForm();
    await useAlert().openAlert("가입이 완료되었습니다. 로그인해 주세요.");
    router.push("/login");
  } else {
    errorMsg.value = result.message ?? "회원가입에 실패했습니다.";
  }
}
</script>
