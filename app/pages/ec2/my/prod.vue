<template>
  <!-- 마이페이지 > 판매 상품 관리 (/my/prod, 2026-10-02 · 셀러 Phase 2 · 2B) — 승인된 판매자가 단품(SINGLE) 상품을 등록/수정/판매종료한다.
       출고 창고는 필수(내 창고 중 선택, 기본 출고지가 미리 선택됨). 상품 소유·유형·사이트는 서버가 정한다. -->
  <my-shell active="prod" title="판매 상품 관리" :file-path="currentFilePath">
    <div v-if="loading" class="py-16 text-center text-gray-400">불러오는 중...</div>

    <div v-else-if="!seller" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center">
      <p class="m-0 mb-4 text-[0.9rem] text-gray-500">판매자만 사용할 수 있는 메뉴입니다.</p>
      <NuxtLink to="/my/seller-apply" class="rounded-lg bg-gray-900 px-5 py-2.5 text-[0.85rem] font-bold text-white no-underline">판매자 신청하기</NuxtLink>
    </div>

    <template v-else>
      <div v-if="seller.sellerStatusCd !== 'ACTIVE'" class="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[0.85rem] text-[#92400e]">
        판매자 승인이 완료되면 상품을 등록할 수 있습니다. (현재 상태: {{ seller.sellerStatusCd === "PENDING" ? "승인 대기" : "이용정지" }})
      </div>

      <div class="mb-4 flex items-center justify-between">
        <p class="m-0 text-[0.85rem] text-gray-500">판매 중인 단품 상품을 관리합니다. 상품을 지우면 삭제되지 않고 <b>판매종료</b> 처리됩니다.</p>
        <button type="button" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-4 py-2 text-[0.85rem] font-bold text-white disabled:opacity-50" :disabled="seller.sellerStatusCd !== 'ACTIVE' || !warehouses.length" @click="handleBtnAction('prod-open-form')">+ 상품 등록</button>
      </div>
      <p v-if="seller.sellerStatusCd === 'ACTIVE' && !warehouses.length" class="mb-4 mt-0 rounded-lg bg-[#fef2f2] px-3 py-2 text-[0.82rem] text-red-600">
        출고 창고가 없습니다. 상품을 등록하려면 먼저 <NuxtLink to="/my/seller-warehouse" class="font-bold underline">창고를 등록</NuxtLink>해 주세요.
      </p>

      <form v-if="editing" class="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-5" @submit.prevent="handleBtnAction('prod-save')">
        <h3 class="m-0 mb-3 text-[1rem] font-bold text-gray-900">{{ form.prodId ? "상품 수정" : "상품 등록" }}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block sm:col-span-2"><span class="lb">상품명 *</span><input v-model="form.prodNm" class="in" maxlength="200" /></label>
          <label class="block">
            <span class="lb">카테고리 *</span>
            <select v-model="form.categoryId" class="in">
              <option value="">선택</option>
              <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.label }}</option>
            </select>
          </label>
          <label class="block">
            <span class="lb">출고 창고 *</span>
            <select v-model="form.warehouseId" class="in">
              <option value="">선택</option>
              <option v-for="w in warehouses" :key="w.warehouseId" :value="w.warehouseId">{{ w.warehouseNm }}{{ w.isDefault === "Y" ? " (기본)" : "" }}</option>
            </select>
          </label>
          <label class="block"><span class="lb">판매가(원) *</span><input v-model.number="form.salePrice" class="in" type="number" min="1" /></label>
          <label class="block"><span class="lb">정가(원) <span class="text-gray-400">— 비우면 판매가와 같음</span></span><input v-model.number="form.stdPrice" class="in" type="number" min="0" /></label>
          <label class="block"><span class="lb">재고수량 *</span><input v-model.number="form.stockQty" class="in" type="number" min="0" /></label>
          <label class="block">
            <span class="lb">판매 상태</span>
            <select v-model="form.prodStatusCd" class="in"><option value="ACTIVE">판매중</option><option value="INACTIVE">판매중지</option></select>
          </label>
          <div class="sm:col-span-2">
            <span class="lb">대표 이미지 <span class="text-gray-400">— {{ form.prodId ? "새로 올리면 교체됩니다" : "1장" }}</span></span>
            <img v-if="form.prodId && currentThumb && !imgChanges.length" :src="currentThumb" alt="" class="mb-2 h-20 w-20 rounded-lg object-cover" />
            <attach-uploader v-model="imgChanges" title="대표 이미지" :show-grp="false" grp-code="PROD_IMG" :max-count="1" :accept="IMG_ACCEPT" />
          </div>
          <div class="sm:col-span-2">
            <span class="lb">상세 설명</span>
            <html-editor v-model="form.contentHtml" height="220px" placeholder="상품 상세 설명" upload-code="PROD_CONTENT_IMG" />
          </div>
        </div>
        <p v-if="err" class="m-0 mt-2 text-[0.8rem] text-red-500">{{ err }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="btn-sub" @click="editing = false">취소</button>
          <button type="submit" class="cursor-pointer rounded-lg border-0 bg-gray-900 px-5 py-2 text-[0.85rem] font-bold text-white disabled:opacity-60" :disabled="saving">{{ saving ? "저장 중..." : "저장" }}</button>
        </div>
      </form>

      <div v-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 py-14 text-center text-gray-400">등록한 상품이 없습니다.</div>
      <ul v-else class="m-0 grid list-none gap-3 p-0">
        <li v-for="p in list" :key="p.prodId" class="flex gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-4" :class="p.prodStatusCd === 'ENDED' ? 'opacity-60' : ''">
          <img v-if="p.thumbnailUrl" :src="p.thumbnailUrl" alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover" />
          <div v-else class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300"><i class="far fa-image"></i></div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="truncate font-bold text-gray-900">{{ p.prodNm }}</span>
              <span class="rounded-full px-2 py-px text-[0.72rem] font-bold" :class="STATUS_CLASS[p.prodStatusCd ?? 'ACTIVE']">{{ STATUS_LABEL[p.prodStatusCd ?? "ACTIVE"] }}</span>
              <span class="ml-auto flex gap-2 text-[0.8rem]">
                <NuxtLink v-if="p.prodStatusCd !== 'ENDED'" :to="`/prod-dtl/${p.prodId}`" class="lnk no-underline">보기</NuxtLink>
                <button v-if="p.prodStatusCd !== 'ENDED'" type="button" class="lnk" @click="handleBtnAction('prod-open-form', p)">수정</button>
                <button v-if="p.prodStatusCd !== 'ENDED'" type="button" class="lnk !text-red-500" @click="handleBtnAction('prod-end', p)">판매종료</button>
              </span>
            </div>
            <div class="mt-1 text-[0.85rem] text-gray-700">{{ (p.salePrice ?? 0).toLocaleString() }}원<span v-if="p.stdPrice && p.stdPrice > (p.salePrice ?? 0)" class="ml-1 text-gray-400 line-through">{{ p.stdPrice.toLocaleString() }}원</span></div>
            <div class="text-[0.8rem] text-gray-500">재고 {{ p.stockQty ?? 0 }}개 · 출고 {{ p.warehouseNm || "-" }}</div>
          </div>
        </li>
      </ul>
    </template>
  </my-shell>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import MyShell from "~/components/ec2/my/MyShell.vue";
import AttachUploader from "~/components/ec2/ui/AttachUploader.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useAuthStore } from "~/store/useAuthStore";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import { slSellerSvc } from "~/svc/fo/ec/sl/slSellerSvc";
import { slSellerWarehouseSvc } from "~/svc/fo/ec/sl/slSellerWarehouseSvc";
import type { PdMyProdSaveType, PdMyProdStatusCd, PdMyProdType } from "~/types/pd/pdMyProdType";
import type { SlSellerMyType } from "~/types/sl/slSellerApplyType";
import type { SlSellerWarehouseType } from "~/types/sl/slSellerWarehouseType";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

// TipTap(ProseMirror) 번들이 커서 에디터가 실제로 그려질 때 별도 파일로 받는다
const HtmlEditor = defineAsyncComponent(() => import("~/components/ec2/ui/HtmlEditor.vue"));

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 판매 상품 관리" });
usePageTitle("마이페이지 - 판매 상품 관리");

const STATUS_LABEL: Record<PdMyProdStatusCd, string> = { ACTIVE: "판매중", INACTIVE: "판매중지", ENDED: "판매종료", DRAFT: "임시저장" };
const STATUS_CLASS: Record<PdMyProdStatusCd, string> = {
  ACTIVE: "bg-[#dcfce7] text-[#15803d]",
  INACTIVE: "bg-[#fef3c7] text-[#b45309]",
  ENDED: "bg-gray-100 text-gray-500",
  DRAFT: "bg-gray-100 text-gray-500",
};
const IMG_ACCEPT = ["jpg", "jpeg", "png", "gif", "webp"];

const loading = ref(true);
const seller = ref<SlSellerMyType | null>(null);
const list = ref<PdMyProdType[]>([]);
const warehouses = ref<SlSellerWarehouseType[]>([]);
const categoryOptions = ref<{ id: string; label: string }[]>([]);
const editing = ref(false);
const saving = ref(false);
const err = ref("");
const imgChanges = ref<SyAttachChangeType[]>([]);
const currentThumb = ref("");
const blank = () => ({ prodId: "", prodNm: "", categoryId: "", warehouseId: "", salePrice: 0, stdPrice: 0, stockQty: 0, prodStatusCd: "ACTIVE" as "ACTIVE" | "INACTIVE", contentHtml: "" });
const form = reactive(blank());

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/prod.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "prod-open-form") {
    return openForm(param as PdMyProdType);
  } else if (cmd === "prod-save") {
    return save();
  } else if (cmd === "prod-end") {
    return endProd(param as PdMyProdType);
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/** 카테고리 평탄 목록 → "상위 > 하위" 라벨 (뎁스 순서 유지) */
function buildCategoryOptions(rows: { categoryId: string; categoryNm: string; parentCategoryId?: string }[]) {
  const byId = new Map(rows.map((r) => [r.categoryId, r]));
  const labelOf = (id: string): string => {
    const r = byId.get(id);
    if (!r) return "";
    return r.parentCategoryId && byId.has(r.parentCategoryId) ? `${labelOf(r.parentCategoryId)} > ${r.categoryNm}` : r.categoryNm;
  };
  return rows.map((r) => ({ id: r.categoryId, label: labelOf(r.categoryId) })).sort((a, b) => a.label.localeCompare(b.label, "ko"));
}

async function loadList() {
  list.value = (await pdMyProdSvc.getMyProds()).slice().sort((a, b) => (a.prodStatusCd === "ENDED" ? 1 : 0) - (b.prodStatusCd === "ENDED" ? 1 : 0));
}

async function openForm(p?: PdMyProdType) {
  err.value = "";
  imgChanges.value = [];
  if (p?.prodId) {
    try {
      const d = await pdMyProdSvc.getMyProd(p.prodId); // 상세설명까지 포함된 최신 값
      Object.assign(form, blank(), { prodId: d.prodId, prodNm: d.prodNm, categoryId: d.categoryId ?? "", warehouseId: d.warehouseId ?? "", salePrice: d.salePrice ?? 0, stdPrice: d.stdPrice ?? 0, stockQty: d.stockQty ?? 0, prodStatusCd: d.prodStatusCd === "INACTIVE" ? "INACTIVE" : "ACTIVE", contentHtml: d.contentHtml ?? "" });
      currentThumb.value = d.thumbnailUrl ?? "";
    } catch (e) {
      return void useNuxtApp().$toast.error(errText(e, "상품 정보를 불러오지 못했습니다."));
    }
  } else {
    // 새 상품 — 기본 출고지가 있으면 미리 선택
    Object.assign(form, blank(), { warehouseId: (warehouses.value.find((w) => w.isDefault === "Y") ?? warehouses.value[0])?.warehouseId ?? "" });
    currentThumb.value = "";
  }
  editing.value = true;
}

async function save() {
  err.value = "";
  if (!form.prodNm.trim()) return void (err.value = "상품명을 입력해 주세요.");
  if (!form.categoryId) return void (err.value = "카테고리를 선택해 주세요.");
  if (!form.warehouseId) return void (err.value = "출고 창고를 선택해 주세요.");
  if (!form.salePrice || form.salePrice < 1) return void (err.value = "판매가는 1원 이상이어야 합니다.");
  if (form.stdPrice && form.stdPrice < form.salePrice) return void (err.value = "정가는 판매가보다 작을 수 없습니다.");
  if (form.stockQty == null || form.stockQty < 0) return void (err.value = "재고수량은 0 이상이어야 합니다.");
  saving.value = true;
  try {
    const body: PdMyProdSaveType = {
      prodNm: form.prodNm.trim(),
      categoryId: form.categoryId,
      warehouseId: form.warehouseId,
      salePrice: form.salePrice,
      stdPrice: form.stdPrice > 0 ? form.stdPrice : undefined,
      stockQty: form.stockQty,
      contentHtml: form.contentHtml,
      prodStatusCd: form.prodStatusCd,
      attachId: imgChanges.value.find((f) => f.rowStatus === "I")?.attachId,
    };
    if (form.prodId) await pdMyProdSvc.updateProd(form.prodId, body);
    else await pdMyProdSvc.createProd(body);
    editing.value = false;
    await loadList();
    useNuxtApp().$toast.success("저장되었습니다.");
  } catch (e) {
    err.value = errText(e, "저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}

async function endProd(p: PdMyProdType) {
  if (!(await useConfirm().openConfirm({ title: "판매종료", message: `'${p.prodNm}' 의 판매를 종료할까요?\n(상품은 삭제되지 않고 판매종료로 표시됩니다.)`, confirmText: "판매종료", cancelText: "취소", variant: "danger" }))) return;
  try {
    await pdMyProdSvc.endProd(p.prodId);
    await loadList();
  } catch (e) {
    useNuxtApp().$toast.error(errText(e, "판매종료에 실패했습니다."));
  }
}

onMounted(async () => {
  useAuthStore().loadStToken();
  if (!useAuthStore().isStLoggedIn) return void (await navigateTo("/login"));
  try {
    seller.value = await slSellerSvc.getMySeller();
    if (seller.value) {
      const [prods, whs, cats] = await Promise.all([pdMyProdSvc.getMyProds(), slSellerWarehouseSvc.getMyWarehouses(), pdMyProdSvc.getCategories()]);
      list.value = prods.slice().sort((a, b) => (a.prodStatusCd === "ENDED" ? 1 : 0) - (b.prodStatusCd === "ENDED" ? 1 : 0));
      warehouses.value = whs.filter((w) => w.useYn !== "N");
      categoryOptions.value = buildCategoryOptions(cats);
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
