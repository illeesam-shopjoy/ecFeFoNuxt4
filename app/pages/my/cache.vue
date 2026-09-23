<template>
  <!-- 2026-09-20 ecFeBo 화면 구조로 통일 / 2026-09-19 — 마이페이지 > 캐쉬 (/my/cache). ecFeBo MyCache.js 이식. 보유 캐쉬 + 적립/사용 이력(<fo-grid>, 서버 페이징).
       2026-09-23(요청사항: "캐시란에 캐시충전하기 기능넣어줘 캐시충전 버튼 클릭하면 모달로 캐시충전화면 띄워주고
       하단에 무료충전 란 넣어줘") — 충전 UI를 CashChargeModal 모달로 분리(실 결제 이동 + 무료충전/강제차감 테스트). -->
  <my-page-frame tab="cache" :my="my" :file-path="currentFilePath" empty-text="캐쉬 내역이 없습니다." @btn-action="handleBtnAction" @select-action="handleSelectAction">
    <template #top>
      <div class="rounded-xl px-6 py-5 mb-4 text-gray-900" style="background: linear-gradient(135deg, #fbbf24, #f59e0b)">
        <div class="text-[0.85rem] font-semibold opacity-80">보유 캐쉬</div>
        <div class="text-[2rem] font-black mt-1">{{ formatPrice(balance) }}</div>
        <button type="button" class="mt-3 rounded-md border-0 bg-white/90 px-4 py-2 text-[0.85rem] font-bold text-[#92400e] cursor-pointer hover:bg-white" @click="chargeModal?.show()">💰 캐시 충전하기</button>
      </div>
    </template>

    <CashChargeModal ref="chargeModal" :balance="balance" @charged="handleSearchList" />

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="cashId" :loading="my.loading" />
    </div>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/my/MyPageFrame.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import CashChargeModal from "~/components/modals/CashChargeModal.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useMyList, kor, ymd, codeMap } from "~/composables/useMyList";
import { useCodeStore } from "~/store/useCodeStore";
import type { SyCodeType } from "~/types/sy/syCodeType";
import { myCashSvc } from "~/svc/fo/my/myCashSvc";
import type { PmCacheType } from "~/types/pm/pmCacheType";
import type { FoGridColumn } from "~/types/fo/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 캐쉬" });
usePageTitle("마이페이지 - 캐쉬");

const codes = reactive({ cache_types: [] as SyCodeType[] });
const balance = ref(0);
const chargeModal = ref<InstanceType<typeof CashChargeModal> | null>(null);

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptCash). 구분 라벨: 서버 한글명 → 공통코드(CACHE_TYPE_CD) — 조회 시점에 1회 변환
function adapt(h: PmCacheType) {
  const amount = Number(h.cacheAmt ?? 0);
  return {
    cashId: String(h.cacheId),
    type: kor(h.cacheTypeCdNm, h.cacheTypeCd, codeMap(codes.cache_types)) || (amount >= 0 ? "적립" : "사용"),
    amount,
    balance: Number(h.balanceAmt ?? 0),
    date: ymd(h.cacheDate),
    desc: String(h.cacheDesc ?? ""),
  };
}

const my = useMyList({
  dateType: "reg_date",
  loader: async (p) => {
    const r = await myCashSvc.getPage(p);
    balance.value = Number(r.balance ?? 0);
    return { rows: (r.history?.pageList ?? []).map(adapt), total: r.history?.pageTotalCount ?? 0, totalPage: r.history?.pageTotalPage || 1 };
  },
});


const columns: FoGridColumn[] = [
  { key: "date", label: "일자", width: "120px" },
  { key: "type", label: "구분", width: "90px", align: "center", badge: (r) => (r.amount >= 0 ? "blue" : "red") },
  { key: "desc", label: "내용", align: "left", fmt: (v) => String(v || "-") },
  { key: "amount", label: "금액", width: "140px", align: "right", fmt: (v) => `${Number(v) >= 0 ? "+" : ""}${formatPrice(Number(v))}`, cellStyle: (v) => `font-weight:900;color:${Number(v) >= 0 ? "#2563eb" : "#ef4444"}` },
  { key: "balance", label: "잔액", width: "140px", align: "right", fmt: (v) => formatPrice(Number(v)) },
];

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/cache.vue : handleBtnAction -> ", cmd, param);
  // 검색조건으로 목록 조회
  if (cmd === "searchParam-list") {
    return my.search();
    // 검색조건 초기화
  } else if (cmd === "searchParam-reset") {
    return my.resetSearch();
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/* handleSelectAction — 행/선택 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleSelectAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/cache.vue : handleSelectAction -> ", cmd, param);
  // 등록기간 프리셋 변경
  if (cmd === "searchParam-preset") {
    return my.applyPreset();
    // 페이지 크기 변경
  } else if (cmd === "pager-size") {
    return my.changePageSize();
    // 페이지 이동 (param: pageNo)
  } else if (cmd === "pager-page") {
    return my.goPage(param as number);
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadCodes — 이 화면이 쓰는 코드그룹만 로딩 */
const fnLoadCodes = async () => {
  const codeStore = useCodeStore();
  await codeStore.saLoadCodes(["CACHE_TYPE_CD"]);
  codes.cache_types = codeStore.sgGetGrpCodes("CACHE_TYPE_CD");
};

/* handleSearchList — 서버 페이징 조회 (등록기간) */
const handleSearchList = () => my.load();

/* initPage — 화면 로드 시퀀스: 로그인 확인 → 코드 로딩 → 초기 조회 */
const initPage = async () => {
  if (!(await my.ensureLogin())) return;
  await fnLoadCodes();
  await handleSearchList();
};
onMounted(initPage);
</script>