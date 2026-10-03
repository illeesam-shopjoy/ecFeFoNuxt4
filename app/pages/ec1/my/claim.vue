<template>
  <!-- 2026-09-19 — 마이페이지 > 취소/반품/교환 (/my/claim). ecFeBo MyClaim.js 이식. 기간 + 유형 서버 페이징, 행 클릭 시 사유/환불/수거 정보 펼침.
       2026-09-20 — ecFeBo 화면 구조(초기변수/액션 dispatch/내장함수/initPage)로 통일. 유형 필터 버튼은 공통코드 CLAIM_TYPE_CD 로 그린다.
       2026-10-03(클레임-부분환불 계약 §7) — 펼침에 품목(상품명·수량·금액)·금액 내역·환불 내역(od_refund 수단/금액/상태)·사유, [철회](REQUESTED/APPROVED) → withdraw → 재조회.
       펼칠 때 GET /fo/my/claim/{id} 로 상세(claimItems/refunds)를 1회 보충 조회한다(목록 응답은 요약만). 상태 배지 색은 claimStatusCd 기준. -->
  <my-page-frame tab="claim" :my="my" empty-text="해당 내역이 없습니다." @btn-action="handleBtnAction" @select-action="handleSelectAction">
    <template #top>
      <div class="flex flex-wrap gap-2 mb-4">
        <button v-for="c in claimFilters()" :key="c.codeValue" type="button" class="px-4 py-2 rounded-full border-2 text-[0.85rem] font-semibold cursor-pointer" :class="searchParam.claimTypeCd === c.codeValue ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-[#e5e7eb]'" @click="handleSelectAction('claims-type', c.codeValue)">
          {{ c.codeLabel }} <span class="opacity-70 font-normal">({{ uiState.counts[c.codeValue] ?? 0 }})</span>
        </button>
      </div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="claimId" :row-click="(r) => handleSelectAction('claims-toggle', r.claimId)" :is-expanded="(r) => my.openId === r.claimId" :loading="my.loading">
        <template #row-expand="{ row, colspan }">
          <td :colspan="colspan" class="!p-0 !border-b !border-[#f3f4f6]">
            <div class="px-4 pb-4 pt-1 text-[0.83rem] text-gray-600 grid gap-2">
              <!-- 품목 (상품명·수량·금액) -->
              <div v-if="detailOf(row).claimItems?.length" class="rounded-lg border border-[#f3f4f6] divide-y divide-[#f3f4f6]">
                <div v-for="ci in detailOf(row).claimItems" :key="ci.orderItemId" class="flex items-center gap-3 px-3 py-2">
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-gray-900 truncate">{{ ci.prodNm || ci.orderItemId }}</div>
                    <div class="text-[0.74rem] text-gray-400">
                      <span v-if="optNm(ci)">{{ optNm(ci) }} · </span>{{ ci.claimQty ?? 0 }}개<template v-if="ci.unitPrice"> · {{ formatPrice(ci.unitPrice) }}</template>
                      <template v-if="row.typeCd === 'EXCHANGE' && (ci.newSkuCode || ci.newProdSkuId)"> · 교환 → {{ ci.newSkuCode || ci.newProdSkuId }} {{ ci.newQty ?? ci.claimQty ?? 0 }}개</template>
                    </div>
                  </div>
                  <div class="text-gray-800 font-semibold whitespace-nowrap">{{ formatPrice(ci.refundAmt ?? ci.itemAmt ?? 0) }}</div>
                </div>
              </div>
              <div v-else-if="uiState.detailLoading[row.claimId]" class="text-gray-400">품목을 불러오는 중…</div>
              <div v-else-if="row.claimItemCnt" class="text-gray-400">품목 {{ row.claimItemCnt }}건 · 수량 {{ row.claimQtySum }}개</div>

              <!-- 사유 / 처리 정보 -->
              <div class="grid gap-1">
                <div v-if="row.reason">사유: <b class="text-gray-800">{{ row.reason }}</b><template v-if="row.reasonDetail"> — {{ row.reasonDetail }}</template></div>
                <div v-if="row.completeDate">처리일: {{ row.completeDate }}</div>
                <div v-if="row.refundMethod">환불수단: {{ row.refundMethod }}<template v-if="detailOf(row).refundBankCdNm || detailOf(row).refundAccountNo"> ({{ detailOf(row).refundBankCdNm || detailOf(row).refundBankCd }} {{ detailOf(row).refundAccountNo }} {{ detailOf(row).refundAccountNm }})</template></div>
                <div v-if="row.courier || row.trackingNo">수거 택배: {{ row.courier }} {{ row.trackingNo }}</div>
              </div>

              <!-- 금액 내역 (서버 계산값 그대로) -->
              <div v-if="row.typeCd !== 'EXCHANGE' || detailOf(row).returnShippingFee" class="rounded-lg bg-[#fafaf9] border border-[#f3f4f6] px-3.5 py-2.5 grid gap-1 text-[0.8rem]">
                <div class="flex justify-between"><span>상품금액</span><span class="font-semibold text-gray-800">{{ formatPrice(detailOf(row).refundProdAmt ?? 0) }}</span></div>
                <div v-if="detailOf(row).refundCouponAmt" class="flex justify-between"><span>쿠폰 할인 차감</span><span>-{{ formatPrice(detailOf(row).refundCouponAmt ?? 0) }}</span></div>
                <div v-if="detailOf(row).refundSaveAmt" class="flex justify-between"><span>적립금·캐시 복원</span><span>-{{ formatPrice(detailOf(row).refundSaveAmt ?? 0) }}</span></div>
                <div v-if="detailOf(row).refundShippingAmt" class="flex justify-between"><span>배송비 환불</span><span>{{ (detailOf(row).refundShippingAmt ?? 0) < 0 ? "-" : "+" }}{{ formatPrice(Math.abs(detailOf(row).refundShippingAmt ?? 0)) }}</span></div>
                <div v-if="detailOf(row).returnShippingFee" class="flex justify-between"><span>반품/교환 배송비</span><span>-{{ formatPrice(detailOf(row).returnShippingFee ?? 0) }}</span></div>
                <div class="flex justify-between border-t border-[#e5e7eb] pt-1 mt-0.5"><span class="font-bold text-gray-900">환불{{ row.statusCd === "COMPLT" ? "" : " 예정" }}액</span><span class="font-black text-gray-900">{{ formatPrice(detailOf(row).refundAmt ?? 0) }}</span></div>
                <div v-if="detailOf(row).fullClaimYn === 'Y'" class="text-[0.72rem] text-emerald-700">남은 수량 전부 → 배송비 환불 포함</div>
              </div>

              <!-- 환불 내역 (od_refund — 완료 처리 후 생성) -->
              <div v-if="detailOf(row).refunds?.length" class="grid gap-1">
                <div class="font-semibold text-gray-700">환불 내역</div>
                <div v-for="rf in detailOf(row).refunds" :key="rf.refundId" class="rounded-lg border border-[#f3f4f6] px-3 py-2 grid gap-0.5 text-[0.78rem]">
                  <div class="flex justify-between"><span>{{ rf.refundTypeCdNm || REFUND_TYPE_KOR[String(rf.refundTypeCd ?? "")] || rf.refundTypeCd }} · {{ ymd(rf.refundDate || rf.regDate) }}</span><span class="font-semibold text-gray-800">{{ formatPrice(rf.totalRefundAmt ?? 0) }} <span class="ml-1 inline-block rounded-full px-2 py-0.5 text-[0.7rem] font-bold text-white align-middle" :style="{ background: REFUND_STATUS_COLOR[String(rf.refundStatusCd ?? '')] || '#9ca3af' }">{{ rf.refundStatusCdNm || REFUND_STATUS_KOR[String(rf.refundStatusCd ?? "")] || rf.refundStatusCd }}</span></span></div>
                  <div v-for="(m, mi) in rf.refundMethods ?? []" :key="mi" class="flex justify-between text-gray-500 pl-2">
                    <span>└ {{ m.payMethodCdNm || PAY_METHOD_KOR[String(m.payMethodCd ?? "")] || m.payMethodCd }}</span>
                    <span>{{ formatPrice(m.refundAmt ?? 0) }} · {{ m.refundStatusCdNm || REFUND_STATUS_KOR[String(m.refundStatusCd ?? "")] || m.refundStatusCd }}</span>
                  </div>
                </div>
              </div>

              <!-- 철회 — REQUESTED/APPROVED 에서만 -->
              <div v-if="WITHDRAWABLE.includes(row.statusCd)" class="flex justify-end">
                <button type="button" class="rounded-md border border-[#d1d5db] bg-white px-3.5 py-1.5 text-[0.78rem] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50" :disabled="uiState.withdrawing === row.claimId" @click.stop="handleBtnAction('claims-withdraw', row.claimId)">{{ uiState.withdrawing === row.claimId ? "철회 중…" : "신청 철회" }}</button>
              </div>
            </div>
          </td>
        </template>
      </fo-grid>
    </div>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/ec1/my/MyPageFrame.vue";
