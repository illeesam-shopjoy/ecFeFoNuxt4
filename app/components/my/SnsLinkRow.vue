<template>
  <!-- 소셜 계정 연동 상태 — 흑백(미연동)을 누르면 그 소셜로 인증해 연동하고, 연동된 항목은 아래 "연동 취소" 버튼으로 해제한다. -->
  <div>
    <span class="mb-1 block text-[0.78rem] text-gray-500">소셜 계정 연동</span>
    <div class="flex items-stretch gap-2">
      <div v-for="p in PROVIDERS" :key="p.cd" class="flex flex-1 flex-col gap-1.5">
        <button
          type="button"
          class="group flex flex-1 flex-col items-center gap-1 rounded-lg border bg-white px-2 py-2.5 transition"
          :class="isLinked(p.cd) ? 'cursor-default border-[#d1d5db] shadow-sm' : 'cursor-pointer border-[#e5e7eb] hover:border-gray-400'"
          :title="isLinked(p.cd) ? `${p.nm} 연동됨` : `${p.nm} 인증하고 연동하기`"
          :disabled="busy || isLinked(p.cd)"
          @click="link(p)"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-full text-[1rem] font-extrabold transition" :class="isLinked(p.cd) ? p.on : 'bg-[#e5e7eb] text-[#9ca3af] grayscale'">{{ p.ch }}</span>
          <span class="text-[0.75rem] font-semibold" :class="isLinked(p.cd) ? 'text-gray-800' : 'text-gray-400'">{{ p.nm }}</span>
          <span class="text-[0.7rem]" :class="isLinked(p.cd) ? 'text-[#15803d]' : 'text-gray-400 group-hover:text-gray-600'">{{ isLinked(p.cd) ? "연동됨" : "인증하기" }}</span>
        </button>
        <button
          v-if="isLinked(p.cd)"
          type="button"
          class="cursor-pointer rounded-md border border-[#fca5a5] bg-white py-1 text-[0.72rem] font-semibold text-[#dc2626] transition hover:bg-[#fef2f2] disabled:opacity-50"
          :disabled="busy"
          @click="unlink(p)"
        >
          연동 취소
        </button>
      </div>
    </div>
    <p v-if="msg" class="m-0 mt-1 text-[0.78rem] text-red-500">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import type { MbMemberSnsType } from "~/types/mb/mbMemberSnsType";

const PROVIDERS = [
  { cd: "KAKAO", nm: "카카오", path: "kakao", ch: "K", on: "bg-[#FEE500] text-[#3c1e1e]" },
  { cd: "NAVER", nm: "네이버", path: "naver", ch: "N", on: "bg-[#03C75A] text-white" },
  { cd: "GOOGLE", nm: "구글", path: "google", ch: "G", on: "bg-white text-[#4285F4] border border-[#e5e7eb]" },
] as const;

const list = ref<MbMemberSnsType[]>([]);
const busy = ref(false);
const msg = ref("");
const linked = computed(() => new Set(list.value.map((s) => s.snsChannelCd.toUpperCase())));
const isLinked = (cd: string) => linked.value.has(cd);

async function load() {
  try {
    list.value = await myInfoSvc.getSns();
  } catch {
    list.value = [];
  }
}
onMounted(load);

/** 미연동 소셜 — 그 소셜의 인증 페이지로 이동 → 돌아와서 /login/oauth-link 가 연동을 마무리한다 */
function link(p: (typeof PROVIDERS)[number]) {
  msg.value = "";
  window.location.href = `/api/auth/${p.path}?link=1`;
}

/** 연동 취소 — 마지막 연동이면 로그인 수단이 없어질 수 있어 경고한다(소셜로 가입한 회원의 비밀번호는 임의값이라 "비밀번호 찾기"로 설정해야 함) */
async function unlink(p: (typeof PROVIDERS)[number]) {
  msg.value = "";
  const last = list.value.length <= 1;
  const ok = await useConfirm().openConfirm({
    title: `${p.nm} 연동 취소`,
    message: last
      ? `${p.nm} 연동을 취소할까요?
마지막 소셜 연동입니다. 취소하면 ${p.nm}로는 로그인할 수 없고, 비밀번호를 설정하지 않았다면 로그인 화면의 '비밀번호 찾기'로 먼저 설정해야 합니다.`
      : `${p.nm} 연동을 취소할까요?
취소하면 ${p.nm}로는 로그인할 수 없습니다.`,
    confirmText: "연동 취소",
    cancelText: "닫기",
    variant: "danger",
  });
  if (!ok) return;
  busy.value = true;
  try {
    list.value = await myInfoSvc.unlinkSns(p.cd);
    useNuxtApp().$toast.success(`${p.nm} 연동이 취소되었습니다.`);
  } catch (e) {
    const x = e as { data?: { message?: string }; message?: string };
    msg.value = String(x?.data?.message ?? x?.message ?? "연동 취소에 실패했습니다.").split("::")[0]!;
  } finally {
    busy.value = false;
  }
}
</script>
