<template>
  <div class="pt-6 px-6 pb-4">
    <h1 class="text-xl font-bold text-gray-800 mb-4">공지사항관리</h1>
    <AdminSearchBar show-reset :page-type="page.pageType" @search="onSearch" @reset="resetSearch">
      <div class="flex flex-wrap gap-4 items-end">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-600">공지제목</span>
          <input v-model="search.noticeTitle" type="text" class="border rounded px-3 py-1.5 w-48" placeholder="공지제목" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-600">공지유형</span>
          <select v-model="search.noticeType" class="border rounded px-3 py-1.5 w-28">
            <option value="">전체</option>
            <option v-for="c in noticeTypeCodes" :key="c.codeValue" :value="c.codeValue">{{ c.codeLabel }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-600">공지상태</span>
          <select v-model="search.status" class="border rounded px-3 py-1.5 w-28">
            <option value="">전체</option>
            <option v-for="c in noticeStatusCodes" :key="c.codeValue" :value="c.codeValue">{{ c.codeLabel }}</option>
          </select>
        </label>
      </div>
    </AdminSearchBar>
    <AdminGrid
      v-model:selected-ids="selectedIds"
      :columns="columns"
      :rows="list"
      :card-rows="cardList"
      :page-type="page.pageType"
      row-key="noticeId"
      title-column-key="noticeTitle"
      :show-detail-col="true"
      :show-edit-col="true"
      :detail-route="(row) => `/adminSy/notices/${row.noticeId}`"
      :edit-route="(row) => `/adminSy/notices/${row.noticeId}-edit`"
      :detail-open-new-tab="true"
      :detail-tab-title="(row) => `공지상세(${row.noticeId})`"
      :edit-tab-title="(row) => `공지상세(${row.noticeId})`"
      selectable
      @select-change="(ids) => selectedIds.splice(0, selectedIds.length, ...ids)"
    >
      <template #toolbar>
        <button type="button" class="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700" @click="goNew($event)">
          신규
        </button>
        <button type="button" class="px-3 py-1.5 border border-red-400 text-red-600 rounded text-sm hover:bg-red-50" @click="doDelete">
          삭제
        </button>
      </template>
      <!-- 원본 코드값(GENERAL/ACTIVE 등) 대신 공통코드 라벨로 표시 -->
      <template #cell-noticeType="{ value }">{{ codeStore.getStLabel[`NOTICE_TYPE_CD-${value}`] ?? value }}</template>
      <template #cell-status="{ value }">{{ codeStore.getStLabel[`NOTICE_STATUS-${value}`] ?? value }}</template>
    </AdminGrid>
    <AdminPagination
      :page-no="page.pageNo"
      :page-size="page.pageSize"
      :total-count="page.totalCount"
      :page-type="page.pageType"
      :has-more-card="hasMoreCard"
      :loading-more="loadingMore"
      @update:page-no="(v) => { page.pageNo = v; fetchList(); }"
      @update:page-size="(v) => { page.pageSize = v; page.pageNo = 1; fetchList(); }"
      @load-more="loadMoreCard"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { usePageTitle } from "~/composables/usePageTitle";
import { PAGE_TYPE_DEFAULT } from "~/types/page";
import { useCodeStore } from "~/store/useCodeStore";
import { syNoticeSvc, type SyNoticeRow } from "~/svc/fo/ec/sy/syNoticeSvc";
definePageMeta({ layout: "admin" });

// <select> 옵션은 하드코딩 대신 공통코드(ecBeBo sy_code)에서 가져온다(2026-09, ecFeBo 참고 요청사항).
const codeStore = useCodeStore();
if (import.meta.client) codeStore.loadStCodes();
const noticeTypeCodes = computed(() => codeStore.getStCodes["NOTICE_TYPE_CD"] ?? []);
const noticeStatusCodes = computed(() => codeStore.getStCodes["NOTICE_STATUS"] ?? []);
usePageTitle("공지사항관리");

const columns = [
  { key: "noticeId", label: "공지ID" },
  { key: "noticeTitle", label: "공지제목" },
  { key: "noticeType", label: "공지유형" },
  { key: "status", label: "공지상태" },
  { key: "createBy", label: "생성자" },
  { key: "createTime", label: "생성시간" },
];

const search = reactive({ noticeTitle: "", noticeType: "", status: "" });
const list = reactive<SyNoticeRow[]>([]);
const cardList = reactive<SyNoticeRow[]>([]);
const selectedIds = reactive<(string | number)[]>([]);
const page = reactive({ pageNo: 1, pageSize: 10, totalCount: 0, pageType: PAGE_TYPE_DEFAULT as import("~/types/page").PageType });
const { isCardView } = useBreakpoint();
const cardPageNo = ref(1);
const loadingMore = ref(false);
const { openDetailTab } = useOpenDetailTab();

const hasMoreCard = computed(() => cardList.length < page.totalCount);

async function fetchPage(pageNo: number): Promise<SyNoticeRow[]> {
  const res = await syNoticeSvc.getPage({
    pageNo,
    pageSize: page.pageSize,
    noticeTitle: search.noticeTitle || undefined,
    noticeType: search.noticeType || undefined,
    status: search.status || undefined,
  });
  page.totalCount = res.totalCount ?? 0;
  return res.list ?? [];
}

async function fetchList() {
  try {
    const items = await fetchPage(page.pageNo);
    list.splice(0, list.length, ...items);
  } catch {
    list.splice(0, list.length);
    page.totalCount = 0;
  }
}

function onSearch() {
  page.pageNo = 1;
  fetchList();
  if (isCardView.value) {
    cardPageNo.value = 1;
    fetchPage(1).then((items) => cardList.splice(0, cardList.length, ...items)).catch(() => cardList.splice(0, cardList.length));
  }
}

async function loadMoreCard() {
  if (loadingMore.value || !hasMoreCard.value) return;
  loadingMore.value = true;
  try {
    const items = await fetchPage(cardPageNo.value + 1);
    cardPageNo.value += 1;
    cardList.push(...items);
  } finally {
    loadingMore.value = false;
  }
}

watch(isCardView, (card) => {
  if (card) {
    cardPageNo.value = 1;
    fetchPage(1).then((items) => cardList.splice(0, cardList.length, ...items)).catch(() => cardList.splice(0, cardList.length));
  }
});

function resetSearch() {
  search.noticeTitle = "";
  search.noticeType = "";
  search.status = "";
  page.pageNo = 1;
  cardPageNo.value = 1;
  fetchList();
  if (isCardView.value) {
    fetchPage(1).then((items) => cardList.splice(0, cardList.length, ...items)).catch(() => cardList.splice(0, cardList.length));
  }
}

function goNew(e?: MouseEvent) {
  openDetailTab("/adminSy/notices/new", "공지사항 등록", e?.ctrlKey ?? false);
}

async function doDelete() {
  if (selectedIds.length === 0) {
    await useAlert().openAlert("삭제할 항목을 선택하세요.");
    return;
  }
  const ok = await useConfirm().openConfirm({
    title: "삭제 확인",
    message: `${selectedIds.length}건 삭제할까요?`,
    confirmText: "삭제",
    cancelText: "취소",
    variant: "danger",
  });
  if (!ok) return;
  try {
    for (const id of selectedIds) {
      await syNoticeSvc.remove(String(id));
    }
    selectedIds.splice(0, selectedIds.length);
    await fetchList();
  } catch (err: any) {
    await useAlert().openAlert(err?.data?.message || "삭제에 실패했습니다.");
  }
}

onMounted(() => {
  fetchList();
  if (isCardView.value) {
    cardPageNo.value = 1;
    fetchPage(1).then((items) => cardList.splice(0, cardList.length, ...items)).catch(() => cardList.splice(0, cardList.length));
  }
});
</script>