import FoGrid from "~/components/ec1/fo/FoGrid.vue";
import { useMyList, ymd, kor, codeMap } from "~/composables/useMyList";
import { useCodeStore } from "~/store/useCodeStore";
import { myClaimSvc } from "~/svc/fo/my/myClaimSvc";
import type { MyListParams } from "~/types/fo/foMyType";
import type { OdClaimType } from "~/types/od/odClaimType";
import type { OdClaimItemType } from "~/types/od/odClaimItemType";
import type { SyCodeType } from "~/types/sy/syCodeType";
import type { FoGridColumn } from "~/types/fo/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 취소/반품/교환" });

const CLAIM_TYPE_KOR: Record<string, string> = { CANCEL: "취소", RETURN: "반품", EXCHANGE: "교환" };
const CLAIM_TYPE_COLOR: Record<string, string> = { 취소: "#ef4444", 반품: "#f97316", 교환: "#3b82f6" };
// 클레임상태(계약 §1) — 코드 기준 라벨/배지색. 라벨은 서버 한글명 → 공통코드(CLAIM_STATUS_CD) → 이 매핑
const CLAIM_STATUS_KOR: Record<string, string> = { REQUESTED: "신청", APPROVED: "승인", IN_PICKUP: "수거중", PROCESSING: "처리중", REFUND_WAIT: "환불대기", COMPLT: "완료", REJECTED: "반려", CANCELLED: "철회" };
const CLAIM_STATUS_COLOR: Record<string, string> = { REQUESTED: "#ef4444", APPROVED: "#3b82f6", IN_PICKUP: "#f59e0b", PROCESSING: "#8b5cf6", REFUND_WAIT: "#f97316", COMPLT: "#22c55e", REJECTED: "#6b7280", CANCELLED: "#9ca3af" };
const WITHDRAWABLE = ["REQUESTED", "APPROVED"]; // 고객 철회 가능 상태
const REASON_KOR: Record<string, string> = { CHANGE_MIND: "단순변심", WRONG_ORDER: "잘못 주문", DEFECT: "상품 불량", WRONG_DELIVERY: "오배송", DELIVERY_DELAY: "배송 지연", ETC: "기타" };
const REFUND_TYPE_KOR: Record<string, string> = { CANCEL: "취소 환불", RETURN: "반품 환불", PARTIAL: "부분 환불", EXTRA: "추가 환불" };
const REFUND_STATUS_KOR: Record<string, string> = { PENDING: "대기", COMPLT: "완료", FAILED: "실패" };
const REFUND_STATUS_COLOR: Record<string, string> = { PENDING: "#f97316", COMPLT: "#22c55e", FAILED: "#ef4444" };
const PAY_METHOD_KOR: Record<string, string> = { TOSS: "토스", KAKAO: "카카오페이", NAVER: "네이버페이", BANK_TRANSFER: "무통장입금", VBANK: "가상계좌", CACHE: "캐시 복원" };

