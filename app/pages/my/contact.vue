<template>
  <!-- 2026-09-20 ecFeBo 화면 구조로 통일 / 2026-09-19 — 마이페이지 > 문의 (/my/contact). ecFeBo MyContact.js 이식. 기간 서버 페이징, 행 클릭 시 문의 내용/답변 펼침. -->
  <my-page-frame tab="contact" :my="my" :file-path="currentFilePath" empty-text="문의 내역이 없습니다." @btn-action="handleBtnAction" @select-action="handleSelectAction">
    <template #empty>
      <div class="mt-4"><nuxt-link to="/contact" class="os-btn os-btn-black os-btn-3 inline-block">1:1 문의하기</nuxt-link></div>
    </template>

    <div class="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
      <fo-grid bare :columns="columns" :rows="my.rows" row-key="inquiryId" :row-click="(r) => handleSelectAction('contacts-toggle', r.inquiryId)" :is-expanded="(r) => my.openId === r.inquiryId" :loading="my.loading">
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
import { useMyList, kor, ymd, codeMap } from "~/composables/useMyList";
import { useCodeStore } from "~/store/useCodeStore";
import type { SyCodeType } from "~/types/sy/syCodeType";
import { myInquirySvc } from "~/svc/fo/my/myInquirySvc";
import type { MyRow } from "~/types/fo/foMyType";
import type { FoGridColumn } from "~/types/fo/foCompType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
useHead({ title: "마이페이지 - 문의" });
usePageTitle("마이페이지 - 문의");

const CONTACT_STATUS_KOR: Record<string, string> = { REQUEST: "요청", REQUESTED: "요청", PROCESSING: "처리중", COMPLETE: "답변완료", CANCEL: "취소됨" };
const CONTACT_COLOR: Record<string, string> = { 요청: "#3b82f6", 접수: "#3b82f6", 처리중: "#f97316", 답변완료: "#22c55e", 완료: "#22c55e", 취소됨: "#9ca3af" };

const codes = reactive({ contact_status: [] as SyCodeType[] });

// 백엔드 → 화면 어댑터 (ecFeBo foMyStore._adaptContact). 상태 라벨: 서버 한글명 → 공통코드(CONTACT_STATUS_CD) → 기본 매핑 — 조회 시점에 1회 변환
function adapt(q: MyRow) {
  return ({
    inquiryId: String(q.contactId),
    category: String(q.categoryCd ?? ""),
    title: String(q.contactTitle ?? ""),
    content: String(q.contactContent ?? ""),
    status: kor(q.contactStatusCdNm, q.contactStatusCd, { ...CONTACT_STATUS_KOR, ...codeMap(codes.contact_status) }),
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

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명'). 5줄 이하 짧은 로직은 인라인 */
const handleBtnAction = (cmd: string, param: unknown = {}) => {
  console.log(" ■■ my/contact.vue : handleBtnAction -> ", cmd, param);
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
  console.log(" ■■ my/contact.vue : handleSelectAction -> ", cmd, param);
  // 등록기간 프리셋 변경
  if (cmd === "searchParam-preset") {
    return my.applyPreset();
    // 페이지 크기 변경
  } else if (cmd === "pager-size") {
    return my.changePageSize();
    // 페이지 이동 (param: pageNo)
  } else if (cmd === "pager-page") {
    return my.goPage(param as number);
    // 문의 행 펼침/접힘 (param: inquiryId)
  } else if (cmd === "contacts-toggle") {
    my.toggle(param as string);
  } else {
    console.warn("[handleSelectAction] unknown cmd:", cmd);
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadCodes — 이 화면이 쓰는 코드그룹만 로딩 */
const fnLoadCodes = async () => {
  const codeStore = useCodeStore();
  await codeStore.saLoadCodes(["CONTACT_STATUS_CD"]);
  codes.contact_status = codeStore.sgGetGrpCodes("CONTACT_STATUS_CD");
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