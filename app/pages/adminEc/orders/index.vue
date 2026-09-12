<template>
  <div class="pt-6 px-6 pb-4">
    <h1 class="text-xl font-bold text-gray-800 mb-4">주문관리</h1>
    <AdminSearchBar show-reset :page-type="page.pageType" @search="onSearch" @reset="resetSearch">
      <div class="flex flex-wrap gap-4 items-end">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-600">회원</span>
          <div ref="memberPopupRootRef" class="relative">
            <div class="flex gap-2">
              <input
                :value="search.member ? `${search.member.name} (${search.member.email})` : ''"
                type="text"
                readonly
                class="border rounded px-3 py-1.5 w-48 bg-gray-50 cursor-pointer"
                placeholder="회원 선택"
                @click="memberPopupOpen = !memberPopupOpen"
              />
              <button type="button" class="px-2 border rounded hover:bg-gray-100" @click="memberPopupOpen = !memberPopupOpen">
                {{ memberPopupOpen ? "▲" : "▼" }}
              </button>
            </div>
            <div
              v-show="memberPopupOpen"
              class="absolute top-full left-0 mt-1 w-96 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div class="p-2 border-b bg-gray-50 font-medium text-sm">회원 선택 (클릭)</div>
              <ul>
                <li
                  v-for="m in memberList"
                  :key="m.memberId"
                  class="px-3 py-2 cursor-pointer hover:bg-amber-50 border-b border-gray-100 text-sm"
                  :class="{ 'bg-amber-100': search.member?.memberId === m.memberId }"
                  @click="selectMember(m)"
                >
                  {{ m.name }} ({{ m.email }}) - {{ m.memberId }}
                </li>
              </ul>
              <div v-if="memberList.length === 0" class="p-4 text-gray-500 text-sm">회원 목록이 없습니다.</div>
            </div>
          </div>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-600">주문번호</span>
          <input v-model="search.orderNo" type="text" class="border rounded px-3 py-1.5 w-40" placeholder="주문번호" />
        </label>
      </div>
    </AdminSearchBar>
    <AdminGrid
      v-model:selected-ids="selectedIds"
      :columns="columns"
      :rows="list"
      :card-rows="cardList"
      :page-type="page.pageType"
      row-key="orderId"
      title-column-key="orderNo"
      :show-detail-col="true"
      :show-edit-col="true"
      :detail-route="(row: any) => `/adminEc/orders/${row.orderId}`"
      :edit-route="(row: any) => `/adminEc/orders/${row.orderId}-edit`"
      :detail-open-new-tab="true"
      :detail-tab-title="(row: any) => `주문상세(${row.orderId})`"
      :edit-tab-title="(row: any) => `주문상세(${row.orderId})`"
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
import { reactive } from "vue";
import { usePageTitle } from "~/composables/usePageTitle";
import { PAGE_TYPE_DEFAULT } from "~/types/page";
definePageMeta({ layout: "admin" });
usePageTitle("주문관리");

type MemberOption = { memberId: number; name: string; email: string };
type OrderRow = { orderId: number; orderNo: string; memberName: string; amount: number; status: string };

const columns = [
  { key: "orderId", label: "주문ID" },
  { key: "orderNo", label: "주문번호" },
  { key: "memberName", label: "회원명" },
  { key: "amount", label: "금액" },
  { key: "status", label: "상태" },
];

const search = reactive<{ member: MemberOption | null; orderNo: string }>({ member: null, orderNo: "" });
const list = reactive<OrderRow[]>([]);
const cardList = reactive<OrderRow[]>([]);
const memberList = reactive<MemberOption[]>([]);
const selectedIds = reactive<(string | number)[]>([]);
const orderFullList = ref<OrderRow[]>([]);
const page = reactive<{
  pageNo: number;
  pageSize: number;
  totalCount: number;
  pageType: import("~/types/page").PageType;
  condition: { member: MemberOption | null; orderNo: string };
}>({
  pageNo: 1,
  pageSize: 10,
  totalCount: 0,
  pageType: PAGE_TYPE_DEFAULT,
  condition: { member: null, orderNo: "" },
});
const { isCardView } = useBreakpoint();
const cardPageNo = ref(1);
const loadingMore = ref(false);
const { openDetailTab } = useOpenDetailTab();

