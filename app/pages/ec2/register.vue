<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="회원가입" subtitle="회원가입" />
    <section class="login-area pt-[16px] md:pt-[100px] pb-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="row flex justify-center">
          <div class="col-lg-8 col-12 mx-auto">
            <div class="basic-login">
              <h3 class="text-center mb-6 md:mb-8">회원가입</h3>
              <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — vee-validate <Form>/<Field> 를 <fo-form> + yup(useFoValidate)로 교체 -->
              <fo-form :columns="formCols" :form="form" :errors="errors" :cols="1" :gap="20" @submit="handleBtnAction('form-submit')">
                <template #passwordRules>
                  <password-rules class="-mt-3.5" :value="form.password" />
                </template>
                <template #password2Msg>
                  <field-msg v-if="form.password2" class="-mt-3.5" :ok="form.password2 === form.password" :text="form.password2 === form.password ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'" />
                </template>
                <template #actions>
                <!-- 프로필 이미지 · 수신 동의(휴대폰/카카오/SMS/이메일/광고) — 모두 선택 -->
                <profile-img-upload v-model="profileImgUrl" class="mb-15" />
                <recv-consent-row v-model="consent" class="mb-15" />
                <!-- 이메일 인증(2026-10-02, PASS 대체) — 가입 이메일로 링크를 보내 인증한다(선택, 판매자로도 가입하면 필수). 서버가 가입 시 한 번 더 확인한다. -->
                <email-verify-box class="mb-10" purpose-cd="JOIN" :email="form.email" title="이메일 인증" :idle-text="sellerApply ? '미인증 (판매자 가입은 필수)' : '미인증 (선택)'" @verified="(id: string) => (emailVerifyId = id)" @reset="emailVerifyId = ''" />

                <!-- 판매자 신청(선택) — 체크 시 유형/판매자명을 추가로 받아 가입 요청에 함께 보낸다(가입과 동시에 PENDING 신청) -->
                <label class="mb-10 flex cursor-pointer items-center gap-2 text-[0.85rem] text-gray-700">
                  <input type="checkbox" class="!my-0 !ml-0 !mr-2 !h-4 !w-4 shrink-0 !border-0 !p-0 accent-[#bc8246]" v-model="sellerApply" />
                  판매자로도 가입하기 (판매자 신청)
                </label>
                <div v-if="sellerApply" class="mb-10 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-3">
                  <span class="mb-1 block text-[0.78rem] text-gray-500">판매자 유형</span>
                  <div class="mb-3 flex gap-2">
                    <label class="m-0 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-[1.5px] px-3 py-2 text-[0.85rem] font-semibold" :class="sellerTypeCd === 'INDIVIDUAL' ? 'border-gray-900 bg-gray-900 text-white' : 'border-[#e5e7eb] bg-white text-gray-600'">
                      <input v-model="sellerTypeCd" type="radio" name="seller-type-cd" value="INDIVIDUAL" class="sr-only" />개인
                    </label>
                    <label class="m-0 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-[1.5px] px-3 py-2 text-[0.85rem] font-semibold" :class="sellerTypeCd === 'COMPANY' ? 'border-gray-900 bg-gray-900 text-white' : 'border-[#e5e7eb] bg-white text-gray-600'">
                      <input v-model="sellerTypeCd" type="radio" name="seller-type-cd" value="COMPANY" class="sr-only" />업체
                    </label>
                  </div>
                  <label class="mb-1 block text-[0.78rem] text-gray-500" for="seller-nm">판매자명<span class="text-theme ml-0.5">*</span></label>
                  <input id="seller-nm" v-model="sellerNm" class="w-full rounded-lg border-[1.5px] border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[0.88rem] text-gray-900 outline-none focus:border-[#bc8246]" placeholder="판매자명(상호명) 입력" maxlength="60" />
                  <span class="mb-1 mt-3 block text-[0.78rem] text-gray-500">신청 서류 (사업자등록증·신분증 사본 등)<span class="text-theme ml-0.5">*</span></span>
                  <attach-uploader v-model="sellerAttach" title="신청 서류" :show-grp="false" grp-code="SELLER_DOC" :max-count="5" :accept="DOC_ACCEPT" />
                  <p class="mb-0 mt-1.5 text-[0.75rem] leading-snug text-gray-400">판매자는 이메일 인증과 서류 첨부가 필요하며, 관리자 검토 후 승인됩니다.</p>
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
import Layout from "~/layout/ec2/Layout.vue";
import BreadcrumbArea from "~/components/ec2/common/breadcrumb/BreadcrumbArea.vue";
import { ref } from "vue";
import FoForm from "~/components/ec2/fo/FoForm.vue";
import { useFoValidate } from "~/composables/useFoValidate";
import type { FoFormColumn } from "~/types/fo/foCompType";
import * as yup from "yup";
import type { MbRegisterFormType } from "~/types/mb/mbRegisterFormType";
import { useAuthStore } from "~/store/useAuthStore";
import { useRouter } from "vue-router";
import ProfileImgUpload from "~/components/ec2/my/ProfileImgUpload.vue";
import RecvConsentRow from "~/components/ec2/my/RecvConsentRow.vue";
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";
import { defaultRecvConsent, isRequiredRecvOk, REQUIRED_RECV_MESSAGE } from "~/utils/recvConsent";
import EmailVerifyBox from "~/components/ec2/fo/EmailVerifyBox.vue";
import AttachUploader from "~/components/ec2/ui/AttachUploader.vue";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

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
const consent = ref<MbRecvConsentType>(defaultRecvConsent()); // 필수(주문/문의)는 휴대폰·이메일 초기 체크

