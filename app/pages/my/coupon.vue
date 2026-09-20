<template>
  <!-- 2026-09-20 ecFeBo 화면 구조로 통일 / 2026-09-19 — 마이페이지 > 쿠폰 (/my/coupon). ecFeBo MyCoupon.js 이식. 등록 폼(<fo-form>) + 미사용/사용 탭(클라이언트 필터) + 쿠폰 목록(<fo-grid>).
       쿠폰 코드 등록 API 는 ecBeBo FO 쪽에 없어 등록은 "준비 중" 안내만 한다(ecFeBo 도 동일). -->
  <my-page-frame tab="coupon" :my="my" :file-path="currentFilePath" empty-text="사용 가능한 쿠폰이 없습니다." :count="shown().length" :shown="shown().length" @btn-action="handleBtnAction" @select-action="handleSelectAction">
    <template #top>
      <div class="p-4 mb-4 bg-white border border-[#e5e7eb] rounded-lg">
        <fo-form :columns="regCols" :form="regForm" :cols="1" :gap="8" @submit="handleBtnAction('coupon-register')">
          <template #reg="{ form }">
            <div class="flex gap-2">
              <input v-model="form.couponCode" class="fo-my-in flex-1" placeholder="쿠폰 코드 입력 (예: SPRING5000)" />
              <button type="submit" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-bold cursor-pointer">쿠폰 등록</button>
            </div>
          </template>
        </fo-form>
      </div>
      <div class="flex border-b border-[#e5e7eb] mb-2">
        <button v-for="c in COUPON_TABS" :key="c.key" type="button" class="px-6 py-3 bg-transparent border-0 border-b-2 -mb-px cursor-pointer text-[0.88rem]" :class="uiState.couponTab === c.key ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-400'" @click="handleSelectAction('coupons-tab', c.key)">
          {{ c.label }} <span class="font-normal">({{ countOf(c.key) }})</span>
        </button>
      </div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="shown()" row-key="couponId" :row-class="(r) => (r.used ? 'opacity-50' : '')" :loading="my.loading" />
    </div>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/my/MyPageFrame.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import FoForm from "~/components/fo/FoForm.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useMyList, ymd } from "~/composables/useMyList";
import { myCouponSvc } from "~/svc/fo/my/myCouponSvc";
import type { MyRow } from "~/types/fo/foMyType";
import type { FoFormColumn, FoGridColumn } from "~/types/fo/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 쿠폰" });
usePageTitle("마이페이지 - 쿠폰");

const COUPON_TABS = [
  { key: "unused", label: "미사용" },
  { key: "used", label: "사용" },
] as const;
const uiState = reactive({ couponTab: "unused" as "unused" | "used" });
const regForm = reactive({ couponCode: "" });
const regCols: FoFormColumn[] = [{ key: "reg", type: "slot" }];

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptCoupon) — 조회 시점에 1회 변환
function adapt(c: MyRow) {
  const type = couponType(c);
  const status = String(c.couponStatusCd ?? "").toUpperCase();
  const minOrder = Number(c.minOrderAmt ?? 0);
  const expiry = ymd(c.validTo);
  const value = type === "rate" ? Number(c.discountRate ?? 0) : Number(c.discountAmt ?? 0);
  return {
    couponId: String(c.couponId),
    name: String(c.couponNm ?? ""),
    code: String(c.couponCd ?? ""),
    discount: type === "rate" ? `${value}% 할인` : type === "shipping" ? "무료배송" : `${value.toLocaleString()}원 할인`,
    cond: [minOrder ? `${formatPrice(minOrder)} 이상 구매 시` : "", String(c.targetTypeCdNm ?? "")].filter(Boolean).join(" · "),
    expiry: expiry ? `~ ${expiry}` : "",
    used: status.includes("USED") || status.includes("USE_DONE") || c.couponStatusCdNm === "사용완료",
  };
}

const my = useMyList({
  dateType: "reg_date",
  loader: async (p) => {
    const r = await myCouponSvc.getPage(p);
    return { rows: (r.pageList ?? []).map(adapt), total: r.pageTotalCount ?? 0, totalPage: r.pageTotalPage || 1 };
  },
});

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptCoupon)
function couponType(c: MyRow): "rate" | "amount" | "shipping" {
  const cd = String(c.couponTypeCd ?? "").toUpperCase();
  const nm = String(c.couponTypeCdNm ?? "");
  if (cd.includes("SHIP") || nm.includes("배송")) return "shipping";
  if (cd.includes("RATE") || cd.includes("PCT") || nm.includes("율") || nm.includes("%")) return "rate";
  if (cd.includes("AMT") || cd.includes("AMOUNT") || nm.includes("금액") || nm.includes("원")) return "amount";
  return Number(c.discountRate ?? 0) > 0 ? "rate" : "amount";
}
// 미사용/사용 탭은 조회된 페이지 안에서 클라이언트 필터 (템플릿에서 호출 — 탭/조회 변경 시 자동 재계산)
const isTab = (used: boolean, k: string) => (k === "used" ? used : !used);
const shown = () => my.rows.filter((c) => isTab(c.used, uiState.couponTab));
const countOf = (k: string) => my.rows.filter((c) => isTab(c.used, k)).length;

const columns: FoGridColumn[] = [
  { key: "discount", label: "혜택", width: "130px", align: "center", cellStyle: "font-weight:900;color:#bc8246" },
  { key: "name", label: "쿠폰명", align: "left", cellStyle: "font-weight:700;color:#111827" },
  { key: "cond", label: "사용 조건", align: "left" },
  { key: "expiry", label: "유효기간", width: "130px" },
  { key: "code", label: "코드", width: "140px", mono: true },
];

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/coupon.vue : handleBtnAction -> ", cmd, param);
  // 검색조건으로 목록 조회
  if (cmd === "searchParam-list") {
    return my.search();
    // 검색조건 초기화
  } else if (cmd === "searchParam-reset") {
    return my.resetSearch();
    // 쿠폰 코드 등록 — ecBeBo FO 쪽 등록 API 가 없어 안내만 (ecFeBo 도 동일)
  } else if (cmd === "coupon-register") {
    useNuxtApp().$toast.info("쿠폰 코드 등록 기능은 준비 중입니다.");
  } else {
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  }
};

/* handleSelectAction — 행/선택 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleSelectAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/coupon.vue : handleSelectAction -> ", cmd, param);
  // 등록기간 프리셋 변경
  if (cmd === "searchParam-preset") {
    return my.applyPreset();
    // 페이지 크기 변경
  } else if (cmd === "pager-size") {
    return my.changePageSize();
    // 페이지 이동 (param: pageNo)
  } else if (cmd === "pager-page") {
    return my.goPage(param as number);
    // 미사용/사용 탭 전환 (param: 'unused' | 'used')
  } else if (cmd === "coupons-tab") {
    uiState.couponTab = param as "unused" | "used";
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadCodes — 이 화면은 공통코드를 쓰지 않는다(쿠폰 유형/상태는 서버 응답의 한글명 사용). 구조 통일용 자리 */
const fnLoadCodes = async () => {};

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