// 회원 선택 드롭다운(옛 MemberSelectPopup 컴포넌트를 이 화면에서만 써서 인라인 병합, 2026-09-12)
const memberPopupOpen = ref(false);
const memberPopupRootRef = ref<HTMLElement | null>(null);
function onMemberPopupDocClick(e: MouseEvent) {
  if (memberPopupRootRef.value && !memberPopupRootRef.value.contains(e.target as Node)) memberPopupOpen.value = false;
}
onMounted(() => document.addEventListener("click", onMemberPopupDocClick));
onUnmounted(() => document.removeEventListener("click", onMemberPopupDocClick));
function selectMember(m: MemberOption) {
  search.member = m;
  memberPopupOpen.value = false;
}

const hasMoreCard = computed(() => cardList.length < page.totalCount);

function onSearch() {
  page.condition = { member: search.member ?? null, orderNo: search.orderNo };
  page.pageNo = 1;
  fetchList();
  if (isCardView.value) {
    cardPageNo.value = 1;
    cardList.splice(0, cardList.length, ...fetchPage(1));
  }
}

function fetchPage(pageNo: number): OrderRow[] {
  const start = (pageNo - 1) * page.pageSize;
  return orderFullList.value.slice(start, start + page.pageSize);
}

function fetchList() {
  let items: OrderRow[] = [
    { orderId: 1, orderNo: "ORD-2024-001", memberName: "김회원", amount: 50000, status: "결제완료" },
    { orderId: 2, orderNo: "ORD-2024-002", memberName: "이회원", amount: 120000, status: "배송중" },
  ];
  const cond = page.condition;
  if (cond.member) items = items.filter((o) => o.memberName === cond.member?.name);
  if (cond.orderNo) items = items.filter((o) => o.orderNo.includes(cond.orderNo));
  orderFullList.value = items;
  page.totalCount = items.length;
  const start = (page.pageNo - 1) * page.pageSize;
  list.splice(0, list.length, ...items.slice(start, start + page.pageSize));
}

function loadMoreCard() {
  if (loadingMore.value || !hasMoreCard.value) return;
  loadingMore.value = true;
  const nextNo = cardPageNo.value + 1;
  cardList.push(...fetchPage(nextNo));
  cardPageNo.value = nextNo;
  loadingMore.value = false;
}

watch(isCardView, (card) => {
  if (card) {
    cardPageNo.value = 1;
    cardList.splice(0, cardList.length, ...fetchPage(1));
  }
});

function resetSearch() {
  search.member = null;
  search.orderNo = "";
  page.pageNo = 1;
  page.condition = { member: null, orderNo: "" };
  cardPageNo.value = 1;
  fetchList();
  if (isCardView.value) cardList.splice(0, cardList.length, ...fetchPage(1));
}

function loadMembers() {
  // TODO: API /adminEc/members 목록
  memberList.splice(0, memberList.length,
    { memberId: 1, name: "김회원", email: "member1@example.com" },
    { memberId: 2, name: "이회원", email: "member2@example.com" },
  );
}

function goNew(e?: MouseEvent) {
  openDetailTab("/adminEc/orders/new", "주문 등록", e?.ctrlKey ?? false);
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
  selectedIds.splice(0, selectedIds.length);
  fetchList();
}

onMounted(() => {
  loadMembers();
  fetchList();
  if (isCardView.value) {
    cardPageNo.value = 1;
    cardList.splice(0, cardList.length, ...fetchPage(1));
  }
});
</script>
