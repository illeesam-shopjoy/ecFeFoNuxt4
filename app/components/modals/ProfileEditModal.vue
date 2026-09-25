<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" @click.self="handleBtnAction('modal-close')">
      <div class="relative w-full max-w-[440px] md:max-w-[680px] max-h-[88vh] overflow-y-auto rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <button type="button" class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer" aria-label="닫기" @click="handleBtnAction('modal-close')">
          <i class="fal fa-times"></i>
        </button>

        <div class="-mx-7 -mt-7 mb-5 rounded-t-2xl border-b border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-7 pb-4 pt-6">
          <h3 id="profile-edit-title" class="text-[1.2rem] font-extrabold text-gray-900 m-0"><i class="fas fa-pen text-theme mr-2 text-base"></i>프로필 수정</h3>
          <div class="text-[0.8rem] text-gray-400 mt-1">회원 정보를 수정하세요</div>
        </div>

        <profile-img-upload v-if="!loading" v-model="f.profileImgUrl" class="mb-4" />
        <div v-if="loading" class="py-10 text-center text-gray-400 text-[0.9rem]">불러오는 중...</div>
        <!-- 2026-09-19(요청사항: "FoGrid FoForm 적극적으로 사용") — 입력칸을 <fo-form> 으로 교체(주소/성별은 슬롯) -->
        <fo-form v-else :columns="formCols" :form="f" :cols="2" :gap="12" min-col-width="140px" @submit="handleBtnAction('form-save')">
          <template #addr="{ form }">
            <span class="block text-[0.78rem] text-gray-500 mb-1">주소</span>
            <div class="flex gap-2 mb-1.5">
              <input v-model="form.memberZipCode" class="pf-input !w-[110px] shrink-0 bg-[#f9fafb] cursor-default" placeholder="우편번호" readonly />
              <button type="button" class="px-3.5 border-[1.5px] border-theme rounded-lg bg-[#fdf6ee] text-theme text-[0.82rem] font-bold cursor-pointer whitespace-nowrap" @click="handleBtnAction('addr-search')">
                <i class="fas fa-search mr-1"></i>주소 검색
              </button>
            </div>
            <input v-model="form.memberAddr" class="pf-input bg-[#f9fafb] cursor-default mb-1.5" placeholder="도로명 주소" readonly />
            <input v-model="form.memberAddrDetail" class="pf-input" placeholder="상세 주소 (동/호수 등)" maxlength="100" />
          </template>

          <!-- 본인인증(PASS) — 휴대폰 아래 -->
          <template #pass>
            <pass-verify-row :verified="f.passVerifiedYn === 'Y'" :verified-date="f.passVerifiedDate" @verified="onPassVerified" />
          </template>

          <template #gender="{ form }">
            <span class="block text-[0.78rem] text-gray-500 mb-1">성별</span>
            <div class="flex gap-1.5">
              <button
                v-for="g in genders"
                :key="g.v"
                type="button"
                class="flex-1 py-2.5 px-0.5 rounded-lg text-[0.78rem] font-semibold cursor-pointer border-[1.5px]"
                :class="form.memberGender === g.v ? 'bg-gray-900 text-white border-gray-900' : 'bg-[#f9fafb] text-gray-500 border-[#e5e7eb]'"
                @click="form.memberGender = g.v"
              >
                {{ g.l }}
              </button>
            </div>
          </template>
        </fo-form>
        <recv-consent-row v-if="!loading" v-model="consent" class="mt-4" />
        <!-- 소셜 계정 연동 — 수신 동의 아래 -->
        <sns-link-row v-if="!loading" class="mt-4" />

        <!-- 맨 아래: 오류 + [취소][저장] -->
        <div v-if="!loading" class="mt-5">
          <div v-if="errorMsg" class="mb-2 rounded-md bg-red-50 px-3 py-2 text-[0.82rem] text-red-500">{{ errorMsg }}</div>
          <div class="flex gap-2.5">
            <button type="button" class="mbtn mbtn-ghost flex-1" @click="handleBtnAction('modal-close')">취소</button>
            <button type="button" class="mbtn mbtn-primary flex-[2]" :disabled="!f.memberNm.trim() || saving" @click="handleBtnAction('form-save')">
              {{ saving ? "저장 중..." : "저장" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  <!-- 카카오(다음) 우편번호 검색 — 자체 Teleport 모달 -->
  <addr-search-modal ref="addrRef" @select="onAddr" />
</template>

<script setup lang="ts">
/**
 * 프로필 수정 모달 (2026-09-19, ecFeBo foAppHeader 의 Profile 모달 이식).
 * ecFeBo 는 화면 상태만 바꿨지만 여기서는 실제로 ecBeBo(PUT /api/fo/ec/my/info)에 저장한다.
 * 열릴 때 내 정보를 새로 조회해 채우고, 저장 성공 시 로그인 스토어의 이름/휴대폰(헤더 표시값)도 갱신한다.
 */
import { reactive, ref, watch } from "vue";
import AddrSearchModal from "~/components/modals/AddrSearchModal.vue";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";
import FoForm from "~/components/fo/FoForm.vue";
import type { FoFormColumn } from "~/types/fo/foCompType";
import PassVerifyRow from "~/components/my/PassVerifyRow.vue";
import SnsLinkRow from "~/components/my/SnsLinkRow.vue";
import { isRequiredRecvOk, REQUIRED_RECV_MESSAGE, withAdSummary, withRequiredDefault } from "~/utils/recvConsent";
import ProfileImgUpload from "~/components/my/ProfileImgUpload.vue";
import RecvConsentRow from "~/components/my/RecvConsentRow.vue";
import type { MbMemberProfileType } from "~/types/mb/mbMemberProfileType";
import type { MbRecvConsentType } from "~/types/mb/mbRecvConsentType";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import { useAuthStore } from "~/store/useAuthStore";

// 2026-09-19: 기존 ProfileEditModal(저장 기능이 없는 껍데기 ProfileEditForm 을 감싸던 모달)을 실제 저장되는 모달로 교체 —
// 기존 사용처(pages/account.vue 의 profileEditModalRef.value.show())가 그대로 동작하도록 show()/close() 노출 방식은 유지한다.
const emit = defineEmits<{ (e: "saved"): void }>();
const visible = ref(false);

const authStore = useAuthStore();
const addrRef = ref<InstanceType<typeof AddrSearchModal> | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");
const genders = [
  { v: "M", l: "남" },
  { v: "F", l: "여" },
  { v: "", l: "미정" },
];
const f = reactive({
  loginId: "",
  memberNm: "",
  memberEmail: "",
  memberPhone: "",
  memberGender: "",
  birthDate: "",
  passVerifiedYn: "N",
  passVerifiedDate: "",
  profileImgUrl: "",
  recvPhoneYn: "N",
  recvKakaoYn: "N",
  recvSmsYn: "N",
  recvEmailYn: "N",
  recvAdYn: "N",
  recvMktKakaoYn: "N",
  recvMktSmsYn: "N",
  recvMktEmailYn: "N",
  recvAdKakaoYn: "N",
  recvAdSmsYn: "N",
  recvAdEmailYn: "N",
  memberZipCode: "",
  memberAddr: "",
  memberAddrDetail: "",
});

// 수신 동의(체크박스 묶음) — f 의 recv*Yn 과 양방향으로 맞춘다
const consent = computed<MbRecvConsentType>({
  get: () => ({ recvPhoneYn: f.recvPhoneYn, recvKakaoYn: f.recvKakaoYn, recvSmsYn: f.recvSmsYn, recvEmailYn: f.recvEmailYn, recvMktKakaoYn: f.recvMktKakaoYn, recvMktSmsYn: f.recvMktSmsYn, recvMktEmailYn: f.recvMktEmailYn, recvAdKakaoYn: f.recvAdKakaoYn, recvAdSmsYn: f.recvAdSmsYn, recvAdEmailYn: f.recvAdEmailYn, recvAdYn: f.recvAdYn }),
  set: (v) => Object.assign(f, v),
});

const formCols: FoFormColumn[] = [
  { key: "memberNm", label: "이름", type: "text", required: true, placeholder: "이름", maxlength: 50, colSpan: 2 },
  { key: "memberEmail", label: "이메일", type: "readonly", colSpan: 2, fmt: (v, form) => String(v || form.loginId || "-") },
  { key: "memberPhone", label: "휴대폰", type: "tel", placeholder: "010-0000-0000", maxlength: 20, colSpan: 2 },
  { key: "pass", type: "slot", colSpan: 2 },
  { key: "addr", type: "slot", colSpan: 2 },
  { key: "birthDate", label: "생년월일", type: "date" },
  { key: "gender", type: "slot" },
];

function onPassVerified(profile: MbMemberProfileType) {
  f.passVerifiedYn = profile.passVerifiedYn ?? "Y";
  f.passVerifiedDate = String(profile.passVerifiedDate ?? "");
  emit("saved");
}

function errMsg(e: unknown, fallback: string): string {
  const x = e as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string };
  return (x?.data?.statusMessage || x?.data?.message || x?.statusMessage || fallback).split("::")[0]!; // 서버 내부 표기("::클래스::메서드:줄") 제거
}

watch(
  visible,
  async (v) => {
    if (!v) return;
    errorMsg.value = "";
    loading.value = true;
    try {
      Object.assign(f, await myInfoSvc.getProfile());
      Object.assign(f, withRequiredDefault(consent.value)); // 필수(주문/문의)를 정한 적 없으면 휴대폰·이메일 초기 체크
    } catch (e) {
      errorMsg.value = errMsg(e, "회원 정보를 불러오지 못했습니다.");
    } finally {
      loading.value = false;
    }
  }
);

function onAddr(r: SyAddrSearchResultType) {
  f.memberZipCode = r.zonecode;
  f.memberAddr = r.address;
}

function show() {
  visible.value = true;
}
function close() {
  visible.value = false;
}
defineExpose({ show, close });

async function save() {
  if (!f.memberNm.trim() || saving.value) return;
  if (!isRequiredRecvOk(consent.value)) {
    errorMsg.value = REQUIRED_RECV_MESSAGE;
    return;
  }
  saving.value = true;
  errorMsg.value = "";
  try {
    const saved = await myInfoSvc.updateProfile({
      memberNm: f.memberNm,
      memberPhone: f.memberPhone,
      memberGender: f.memberGender,
      birthDate: f.birthDate,
      memberZipCode: f.memberZipCode,
      memberAddr: f.memberAddr,
      memberAddrDetail: f.memberAddrDetail,
      profileImgUrl: f.profileImgUrl,
      recvPhoneYn: f.recvPhoneYn,
      recvKakaoYn: f.recvKakaoYn,
      recvSmsYn: f.recvSmsYn,
      recvEmailYn: f.recvEmailYn,
      recvAdYn: withAdSummary(consent.value).recvAdYn,
      recvMktKakaoYn: f.recvMktKakaoYn,
      recvMktSmsYn: f.recvMktSmsYn,
      recvMktEmailYn: f.recvMktEmailYn,
      recvAdKakaoYn: f.recvAdKakaoYn,
      recvAdSmsYn: f.recvAdSmsYn,
      recvAdEmailYn: f.recvAdEmailYn,
    });
    // 헤더/드롭다운에 보이는 이름·휴대폰을 즉시 반영(localStorage 캐시 프로필도 함께 갱신)
    if (authStore.token && authStore.user) authStore.setSession(authStore.token, { ...authStore.user, userNm: saved.memberNm, userPhone: saved.memberPhone });
    useNuxtApp().$toast.success("프로필이 저장되었습니다.");
    emit("saved");
    close();
  } catch (e) {
    errorMsg.value = errMsg(e, "프로필 저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ ProfileEditModal.vue : handleBtnAction -> ", cmd, param);
  // 프로필 저장
  if (cmd === "form-save") {
    return save();
  // 모달 닫기
  } else if (cmd === "modal-close") {
    return close();
  // 주소 검색 모달 열기
  } else if (cmd === "addr-search") {
    addrRef.value?.show();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};
</script>

<style scoped>
.pf-input {
  width: 100%;
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #111827;
  font-size: 0.88rem;
  outline: none;
}
.pf-input:focus {
  border-color: #bc8246;
}
</style>
