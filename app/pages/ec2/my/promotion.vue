<template>
  <!-- 마이페이지 > 프로모션 관리 (/my/promotion, 2026-10-02 · 셀러 Phase 2 · 2C) — 승인된 판매자가 내 상품 대상으로 할인·적립금·상품권을 등록한다.
       할인/적립금은 대상 상품(내 상품만)을 골라야 하고, 상품권은 상품 매핑 없이 내 상품 전체에 적용된다. 할인 비용은 판매자가 100% 부담한다. -->
  <my-shell active="promotion" title="프로모션 관리" :file-path="currentFilePath">
    <div v-if="loading" class="py-16 text-center text-gray-400">불러오는 중...</div>

    <div v-else-if="!seller" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center">
      <p class="m-0 mb-4 text-[0.9rem] text-gray-500">판매자만 사용할 수 있는 메뉴입니다.</p>
      <NuxtLink to="/my/seller-apply" class="rounded-lg bg-gray-900 px-5 py-2.5 text-[0.85rem] font-bold text-white no-underline">판매자 신청하기</NuxtLink>
    </div>

    <template v-else>
      <div v-if="seller.sellerStatusCd !== 'ACTIVE'" class="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[0.85rem] text-[#92400e]">
        판매자 승인이 완료되면 프로모션을 등록할 수 있습니다. (현재 상태: {{ seller.sellerStatusCd === "PENDING" ? "승인 대기" : "이용정지" }})
      </div>

      <div class="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-[#f3f4f6] p-1">
        <button v-for="t in TABS" :key="t.key" type="button" class="cursor-pointer rounded-lg border-0 py-2.5 text-[0.9rem] font-bold transition" :class="kind === t.key ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500'" @click="handleBtnAction('promo-switch-tab', t.key)">{{ t.label }}</button>
      </div>

      <div class="mb-4 flex items-center justify-between">
        <p class="m-0 text-[0.82rem] text-gray-500">{{ HINT[kind] }}</p>
        <button type="button" class="cursor-pointer whitespace-nowrap rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white disabled:opacity-50" :disabled="seller.sellerStatusCd !== 'ACTIVE'" @click="handleBtnAction('promo-open-form')">+ 등록</button>
      </div>

      <form v-if="editing" class="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-5" @submit.prevent="handleBtnAction('promo-save')">
        <h3 class="m-0 mb-3 text-[1rem] font-bold text-gray-900">{{ form.id ? "수정" : "등록" }} · {{ TAB_LABEL[kind] }}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block sm:col-span-2"><span class="lb">이름 *</span><input v-model="form.nm" class="in" maxlength="100" /></label>
          <label class="block">
            <span class="lb">{{ kind === "discnt" ? "할인 방식" : kind === "save" ? "적립 단위" : "상품권 유형" }} *</span>
            <select v-model="form.valTypeCd" class="in"><option v-for="o in VAL_TYPES[kind]" :key="o.v" :value="o.v">{{ o.l }}</option></select>
          </label>
          <label class="block"><span class="lb">{{ valLabel }} *</span><input v-model.number="form.value" class="in" type="number" min="0" step="any" /></label>
          <label class="block"><span class="lb">최소 주문금액(원)</span><input v-model.number="form.minOrderAmt" class="in" type="number" min="0" /></label>
          <label v-if="kind !== 'save' && form.valTypeCd === 'RATE'" class="block"><span class="lb">최대 할인금액(원)</span><input v-model.number="form.maxDiscntAmt" class="in" type="number" min="0" /></label>
          <template v-if="kind !== 'voucher'">
            <label class="block"><span class="lb">시작일 *</span><input v-model="form.startDate" class="in" type="date" /></label>
            <label class="block"><span class="lb">종료일 *</span><input v-model="form.endDate" class="in" type="date" /></label>
          </template>
          <label v-else class="block"><span class="lb">유효기간(개월)</span><input v-model.number="form.expireMonth" class="in" type="number" min="1" /></label>
          <label class="block"><span class="lb">상태</span><select v-model="form.statusCd" class="in"><option value="ACTIVE">진행</option><option value="INACTIVE">비활성</option></select></label>
          <label class="block sm:col-span-2"><span class="lb">설명</span><input v-model="form.desc" class="in" maxlength="500" /></label>
          <div v-if="kind !== 'voucher'" class="sm:col-span-2">
            <span class="lb">대상 상품 * <span class="text-gray-400">— 내 상품만 선택할 수 있습니다 ({{ form.prodIds.length }}개 선택)</span></span>
            <div v-if="!prods.length" class="rounded-lg bg-gray-50 px-3 py-3 text-[0.82rem] text-gray-500">등록된 상품이 없습니다. 먼저 <NuxtLink to="/my/prod" class="font-bold underline">상품을 등록</NuxtLink>해 주세요.</div>
            <div v-else class="max-h-48 overflow-y-auto rounded-lg border border-[#e5e7eb] p-2">
              <label v-for="p in prods" :key="p.prodId" class="flex cursor-pointer items-center gap-2 px-1 py-1 text-[0.85rem]"><input v-model="form.prodIds" type="checkbox" :value="p.prodId" />{{ p.prodNm }}<span class="text-gray-400">{{ (p.salePrice ?? 0).toLocaleString() }}원</span></label>
            </div>
          </div>
        </div>
        <p v-if="err" class="m-0 mt-2 text-[0.8rem] text-red-500">{{ err }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn-sub" @click="editing = false">취소</button>
          <button type="submit" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-5 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="saving">{{ saving ? "저장 중..." : "저장" }}</button>
        </div>
      </form>

      <div v-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">등록한 {{ TAB_LABEL[kind] }}이(가) 없습니다.</div>
      <ul v-else class="m-0 grid list-none gap-3 p-0">
        <li v-for="x in list" :key="x.id" class="rounded-2xl border border-[#e5e7eb] bg-white p-4" :class="x.statusCd === 'INACTIVE' ? 'opacity-60' : ''">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-gray-900">{{ x.nm }}</span>
            <span class="rounded-full px-2 py-px text-[0.72rem] font-bold" :class="x.statusCd === 'INACTIVE' ? 'bg-gray-100 text-gray-500' : 'bg-[#dcfce7] text-[#15803d]'">{{ x.statusCd === "INACTIVE" ? "종료/비활성" : "진행" }}</span>
            <span class="ml-auto flex gap-2 text-[0.8rem]">
              <button v-if="x.statusCd !== 'INACTIVE'" type="button" class="lnk" @click="handleBtnAction('promo-open-form', x)">수정</button>
              <button v-if="x.statusCd !== 'INACTIVE'" type="button" class="lnk !text-red-500" @click="handleBtnAction('promo-end', x)">종료</button>
            </span>
          </div>
          <div class="mt-1 text-[0.85rem] text-gray-700">{{ summary(x) }}</div>
          <div v-if="x.startDate" class="text-[0.8rem] text-gray-500">{{ x.startDate }} ~ {{ x.endDate }}</div>
          <div v-else-if="x.expireMonth" class="text-[0.8rem] text-gray-500">유효기간 {{ x.expireMonth }}개월</div>
        </li>
      </ul>
    </template>
  </my-shell>
</template>

<script setup lang="ts">
import MyShell from "~/components/ec2/my/MyShell.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import { pmSellerPromoSvc } from "~/svc/fo/ec/pm/pmSellerPromoSvc";
import { slSellerSvc } from "~/svc/fo/ec/sl/slSellerSvc";
import type { PdMyProdType } from "~/types/pd/pdMyProdType";
import type { PmSellerPromoKindType, PmSellerPromoSaveType, PmSellerPromoType } from "~/types/pm/pmSellerPromoType";
import type { SlSellerMyType } from "~/types/sl/slSellerApplyType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 프로모션 관리" });
usePageTitle("마이페이지 - 프로모션 관리");