const codes = reactive({ claim_types: [] as SyCodeType[], claim_status: [] as SyCodeType[] });
const uiState = reactive({
  counts: {} as Record<string, number>,
  details: {} as Record<string, OdClaimType>, // 펼칠 때 보충 조회한 상세(claimItems/refunds)
  detailLoading: {} as Record<string, boolean>,
  withdrawing: "" as string, // 철회 진행 중인 claimId
});
const searchParam = reactive({ claimTypeCd: "" });

const columns: FoGridColumn[] = [
  { key: "type", label: "유형", width: "80px", align: "center", badge: (r) => CLAIM_TYPE_COLOR[r.type] || "#6b7280" },
  { key: "status", label: "상태", width: "110px", align: "center", badge: (r) => CLAIM_STATUS_COLOR[r.statusCd] || "#9ca3af" },
  { key: "claimId", label: "클레임번호", width: "190px", mono: true, align: "left", cellStyle: "font-weight:600;color:#111827" },
  { key: "orderId", label: "주문번호", width: "190px", mono: true, align: "left" },
  { key: "requestDate", label: "신청일", width: "120px" },
  { key: "refundAmount", label: "환불금액", align: "right", fmt: (v) => (Number(v) ? formatPrice(Number(v)) : "-"), cellStyle: "font-weight:800;color:#111827" },
];

