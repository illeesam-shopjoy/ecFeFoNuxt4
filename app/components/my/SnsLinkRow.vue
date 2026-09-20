<template>
  <!-- 소셜 계정 연동 상태 — 연동돼 있으면 브랜드 색으로, 아니면 흑백으로 보이고 흑백을 누르면 그 소셜로 인증해 연동한다. 컬러(연동됨)를 누르면 연동 해제. -->
  <div>
    <span class="mb-1 block text-[0.78rem] text-gray-500">소셜 계정 연동</span>
    <div class="flex items-stretch gap-2">
      <button
        v-for="p in PROVIDERS"
        :key="p.cd"
        type="button"
        class="group flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border bg-white px-2 py-2.5 transition"
        :class="isLinked(p.cd) ? 'border-[#d1d5db] shadow-sm' : 'border-[#e5e7eb] hover:border-gray-400'"
        :aria-pressed="isLinked(p.cd)"
        :title="isLinked(p.cd) ? `${p.nm} 연동됨 (누르면 해제)` : `${p.nm} 인증하고 연동하기`"
        :disabled="busy"
        @click="onClick(p)"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-full text-[1rem] font-extrabold transition" :class="isLinked(p.cd) ? p.on : 'bg-[#e5e7eb] text-[#9ca3af] grayscale'">{{ p.ch }}</span>
        <span class="text-[0.75rem] font-semibold" :class="isLinked(p.cd) ? 'text-gray-800' : 'text-gray-400'">{{ p.nm }}</span>
        <span class="text-[0.7rem]" :class="isLinked(p.cd) ? 'text-[#15803d]' : 'text-gray-400 group-hover:text-gray-600'">{{ isLinked(p.cd) ? "연동됨" : "인증하기" }}</span>
      </button>
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

async function onClick(p: (typeof PROVIDERS)[number]) {
  msg.value = "";
  if (!isLinked(p.cd)) {
    // 그 소셜의 인증 페이지로 이동 → 돌아와서 /login/oauth-link 가 연동을 마무리한다
    window.location.href = `/api/auth/${p.path}?link=1`;
    return;
  }
  const ok = await useConfirm().openConfirm({ title: "연동 해제", message: `${p.nm} 연동을 해제할까요?`, confirmText: "해제", cancelText: "취소", variant: "danger" });
  if (!ok) return;
  busy.value = true;
  try {
    list.value = await myInfoSvc.unlinkSns(p.cd);
    useNuxtApp().$toast.success(`${p.nm} 연동이 해제되었습니다.`);
  } catch (e) {
    const x = e as { data?: { message?: string }; message?: string };
    msg.value = String(x?.data?.message ?? x?.message ?? "연동 해제에 실패했습니다.").split("::")[0]!;
  } finally {
    busy.value = false;
  }
}
</script>
