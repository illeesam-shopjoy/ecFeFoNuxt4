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
        <!-- 사진으로 자동 작성(Claude 연계) — 사진을 찍거나 고르면 상품명·카테고리·상세설명 초안을 채워 준다. 저장 전 판매자가 확인·수정한다 -->
        <div class="mb-4 rounded-xl border border-[#e0e7ff] bg-[#f5f7ff] px-4 py-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[0.88rem] font-bold text-gray-900"><i class="fas fa-magic mr-1 text-[#4f46e5]"></i>사진으로 자동 작성</span>
            <button type="button" class="ai-btn" :disabled="aiLoading" @click="aiCamera?.click()"><i class="fas fa-camera text-[0.75rem]"></i>사진 촬영</button>
            <button type="button" class="ai-btn" :disabled="aiLoading" @click="aiPicker?.click()"><i class="fas fa-image text-[0.75rem]"></i>사진 선택</button>
            <button v-if="aiPhoto && !aiLoading" type="button" class="ai-btn" @click="handleBtnAction('ai-draft')"><i class="fas fa-redo text-[0.72rem]"></i>다시 작성</button>
            <input ref="aiCamera" type="file" accept="image/*" capture="environment" class="hidden" @change="onAiPhotoPick" />
            <input ref="aiPicker" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="onAiPhotoPick" />
          </div>
          <input v-model="aiHint" class="in mt-2" maxlength="200" placeholder="AI 에게 알려 줄 내용 (선택) — 예: 작년에 산 정품, 박스 있음, 사용감 거의 없음" />
          <p v-if="aiLoading" class="m-0 mt-2 text-[0.82rem] text-[#4f46e5]"><i class="fas fa-spinner fa-spin mr-1"></i>AI 가 사진을 보고 상품정보를 작성하고 있습니다… (10~40초)</p>
          <p v-else-if="aiErr" class="m-0 mt-2 text-[0.82rem] text-red-500">{{ aiErr }}</p>
          <div v-else-if="aiResult" class="mt-2 text-[0.82rem] leading-relaxed text-gray-600">
            <p class="m-0 font-bold text-[#15803d]">AI 가 작성했습니다. 아래 내용을 확인하고 고친 뒤 저장해 주세요.</p>
            <p v-if="aiResult.checkNote" class="m-0 text-[#b45309]">확인 필요: {{ aiResult.checkNote }}</p>
            <p v-if="aiResult.suggestedSalePrice" class="m-0">
              예상 판매가 {{ aiResult.suggestedSalePrice.toLocaleString() }}원 (참고용)
              <button type="button" class="lnk ml-1" @click="handleBtnAction('ai-use-price')">판매가에 넣기</button>
            </p>
            <p v-if="aiResult.tags.length" class="m-0">추천 태그: {{ aiResult.tags.map((t) => "#" + t).join(" ") }}</p>
          </div>
          <p v-else class="m-0 mt-2 text-[0.78rem] text-gray-500">상품 사진 한 장이면 상품명·카테고리·상세설명 초안을 채워 드립니다. 찍은 사진은 대표 이미지로도 올라갑니다.</p>
        </div>

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
            <attach-uploader ref="mainImgUploader" v-model="imgChanges" title="대표 이미지" :show-grp="false" grp-code="PROD_IMG" :max-count="1" :accept="IMG_ACCEPT" @picked="onMainImagePicked" />
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
import type { PdMyProdAiDraftType, PdMyProdSaveType, PdMyProdStatusCd, PdMyProdType } from "~/types/pd/pdMyProdType";
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

// ── 사진으로 자동 작성(Claude 연계) ──
const aiCamera = ref<HTMLInputElement | null>(null);
const aiPicker = ref<HTMLInputElement | null>(null);
const mainImgUploader = ref<{ addFiles: (files: File[]) => Promise<void> } | null>(null);
const aiPhoto = ref<File | null>(null); // 마지막으로 AI 에 보낸(보낼) 사진
const aiHint = ref("");
const aiLoading = ref(false);
const aiErr = ref("");
const aiResult = ref<PdMyProdAiDraftType | null>(null);