// 판매자로도 가입하기(선택) — 체크 시 sellerNm 필수, sellerTypeCd 는 기본 INDIVIDUAL. 2026-09-30
const sellerApply = ref(false);
const sellerTypeCd = ref<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
const sellerNm = ref("");

// 이메일 링크 인증(선택, 판매자 가입은 필수) — 인증을 마치면 verifyId 를 가입 요청에 함께 보낸다(서버가 1회 소비하며 가입 이메일과 같은지 확인)
const emailVerifyId = ref("");
// 판매자 신청 서류 — AttachUploader 변경목록({attachId,rowStatus:'I'}), 판매자 가입이면 1건 이상 필수
const sellerAttach = ref<SyAttachChangeType[]>([]);
const DOC_ACCEPT = ["jpg", "jpeg", "png", "pdf", "docx", "xlsx", "zip"];

import PasswordRules from "~/components/ec2/fo/PasswordRules.vue";
import FieldMsg from "~/components/ec2/fo/FieldMsg.vue";
import { isPasswordValid, PASSWORD_RULE_MESSAGE } from "~/utils/passwordPolicy";

const schema = yup.object({
  name: yup.string().required("이름을 입력해 주세요").label("이름"),
  email: yup.string().required("이메일을 입력해 주세요").email("올바른 이메일 주소를 입력해 주세요").label("이메일"),
  password: yup.string().required("비밀번호를 입력해 주세요").test("pw-policy", PASSWORD_RULE_MESSAGE, (v) => isPasswordValid(v ?? "")).label("비밀번호"),
  password2: yup.string().required("비밀번호를 한 번 더 입력해 주세요").oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다").label("비밀번호 확인"),
});

const form = reactive({ name: "", email: "", password: "", password2: "" });
const formCols: FoFormColumn[] = [
  { key: "name", label: "사용자명", type: "text", required: true, placeholder: "사용자명 입력", autocomplete: "name" },
  { key: "email", label: "이메일 주소", type: "text", required: true, placeholder: "이메일 주소...", autocomplete: "username" },
  { key: "password", label: "비밀번호", type: "password", required: true, placeholder: "비밀번호 입력...", autocomplete: "new-password" },
  { key: "passwordRules", type: "slot" },
  { key: "password2", label: "비밀번호 확인", type: "password", required: true, placeholder: "비밀번호 재입력...", autocomplete: "new-password" },
  { key: "password2Msg", type: "slot" },
];
const { errors, validate } = useFoValidate(schema, form);

async function onSubmit() {
  if (!(await validate())) return;
  if (!isRequiredRecvOk(consent.value)) {
    errorMsg.value = REQUIRED_RECV_MESSAGE;
    return;
  }
  if (sellerApply.value && !sellerNm.value.trim()) {
    errorMsg.value = "판매자명을 입력해 주세요.";
    return;
  }
  if (sellerApply.value && !emailVerifyId.value) {
    errorMsg.value = "판매자로 가입하려면 이메일 인증을 완료해 주세요.";
    return;
  }
  if (sellerApply.value && !sellerAttach.value.some((f) => f.rowStatus === "I")) {
    errorMsg.value = "판매자 신청 서류를 1개 이상 첨부해 주세요.";
    return;
  }
  const { name, email, password } = form as unknown as MbRegisterFormType;
  loading.value = true;
  errorMsg.value = "";
  const sellerExtra: Record<string, unknown> = sellerApply.value ? { sellerNm: sellerNm.value.trim(), sellerTypeCd: sellerTypeCd.value, sellerAttachFiles: sellerAttach.value } : {};
  const result = await authStore.register(name, email, password, emailVerifyId.value || undefined, { profileImgUrl: profileImgUrl.value, ...consent.value, ...sellerExtra });
  loading.value = false;
  if (result.ok) {
    Object.assign(form, { name: "", email: "", password: "", password2: "" });
    emailVerifyId.value = "";
    sellerAttach.value = [];
    profileImgUrl.value = "";
    consent.value = defaultRecvConsent();
    sellerApply.value = false;
    sellerTypeCd.value = "INDIVIDUAL";
    sellerNm.value = "";
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
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>