const TABS: { key: PmSellerPromoKindType; label: string }[] = [
  { key: "discnt", label: "할인" },
  { key: "voucher", label: "상품권" },
  { key: "save", label: "적립금" },
];
const TAB_LABEL: Record<PmSellerPromoKindType, string> = { discnt: "할인", voucher: "상품권", save: "적립금" };
const HINT: Record<PmSellerPromoKindType, string> = {
  discnt: "선택한 내 상품에 정률/정액 할인을 적용합니다. 할인 비용은 판매자가 부담합니다.",
  voucher: "내 상품 전체에 쓸 수 있는 상품권입니다. 상품 선택 없이 등록합니다.",
  save: "선택한 내 상품을 구매하면 적립금을 줍니다. 정률(%) 또는 정액(원)으로 설정합니다.",
};
const VAL_TYPES: Record<PmSellerPromoKindType, { v: string; l: string }[]> = {
  discnt: [{ v: "RATE", l: "정률 (%)" }, { v: "AMOUNT", l: "정액 (원)" }],
  voucher: [{ v: "AMOUNT", l: "금액권 (원)" }, { v: "RATE", l: "정률 (%)" }],
  save: [{ v: "%", l: "정률 (%)" }, { v: "KRW", l: "정액 (원)" }],
};

const loading = ref(true);
const seller = ref<SlSellerMyType | null>(null);
const kind = ref<PmSellerPromoKindType>("discnt");
const list = ref<PmSellerPromoType[]>([]);
const prods = ref<PdMyProdType[]>([]);
const editing = ref(false);
const saving = ref(false);
const err = ref("");
const blank = () => ({ id: "", nm: "", valTypeCd: "", value: 0, minOrderAmt: 0, maxDiscntAmt: 0, startDate: "", endDate: "", expireMonth: 12, statusCd: "ACTIVE" as "ACTIVE" | "INACTIVE", desc: "", prodIds: [] as string[] });
const form = reactive(blank());

