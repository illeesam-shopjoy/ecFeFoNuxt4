<template>
  <!-- 이메일 링크 인증 박스 (PASS 본인인증 대체, 2026-10-02) — 가입·계정찾기·마이페이지·판매자신청·비회원 결제/채팅 공용.
       [이메일 인증하기] → 인증 메일 발송 → 메일의 링크를 누르면 이 박스가 자동으로 "인증 완료"로 바뀐다(3초마다 확인).
       이메일 인증은 "그 메일함에 접근할 수 있다"만 증명한다(실명·휴대폰 확인 아님). -->
  <div class="rounded-lg border px-3 py-2.5 text-[0.85rem]" :class="verified ? 'border-[#bbf7d0] bg-[#f0fdf4]' : sent ? 'border-[#fde68a] bg-[#fffbeb]' : 'border-[#e5e7eb] bg-[#f9fafb]'">
    <div class="flex flex-wrap items-center gap-2">
      <i class="fas" :class="verified ? 'fa-check-circle text-[#16a34a]' : 'fa-envelope text-[#d97706]'"></i>
      <span class="font-semibold text-gray-800">{{ title }}</span>
      <span v-if="verified" class="text-[#15803d]">인증 완료<template v-if="sentTo"> · {{ sentTo }}</template></span>
      <span v-else-if="sent" class="text-gray-600">메일 확인 중…</span>
      <span v-else class="text-gray-500">{{ idleText }}</span>
      <button v-if="!verified" type="button" class="ml-auto cursor-pointer rounded-md border-0 bg-[#111] px-3 py-1.5 text-[0.8rem] font-bold text-white disabled:opacity-60" :disabled="sending || disabled || (!loginPurpose && !email.trim())" @click="onSend">
        {{ sending ? "발송 중..." : sent ? "메일 다시 보내기" : "이메일 인증하기" }}
      </button>
      <button v-else type="button" class="ml-auto cursor-pointer border-0 bg-transparent p-0 text-[0.78rem] text-gray-500 underline" @click="onReset">다시 인증</button>
    </div>
    <p v-if="sent && !verified" class="m-0 mt-1.5 text-[0.78rem] leading-snug text-gray-600">
      <b>{{ sentTo }}</b> 로 인증 메일을 보냈습니다. 메일의 <b>[이메일 인증하기]</b> 를 누르면 이곳이 자동으로 완료됩니다. ({{ expireMinutes }}분 안에)
    </p>
    <p v-if="error" class="m-0 mt-1.5 text-[0.78rem] text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useEmailVerify } from "~/composables/useEmailVerify";
import type { MbEmailVerifyPurposeType } from "~/types/mb/mbEmailVerifyType";

const props = withDefaults(defineProps<{ purposeCd: MbEmailVerifyPurposeType; email?: string; title?: string; idleText?: string; disabled?: boolean }>(), {
  email: "",
  title: "이메일 인증",
  idleText: "미인증",
  disabled: false,
});
const emit = defineEmits<{ (e: "verified", verifyId: string): void; (e: "reset"): void }>();

// 로그인 목적은 서버가 내 이메일로 보내므로 입력 이메일이 필요 없다
const loginPurpose = computed(() => props.purposeCd === "MYPAGE" || props.purposeCd === "SELLER_APPLY");
const { verifyId, sentTo, expireMinutes, sending, sent, verified, error, send, reset } = useEmailVerify(props.purposeCd);

async function onSend() {
  await send(props.email);
}
function onReset() {
  reset();
  emit("reset");
}
watch(verified, (v) => {
  if (v) emit("verified", verifyId.value);
});
// 인증(또는 발송) 후 이메일을 바꾸면 이전 인증은 무효 — 다시 받아야 한다
watch(
  () => props.email,
  (n, o) => {
    if (!loginPurpose.value && n !== o && (sent.value || verified.value)) onReset();
  }
);
</script>
