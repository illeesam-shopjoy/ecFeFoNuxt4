<template>
  <!-- 2026-09-19 — 마이페이지 > 문의 (/my/contact). ecFeBo MyContact.js 이식. 기간 서버 페이징, 행 클릭 시 문의 내용/답변 펼침. -->
  <my-page-frame tab="contact" :my="my" :file-path="currentFilePath" empty-text="문의 내역이 없습니다.">
    <template #empty>
      <div class="mt-4"><nuxt-link to="/contact" class="os-btn os-btn-black os-btn-3 inline-block">1:1 문의하기</nuxt-link></div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="inquiryId" :row-click="(r) => my.toggle(r.inquiryId)" :is-expanded="(r) => my.openId === r.inquiryId" :loading="my.loading">
        <template #row-expand="{ row, colspan }">
          <td :colspan="colspan" class="!p-0 !border-b !border-[#f3f4f6]">
            <div class="px-4 pb-4 pt-2 text-[0.85rem]">
              <div class="whitespace-pre-line text-gray-700 leading-relaxed">{{ row.content }}</div>
              <div v-if="row.answer" class="mt-3 p-3 bg-[#f9fafb] rounded-md text-gray-700 leading-relaxed whitespace-pre-line"><b class="text-gray-900">답변</b><br />{{ row.answer }}</div>
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
import { useMyList, kor, ymd } from "~/composables/useMyList";
import { myInquirySvc } from "~/svc/fo/my/myInquirySvc";
import type { MyRow } from "~/types/foMyType";
import type { FoGridColumn } from "~/types/foCompType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 문의" });
usePageTitle("마이페이지 - 문의");

const CONTACT_STATUS_KOR: Record<string, string> = { REQUEST: "요청", REQUESTED: "요청", PROCESSING: "처리중", COMPLETE: "답변완료", CANCEL: "취소됨" };
const CONTACT_COLOR: Record<string, string> = { 요청: "#3b82f6", 처리중: "#f97316", 답변완료: "#22c55e", 취소됨: "#9ca3af" };

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptContact) — 조회 시점에 1회 변환
function adapt(q: MyRow) {
  return ({
    inquiryId: String(q.contactId),
    category: String(q.categoryCd ?? ""),
    title: String(q.contactTitle ?? ""),
    content: String(q.contactContent ?? ""),
    status: kor(q.contactStatusCdNm, q.contactStatusCd, CONTACT_STATUS_KOR),
    date: ymd(q.contactDate),
    answer: String(q.contactAnswer ?? ""),
  });
}

const my = useMyList({
  dateType: "reg_date",
  loader: async (p) => {
    const r = await myInquirySvc.getPage(p);
    return { rows: (r.pageList ?? []).map(adapt), total: r.pageTotalCount ?? 0, totalPage: r.pageTotalPage || 1 };
  },
});


const columns: FoGridColumn[] = [
  { key: "status", label: "상태", width: "100px", align: "center", badge: (r) => CONTACT_COLOR[r.status] || "#9ca3af" },
  { key: "category", label: "분류", width: "110px", fmt: (v) => (v ? `[${v}]` : "") },
  { key: "title", label: "제목", align: "left", cellStyle: "font-weight:600;color:#111827" },
  { key: "date", label: "문의일", width: "120px" },
];
</script>
