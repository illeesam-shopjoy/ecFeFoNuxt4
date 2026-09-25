<template>
  <my-shell active="profile" title="개인정보 수정" :file-path="currentFilePath">
    <div v-if="loading" class="py-16 text-center text-gray-400">불러오는 중...</div>
    <div v-else class="space-y-5">
      <div class="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div class="mb-5 flex items-center gap-4">
          <div class="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#f3f4f6]">
            <img v-if="p.profileImgUrl" :src="p.profileImgUrl" alt="프로필 이미지" class="h-full w-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center text-[1.8rem] font-bold text-gray-400">{{ (p.memberNm || "?").slice(0, 1) }}</div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[1.1rem] font-bold text-gray-900">{{ p.memberNm || "-" }}</div>
            <div class="truncate text-[0.85rem] text-gray-500">{{ p.memberEmail || p.loginId }}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white" @click="profileModal?.show()">개인정보 수정</button>
            <button type="button" class="cursor-pointer rounded-lg border border-[#c9ced6] bg-[#f3f4f6] px-4 py-2 text-[0.85rem] font-semibold text-gray-700" @click="pwModal?.show()">비밀번호 변경</button>
          </div>
        </div>
        <dl class="m-0 grid gap-x-6 gap-y-3 text-[0.9rem] sm:grid-cols-2">
          <div v-for="r in rows" :key="r.label"><dt class="text-[0.75rem] text-gray-400">{{ r.label }}</dt><dd class="m-0 text-gray-800">{{ r.value || "-" }}</dd></div>
        </dl>
      </div>

      <div class="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h3 class="m-0 mb-3 text-[1rem] font-bold text-gray-900">본인인증 · 소셜 연동</h3>
        <pass-verify-row class="mb-4" :verified="p.passVerifiedYn === 'Y'" :verified-date="p.passVerifiedDate" @verified="load" />
        <sns-link-row />
      </div>

      <div class="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h3 class="m-0 mb-3 text-[1rem] font-bold text-gray-900">수신 동의</h3>
        <div v-for="g in consents" :key="g.label" class="mb-2.5 last:mb-0">
          <p class="m-0 mb-1 text-[0.76rem] text-gray-500">{{ g.label }}</p>
          <div class="flex flex-wrap gap-2 text-[0.82rem]">
            <span v-for="c in g.items" :key="c.label" class="rounded-full px-3 py-1 font-semibold" :class="c.on ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#f3f4f6] text-gray-400'">{{ c.label }} {{ c.on ? "동의" : "미동의" }}</span>
          </div>
        </div>
        <p class="m-0 mt-2 text-[0.78rem] text-gray-400">'개인정보 수정'에서 바꿀 수 있습니다.</p>
      </div>
    </div>

    <template #modal>
      <profile-edit-modal ref="profileModal" @saved="load" />
      <password-change-modal ref="pwModal" />
    </template>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/my/MyShell.vue";
import PassVerifyRow from "~/components/my/PassVerifyRow.vue";
import SnsLinkRow from "~/components/my/SnsLinkRow.vue";
import ProfileEditModal from "~/components/modals/ProfileEditModal.vue";
import PasswordChangeModal from "~/components/modals/PasswordChangeModal.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import type { MbMemberProfileType } from "~/types/mb/mbMemberProfileType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 개인정보 수정" });
usePageTitle("마이페이지 - 개인정보 수정");

const authStore = useAuthStore();
const loading = ref(true);
const p = ref<Partial<MbMemberProfileType>>({});
const profileModal = ref<InstanceType<typeof ProfileEditModal> & { show(): void } | null>(null);
const pwModal = ref<InstanceType<typeof PasswordChangeModal> & { show(): void } | null>(null);

const genderNm = (g?: string) => (g === "M" ? "남성" : g === "F" ? "여성" : "");
const rows = computed(() => [
  { label: "휴대폰", value: p.value.memberPhone },
  { label: "성별", value: genderNm(p.value.memberGender) },
  { label: "생년월일", value: p.value.birthDate },
  { label: "주소", value: [p.value.memberZipCode, p.value.memberAddr, p.value.memberAddrDetail].filter(Boolean).join(" ") },
]);
const consents = computed(() => {
  const on = (k: keyof typeof p.value) => p.value[k] === "Y";
  return [
    { label: "필수 · 주문/문의", items: [{ label: "SMS", on: on("recvSmsYn") }, { label: "이메일", on: on("recvEmailYn") }, { label: "카카오", on: on("recvKakaoYn") }] },
    { label: "선택 · 마케팅", items: [{ label: "이벤트", on: on("recvMktEventYn") }, { label: "기획전", on: on("recvMktPlanYn") }, { label: "광고", on: on("recvAdYn") }] },
  ];
});

async function load() {
  try {
    p.value = await myInfoSvc.getProfile();
  } catch {
    p.value = {};
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  authStore.loadStToken();
  if (!authStore.isStLoggedIn) return void (await navigateTo("/login"));
  // 소셜 연동 흐름에서 돌아온 경우: 결과를 알리고 개인정보 수정을 다시 연다
  const q = useRoute().query;
  if (q.snsLinked) useNuxtApp().$toast.success("소셜 계정이 연동되었습니다.");
  if (q.snsError) useNuxtApp().$toast.error(String(q.snsError));
  await load();
  if (q.openProfile || q.snsError) setTimeout(() => profileModal.value?.show(), 300);
});
</script>
