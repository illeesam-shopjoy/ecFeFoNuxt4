<template>
  <!-- 2026-09-19 — 마이페이지 > 채팅 (/my/chatt). ecFeBo MyChatt.js 이식. 기간 서버 페이징 채팅방 목록(<fo-grid>).
       실제 상담은 화면 우측 하단 채팅 위젯에서 이어서 진행한다. -->
  <my-page-frame tab="chatt" :my="my" :file-path="currentFilePath" empty-text="채팅 내역이 없습니다.">
    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="chatId" :loading="my.loading" />
    </div>
    <template #bottom>
      <p v-if="my.rows.length" class="mt-3 text-[0.78rem] text-gray-400">채팅 상담은 화면 우측 하단의 채팅 버튼에서 이어서 진행할 수 있습니다.</p>
    </template>
  </my-page-frame>
</template>

<script setup lang="ts">
import MyPageFrame from "~/components/my/MyPageFrame.vue";
import FoGrid from "~/components/fo/FoGrid.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { usePageTitle } from "~/composables/usePageTitle";
import { useMyList, kor, ymd } from "~/composables/useMyList";
import { myChatSvc } from "~/svc/fo/my/myChatSvc";
import type { MyRow } from "~/types/foMyType";
import type { FoGridColumn } from "~/types/foCompType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 채팅" });
usePageTitle("마이페이지 - 채팅");

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptChatt) — 조회 시점에 1회 변환
function adapt(c: MyRow) {
  return ({
    chatId: String(c.chattId ?? c.chattRoomId ?? ""),
    subject: String(c.subject || "채팅 상담"),
    status: kor(c.chattStatusCdNm, c.chattStatusCd, {}),
    date: ymd(c.lastMsgDate),
    lastMsg: typeof c.lastMsg === "string" ? c.lastMsg : String((c.lastMsg as MyRow | null)?.msgContent ?? (c.lastMsg as MyRow | null)?.chattMsg ?? "") || "새 채팅",
  });
}

const my = useMyList({
  dateType: "reg_date",
  loader: async (p) => {
    const r = await myChatSvc.getPage(p);
    return { rows: (r.pageList ?? []).map(adapt), total: r.pageTotalCount ?? 0, totalPage: r.pageTotalPage || 1 };
  },
});


const columns: FoGridColumn[] = [
  { key: "subject", label: "제목", width: "220px", align: "left", cellStyle: "font-weight:700;color:#111827" },
  { key: "status", label: "상태", width: "100px", align: "center", badge: (r) => (r.status === "ACTIVE" ? "green" : "gray") },
  { key: "lastMsg", label: "마지막 메시지", align: "left" },
  { key: "date", label: "최근 일자", width: "120px" },
];
</script>
