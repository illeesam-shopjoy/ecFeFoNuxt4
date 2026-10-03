<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9600] flex items-center justify-center bg-[#1a1410]/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" :aria-label="`${typeLabel} 신청`" @click.self="hide">
      <div class="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <!-- 머리 -->
        <div class="flex items-center justify-between border-b border-[#eceef1] px-5 py-3.5">
          <h3 class="m-0 flex items-center gap-2 text-[1.05rem] font-bold text-gray-900"><span aria-hidden="true">↩️</span> {{ typeLabel }} 신청</h3>
          <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f1f2f4] text-xl leading-none text-gray-600 hover:bg-[#e4e6ea]" aria-label="닫기" @click="hide">×</button>
        </div>

        <div class="overflow-y-auto px-5 py-4 text-[0.85rem]">
          <!-- 주문 요약 -->
          <div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-[#f9fafb] px-3.5 py-2.5 text-[0.78rem] text-gray-500">
            <span>주문번호 <b class="font-mono text-gray-800">{{ form.orderId }}</b></span>
            <span v-if="payMethodNm">결제수단 <b class="text-gray-800">{{ payMethodNm }}</b></span>
          </div>

          <!-- 유형 탭 — 신청 가능한 품목이 하나도 없는 유형은 비활성 -->
          <div class="mb-4 flex gap-1.5">
            <button v-for="t in CLAIM_TYPES" :key="t.cd" type="button" class="flex-1 rounded-lg border py-2 text-[0.85rem] font-bold" :class="form.claimTypeCd === t.cd ? 'border-gray-900 bg-gray-900 text-white' : 'border-[#e5e7eb] bg-white text-gray-600 hover:border-gray-400'" :disabled="!typeAvailable(t.cd)" :title="typeAvailable(t.cd) ? '' : `${t.label} 가능한 상품이 없습니다`" @click="fnChangeType(t.cd)">
              {{ t.label }}
            </button>
          </div>

          <!-- 품목 + 수량 스텝퍼 -->
          <label class="mb-1.5 block text-[0.82rem] font-semibold text-gray-700">신청 상품 <span class="font-normal text-gray-400">(수량 0 은 제외됩니다)</span></label>
          <div class="divide-y divide-[#f3f4f6] rounded-lg border border-[#e5e7eb]">
            <div v-for="it in rows" :key="it.orderItemId" class="px-3.5 py-3">
              <div class="flex items-center gap-3">
                <div class="min-w-0 flex-1">
                  <div class="truncate font-semibold text-gray-900">{{ it.prodNm }}</div>
                  <div class="text-[0.75rem] text-gray-400">
                    <span v-if="it.optNm">{{ it.optNm }} · </span>{{ formatPrice(it.unitPrice) }} · 주문 {{ it.orderQty }}개 · 남은 <b class="text-gray-600">{{ it.claimableQty }}</b>개
                  </div>
                </div>
                <div class="flex items-center overflow-hidden rounded-md border border-[#d1d5db]">
                  <button type="button" class="h-8 w-8 cursor-pointer border-0 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40" :disabled="it.claimQty <= 0" aria-label="수량 감소" @click="fnStep(it, -1)">−</button>
                  <input :value="it.claimQty" inputmode="numeric" class="h-8 w-11 border-x border-[#d1d5db] text-center text-[0.85rem] font-bold text-gray-900 outline-none" :aria-label="`${it.prodNm} 수량`" @input="fnSetQty(it, ($event.target as HTMLInputElement).value)" />
                  <button type="button" class="h-8 w-8 cursor-pointer border-0 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40" :disabled="it.claimQty >= it.claimableQty" aria-label="수량 증가" @click="fnStep(it, 1)">+</button>
                </div>
              </div>
              <!-- 교환: 바꿀 옵션(SKU) 선택 — 같은 상품의 다른 SKU, 재고 없는 것은 비활성 -->
              <div v-if="form.claimTypeCd === 'EXCHANGE' && it.claimQty > 0" class="mt-2 flex items-center gap-2">
                <span class="shrink-0 text-[0.78rem] text-gray-500">교환 옵션</span>
                <select v-model="it.newProdSkuId" class="h-8 flex-1 rounded-md border border-[#d1d5db] bg-white px-2 text-[0.82rem]" :disabled="it.skuLoading">
                  <option value="">{{ it.skuLoading ? "옵션을 불러오는 중…" : it.skuOptions.length ? "교환할 옵션을 선택해 주세요" : "교환 가능한 다른 옵션이 없습니다" }}</option>
                  <option v-for="s in it.skuOptions" :key="s.prodSkuId" :value="s.prodSkuId" :disabled="s.stockQty < it.claimQty">{{ s.label }} (재고 {{ s.stockQty }})</option>
                </select>
              </div>
            </div>
            <div v-if="!rows.length" class="px-3.5 py-4 text-center text-gray-400">{{ typeLabel }} 신청 가능한 상품이 없습니다.</div>
          </div>

          <!-- 사유 -->
          <label class="mb-1.5 mt-4 block text-[0.82rem] font-semibold text-gray-700">사유</label>
          <select v-model="form.reasonCd" class="cl-in mb-2 w-full">
            <option value="">사유를 선택해 주세요</option>
            <option v-for="r in REASONS" :key="r.cd" :value="r.cd">{{ r.label }}</option>
          </select>
          <textarea v-model="form.reasonDetail" rows="2" maxlength="500" placeholder="상세 사유 (선택)" class="cl-in w-full resize-none"></textarea>

          <!-- 환불계좌 — 무통장/가상계좌 주문의 취소·반품만 -->
          <template v-if="needBank">
            <label class="mb-1.5 mt-4 block text-[0.82rem] font-semibold text-gray-700">환불 계좌 <span class="font-normal text-gray-400">(무통장/가상계좌 주문은 입력하신 계좌로 환불됩니다)</span></label>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <select v-if="bankCodes.length" v-model="form.refundBankCd" class="cl-in w-full">
                <option value="">은행 선택</option>
                <option v-for="b in bankCodes" :key="b.codeValue" :value="b.codeValue">{{ b.codeLabel }}</option>
              </select>
              <input v-else v-model="form.refundBankCd" placeholder="은행명" class="cl-in w-full" />
              <input v-model="form.refundAccountNo" inputmode="numeric" placeholder="계좌번호 ('-' 없이)" class="cl-in w-full" @input="form.refundAccountNo = form.refundAccountNo.replace(/[^0-9]/g, '')" />
              <input v-model="form.refundAccountNm" placeholder="예금주" class="cl-in w-full" />
            </div>
          </template>

          <!-- 금액 미리보기 -->
          <div v-if="preview" class="mt-4 rounded-lg border border-[#e5e7eb] bg-[#fafaf9] px-4 py-3">
            <div class="mb-1.5 text-[0.82rem] font-bold text-gray-800">환불 예정 내역</div>
            <div class="grid gap-1 text-[0.8rem] text-gray-600">
              <div class="flex justify-between"><span>상품금액</span><span class="font-semibold text-gray-800">{{ formatPrice(preview.refundProdAmt ?? 0) }}</span></div>
              <div v-if="preview.refundCouponAmt" class="flex justify-between"><span>쿠폰 할인 차감</span><span>-{{ formatPrice(preview.refundCouponAmt) }}</span></div>
              <div v-if="preview.refundSaveAmt" class="flex justify-between"><span>적립금·캐시 복원 <span class="text-gray-400">(캐시 잔액으로 복원)</span></span><span>-{{ formatPrice(preview.refundSaveAmt) }}</span></div>
              <div v-if="preview.refundShippingAmt" class="flex justify-between"><span>배송비 환불</span><span>{{ (preview.refundShippingAmt ?? 0) < 0 ? "-" : "+" }}{{ formatPrice(Math.abs(preview.refundShippingAmt ?? 0)) }}</span></div>
              <div v-if="preview.returnShippingFee" class="flex justify-between"><span>반품/교환 배송비 <span class="text-gray-400">(고객 귀책)</span></span><span>-{{ formatPrice(preview.returnShippingFee) }}</span></div>
              <div class="mt-1 flex justify-between border-t border-[#e5e7eb] pt-1.5 text-[0.9rem]"><span class="font-bold text-gray-900">환불 예정액</span><span class="font-black text-gray-900">{{ formatPrice(preview.refundAmt ?? 0) }}</span></div>
            </div>
            <p v-if="preview.fullClaimYn === 'Y'" class="m-0 mt-2 text-[0.74rem] text-emerald-700">남은 수량 전부를 {{ typeLabel }}하는 신청이라 배송비가 환불 대상에 포함됩니다.</p>
            <p v-else-if="form.claimTypeCd !== 'EXCHANGE'" class="m-0 mt-2 text-[0.74rem] text-gray-400">일부 수량만 {{ typeLabel }}하는 경우 배송비는 환불되지 않습니다.</p>
            <p v-if="form.claimTypeCd === 'EXCHANGE'" class="m-0 mt-2 text-[0.74rem] text-gray-400">교환은 현금 환불이 없으며, 옵션 가격 차이는 별도 안내됩니다.</p>
          </div>
          <p v-else class="m-0 mt-3 text-[0.76rem] text-gray-400">[금액 확인]을 누르면 환불 예정 금액을 미리 볼 수 있습니다.</p>
        </div>

        <!-- 바닥 버튼 -->
        <div class="flex gap-2 border-t border-[#eceef1] px-5 py-3.5">
          <button type="button" class="mbtn mbtn-ghost flex-1" :disabled="busy" @click="hide">닫기</button>
          <button type="button" class="mbtn mbtn-ghost flex-1" :disabled="busy || !rows.length" @click="handleBtnAction('claim-preview')">{{ previewing ? "계산 중…" : "금액 확인" }}</button>
          <button type="button" class="mbtn mbtn-primary flex-1" :disabled="busy || !rows.length" @click="handleBtnAction('claim-submit')">{{ submitting ? "신청 중…" : "신청" }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * ClaimRequestModal — 마이페이지 > 주문의 [취소 신청]/[반품 신청]/[교환 신청] 버튼에서 연다. show(order, type) 으로 열고 신청 완료 시 done 을 emit.
 * 2026-10-03 클레임-부분환불 계약(z0docs/정책서/ec/od/od.13.클레임-부분환불.impl-2026-10-03.md §2·§7):
 *  - 품목별 수량 스텝퍼(0..claimableQty — 서버가 주문 목록 응답 OdOrderItemDto.Item 에 채운 남은 수량), 유형 탭은 품목의 claimableTypeCds 로 활성 여부 결정.
 *  - 교환이면 pdProductSvc.getById(prodId).prodSkus 중 원 SKU 를 뺀 다른 SKU 를 옵션명(prodOpt1List/prodOpt2List 매칭, 없으면 skuCode)+재고로 보여준다. newQty = claimQty.
 *  - 무통장/가상계좌 주문의 취소·반품은 환불계좌 3개 필수(공통코드 BANK_CODE 가 있으면 select, 없으면 자유 입력). 주문에 환불계좌가 있으면 미리 채운다.
 *  - [금액 확인] → myClaimSvc.preview(저장 안 함) 결과를 내역으로 표시, [신청] → myClaimSvc.create. 금액 계산은 전부 서버(ClaimAmountCalculator) — 화면은 계산하지 않는다.
 */
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useCodeStore } from "~/store/useCodeStore";
import { myClaimSvc } from "~/svc/fo/my/myClaimSvc";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import type { OdOrderType } from "~/types/od/odOrderType";
import type { OdOrderItemType } from "~/types/od/odOrderItemType";
import type { OdClaimType } from "~/types/od/odClaimType";
import type { OdClaimReqType } from "~/types/od/odClaimReqType";
import type { PdProdType } from "~/types/pd/pdProdType";
import type { SyCodeType } from "~/types/sy/syCodeType";

/* ##### [01] 초기 변수 정의 ################################################## */

const emit = defineEmits<{ (e: "done", claim: OdClaimType): void }>();
const { formatPrice } = usePrice();

const CLAIM_TYPES = [
  { cd: "CANCEL", label: "취소" },
  { cd: "RETURN", label: "반품" },
  { cd: "EXCHANGE", label: "교환" },
];
// 사유코드(계약 §1) — 고객 귀책 여부는 서버가 판정한다
const REASONS = [
  { cd: "CHANGE_MIND", label: "단순변심" },
  { cd: "WRONG_ORDER", label: "잘못 주문" },
  { cd: "DEFECT", label: "상품 불량" },
  { cd: "WRONG_DELIVERY", label: "오배송" },
  { cd: "DELIVERY_DELAY", label: "배송 지연" },
  { cd: "ETC", label: "기타" },
];
const BANK_PAY_METHODS = ["BANK_TRANSFER", "VBANK"];

/** 화면 품목 행 — 주문상품 + 신청 수량 + 교환 옵션 */
interface ClaimRow {
  orderItemId: string;
  prodId: string;
  prodSkuId: string;
  prodNm: string;
  optNm: string;
  unitPrice: number;
  orderQty: number;
  claimableQty: number;
  claimableTypeCds: string[];
  claimQty: number;
  newProdSkuId: string;
  skuOptions: { prodSkuId: string; label: string; stockQty: number }[];
  skuLoading: boolean;
}

const open = ref(false);
const order = ref<OdOrderType | null>(null);
const allRows = ref<ClaimRow[]>([]);
const form = reactive({ orderId: "", claimTypeCd: "CANCEL", reasonCd: "", reasonDetail: "", refundBankCd: "", refundAccountNo: "", refundAccountNm: "" });
const preview = ref<OdClaimType | null>(null);
const previewing = ref(false);
const submitting = ref(false);
const bankCodes = ref<SyCodeType[]>([]);
const prodCache = new Map<string, Promise<PdProdType>>(); // 교환 옵션용 상품 상세 — 같은 상품은 1회만 조회

const busy = computed(() => previewing.value || submitting.value);
const typeLabel = computed(() => CLAIM_TYPES.find((t) => t.cd === form.claimTypeCd)?.label ?? "클레임");
const payMethodNm = computed(() => order.value?.payMethodCdNm || order.value?.payMethodCd || "");
/** 현재 유형으로 신청 가능한 품목만 */
const rows = computed(() => allRows.value.filter((r) => r.claimableQty > 0 && r.claimableTypeCds.includes(form.claimTypeCd)));
const needBank = computed(() => form.claimTypeCd !== "EXCHANGE" && BANK_PAY_METHODS.includes(String(order.value?.payMethodCd ?? "")));
const typeAvailable = (cd: string) => allRows.value.some((r) => r.claimableQty > 0 && r.claimableTypeCds.includes(cd));

// 입력이 바뀌면 미리보기 금액은 더 이상 유효하지 않다
watch([form, allRows], () => (preview.value = null), { deep: true });

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string, param: unknown = {}) => {
  console.log(" ■■ ClaimRequestModal : handleBtnAction -> ", cmd, param);
  // 금액 미리보기 (저장 안 함)
  if (cmd === "claim-preview") {
    const body = fnBuildBody();
    if (!body) return;
    previewing.value = true;
    try {
      preview.value = await myClaimSvc.preview(body);
    } catch (err) {
      useNuxtApp().$toast.error(fnErrMsg(err, "금액 계산에 실패했습니다."));
    } finally {
      previewing.value = false;
    }
    // 신청
  } else if (cmd === "claim-submit") {
    const body = fnBuildBody();
    if (!body) return;
    const qty = body.items.reduce((s, i) => s + i.claimQty, 0);
    const ok = await useConfirm().openConfirm({ title: `${typeLabel.value} 신청`, message: `${body.items.length}개 상품 ${qty}개를 ${typeLabel.value} 신청합니다.\n신청 후에는 마이페이지 > 취소/반품/교환에서 확인·철회할 수 있습니다.`, confirmText: "신청" });
    if (!ok) return;
    submitting.value = true;
    try {
      const res = await myClaimSvc.create(body);
      hide();
      await useAlert().openAlert(`${typeLabel.value} 신청이 완료되었습니다.${res?.refundAmt ? `\n환불 예정액: ${formatPrice(res.refundAmt)}` : ""}`);
      emit("done", res);
    } catch (err) {
      useNuxtApp().$toast.error(fnErrMsg(err, `${typeLabel.value} 신청에 실패했습니다.`));
    } finally {
      submitting.value = false;
    }
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape" && !busy.value) hide();
}

/** show(order, type) — 주문과 유형으로 열기. 품목 행을 주문상품에서 만든다(claimableQty/claimableTypeCds 는 서버가 채운 값) */
function show(o: OdOrderType, type = "CANCEL") {
  order.value = o;
  form.orderId = String(o.orderId);
  form.reasonCd = "";
  form.reasonDetail = "";
  form.refundBankCd = String(o.refundBankCd ?? "");
  form.refundAccountNo = String(o.refundAccountNo ?? "");
  form.refundAccountNm = String(o.refundAccountNm ?? "");
  allRows.value = (Array.isArray(o.orderItems) ? o.orderItems : []).map((it: OdOrderItemType) => ({
    orderItemId: String(it.orderItemId),
    prodId: String(it.prodId ?? ""),
    prodSkuId: String(it.prodSkuId ?? ""),
    prodNm: String(it.prodNm ?? ""),
    optNm: [it.prodOptNm1, it.prodOptNm2].filter(Boolean).join(" / ") || String(it.skuCode ?? ""),
    unitPrice: Number(it.unitPrice ?? 0),
    orderQty: Number(it.orderQty ?? 0),
    claimableQty: Math.max(0, Number(it.claimableQty ?? 0)),
    claimableTypeCds: Array.isArray(it.claimableTypeCds) ? it.claimableTypeCds : [],
    claimQty: 0,
    newProdSkuId: "",
    skuOptions: [],
    skuLoading: false,
  }));
  // 요청한 유형이 불가하면 가능한 첫 유형으로
  form.claimTypeCd = typeAvailable(type) ? type : (CLAIM_TYPES.find((t) => typeAvailable(t.cd))?.cd ?? type);
  preview.value = null;
  open.value = true;
  window.addEventListener("keydown", onKey);
  fnLoadCodes();
}
function hide() {
  open.value = false;
  window.removeEventListener("keydown", onKey);
}
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

/* fnLoadCodes — 환불은행 공통코드(BANK_CODE). 없으면 자유 입력으로 동작 */
const fnLoadCodes = async () => {
  try {
    const codeStore = useCodeStore();
    await codeStore.saLoadCodes(["BANK_CODE"]);
    bankCodes.value = codeStore.sgGetGrpCodes("BANK_CODE");
  } catch {
    bankCodes.value = [];
  }
};

/* fnChangeType — 유형 탭 변경: 수량·교환옵션 초기화 */
const fnChangeType = (cd: string) => {
  if (!typeAvailable(cd) || form.claimTypeCd === cd) return;
  form.claimTypeCd = cd;
  allRows.value.forEach((r) => {
    r.claimQty = 0;
    r.newProdSkuId = "";
  });
};

/* fnStep / fnSetQty — 수량 스텝퍼 (0..claimableQty). 교환이면 수량이 생길 때 SKU 옵션을 불러온다 */
const fnStep = (r: ClaimRow, d: number) => fnSetQty(r, String(r.claimQty + d));
const fnSetQty = (r: ClaimRow, v: string) => {
  const n = Math.trunc(Number(String(v).replace(/[^0-9]/g, "")) || 0);
  r.claimQty = Math.min(Math.max(0, n), r.claimableQty);
  if (r.claimQty === 0) r.newProdSkuId = "";
  if (form.claimTypeCd === "EXCHANGE" && r.claimQty > 0 && !r.skuOptions.length && !r.skuLoading) fnLoadSkuOptions(r);
};

/* fnLoadSkuOptions — 교환 옵션: 같은 상품의 다른 SKU(원 SKU 제외) + 옵션명 + 재고 */
const fnLoadSkuOptions = async (r: ClaimRow) => {
  if (!r.prodId) return;
  r.skuLoading = true;
  try {
    let p = prodCache.get(r.prodId);
    if (!p) {
      p = pdProductSvc.getById(r.prodId);
      prodCache.set(r.prodId, p);
    }
    const prod = await p;
    const optNm = new Map<string, string>([...(prod.prodOpt1List ?? []), ...(prod.prodOpt2List ?? [])].map((o) => [String(o.prodOptId), o.prodOptNm]));
    r.skuOptions = (prod.prodSkus ?? [])
      .filter((s) => s.prodSkuId && s.prodSkuId !== r.prodSkuId && s.useYn !== "N")
      .map((s) => ({
        prodSkuId: s.prodSkuId,
        label: [s.prodOpt1Id, s.prodOpt2Id].map((id) => (id ? optNm.get(String(id)) : "")).filter(Boolean).join(" / ") || String(s.skuCode ?? s.prodSkuId),
        stockQty: Number(s.stockQty ?? 0),
      }));
  } catch (err) {
    prodCache.delete(r.prodId);
    useNuxtApp().$toast.error(fnErrMsg(err, "교환 옵션을 불러오지 못했습니다."));
  } finally {
    r.skuLoading = false;
  }
};

/* fnBuildBody — 입력 검증 후 요청 본문(FoClaimReqDto) 생성. 검증 실패면 토스트 후 null */
const fnBuildBody = (): OdClaimReqType | null => {
  const picked = rows.value.filter((r) => r.claimQty > 0);
  if (!picked.length) return fnInvalid("신청할 상품의 수량을 선택해 주세요.");
  if (picked.some((r) => r.claimQty > r.claimableQty)) return fnInvalid("남은 수량을 초과해 신청할 수 없습니다.");
  if (!form.reasonCd) return fnInvalid("사유를 선택해 주세요.");
  if (form.claimTypeCd === "EXCHANGE") {
    const miss = picked.find((r) => !r.newProdSkuId);
    if (miss) return fnInvalid(`'${miss.prodNm}' 의 교환할 옵션을 선택해 주세요.`);
    const short = picked.find((r) => (r.skuOptions.find((s) => s.prodSkuId === r.newProdSkuId)?.stockQty ?? 0) < r.claimQty);
    if (short) return fnInvalid(`'${short.prodNm}' 의 선택한 옵션 재고가 부족합니다.`);
  }
  if (needBank.value) {
    if (!form.refundBankCd) return fnInvalid("환불 받을 은행을 선택해 주세요.");
    if (!form.refundAccountNo) return fnInvalid("환불 계좌번호를 입력해 주세요.");
    if (!form.refundAccountNm.trim()) return fnInvalid("예금주명을 입력해 주세요.");
  }
  return {
    orderId: form.orderId,
    claimTypeCd: form.claimTypeCd,
    reasonCd: form.reasonCd,
    reasonDetail: form.reasonDetail.trim() || undefined,
    ...(needBank.value ? { refundBankCd: form.refundBankCd, refundAccountNo: form.refundAccountNo, refundAccountNm: form.refundAccountNm.trim() } : {}),
    items: picked.map((r) => ({
      orderItemId: r.orderItemId,
      claimQty: r.claimQty,
      ...(form.claimTypeCd === "EXCHANGE" ? { newProdSkuId: r.newProdSkuId, newQty: r.claimQty } : {}),
    })),
  };
};
const fnInvalid = (msg: string): null => {
  useNuxtApp().$toast.error(msg);
  return null;
};
const fnErrMsg = (err: unknown, fallback: string) => {
  const e = err as { statusMessage?: string; data?: { message?: string }; message?: string };
  return e?.data?.message || e?.statusMessage || e?.message || fallback;
};

defineExpose({ show, hide });
</script>

<style scoped>
/* 모달 입력 공통 — select/input/textarea */
.cl-in {
  min-height: 40px;
  padding: 0.45rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 0.85rem;
  color: #111827;
  outline: none;
}
.cl-in:focus {
  border-color: #6b7280;
}
</style>
