<template>
  <div :class="`shop-pagination-wrapper ${style_2 ? '' : 'd-md-flex justify-between items-center'}`">
    <div class="basic-pagination">
      <ul>
        <li class="page-item" :class="{ disabled: currPage === 1 }" @click.prevent="setPage(currPage - 1)">
          <a href="#">
            <i class="fal fa-angle-left"></i>
          </a>
        </li>

        <li
          class="page-item"
          v-for="(n, idx) in pageItems"
          :key="`${n}-${idx}`"
          :class="{ 'page-item--ellipsis': n === '...' }"
          @click.prevent="n !== '...' && setPage(n)"
        >
          <span v-if="n === '...'" class="page-link page-link--ellipsis">…</span>
          <a v-else :class="[`page-link`, { active: currPage === n }]" href="">
            {{ n }}
          </a>
        </li>
        <li class="page-item" :class="{ disabled: currPage === totalPage }" @click.prevent="setPage(currPage + 1)">
          <a href="#">
            <i class="fal fa-angle-right"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  countOfPage: { type: Number, default: 8 },
  paginationClass: { type: String },
  style_2: { type: Boolean, default: false },
});
const emit = defineEmits<{ (e: "paginatedData", rows: unknown[], start: number, count: number): void }>();

const currPage = ref(1);
const filteredRows = computed(() => props.items);
const pageStart = computed(() => (currPage.value - 1) * props.countOfPage);
const totalPage = computed(() => Math.ceil((filteredRows.value?.length ?? 0) / props.countOfPage));

// 2026-09-13(요청사항: "하단 페이징 페이지번호 다 보이는데 잘 개선해줘") — 총 페이지가 많으면
// (예: 43페이지) 1~43을 전부 나열해 모바일에서 줄바꿈되어 지저분해 보였다. 현재 페이지 주변만
// 보여주고 나머지는 "…"으로 축약한다(항상 처음/끝 페이지는 보여줌).
const pageItems = computed<(number | "...")[]>(() => {
  const total = totalPage.value;
  const curr = currPage.value;
  const SIBLINGS = 1; // 현재 페이지 좌우로 몇 개씩 더 보여줄지
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "...")[] = [1];
  const start = Math.max(2, curr - SIBLINGS);
  const end = Math.min(total - 1, curr + SIBLINGS);
  if (start > 2) items.push("...");
  for (let n = start; n <= end; n++) items.push(n);
  if (end < total - 1) items.push("...");
  items.push(total);
  return items;
});

function emitPaginated() {
  emit("paginatedData", filteredRows.value ?? [], pageStart.value, props.countOfPage);
}

function setPage(idx: number) {
  if (idx <= 0 || idx > totalPage.value) return;
  currPage.value = idx;
  window.scrollTo(0, 0);
  emitPaginated();
}

onMounted(() => {
  emitPaginated();
});

// API 등으로 items가 나중에 로드되면 목록에 반영
watch(
  () => props.items,
  () => {
    currPage.value = 1;
    emitPaginated();
  },
  { deep: true }
);
</script>

<style scoped>
.page-item--ellipsis {
  cursor: default;
}
.page-link--ellipsis {
  cursor: default;
  pointer-events: none;
}
</style>
