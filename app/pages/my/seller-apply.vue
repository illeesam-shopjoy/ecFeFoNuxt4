<template>
  <!-- 마이페이지 > 판매자 신청 (/my/seller-apply, 2026-09-30) — 회원가입 시 신청하지 않은 기존 회원용.
       신청 이력이 있으면 상태 카드, 없으면 신청 폼을 보여준다. -->
  <my-shell active="seller-apply" title="판매자 신청" :file-path="currentFilePath">
    <div v-if="loading" class="py-16 text-center text-gray-400">불러오는 중...</div>

    <div v-else-if="applied" class="rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <div class="mb-3 flex items-center gap-2">
        <span class="rounded-full px-3 py-1 text-[0.8rem] font-bold" :class="statusBadgeClass">{{ statusLabel }}</span>
        <span class="text-[1.05rem] font-bold text-gray-900">{{ applied.sellerNm }}</span>
      </div>
      <p class="m-0 text-[0.9rem] text-gray-600">{{ statusMsg }}</p>
    </div>

    <div v-else class="rounded-2xl border border-[#e5e7eb] bg-white p-6">
      <p class="m-0 mb-5 text-[0.85rem] text-gray-500">판매자로 등록하면 승인 후 상품을 등록하고 판매할 수 있습니다.</p>

      <span class="mb-1 block text-[0.78rem] text-gray-500">판매자 유형</span>
      <div class="mb-4 flex gap-2">
        <label
          class="m-0 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-[1.5px] px-3 py-2.5 text-[0.85rem] font-semibold"
          :class="sellerTypeCd === 'INDIVIDUAL' ? 'border-gray-900 bg-gray-900 text-white' : 'border-[#e5e7eb] bg-white text-gray-600'"
        >
          <input v-model="sellerTypeCd" type="radio" name="seller-type-cd" value="INDIVIDUAL" class="sr-only" />개인
        </label>
        <label
          class="m-0 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-[1.5px] px-3 py-2.5 text-[0.85rem] font-semibold"
          :class="sellerTypeCd === 'COMPANY' ? 'border-gray-900 bg-gray-900 text-white' : 'border-[#e5e7eb] bg-white text-gray-600'"
        >
          <input v-model="sellerTypeCd" type="radio" name="seller-type-cd" value="COMPANY" class="sr-only" />업체
        </label>
      </div>

      <label class="mb-1 block text-[0.78rem] text-gray-500" for="seller-nm">판매자명<span class="text-theme ml-0.5">*</span></label>
      <input
        id="seller-nm"
        v-model="sellerNm"
        class="mb-2 w-full rounded-lg border-[1.5px] border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[0.88rem] text-gray-900 outline-none focus:border-[#bc8246]"
        placeholder="판매자명(상호명) 입력"
        maxlength="60"
      />
      <p v-if="errorMsg" class="m-0 mb-3 text-[0.8rem] text-red-500">{{ errorMsg }}</p>

      <button type="button" class="mt-2 w-full cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-3 text-[0.9rem] font-bold text-white disabled:opacity-60" :disabled="submitting" @click="handleBtnAction('seller-apply')">
        {{ submitting ? "신청 중..." : "판매자 신청하기" }}
      </button>
    </div>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/my/MyShell.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { mbSellerSvc } from "~/svc/fo/ec/mb/mbSellerSvc";
import type { MbSellerMyType, MbSellerStatusCd } from "~/types/mb/mbSellerApplyType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 판매자 신청" });
usePageTitle("마이페이지 - 판매자 신청");

const authStore = useAuthStore();
const loading = ref(true);
const submitting = ref(false);
const applied = ref<MbSellerMyType | null>(null);
const errorMsg = ref("");
const sellerTypeCd = ref<"INDIVIDUAL" | "COMPANY">("INDIVIDUAL");
const sellerNm = ref("");

const STATUS_LABEL: Record<MbSellerStatusCd, string> = { PENDING: "승인 대기", ACTIVE: "판매중", SUSPENDED: "이용정지" };
const STATUS_MSG: Record<MbSellerStatusCd, string> = {
  PENDING: "승인 대기 중입니다. 승인이 완료되면 판매자로 활동하실 수 있습니다.",
  ACTIVE: "이미 판매자입니다.",
  SUSPENDED: "이용이 정지된 판매자입니다. 자세한 사항은 고객센터로 문의해 주세요.",
};
const STATUS_BADGE_CLASS: Record<MbSellerStatusCd, string> = {
  PENDING: "bg-[#fef3c7] text-[#b45309]",
  ACTIVE: "bg-[#dcfce7] text-[#15803d]",
  SUSPENDED: "bg-[#fee2e2] text-[#b91c1c]",
};
const statusCd = computed<MbSellerStatusCd>(() => applied.value?.sellerStatusCd ?? "PENDING");
const statusLabel = computed(() => STATUS_LABEL[statusCd.value]);
const statusMsg = computed(() => STATUS_MSG[statusCd.value]);
const statusBadgeClass = computed(() => STATUS_BADGE_CLASS[statusCd.value]);

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/seller-apply.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "seller-apply") {
    return handleApply();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/* handleApply — 판매자명 필수 검증 후 신청, 성공 시 상태 카드로 전환 */
async function handleApply() {
  if (!sellerNm.value.trim()) {
    errorMsg.value = "판매자명을 입력해 주세요.";
    return;
  }
  errorMsg.value = "";
  submitting.value = true;
  try {
    applied.value = await mbSellerSvc.applySeller(sellerNm.value.trim(), sellerTypeCd.value);
    await useAlert().openAlert("신청이 완료되었습니다. 승인을 기다려주세요.");
  } catch (err) {
    errorMsg.value = ((err as Error)?.message ?? "신청에 실패했습니다.").split("::")[0]!;
  } finally {
    submitting.value = false;
  }
}

async function load() {
  try {
    applied.value = await mbSellerSvc.getMySeller();
  } catch {
    applied.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  authStore.loadStToken();
  if (!authStore.isStLoggedIn) return void (await navigateTo("/login"));
  await load();
});
</script>
