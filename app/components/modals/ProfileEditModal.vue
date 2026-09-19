<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" @click.self="close">
      <div class="relative w-full max-w-[440px] max-h-[88vh] overflow-y-auto rounded-xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <button type="button" class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 bg-transparent border-0 cursor-pointer" aria-label="닫기" @click="close">
          <i class="fal fa-times"></i>
        </button>

        <div class="mb-5">
          <h3 id="profile-edit-title" class="text-[1.2rem] font-extrabold text-gray-900 m-0"><i class="fas fa-pen text-theme mr-2 text-base"></i>프로필 수정</h3>
          <div class="text-[0.8rem] text-gray-400 mt-1">회원 정보를 수정하세요</div>
        </div>

        <div v-if="loading" class="py-10 text-center text-gray-400 text-[0.9rem]">불러오는 중...</div>
        <form v-else class="flex flex-col gap-3" @submit.prevent="save">
          <label class="block">
            <span class="block text-[0.78rem] text-gray-400 mb-1">이름 <span class="text-theme">*</span></span>
            <input v-model="f.memberNm" class="pf-input" placeholder="이름" maxlength="50" />
          </label>
          <label class="block">
            <span class="block text-[0.78rem] text-gray-400 mb-1">이메일</span>
            <input :value="f.memberEmail || f.loginId" class="pf-input bg-[#f9fafb] cursor-default" readonly />
          </label>
          <label class="block">
            <span class="block text-[0.78rem] text-gray-400 mb-1">휴대폰</span>
            <input v-model="f.memberPhone" class="pf-input" placeholder="010-0000-0000" maxlength="20" inputmode="tel" />
          </label>

          <div>
            <span class="block text-[0.78rem] text-gray-400 mb-1">주소</span>
            <div class="flex gap-2 mb-1.5">
              <input v-model="f.memberZipCode" class="pf-input !w-[110px] shrink-0 bg-[#f9fafb] cursor-default" placeholder="우편번호" readonly />
              <button type="button" class="px-3.5 border-[1.5px] border-theme rounded-lg bg-[#fdf6ee] text-theme text-[0.82rem] font-bold cursor-pointer whitespace-nowrap" @click="addrRef?.show()">
                <i class="fas fa-search mr-1"></i>주소 검색
              </button>
            </div>
            <input v-model="f.memberAddr" class="pf-input bg-[#f9fafb] cursor-default mb-1.5" placeholder="도로명 주소" readonly />
            <input v-model="f.memberAddrDetail" class="pf-input" placeholder="상세 주소 (동/호수 등)" maxlength="100" />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <label class="block">
              <span class="block text-[0.78rem] text-gray-400 mb-1">생년월일</span>
              <input v-model="f.birthDate" type="date" class="pf-input" />
            </label>
            <div>
              <span class="block text-[0.78rem] text-gray-400 mb-1">성별</span>
              <div class="flex gap-1.5">
                <button
                  v-for="g in genders"
                  :key="g.v"
                  type="button"
                  class="flex-1 py-2.5 px-0.5 rounded-lg text-[0.78rem] font-semibold cursor-pointer border-[1.5px]"
                  :class="f.memberGender === g.v ? 'bg-gray-900 text-white border-gray-900' : 'bg-[#f9fafb] text-gray-500 border-[#e5e7eb]'"
                  @click="f.memberGender = g.v"
                >
                  {{ g.l }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="errorMsg" class="text-[0.82rem] text-red-500 px-3 py-2 bg-red-50 rounded-md">{{ errorMsg }}</div>

          <div class="flex gap-2.5 mt-3">
            <button type="button" class="flex-1 py-3 border-[1.5px] border-[#e5e7eb] rounded-lg bg-transparent text-gray-500 text-[0.88rem] font-semibold cursor-pointer" @click="close">취소</button>
            <button type="submit" class="flex-[2] py-3 border-0 rounded-lg bg-gray-900 text-white text-[0.88rem] font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!f.memberNm.trim() || saving">
              {{ saving ? "저장 중..." : "저장" }}
            </button>
          </div>
        </form>
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
import AddrSearchModal, { type AddrSearchResult } from "~/components/modals/AddrSearchModal.vue";
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
  memberZipCode: "",
  memberAddr: "",
  memberAddrDetail: "",
});

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
    } catch (e) {
      errorMsg.value = errMsg(e, "회원 정보를 불러오지 못했습니다.");
    } finally {
      loading.value = false;
    }
  }
);

function onAddr(r: AddrSearchResult) {
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
