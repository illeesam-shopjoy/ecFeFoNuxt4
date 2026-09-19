<template>
  <!-- 2026-09-19 — 마이페이지 > 취소/반품/교환 (/my/claim). ecFeBo MyClaim.js 이식. 기간 + 유형 서버 페이징, 행 클릭 시 사유/환불/수거 정보 펼침.
       2026-09-20 — ecFeBo 화면 구조(초기변수/액션 dispatch/내장함수/initPage)로 통일. 유형 필터 버튼은 공통코드 CLAIM_TYPE_CD 로 그린다. -->
  <my-page-frame tab="claim" :my="my" :file-path="currentFilePath" empty-text="해당 내역이 없습니다." @btn-action="handleBtnAction" @select-action="handleSelectAction">
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
import { useMyList, ymd, codeMap } from "~/composables/useMyList";
import { useCodeStore } from "~/store/useCodeStore";
import { myClaimSvc } from "~/svc/fo/my/myClaimSvc";
import type { MyListParams, MyRow } from "~/types/foMyType";
import type { SyCodeType } from "~/types/syCodeType";
import type { FoGridColumn } from "~/types/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 취소/반품/교환" });
usePageTitle("마이페이지 - 취소/반품/교환");

const CLAIM_TYPE_KOR: Record<string, string> = { CANCEL: "취소", RETURN: "반품", EXCHANGE: "교환" };
const CLAIM_TYPE_COLOR: Record<string, string> = { 취소: "#ef4444", 반품: "#f97316", 교환: "#3b82f6" };
const CLAIM_STATUS_COLOR: Record<string, string> = {
  취소요청: "#ef4444", 취소처리중: "#f97316", 취소완료: "#9ca3af", 반품요청: "#ef4444", 수거예정: "#f59e0b", 수거중: "#fb923c",
  검수중: "#8b5cf6", 환불대기: "#f97316", 환불완료: "#9ca3af", 교환요청: "#3b82f6", 교환완료: "#9ca3af",
};

const codes = reactive({ claim_types: [] as SyCodeType[] });
const uiState = reactive({ counts: {} as Record<string, number> });
const searchParam = reactive({ claimTypeCd: "" });

const columns: FoGridColumn[] = [
  { key: "type", label: "유형", width: "80px", align: "center", badge: (r) => CLAIM_TYPE_COLOR[r.type] || "#6b7280" },
  { key: "status", label: "상태", width: "110px", align: "center", badge: (r) => CLAIM_STATUS_COLOR[r.status] || "#9ca3af" },
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
function adapt(c: MyRow) {
  const tnm = String(c.claimTypeCdNm ?? "");
  const typeMap = { ...CLAIM_TYPE_KOR, ...codeMap(codes.claim_types) };
  return {
    claimId: String(c.claimId),
    orderId: String(c.orderId ?? ""),
    type: /[가-힣]/.test(tnm) ? (tnm.includes("취소") ? "취소" : tnm.includes("반품") ? "반품" : tnm.includes("교환") ? "교환" : tnm) : typeMap[String(c.claimTypeCd ?? "")] || String(c.claimTypeCd ?? ""),
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
    // 클레임 행 펼침/접힘 (param: claimId)
  } else if (cmd === "claims-toggle") {
    my.toggle(param as string);
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadCodes — 이 화면이 쓰는 코드그룹만 로딩 */
const fnLoadCodes = async () => {
  const codeStore = useCodeStore();
  await codeStore.saLoadCodes(["CLAIM_TYPE_CD"]);
  codes.claim_types = codeStore.sgGetGrpCodes("CLAIM_TYPE_CD");
};

/* handleSearchList — 서버 페이징 조회 (기간 + 유형) */
const handleSearchList = () => my.load();

/* initPage — 화면 로드 시퀀스: 로그인 확인 → 코드 로딩 → 초기 조회 */
const initPage = async () => {
  if (!(await my.ensureLogin())) return;
  await fnLoadCodes();
  await handleSearchList();
};
onMounted(initPage);
</script>
