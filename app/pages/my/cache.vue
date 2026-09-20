<template>
  <!-- 2026-09-20 ecFeBo 화면 구조로 통일 / 2026-09-19 — 마이페이지 > 캐쉬 (/my/cache). ecFeBo MyCache.js 이식. 보유 캐쉬 + 충전 폼(<fo-form>) + 적립/사용 이력(<fo-grid>, 서버 페이징).
       충전 API 는 ecBeBo FO 쪽에 없어 "준비 중" 안내만 한다(ecFeBo 도 입력칸만 있음). -->
  <my-page-frame tab="cache" :my="my" :file-path="currentFilePath" empty-text="캐쉬 내역이 없습니다." @btn-action="handleBtnAction" @select-action="handleSelectAction">
    <template #top>
      <div class="rounded-xl px-6 py-5 mb-4 text-gray-900" style="background: linear-gradient(135deg, #fbbf24, #f59e0b)">
        <div class="text-[0.85rem] font-semibold opacity-80">보유 캐쉬</div>
        <div class="text-[2rem] font-black mt-1">{{ formatPrice(balance) }}</div>
      </div>
      <div class="p-4 mb-2 bg-white border border-[#e5e7eb] rounded-lg">
        <fo-form :columns="chargeCols" :form="chargeForm" :cols="1" :gap="8" @submit="handleBtnAction('cash-charge')">
          <template #charge="{ form }">
            <div class="flex gap-2">
              <input v-model="form.amount" class="fo-my-in flex-1" inputmode="numeric" placeholder="충전 금액 입력 (최소 1,000원)" />
              <button type="submit" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-bold cursor-pointer">충전하기</button>
            </div>
          </template>
        </fo-form>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        <button v-for="a in [5000, 10000, 30000, 50000]" :key="a" type="button" class="px-4 py-2 rounded-full border border-[#e5e7eb] bg-white text-[0.82rem] font-semibold text-gray-700 cursor-pointer hover:border-gray-400" @click="handleBtnAction('cash-chargeAdd', a)">+{{ a.toLocaleString() }}원</button>
      </div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="cashId" :loading="my.loading" />
    </div>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/my/MyPageFrame.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import FoForm from "~/components/fo/FoForm.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useMyList, kor, ymd, codeMap } from "~/composables/useMyList";
import { useCodeStore } from "~/store/useCodeStore";
import type { SyCodeType } from "~/types/sy/syCodeType";
import { myCashSvc } from "~/svc/fo/my/myCashSvc";
import type { PmCacheType } from "~/types/pm/pmCacheType";
import type { FoFormColumn, FoGridColumn } from "~/types/fo/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 캐쉬" });
usePageTitle("마이페이지 - 캐쉬");

const codes = reactive({ cache_types: [] as SyCodeType[] });
const balance = ref(0);
const chargeForm = reactive({ amount: "" });
const chargeCols: FoFormColumn[] = [{ key: "charge", type: "slot" }];

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
    // 캐쉬 충전 — ecBeBo FO 쪽 충전 API 가 없어 안내만 (ecFeBo 도 입력칸만 있음)
  } else if (cmd === "cash-charge") {
    const amt = Math.floor(Number(String(chargeForm.amount).replace(/[^0-9]/g, "")));
    if (!amt || amt < 1000) return void useNuxtApp().$toast.error("충전 금액은 1,000원 이상 입력해 주세요.");
    if (amt > 1000000) return void useNuxtApp().$toast.error("1회 충전은 1,000,000원까지 가능합니다.");
    return navigateTo({ path: "/my/charge", query: { amount: String(amt) } });
    // 충전 금액 빠른 추가 (param: 더할 금액)
  } else if (cmd === "cash-chargeAdd") {
    chargeForm.amount = String(Number(chargeForm.amount || 0) + (param as number));
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