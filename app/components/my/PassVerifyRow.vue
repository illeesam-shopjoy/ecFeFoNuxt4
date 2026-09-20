<template>
  <!-- PASS 본인인증 여부 행 — 인증 전이면 "PASS 인증하기" 버튼, 인증했으면 완료 표시. 회원정보/프로필 수정에서 함께 쓴다. -->
  <div class="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2.5 text-[0.85rem]" :class="verified ? 'border-[#bbf7d0] bg-[#f0fdf4]' : 'border-[#fde68a] bg-[#fffbeb]'">
    <i class="fas" :class="verified ? 'fa-check-circle text-[#16a34a]' : 'fa-mobile-alt text-[#d97706]'"></i>
    <span class="font-semibold text-gray-800">PASS 본인인증</span>
    <span v-if="verified" class="text-[#15803d]">인증 완료<template v-if="verifiedDate"> · {{ String(verifiedDate).slice(0, 10) }}</template></span>
    <span v-else class="text-gray-500">미인증</span>
    <button v-if="!verified" type="button" class="ml-auto cursor-pointer rounded-md border-0 bg-[#111] px-3 py-1.5 text-[0.8rem] font-bold text-white disabled:opacity-60" :disabled="busy || saving" @click="run">
      {{ busy || saving ? "처리 중..." : "PASS 인증하기" }}
    </button>
    <p v-if="msg" class="m-0 w-full text-[0.78rem] text-red-500">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePassIdentity } from "~/composables/usePassIdentity";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import type { MbMemberProfileType } from "~/types/mb/mbMemberProfileType";

defineProps<{ verified: boolean; verifiedDate?: string }>();
const emit = defineEmits<{ (e: "verified", profile: MbMemberProfileType): void }>();

const pass = usePassIdentity();
const busy = pass.busy;
const saving = ref(false);
const msg = ref("");

async function run() {
  msg.value = "";
  const v = await pass.start(); // 인증창 → 서버가 결과 확인
  if (!v) return;
  saving.value = true;
  try {
    emit("verified", await myInfoSvc.passVerify(v.identityVerificationId)); // 내 회원정보에 인증 여부 저장(서버가 다시 확인)
    useNuxtApp().$toast.success("PASS 본인인증이 완료되었습니다.");
  } catch (e) {
    const x = e as { data?: { message?: string }; statusMessage?: string; message?: string };
    msg.value = String(x?.data?.message ?? x?.statusMessage ?? x?.message ?? "인증 결과를 저장하지 못했습니다.").split("::")[0]!;
  } finally {
    saving.value = false;
  }
}
</script>
