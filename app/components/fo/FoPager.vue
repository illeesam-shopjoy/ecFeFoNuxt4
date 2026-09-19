<template>
  <!-- 2026-09-20(요청사항: "<pagination 을 <fo-pager 로 적용") — ecFeBo(components/comp/FoComp.js)의 FoPager 이식. 그리드/목록 밖에서 쓰는 공통 페이지네이션.
       사용: <fo-pager :pager="pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" :on-size-change="() => handleSelectAction('pager-sizeChange')" />
       pager = { pageNo, pageTotalPage, pageSize, pageSizes? } (reactive). pageSizes 가 비어 있거나 show-size=false 면 페이지 크기 선택은 그리지 않는다. -->
  <div v-if="pager" class="fo-pager">
    <button type="button" :disabled="pager.pageNo === 1" title="처음" @click="onSetPage(1)">«</button>
    <button type="button" :disabled="pager.pageNo === 1" title="이전" @click="onSetPage(pager.pageNo - 1)">‹</button>
    <button v-for="n in pageNums()" :key="n" type="button" :class="{ on: pager.pageNo === n }" @click="onSetPage(n)">{{ n }}</button>
    <button type="button" :disabled="pager.pageNo === lastPage()" title="다음" @click="onSetPage(pager.pageNo + 1)">›</button>
    <button type="button" :disabled="pager.pageNo === lastPage()" title="마지막 페이지" @click="onSetPage(lastPage())">{{ lastPage() }}</button>
    <select v-if="showSize && (pager.pageSizes || []).length" v-model.number="pager.pageSize" class="fo-pager-size" aria-label="페이지 크기" @change="onSizeChange()">
      <option v-for="s in pager.pageSizes" :key="s" :value="s">{{ s }}개</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { FoPagerState } from "~/types/foCompType";

const props = withDefaults(
  defineProps<{
    pager?: FoPagerState;
    onSetPage?: (n: number) => void;
    onSizeChange?: () => void;
    /** 한 번에 보일 페이지 번호 칸 수 */
    pageWindow?: number;
    showSize?: boolean;
  }>(),
  { pager: () => ({ pageNo: 1, pageTotalPage: 1, pageSize: 20, pageSizes: [] }), onSetPage: () => {}, onSizeChange: () => {}, pageWindow: 10, showSize: true }
);

// 파생값은 computed 대신 일반 함수 — 템플릿 렌더 시 props.pager 를 읽으므로 반응성은 유지된다
const lastPage = () => Math.max(1, props.pager.pageTotalPage || 1);
/** 현재 페이지 기준 최대 pageWindow 칸의 페이지 번호 */
function pageNums(): number[] {
  const total = lastPage();
  const cur = Math.min(Math.max(1, props.pager.pageNo || 1), total);
  const win = Math.max(1, props.pageWindow);
  let start = Math.max(1, cur - Math.floor(win / 2));
  const end = Math.min(total, start + win - 1);
  start = Math.max(1, end - win + 1); // 끝에서 윈도우 채우기
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
</script>

<style scoped>
.fo-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.fo-pager button {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;
}
.fo-pager button:hover:not(:disabled) {
  border-color: #9ca3af;
}
.fo-pager button:disabled {
  opacity: 0.4;
  cursor: default;
}
.fo-pager button.on {
  background: #171717;
  border-color: #171717;
  color: #fff;
  font-weight: 700;
}
.fo-pager-size {
  height: 36px;
  margin-left: 6px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font-size: 0.82rem;
  cursor: pointer;
}
</style>
