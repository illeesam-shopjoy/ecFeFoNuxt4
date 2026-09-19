<template>
  <!-- 2026-09-19 — 마이페이지 > 취소/반품/교환 (/my/claim). ecFeBo MyClaim.js 이식. 기간 + 유형 서버 페이징, 행 클릭 시 사유/환불/수거 정보 펼침. -->
  <my-page-frame tab="claim" :my="my" :file-path="currentFilePath" empty-text="해당 내역이 없습니다.">
    <template #top>
      <div class="flex flex-wrap gap-2 mb-4">
        <button v-for="c in CLAIM_FILTERS" :key="c.key" type="button" class="px-4 py-2 rounded-full border-2 text-[0.85rem] font-semibold cursor-pointer" :class="claimType === c.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-[#e5e7eb]'" @click="setType(c.key)">
          {{ c.label }} <span class="opacity-70 font-normal">({{ claimCounts[c.key] ?? 0 }})</span>
        </button>
      </div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="claimId" :row-click="(r) => my.toggle(r.claimId)" :is-expanded="(r) => my.openId === r.claimId" :loading="my.loading">
        <template #row-expand="{ row, colspan }">
          <td :colspan="colspan" class="!p-0 !border-b !border-[#f3f4f6]">
            <div class="px-4 pb-4 pt-1 text-[0.83rem] text-gray-600 grid gap-1">
              <div v-if="row.reason">사유: <b class="text-gray-800">{{ row.reason }}</b><template v-if="row.reasonDetail"> — {{ row.reasonDetail }}</template></div>
              <div v-if="row.completeDate">처리일: {{ row.completeDate }}</div>
              <div v-if="row.refundMethod">환불수단: {{ row.refundMethod }}</div>
              <div v-if="row.courier || row.trackingNo">수거 택배: {{ row.courier }} {{ row.trackingNo }}</div>
              <div v-if="!row.reason && !row.completeDate && !row.refundMethod && !row.courier && !row.trackingNo" class="text-gray-400">추가 정보가 없습니다.</div>
            </div>
          </td>
        </template>
      </fo-grid>
    </div>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/my/MyPageFrame.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useMyList, ymd } from "~/composables/useMyList";
import { myClaimSvc } from "~/svc/fo/my/myClaimSvc";
import type { MyListParams, MyRow } from "~/types/foMyType";
import type { FoGridColumn } from "~/types/foCompType";

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 취소/반품/교환" });
usePageTitle("마이페이지 - 취소/반품/교환");

const CLAIM_FILTERS = [
  { key: "", label: "전체" },
  { key: "CANCEL", label: "취소" },
  { key: "RETURN", label: "반품" },
  { key: "EXCHANGE", label: "교환" },
];
const CLAIM_TYPE_KOR: Record<string, string> = { CANCEL: "취소", RETURN: "반품", EXCHANGE: "교환" };
const CLAIM_TYPE_COLOR: Record<string, string> = { 취소: "#ef4444", 반품: "#f97316", 교환: "#3b82f6" };
const CLAIM_STATUS_COLOR: Record<string, string> = {
  취소요청: "#ef4444", 취소처리중: "#f97316", 취소완료: "#9ca3af", 반품요청: "#ef4444", 수거예정: "#f59e0b", 수거중: "#fb923c",
  검수중: "#8b5cf6", 환불대기: "#f97316", 환불완료: "#9ca3af", 교환요청: "#3b82f6", 교환완료: "#9ca3af",
};

const claimType = ref("");
const claimCounts = ref<Record<string, number>>({});

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptClaim) — 조회 시점에 1회 변환
function adapt(c: MyRow) {
  const tnm = String(c.claimTypeCdNm ?? "");
  return {
    claimId: String(c.claimId),
    orderId: String(c.orderId ?? ""),
    type: /[가-힣]/.test(tnm) ? (tnm.includes("취소") ? "취소" : tnm.includes("반품") ? "반품" : tnm.includes("교환") ? "교환" : tnm) : CLAIM_TYPE_KOR[String(c.claimTypeCd ?? "")] || String(c.claimTypeCd ?? ""),
    status: c.claimStatusCdNm && /[가-힣]/.test(String(c.claimStatusCdNm)) ? String(c.claimStatusCdNm) : String(c.claimStatusCd ?? ""),
    requestDate: ymd(c.requestDate),
    completeDate: ymd(c.procDate),
    reason: String(c.reasonCd ?? ""),
    reasonDetail: String(c.reasonDetail ?? ""),
    refundAmount: Number(c.refundAmt ?? 0),
    refundMethod: String(c.refundMethodCdNm || c.refundMethodCd || ""),
    courier: String(c.returnCourierCdNm || c.returnCourierCd || ""),
    trackingNo: String(c.returnTrackingNo || ""),
  };
}

const my = useMyList({
  dateType: "request_date",
  loader: async (p) => {
    const r = await myClaimSvc.getPage(p);
    return { rows: (r.pageList ?? []).map(adapt), total: r.pageTotalCount ?? 0, totalPage: r.pageTotalPage || 1 };
  },
  extra: () => (claimType.value ? { claimTypeCd: claimType.value } : {}),
  // 유형별 건수 배지 — 같은 기간으로 유형별 1건씩만 조회해 총건수만 사용 (실패해도 화면은 계속 동작)
  afterLoad: (params) => {
    const { pageNo: _p, pageSize: _s, claimTypeCd: _c, ...base } = params;
    Promise.all(CLAIM_FILTERS.map((f) => myClaimSvc.getPage({ ...base, pageNo: 1, pageSize: 1, ...(f.key ? { claimTypeCd: f.key } : {}) } as MyListParams).then((r) => [f.key, r.pageTotalCount ?? 0] as const)))
      .then((arr) => (claimCounts.value = Object.fromEntries(arr)))
      .catch(() => {});
  },
});


const columns: FoGridColumn[] = [
  { key: "type", label: "유형", width: "80px", align: "center", badge: (r) => CLAIM_TYPE_COLOR[r.type] || "#6b7280" },
  { key: "status", label: "상태", width: "110px", align: "center", badge: (r) => CLAIM_STATUS_COLOR[r.status] || "#9ca3af" },
  { key: "claimId", label: "클레임번호", width: "190px", mono: true, align: "left", cellStyle: "font-weight:600;color:#111827" },
  { key: "orderId", label: "주문번호", width: "190px", mono: true, align: "left" },
  { key: "requestDate", label: "신청일", width: "120px" },
  { key: "refundAmount", label: "환불금액", align: "right", fmt: (v) => (Number(v) ? formatPrice(Number(v)) : "-"), cellStyle: "font-weight:800;color:#111827" },
];

function setType(k: string) {
  claimType.value = k;
  my.search();
}
</script>