const valLabel = computed(() => (form.valTypeCd === "RATE" || form.valTypeCd === "%" ? "비율(%)" : "금액(원)"));
const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;
const isRate = (t?: string) => t === "RATE" || t === "%";
function summary(x: PmSellerPromoType): string {
  const v = x.value ?? 0;
  const base = isRate(x.valTypeCd) ? `${v}%` : `${v.toLocaleString()}원`;
  const min = x.minOrderAmt ? ` · ${x.minOrderAmt.toLocaleString()}원 이상 구매 시` : "";
  return `${base}${kind.value === "save" ? " 적립" : " 할인"}${min}`;
}

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/promotion.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "promo-switch-tab") {
    return switchTab(param as PmSellerPromoKindType);
  } else if (cmd === "promo-open-form") {
    return openForm(param as PmSellerPromoType);
  } else if (cmd === "promo-save") {
    return save();
  } else if (cmd === "promo-end") {
    return endPromo(param as PmSellerPromoType);
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

async function loadList() {
  list.value = await pmSellerPromoSvc.list(kind.value);
}
async function switchTab(k: PmSellerPromoKindType) {
  kind.value = k;
  editing.value = false;
  list.value = [];
  try {
    await loadList();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "목록을 불러오지 못했습니다."));
  }
}

async function openForm(x?: PmSellerPromoType) {
  err.value = "";
  const defaults = { valTypeCd: VAL_TYPES[kind.value][0]!.v };
  if (x?.id) {
    try {
      const d = await pmSellerPromoSvc.get(kind.value, x.id); // 대상 상품 prodIds 포함
      Object.assign(form, blank(), defaults, { id: d.id, nm: d.nm, valTypeCd: d.valTypeCd ?? defaults.valTypeCd, value: d.value ?? 0, minOrderAmt: d.minOrderAmt ?? 0, maxDiscntAmt: d.maxDiscntAmt ?? 0, startDate: d.startDate ?? "", endDate: d.endDate ?? "", expireMonth: d.expireMonth ?? 12, statusCd: d.statusCd === "INACTIVE" ? "INACTIVE" : "ACTIVE", desc: d.desc ?? "", prodIds: d.prodIds ?? [] });
    } catch (e) {
      return void useNuxtApp().$toast.error(errText(e, "정보를 불러오지 못했습니다."));
    }
  } else {
    Object.assign(form, blank(), defaults);
  }
  editing.value = true;
}

