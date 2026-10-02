<template>
  <!-- 이메일 인증 여부 행 (PASS 본인인증 대체, 2026-10-02) — 인증 전이면 "이메일 인증하기"(내 이메일로 링크 발송), 인증했으면 완료 표시.
       회원정보/프로필 수정에서 함께 쓴다. 링크를 누르면 이 행이 자동으로 완료되고, 서버가 인증 건을 확인해 내 회원정보에 저장한다. -->
  <div>
    <div v-if="verified" class="flex flex-wrap items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2.5 text-[0.85rem]">
      <i class="fas fa-check-circle text-[#16a34a]"></i>
      <span class="font-semibold text-gray-800">이메일 인증</span>
      <span class="text-[#15803d]">인증 완료<template v-if="verifiedDate"> · {{ String(verifiedDate).slice(0, 10) }}</template></span>
    </div>
    <email-verify-box v-else purpose-cd="MYPAGE" title="이메일 인증" :disabled="saving" @verified="onVerified" />
    <p v-if="msg" class="m-0 mt-1 text-[0.78rem] text-red-500">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EmailVerifyBox from "~/components/ec1/fo/EmailVerifyBox.vue";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import type { MbMemberProfileType } from "~/types/mb/mbMemberProfileType";

defineProps<{ verified: boolean; verifiedDate?: string }>();
const emit = defineEmits<{ (e: "verified", profile: MbMemberProfileType): void }>();

const saving = ref(false);
const msg = ref("");

async function onVerified(verifyId: string) {
  msg.value = "";
  saving.value = true;
  try {
    emit("verified", await myInfoSvc.emailVerify(verifyId)); // 내 회원정보에 인증 여부 저장(서버가 인증 건을 1회 소비하며 내 이메일과 같은지 확인)
    useNuxtApp().$toast.success("이메일 인증이 완료되었습니다.");
  } catch (e) {
    const x = e as { data?: { message?: string }; statusMessage?: string; message?: string };
    msg.value = String(x?.data?.message ?? x?.statusMessage ?? x?.message ?? "인증 결과를 저장하지 못했습니다.").split("::")[0]!;
  } finally {
    saving.value = false;
  }
}
</script>
