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
              <fo-form :columns="formCols" :form="form" :errors="errors" :cols="1" :gap="20" @submit="handleBtnAction('form-submit')">
                <template #actions>
                <!-- 프로필 이미지 · 수신 동의(휴대폰/카카오/SMS/이메일/광고) — 모두 선택 -->
                <profile-img-upload v-model="profileImgUrl" class="mb-15" />
                <recv-consent-row v-model="consent" class="mb-15" />
                <!-- PASS 본인인증 여부 — 가입 전에 인증하면 가입 회원정보에 "인증 완료"로 저장된다(선택). 서버가 가입 시 한 번 더 확인한다. -->
                <div class="mb-10 rounded-lg border px-3 py-2.5 text-[0.85rem]" :class="idv ? 'border-[#bbf7d0] bg-[#f0fdf4]' : 'border-[#fde68a] bg-[#fffbeb]'">
                  <div class="flex items-center gap-2">
                    <i class="fas" :class="idv ? 'fa-check-circle text-[#16a34a]' : 'fa-mobile-alt text-[#d97706]'"></i>
                    <span class="font-semibold text-gray-800">PASS 본인인증</span>
                    <span v-if="idv" class="text-[#15803d]">인증 완료 · {{ maskName(idv.name) }} · {{ maskPhone(idv.phoneNumber) }}</span>
                    <span v-else class="text-gray-500">미인증 (선택)</span>
                    <button v-if="!idv" type="button" class="ml-auto cursor-pointer rounded-md border-0 bg-[#111] px-3 py-1.5 text-[0.8rem] font-bold text-white disabled:opacity-60" :disabled="passBusy" @click="handleBtnAction('pass-verify')">{{ passBusy ? "인증 중..." : "PASS 인증하기" }}</button>
                    <button v-else type="button" class="ml-auto cursor-pointer border-0 bg-transparent p-0 text-[0.78rem] text-gray-500 underline" @click="idv = null">다시 인증</button>
                  </div>
                </div>
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
import type { FoFormColumn } from "~/types/fo/foCompType";
import * as yup from "yup";
import type { MbRegisterFormType } from "~/types/mb/mbRegisterFormType";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";
import ProfileImgUpload from "~/components/my/ProfileImgUpload.vue";
import RecvConsentRow from "~/components/my/RecvConsentRow.vue";
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";
import { maskName, maskPhone, usePassIdentity } from "~/composables/usePassIdentity";
import type { MbIdentityVerifyType } from "~/types/mb/mbIdentityVerifyType";

import { usePageTitle } from "~/composables/usePageTitle";
useHead({
  title: "회원가입",
});
usePageTitle("회원가입");

const authStore = useAuthStore();
const router = useRouter();
const errorMsg = ref("");
const loading = ref(false);
const profileImgUrl = ref("");
const consent = ref<MbRecvConsentType>({ recvPhoneYn: "N", recvKakaoYn: "N", recvSmsYn: "N", recvEmailYn: "N", recvAdYn: "N" });

// PASS 본인인증(선택) — 인증하면 이름을 인증된 실명으로 채우고, 가입 요청에 인증 건 ID 를 함께 보낸다(서버가 재확인해 "인증 완료"로 저장)
const pass = usePassIdentity();
const passBusy = pass.busy;
const idv = ref<MbIdentityVerifyType | null>(null);
async function runPass() {
  const v = await pass.start();
  if (!v) return;
  idv.value = v;
  form.name = v.name;
}

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
  const result = await authStore.register(name, email, password, idv.value?.identityVerificationId, { profileImgUrl: profileImgUrl.value, ...consent.value });
  loading.value = false;
  if (result.ok) {
    Object.assign(form, { name: "", email: "", password: "" });
    idv.value = null;
    profileImgUrl.value = "";
    consent.value = { recvPhoneYn: "N", recvKakaoYn: "N", recvSmsYn: "N", recvEmailYn: "N", recvAdYn: "N" };
    await useAlert().openAlert("가입이 완료되었습니다. 로그인해 주세요.");
    router.push("/login");
  } else {
    errorMsg.value = (result.message ?? "회원가입에 실패했습니다.").split("::")[0]!;
  }
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ register.vue : handleBtnAction -> ", cmd, param);
  // 회원가입 (검증 → authStore.register)
  if (cmd === "form-submit") {
    return onSubmit();
  } else if (cmd === "pass-verify") {
    return runPass();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