async function save() {
  err.value = "";
  if (!form.nm.trim()) return void (err.value = "이름을 입력해 주세요.");
  if (!form.value || form.value <= 0) return void (err.value = "값은 0보다 커야 합니다.");
  if (isRate(form.valTypeCd) && form.value > 100) return void (err.value = "비율은 100%를 넘을 수 없습니다.");
  if (kind.value !== "voucher") {
    if (!form.startDate || !form.endDate) return void (err.value = "시작일과 종료일을 입력해 주세요.");
    if (form.endDate < form.startDate) return void (err.value = "종료일은 시작일보다 빠를 수 없습니다.");
    if (!form.prodIds.length) return void (err.value = "대상 상품을 1개 이상 선택해 주세요.");
  }
  saving.value = true;
  try {
    const body: PmSellerPromoSaveType = {
      nm: form.nm.trim(),
      valTypeCd: form.valTypeCd,
      value: form.value,
      minOrderAmt: form.minOrderAmt > 0 ? form.minOrderAmt : undefined,
      maxDiscntAmt: kind.value !== "save" && isRate(form.valTypeCd) && form.maxDiscntAmt > 0 ? form.maxDiscntAmt : undefined,
      startDate: kind.value !== "voucher" ? form.startDate : undefined,
      endDate: kind.value !== "voucher" ? form.endDate : undefined,
      expireMonth: kind.value === "voucher" ? form.expireMonth : undefined,
      statusCd: form.statusCd,
      desc: form.desc || undefined,
      prodIds: kind.value !== "voucher" ? form.prodIds : undefined,
    };
    if (form.id) await pmSellerPromoSvc.update(kind.value, form.id, body);
    else await pmSellerPromoSvc.create(kind.value, body);
    editing.value = false;
    await loadList();
    useNuxtApp().$toast.success("저장되었습니다.");
  } catch (e) {
    err.value = errText(e, "저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}

async function endPromo(x: PmSellerPromoType) {
  if (!(await useConfirm().openConfirm({ title: "종료", message: `'${x.nm}' 을(를) 종료할까요?\n(삭제되지 않고 비활성 처리됩니다.)`, confirmText: "종료", cancelText: "취소", variant: "danger" }))) return;
  try {
    await pmSellerPromoSvc.end(kind.value, x.id);
    await loadList();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "종료에 실패했습니다."));
  }
}

onMounted(async () => {
  useAuthStore().loadStToken();
  if (!useAuthStore().isStLoggedIn) return void (await navigateTo("/login"));
  try {
    seller.value = await slSellerSvc.getMySeller();
    if (seller.value) {
      const [l, p] = await Promise.all([pmSellerPromoSvc.list(kind.value), pdMyProdSvc.getMyProds()]);
      list.value = l;
      prods.value = p.filter((x) => x.prodStatusCd !== "ENDED");
    }
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "정보를 불러오지 못했습니다."));
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.lb { display: block; margin-bottom: 4px; font-size: 0.78rem; color: #6b7280; }
.in { width: 100%; height: 38px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.88rem; outline: none; background: #fff; }
.in:focus { border-color: #bc8246; }
.lnk { padding: 0; border: 0; background: transparent; color: #4b5563; cursor: pointer; text-decoration: underline; }
.btn-sub { padding: 8px 16px; border: 1px solid #c9ced6; border-radius: 8px; background: #f3f4f6; color: #374151; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
