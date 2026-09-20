<template>
  <my-shell active="addr" title="주소정보 관리" :file-path="currentFilePath">
    <div class="mb-4 flex items-center justify-between">
      <p class="m-0 text-[0.85rem] text-gray-500">기본 배송지는 주문할 때 자동으로 채워집니다.</p>
      <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white" @click="openForm()">+ 배송지 추가</button>
    </div>

    <form v-if="editing" class="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-5" @submit.prevent="save">
      <h3 class="m-0 mb-3 text-[1rem] font-bold text-gray-900">{{ form.memberAddrId ? "배송지 수정" : "배송지 추가" }}</h3>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block"><span class="lb">배송지명</span><input v-model="form.addrNm" class="in" maxlength="30" placeholder="집, 회사 등" /></label>
        <label class="block"><span class="lb">수령자 *</span><input v-model="form.recvNm" class="in" maxlength="50" /></label>
        <label class="block"><span class="lb">연락처 *</span><input v-model="form.recvPhone" class="in" maxlength="20" placeholder="010-0000-0000" /></label>
        <div>
          <span class="lb">주소 *</span>
          <div class="flex gap-2">
            <input v-model="form.zipCd" class="in !w-[110px] shrink-0 bg-[#f9fafb]" readonly placeholder="우편번호" />
            <button type="button" class="cursor-pointer whitespace-nowrap rounded-lg border-[1.5px] border-theme bg-[#fdf6ee] px-3 text-[0.82rem] font-bold text-theme" @click="addrModal?.show()">주소 검색</button>
          </div>
        </div>
        <input v-model="form.addr" class="in bg-[#f9fafb] sm:col-span-2" readonly placeholder="도로명 주소" />
        <input v-model="form.addrDetail" class="in sm:col-span-2" maxlength="100" placeholder="상세 주소 (동/호수 등)" />
      </div>
      <label class="mt-3 flex cursor-pointer items-center gap-2 text-[0.85rem]"><input v-model="makeDefault" type="checkbox" />기본 배송지로 설정</label>
      <p v-if="err" class="m-0 mt-2 text-[0.8rem] text-red-500">{{ err }}</p>
      <div class="mt-4 flex justify-end gap-2">
        <button type="button" class="btn-sub" @click="editing = false">취소</button>
        <button type="submit" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-5 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="saving">{{ saving ? "저장 중..." : "저장" }}</button>
      </div>
    </form>

    <div v-if="loading" class="py-12 text-center text-gray-400">불러오는 중...</div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">등록된 배송지가 없습니다.</div>
    <ul v-else class="m-0 grid list-none gap-3 p-0">
      <li v-for="a in list" :key="a.memberAddrId" class="rounded-2xl border bg-white p-4" :class="a.defaultYn === 'Y' ? 'border-[#bc8246] shadow-sm' : 'border-[#e5e7eb]'">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-bold text-gray-900">{{ a.addrNm || "배송지" }}</span>
          <span v-if="a.defaultYn === 'Y'" class="rounded-full bg-[#faf3ea] px-2 py-px text-[0.72rem] font-bold text-[#8a5a25]">기본 배송지</span>
          <span class="ml-auto flex gap-2 text-[0.8rem]">
            <button v-if="a.defaultYn !== 'Y'" type="button" class="lnk" @click="setDefault(a)">기본으로 설정</button>
            <button type="button" class="lnk" @click="openForm(a)">수정</button>
            <button type="button" class="lnk !text-red-500" @click="remove(a)">삭제</button>
          </span>
        </div>
        <div class="mt-1 text-[0.88rem] text-gray-700">{{ a.recvNm }} · {{ a.recvPhone }}</div>
        <div class="text-[0.85rem] text-gray-500">({{ a.zipCode }}) {{ a.addr }} {{ a.addrDetail }}</div>
      </li>
    </ul>
    <template #modal><addr-search-modal ref="addrModal" @select="onAddr" /></template>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/my/MyShell.vue";
import AddrSearchModal from "~/components/modals/AddrSearchModal.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { myAddrSvc } from "~/svc/fo/ec/my/myAddrSvc";
import type { MbMemberAddrType } from "~/types/mb/mbMemberAddrType";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 주소정보 관리" });
usePageTitle("마이페이지 - 주소정보 관리");

const loading = ref(true);
const list = ref<MbMemberAddrType[]>([]);
const editing = ref(false);
const saving = ref(false);
const err = ref("");
const makeDefault = ref(false);
const addrModal = ref<InstanceType<typeof AddrSearchModal> & { show(): void } | null>(null);
const blank = () => ({ memberAddrId: "", addrNm: "", recvNm: "", recvPhone: "", zipCd: "", addr: "", addrDetail: "" });
const form = reactive(blank());

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;
async function load() {
  try {
    list.value = (await myAddrSvc.getMyAddrs()).slice().sort((a, b) => (a.defaultYn === "Y" ? -1 : 0) - (b.defaultYn === "Y" ? -1 : 0));
  } finally {
    loading.value = false;
  }
}
function openForm(a?: MbMemberAddrType) {
  err.value = "";
  Object.assign(form, blank(), a ? { memberAddrId: a.memberAddrId, addrNm: a.addrNm ?? "", recvNm: a.recvNm ?? "", recvPhone: a.recvPhone ?? "", zipCd: a.zipCode ?? "", addr: a.addr ?? "", addrDetail: a.addrDetail ?? "" } : {});
  makeDefault.value = a ? a.defaultYn === "Y" : !list.value.length;
  editing.value = true;
}
function onAddr(r: SyAddrSearchResultType) {
  form.zipCd = r.zonecode;
  form.addr = r.address;
}
async function save() {
  err.value = "";
  if (!form.recvNm.trim() || !form.recvPhone.trim() || !form.addr.trim()) return void (err.value = "수령자, 연락처, 주소는 필수입니다.");
  saving.value = true;
  try {
    const saved = await myAddrSvc.saveAddr({ ...form, memberAddrId: form.memberAddrId || undefined, isDefault: "N" });
    if (makeDefault.value) await myAddrSvc.setDefault(saved.memberAddrId);
    editing.value = false;
    await load();
    useNuxtApp().$toast.success("저장되었습니다.");
  } catch (e) {
    err.value = errText(e, "저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}
async function setDefault(a: MbMemberAddrType) {
  try {
    await myAddrSvc.setDefault(a.memberAddrId);
    await load();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "기본 배송지 설정에 실패했습니다."));
  }
}
async function remove(a: MbMemberAddrType) {
  if (!(await useConfirm().openConfirm({ title: "배송지 삭제", message: `'${a.addrNm || "배송지"}' 를 삭제할까요?`, confirmText: "삭제", cancelText: "취소", variant: "danger" }))) return;
  try {
    await myAddrSvc.removeAddr(a.memberAddrId);
    await load();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "삭제에 실패했습니다."));
  }
}
onMounted(async () => {
  useAuthStore().loadStToken();
  if (!useAuthStore().isStLoggedIn) return void (await navigateTo("/login"));
  await load();
});
</script>

<style scoped>
.lb { display: block; margin-bottom: 4px; font-size: 0.78rem; color: #6b7280; }
.in { width: 100%; height: 38px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.88rem; outline: none; }
.in:focus { border-color: #bc8246; }
.lnk { padding: 0; border: 0; background: transparent; color: #4b5563; cursor: pointer; text-decoration: underline; }
.btn-sub { padding: 8px 16px; border: 1px solid #c9ced6; border-radius: 8px; background: #f3f4f6; color: #374151; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
