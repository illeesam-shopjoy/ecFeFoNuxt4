<template>
  <!-- 2026-09-20 ecFeBo 화면 구조로 통일 / 2026-09-19 — 마이페이지 > 채팅 (/my/chatt). ecFeBo MyChatt.js 이식. 기간 서버 페이징 채팅방 목록(<fo-grid>).
       실제 상담은 화면 우측 하단 채팅 위젯에서 이어서 진행한다. -->
  <my-page-frame tab="chatt" :my="my" :file-path="currentFilePath" empty-text="채팅 내역이 없습니다." @btn-action="handleBtnAction" @select-action="handleSelectAction">
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
import { useMyList, kor, ymd, codeMap } from "~/composables/useMyList";
import { useCodeStore } from "~/store/useCodeStore";
import type { SyCodeType } from "~/types/sy/syCodeType";
import { myChatSvc } from "~/svc/fo/my/myChatSvc";
import type { MyRow } from "~/types/fo/foMyType";
import type { FoGridColumn } from "~/types/fo/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 채팅" });
usePageTitle("마이페이지 - 채팅");

const codes = reactive({ chatt_status: [] as SyCodeType[] });

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptChatt) — 조회 시점에 1회 변환
function adapt(c: MyRow) {
  return ({
    chatId: String(c.chattId ?? c.chattRoomId ?? ""),
    subject: String(c.subject || "채팅 상담"),
    statusCd: String(c.chattStatusCd ?? ""),
    status: kor(c.chattStatusCdNm, c.chattStatusCd, codeMap(codes.chatt_status)),
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
  { key: "status", label: "상태", width: "100px", align: "center", badge: (r) => (r.statusCd === "ACTIVE" ? "green" : "gray") },
  { key: "lastMsg", label: "마지막 메시지", align: "left" },
  { key: "date", label: "최근 일자", width: "120px" },
];

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/chatt.vue : handleBtnAction -> ", cmd, param);
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
  console.log(" ■■ my/chatt.vue : handleSelectAction -> ", cmd, param);
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
  await codeStore.saLoadCodes(["CHATT_STATUS"]);
  codes.chatt_status = codeStore.sgGetGrpCodes("CHATT_STATUS");
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