// 유형 필터 버튼 목록 — "전체" + 공통코드(CLAIM_TYPE_CD). 코드 로딩 전/실패 시 기본 3종
const claimFilters = () => [
  { codeValue: "", codeLabel: "전체" },
  ...(codes.claim_types.length ? codes.claim_types : Object.entries(CLAIM_TYPE_KOR).map(([codeValue, codeLabel]) => ({ codeValue, codeLabel }))),
];

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptClaim) — 조회 시점에 1회 변환
function adapt(c: OdClaimType) {
  const tnm = String(c.claimTypeCdNm ?? "");
  const typeMap = { ...CLAIM_TYPE_KOR, ...codeMap(codes.claim_types) };
  const statusCd = String(c.claimStatusCd ?? "").toUpperCase();
  return {
    raw: c, // 목록 응답 원본 — 상세 보충 조회 전까지 펼침 영역이 이 값을 쓴다
    claimId: String(c.claimId),
    orderId: String(c.orderId ?? ""),
    typeCd: String(c.claimTypeCd ?? "").toUpperCase(),
    type: /[가-힣]/.test(tnm) ? (tnm.includes("취소") ? "취소" : tnm.includes("반품") ? "반품" : tnm.includes("교환") ? "교환" : tnm) : typeMap[String(c.claimTypeCd ?? "")] || String(c.claimTypeCd ?? ""),
    statusCd,
    status: kor(c.claimStatusCdNm, statusCd, { ...CLAIM_STATUS_KOR, ...codeMap(codes.claim_status) }),
    requestDate: ymd(c.requestDate),
    completeDate: ymd(c.procDate),
    reason: kor(c.reasonCdNm, c.reasonCd, REASON_KOR),
    reasonDetail: String(c.reasonDetail ?? ""),
    refundAmount: Number(c.refundAmt ?? 0),
    refundMethod: String(c.refundMethodCdNm || PAY_METHOD_KOR[String(c.refundMethodCd ?? "")] || c.refundMethodCd || ""),
    courier: String(c.returnCourierCdNm || c.returnCourierCd || ""),
    trackingNo: String(c.returnTrackingNo || ""),
    claimItemCnt: Number(c.claimItemCnt ?? c.claimItems?.length ?? 0),
    claimQtySum: Number(c.claimQtySum ?? (c.claimItems ?? []).reduce((s, i) => s + Number(i.claimQty ?? 0), 0)),
  };
}
type ClaimRow = ReturnType<typeof adapt>;

/** 펼침 영역이 보는 클레임 — 보충 조회한 상세가 있으면 그것, 없으면 목록 원본 */
const detailOf = (row: ClaimRow): OdClaimType => uiState.details[row.claimId] ?? row.raw;
const optNm = (ci: OdClaimItemType) => [ci.prodOptNm1, ci.prodOptNm2].filter(Boolean).join(" / ") || String(ci.skuCode ?? "");

