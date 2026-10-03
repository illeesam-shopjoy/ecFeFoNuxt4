<template>
  <!-- 마이페이지 > 판매자 창고 관리 (/my/seller-warehouse, 2026-09-30) — 출고지/반품지 주소록 CRUD.
       판매자(승인대기 포함)만 사용 가능, 판매자가 아니면 판매자 신청 안내를 보여준다. 상품등록 시 출고창고로 지정된다. -->
  <my-shell active="seller-warehouse" title="판매자 창고 관리">
    <div v-if="loading" class="py-16 text-center text-gray-400">불러오는 중...</div>

    <div v-else-if="notSeller" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center">
      <p class="m-0 mb-4 text-[0.9rem] text-gray-500">판매자만 사용할 수 있는 메뉴입니다.</p>
      <NuxtLink to="/my/seller-apply" class="rounded-lg bg-gray-900 px-5 py-2.5 text-[0.85rem] font-bold text-white no-underline">판매자 신청하기</NuxtLink>
    </div>

    <template v-else>
      <div class="mb-4 flex items-center justify-between">
        <p class="m-0 text-[0.85rem] text-gray-500">상품을 등록할 때 출고 창고로 지정합니다. 기본 출고지는 하나만 지정할 수 있습니다.</p>
        <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white" @click="handleBtnAction('warehouse-open-form')">+ 창고 추가</button>
      </div>

      <form v-if="editing" class="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-5" @submit.prevent="handleBtnAction('warehouse-save')">
        <h3 class="m-0 mb-3 text-[1rem] font-bold text-gray-900">{{ form.warehouseId ? "창고 수정" : "창고 추가" }}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block sm:col-span-2"><span class="lb">창고명 *</span><input v-model="form.warehouseNm" class="in" maxlength="100" placeholder="본사 물류창고, 서울 출고지 등" /></label>
          <label class="block"><span class="lb">담당자</span><input v-model="form.contactNm" class="in" maxlength="50" /></label>
          <label class="block"><span class="lb">담당자 연락처</span><input v-model="form.contactPhone" class="in" maxlength="20" placeholder="010-0000-0000" /></label>
          <div>
            <span class="lb">주소 *</span>
            <div class="flex gap-2">
              <input v-model="form.zipCode" class="in !w-[110px] shrink-0 bg-[#f9fafb]" readonly placeholder="우편번호" />
              <button type="button" class="cursor-pointer whitespace-nowrap rounded-lg border-[1.5px] border-theme bg-[#fdf6ee] px-3 text-[0.82rem] font-bold text-theme" @click="addrModal?.show()">주소 검색</button>
            </div>
          </div>
          <input v-model="form.addr" class="in bg-[#f9fafb] sm:col-span-2" readonly placeholder="도로명 주소" />
          <input v-model="form.addrDetail" class="in sm:col-span-2" maxlength="200" placeholder="상세 주소 (동/호수 등)" />
        </div>
        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.85rem]">
          <label class="flex cursor-pointer items-center gap-2"><input v-model="form.isDefault" type="checkbox" true-value="Y" false-value="N" />기본 출고지로 설정</label>
          <label class="flex cursor-pointer items-center gap-2"><input v-model="form.isReturnAddr" type="checkbox" true-value="Y" false-value="N" />반품지로도 사용</label>
          <label class="flex cursor-pointer items-center gap-2"><input v-model="form.useYn" type="checkbox" true-value="Y" false-value="N" />사용</label>
        </div>
        <p v-if="err" class="m-0 mt-2 text-[0.8rem] text-red-500">{{ err }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn-sub" @click="editing = false">취소</button>
          <button type="submit" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-5 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="saving">{{ saving ? "저장 중..." : "저장" }}</button>
        </div>
      </form>

      <div v-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">등록된 창고가 없습니다. 상품을 등록하려면 창고를 먼저 추가해 주세요.</div>
      <ul v-else class="m-0 grid list-none gap-3 p-0">
        <li v-for="w in list" :key="w.warehouseId" class="rounded-2xl border bg-white p-4" :class="[w.isDefault === 'Y' ? 'border-[#bc8246] shadow-sm' : 'border-[#e5e7eb]', w.useYn === 'N' ? 'opacity-60' : '']">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-gray-900">{{ w.warehouseNm }}</span>
            <span v-if="w.isDefault === 'Y'" class="rounded-full bg-[#faf3ea] px-2 py-px text-[0.72rem] font-bold text-[#8a5a25]">기본 출고지</span>
            <span v-if="w.isReturnAddr === 'Y'" class="rounded-full bg-[#eef2ff] px-2 py-px text-[0.72rem] font-bold text-[#4338ca]">반품지 겸용</span>
            <span v-if="w.useYn === 'N'" class="rounded-full bg-gray-100 px-2 py-px text-[0.72rem] font-bold text-gray-500">미사용</span>
            <span class="ml-auto flex gap-2 text-[0.8rem]">
              <button v-if="w.isDefault !== 'Y' && w.useYn !== 'N'" type="button" class="lnk" @click="handleBtnAction('warehouse-set-default', w)">기본으로 설정</button>
              <button type="button" class="lnk" @click="handleBtnAction('warehouse-toggle-stock', w)">{{ stockOpenId === w.warehouseId ? "재고 닫기" : "재고 보기" }}</button>
              <button type="button" class="lnk" @click="handleBtnAction('warehouse-open-form', w)">수정</button>
              <button type="button" class="lnk !text-red-500" @click="handleBtnAction('warehouse-remove', w)">삭제</button>
            </span>
          </div>
          <div v-if="w.contactNm || w.contactPhone" class="mt-1 text-[0.88rem] text-gray-700">{{ [w.contactNm, w.contactPhone].filter(Boolean).join(" · ") }}</div>
          <div class="text-[0.85rem] text-gray-500">({{ w.zipCode }}) {{ w.addr }} {{ w.addrDetail }}</div>
          <!-- 창고물품관리(조회) — 이 창고에서 출고되는 내 상품과 SKU 재고. 재고 수량은 상품 수정에서 바꾼다(창고별 수량 분산 원장 아님) -->
          <div v-if="stockOpenId === w.warehouseId" class="mt-3 rounded-lg bg-[#f9fafb] p-3">
            <p v-if="stockLoading" class="m-0 text-[0.82rem] text-gray-400">불러오는 중...</p>
            <p v-else-if="!stockProds.length" class="m-0 text-[0.82rem] text-gray-400">이 창고에서 출고되는 상품이 없습니다.</p>
            <ul v-else class="m-0 list-none p-0">
              <li v-for="p in stockProds" :key="p.prodId" class="flex items-center gap-2 py-1 text-[0.85rem]">
                <span class="min-w-0 flex-1 truncate text-gray-800">{{ p.prodNm }}</span>
                <span class="text-gray-500">재고 <b class="text-gray-900">{{ p.stockQty ?? 0 }}</b>개</span>
                <NuxtLink to="/my/prod" class="text-[0.78rem] text-gray-500 underline">상품 관리</NuxtLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </template>
    <template #modal><addr-search-modal ref="addrModal" @select="onAddr" /></template>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/ec2/my/MyShell.vue";
import AddrSearchModal from "~/components/ec2/modals/AddrSearchModal.vue";
import { useAuthStore } from "~/store/useAuthStore";
import { slSellerWarehouseSvc } from "~/svc/fo/ec/sl/slSellerWarehouseSvc";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import type { PdMyProdType } from "~/types/pd/pdMyProdType";
import type { SlSellerWarehouseSaveType, SlSellerWarehouseType } from "~/types/sl/slSellerWarehouseType";
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";

useHead({ title: "마이페이지 - 판매자 창고 관리" });

const loading = ref(true);
const notSeller = ref(false);
const list = ref<SlSellerWarehouseType[]>([]);
const editing = ref(false);
const saving = ref(false);
const err = ref("");
const addrModal = ref<InstanceType<typeof AddrSearchModal> & { show(): void } | null>(null);
const blank = (): SlSellerWarehouseSaveType & { warehouseId: string } => ({
  warehouseId: "",
  warehouseNm: "",
  zipCode: "",
  addr: "",
  addrDetail: "",
  contactNm: "",
  contactPhone: "",
  isDefault: "N",
  isReturnAddr: "N",
  useYn: "Y",
});
const form = reactive(blank());
const stockOpenId = ref("");
const stockProds = ref<PdMyProdType[]>([]);
const stockLoading = ref(false);

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/seller-warehouse.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "warehouse-open-form") {
    return openForm(param as SlSellerWarehouseType);
  } else if (cmd === "warehouse-save") {
    return save();
  } else if (cmd === "warehouse-set-default") {
    return setDefault(param as SlSellerWarehouseType);
  } else if (cmd === "warehouse-toggle-stock") {
    return toggleStock(param as SlSellerWarehouseType);
  } else if (cmd === "warehouse-remove") {
    return remove(param as SlSellerWarehouseType);
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/* toSaveBody — 서버 엔티티에 기본값이 없어 Y/N 3개를 항상 채워 보낸다. 수정 시 setDefault 처럼 일부만 바꿔도 나머지는 기존 값을 그대로 유지 */
const toSaveBody = (w: SlSellerWarehouseType | typeof form, patch: Partial<SlSellerWarehouseSaveType> = {}): SlSellerWarehouseSaveType => ({
  warehouseNm: w.warehouseNm,
  zipCode: w.zipCode ?? "",
  addr: w.addr ?? "",
  addrDetail: w.addrDetail ?? "",
  contactNm: w.contactNm ?? "",
  contactPhone: w.contactPhone ?? "",
  isDefault: w.isDefault ?? "N",
  isReturnAddr: w.isReturnAddr ?? "N",
  useYn: w.useYn ?? "Y",
  ...patch,
});

async function load() {
  try {
    list.value = (await slSellerWarehouseSvc.getMyWarehouses()).slice().sort((a, b) => (b.isDefault === "Y" ? 1 : 0) - (a.isDefault === "Y" ? 1 : 0));
    notSeller.value = false;
  } catch (e) {
    // 판매자가 아니면 서버가 '판매자가 아닙니다.' 를 던진다 — 그 외 오류는 토스트
    if (errText(e, "").includes("판매자가 아닙니다")) notSeller.value = true;
    else useNuxtApp().$toast.error(errText(e, "창고 목록을 불러오지 못했습니다."));
  } finally {
    loading.value = false;
  }
}
function openForm(w?: SlSellerWarehouseType) {
  err.value = "";
  // 첫 창고는 기본 출고지로 미리 체크 — 이벤트 객체/빈 객체가 넘어와도 warehouseId 가 있는 경우만 수정으로 본다
  const isEdit = !!w?.warehouseId;
  Object.assign(form, blank(), isEdit ? { warehouseId: w!.warehouseId, ...toSaveBody(w!) } : { isDefault: list.value.length ? "N" : "Y" });
  editing.value = true;
}
function onAddr(r: SyAddrSearchResultType) {
  form.zipCode = r.zonecode;
  form.addr = r.address;
}
async function save() {
  err.value = "";
  if (!form.warehouseNm.trim()) return void (err.value = "창고명을 입력해 주세요.");
  if (!form.addr.trim()) return void (err.value = "주소를 검색해 입력해 주세요.");
  saving.value = true;
  try {
    const body = toSaveBody({ ...form, warehouseNm: form.warehouseNm.trim() });
    if (form.warehouseId) await slSellerWarehouseSvc.updateWarehouse(form.warehouseId, body);
    else await slSellerWarehouseSvc.createWarehouse(body);
    editing.value = false;
    await load();
    useNuxtApp().$toast.success("저장되었습니다.");
  } catch (e) {
    err.value = errText(e, "저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}
/** toggleStock — 창고별 재고 보기: 이 창고에서 출고되는 내 상품과 재고(서버가 SKU 실효 창고 기준으로 걸러줌) */
async function toggleStock(w: SlSellerWarehouseType) {
  if (stockOpenId.value === w.warehouseId) return void (stockOpenId.value = "");
  stockOpenId.value = w.warehouseId;
  stockProds.value = [];
  stockLoading.value = true;
  try {
    stockProds.value = (await pdMyProdSvc.getMyProds(w.warehouseId)).filter((p) => p.prodStatusCd !== "ENDED");
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "재고를 불러오지 못했습니다."));
  } finally {
    stockLoading.value = false;
  }
}
async function setDefault(w: SlSellerWarehouseType) {
  try {
    await slSellerWarehouseSvc.updateWarehouse(w.warehouseId, toSaveBody(w, { isDefault: "Y" }));
    await load();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "기본 출고지 설정에 실패했습니다."));
  }
}
async function remove(w: SlSellerWarehouseType) {
  if (!(await useConfirm().openConfirm({ title: "창고 삭제", message: `'${w.warehouseNm}' 를 삭제할까요?`, confirmText: "삭제", cancelText: "취소", variant: "danger" }))) return;
  try {
    await slSellerWarehouseSvc.removeWarehouse(w.warehouseId);
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