const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/prod.vue : handleBtnAction -> ", cmd, param);
  if (cmd === "prod-open-form") {
    return openForm(param as PdMyProdType);
  } else if (cmd === "prod-save") {
    return save();
  } else if (cmd === "ai-draft") {
    return runAiDraft();
  } else if (cmd === "ai-use-price") {
    if (aiResult.value?.suggestedSalePrice) form.salePrice = aiResult.value.suggestedSalePrice;
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

/** 사진을 긴 변 1280px 이하 JPEG 로 줄여 base64 로 만든다 — AI 에 보낼 용도(원본은 대표 이미지로 따로 올라간다) */
async function toAiImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("사진을 처리할 수 없습니다.");
  ctx.fillStyle = "#fff"; // 투명 배경(PNG)이 검게 나오지 않게
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1] ?? "";
}

/** AI 초안 요청 → 입력란 채우기. 이미 적어 둔 상품명·설명이 있으면 덮어쓰기 전에 묻는다 */
async function runAiDraft() {
  if (!aiPhoto.value || aiLoading.value) return;
  aiErr.value = "";
  aiLoading.value = true;
  try {
    const d = await pdMyProdSvc.aiDraft({ imageBase64: await toAiImage(aiPhoto.value), mediaType: "image/jpeg", hint: aiHint.value.trim() || undefined });
    if (!d.prodNm) {
      aiResult.value = null;
      return void (aiErr.value = d.checkNote || "사진에서 상품을 알아보지 못했습니다. 상품이 잘 보이는 사진으로 다시 시도해 주세요.");
    }
    const hasText = !!form.prodNm.trim() || !!form.contentHtml.replace(/<[^>]*>/g, "").trim();
    if (hasText && !(await useConfirm().openConfirm({ title: "AI 자동 작성", message: "이미 입력한 상품명·상세 설명을 AI 가 작성한 내용으로 바꿀까요?", confirmText: "바꾸기", cancelText: "그대로 두기" }))) {
      aiResult.value = d; // 안내(확인 필요·예상가·태그)만 보여 준다
      return;
    }
    form.prodNm = d.prodNm;
    if (d.categoryId && categoryOptions.value.some((c) => c.id === d.categoryId)) form.categoryId = d.categoryId;
    form.contentHtml = d.contentHtml;
    aiResult.value = d;
  } catch (e) {
    aiErr.value = errText(e, "AI 자동 작성에 실패했습니다. 직접 입력해 주세요.");
  } finally {
    aiLoading.value = false;
  }
}

/** [사진 촬영]/[사진 선택] — 그 사진을 대표 이미지로 올리고(비어 있을 때) AI 초안을 만든다 */
async function onAiPhotoPick(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  aiPhoto.value = file;
  if (!imgChanges.value.some((f) => f.rowStatus === "I")) void mainImgUploader.value?.addFiles([file]);
  await runAiDraft();
}

/** 대표 이미지 칸에서 사진을 올렸을 때 — 새 상품이고 아직 상품명이 비어 있으면 그 사진으로 AI 초안을 만든다 */
function onMainImagePicked(files: File[]) {
  const img = files.find((f) => f.type.startsWith("image/"));
  if (!img) return;
  aiPhoto.value = img;
  if (!form.prodId && !form.prodNm.trim()) void runAiDraft();
}

async function openForm(p?: PdMyProdType) {
  err.value = "";
  imgChanges.value = [];
  aiPhoto.value = null;
  aiHint.value = "";
  aiErr.value = "";
  aiResult.value = null;
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
.ai-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border: 1px solid #c7d2fe; border-radius: 8px; background: #fff; color: #4338ca; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.ai-btn:disabled { opacity: 0.5; cursor: default; }
.btn-sub { padding: 8px 16px; border: 1px solid #c9ced6; border-radius: 8px; background: #f3f4f6; color: #374151; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