const my = useMyList({
  dateType: "request_date",
  loader: async (p) => {
    const r = await myClaimSvc.getPage(p);
    return { rows: (r.pageList ?? []).map(adapt), total: r.pageTotalCount ?? 0, totalPage: r.pageTotalPage || 1 };
  },
  extra: () => (searchParam.claimTypeCd ? { claimTypeCd: searchParam.claimTypeCd } : {}),
  // 유형별 건수 배지 — 같은 기간으로 유형별 1건씩만 조회해 총건수만 사용 (실패해도 화면은 계속 동작)
  afterLoad: (params) => {
    const { pageNo: _p, pageSize: _s, claimTypeCd: _c, ...base } = params;
    Promise.all(claimFilters().map((f) => myClaimSvc.getPage({ ...base, pageNo: 1, pageSize: 1, ...(f.codeValue ? { claimTypeCd: f.codeValue } : {}) } as MyListParams).then((r) => [f.codeValue, r.pageTotalCount ?? 0] as const)))
      .then((arr) => (uiState.counts = Object.fromEntries(arr)))
      .catch(() => {});
  },
});

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/claim.vue : handleBtnAction -> ", cmd, param);
  // 검색조건으로 목록 조회
  if (cmd === "searchParam-list") {
    return my.search();
    // 검색조건 초기화
  } else if (cmd === "searchParam-reset") {
    searchParam.claimTypeCd = "";
    return my.resetSearch();
    // 신청 철회 (param: claimId) — REQUESTED/APPROVED 에서만, 확인 → POST /fo/my/claim/{id}/withdraw → 재조회
  } else if (cmd === "claims-withdraw") {
    return fnWithdraw(param as string);
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/* handleSelectAction — 행/선택 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleSelectAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/claim.vue : handleSelectAction -> ", cmd, param);
  // 등록기간 프리셋 변경
  if (cmd === "searchParam-preset") {
    return my.applyPreset();
    // 페이지 크기 변경
  } else if (cmd === "pager-size") {
    return my.changePageSize();
    // 페이지 이동 (param: pageNo)
  } else if (cmd === "pager-page") {
    return my.goPage(param as number);
    // 클레임 유형 필터 (param: 유형코드, '' = 전체)
  } else if (cmd === "claims-type") {
    searchParam.claimTypeCd = param as string;
    return my.search();
    // 클레임 행 펼침/접힘 (param: claimId) — 펼칠 때 상세(claimItems/refunds) 1회 보충 조회
  } else if (cmd === "claims-toggle") {
    my.toggle(param as string);
    if (my.openId === param) fnLoadDetail(param as string);
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadCodes — 이 화면이 쓰는 코드그룹만 로딩 */
const fnLoadCodes = async () => {
  const codeStore = useCodeStore();
  await codeStore.saLoadCodes(["CLAIM_TYPE_CD", "CLAIM_STATUS_CD"]);
  codes.claim_types = codeStore.sgGetGrpCodes("CLAIM_TYPE_CD");
  codes.claim_status = codeStore.sgGetGrpCodes("CLAIM_STATUS_CD");
};

/* fnLoadDetail — GET /fo/my/claim/{id} 로 품목·환불 내역 보충 (이미 받았으면 생략, 실패해도 목록 원본으로 표시) */
const fnLoadDetail = async (claimId: string) => {
  if (uiState.details[claimId] || uiState.detailLoading[claimId]) return;
  uiState.detailLoading[claimId] = true;
  try {
    uiState.details[claimId] = await myClaimSvc.getById(claimId);
  } catch (err) {
    console.warn("[my/claim.vue] 클레임 상세 조회 실패:", claimId, err);
  } finally {
    uiState.detailLoading[claimId] = false;
  }
};

/* fnWithdraw — 신청 철회: 확인 → withdraw → 알림 → 목록/상세 재조회 */
const fnWithdraw = async (claimId: string) => {
  const row = my.rows.find((r) => r.claimId === claimId);
  if (!row || !WITHDRAWABLE.includes(row.statusCd)) return void useNuxtApp().$toast.error("지금 상태에서는 철회할 수 없습니다.");
  const ok = await useConfirm().openConfirm({ title: `${row.type} 신청 철회`, message: `${row.type} 신청을 철회하시겠습니까?\n철회하면 다시 되돌릴 수 없으며, 필요하면 새로 신청해야 합니다.`, confirmText: "철회", variant: "danger" });
  if (!ok) return;
  uiState.withdrawing = claimId;
  try {
    await myClaimSvc.withdraw(claimId);
    delete uiState.details[claimId];
    await useAlert().openAlert(`${row.type} 신청이 철회되었습니다.`);
    await handleSearchList();
  } catch (err) {
    const e = err as { statusMessage?: string; data?: { message?: string }; message?: string };
    useNuxtApp().$toast.error(e?.data?.message || e?.statusMessage || e?.message || "철회에 실패했습니다.");
  } finally {
    uiState.withdrawing = "";
  }
};

/* handleSearchList — 서버 페이징 조회 (기간 + 유형). 재조회 시 보충 상세 캐시도 비운다 */
const handleSearchList = () => {
  uiState.details = {};
  return my.load();
};

/* initPage — 화면 로드 시퀀스: 로그인 확인 → 코드 로딩 → 초기 조회 */
const initPage = async () => {
  if (!(await my.ensureLogin())) return;
  await fnLoadCodes();
  await handleSearchList();
};
onMounted(initPage);
</script>
