<template>
  <!-- 2026-09-19 — 마이페이지 > 캐쉬 (/my/cache). ecFeBo MyCache.js 이식. 보유 캐쉬 + 충전 폼(<fo-form>) + 적립/사용 이력(<fo-grid>, 서버 페이징).
       충전 API 는 ecBeBo FO 쪽에 없어 "준비 중" 안내만 한다(ecFeBo 도 입력칸만 있음). -->
  <my-page-frame tab="cache" :my="my" :file-path="currentFilePath" empty-text="캐쉬 내역이 없습니다.">
    <template #top>
      <div class="rounded-xl px-6 py-5 mb-4 text-gray-900" style="background: linear-gradient(135deg, #fbbf24, #f59e0b)">
        <div class="text-[0.85rem] font-semibold opacity-80">보유 캐쉬</div>
        <div class="text-[2rem] font-black mt-1">{{ formatPrice(balance) }}</div>
      </div>
      <div class="p-4 mb-2 bg-white border border-[#e5e7eb] rounded-lg">
        <fo-form :columns="chargeCols" :form="chargeForm" :cols="1" :gap="8" @submit="notReady('캐쉬 충전')">
          <template #charge="{ form }">
            <div class="flex gap-2">
              <input v-model="form.amount" class="fo-my-in flex-1" inputmode="numeric" placeholder="충전 금액 입력 (최소 1,000원)" />
              <button type="submit" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-bold cursor-pointer">충전하기</button>
            </div>
          </template>
        </fo-form>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        <button v-for="a in [5000, 10000, 30000, 50000]" :key="a" type="button" class="px-4 py-2 rounded-full border border-[#e5e7eb] bg-white text-[0.82rem] font-semibold text-gray-700 cursor-pointer hover:border-gray-400" @click="chargeForm.amount = String(Number(chargeForm.amount || 0) + a)">+{{ a.toLocaleString() }}원</button>
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
import { useMyList, kor, ymd } from "~/composables/useMyList";
import { myCashSvc } from "~/svc/fo/my/myCashSvc";
import type { MyRow } from "~/types/foMyType";
import type { FoFormColumn, FoGridColumn } from "~/types/foCompType";

const currentFilePath = useCurrentFilePath();
const { formatPrice } = usePrice();
useHead({ title: "마이페이지 - 캐쉬" });
usePageTitle("마이페이지 - 캐쉬");

const balance = ref(0);
const chargeForm = reactive({ amount: "" });
const chargeCols: FoFormColumn[] = [{ key: "charge", type: "slot" }];

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptCash) — 조회 시점에 1회 변환
function adapt(h: MyRow) {
  const amount = Number(h.cacheAmt ?? h.amount ?? 0);
  return {
    cashId: String(h.cacheId ?? h.cashId ?? ""),
    type: kor(h.cacheTypeCdNm, h.cacheTypeCd, {}) || (amount >= 0 ? "적립" : "사용"),
    amount,
    balance: Number(h.balanceAmt ?? h.balance ?? 0),
    date: ymd(h.cacheDate ?? h.date),
    desc: String(h.cacheDesc ?? h.desc ?? ""),
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

function notReady(what: string) {
  useNuxtApp().$toast.info(`${what} 기능은 준비 중입니다.`);
}
</script>

<style scoped>
.fo-my-in {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font-size: 0.85rem;
}
</style>
