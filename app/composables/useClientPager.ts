/**
 * useClientPager — 이미 전부 받아 둔 목록을 화면에서 잘라 보여주는 클라이언트 페이징 (2026-09-20).
 * <fo-pager> 에 넘길 pager(reactive)와 현재 페이지 행(rows()), 페이지 이동/크기 변경 함수를 돌려준다.
 * 서버 페이징(useMyList 등)과 달리 목록 길이가 바뀌면 총 페이지를 다시 계산한다.
 *   const cp = useClientPager(() => blogs.value ?? [], 6, [6, 12, 24]);
 *   <div v-for="b in cp.rows()">…  <fo-pager :pager="cp.pager" :on-set-page="n => handleSelectAction('pager-setPage', n)" :on-size-change="() => handleSelectAction('pager-sizeChange')" />
 */
import { reactive, watch } from "vue";
import type { FoPagerState } from "~/types/fo/foCompType";

export function useClientPager<T>(getList: () => T[], pageSize = 10, pageSizes: number[] = []) {
  const pager: FoPagerState = reactive({ pageNo: 1, pageSize, pageSizes, pageTotalCount: 0, pageTotalPage: 1 });

  /** 목록 길이 기준으로 총 건수/총 페이지를 다시 계산 */
  function sync() {
    const n = getList().length;
    pager.pageTotalCount = n;
    pager.pageTotalPage = Math.max(1, Math.ceil(n / pager.pageSize));
    if (pager.pageNo > pager.pageTotalPage) pager.pageNo = pager.pageTotalPage;
  }
  watch(() => getList().length, sync, { immediate: true });

  /** 현재 페이지의 행 */
  function rows(): T[] {
    const start = (pager.pageNo - 1) * pager.pageSize;
    return getList().slice(start, start + pager.pageSize);
  }
  function setPage(n: number) {
    if (n < 1 || n > pager.pageTotalPage || n === pager.pageNo) return;
    pager.pageNo = n;
    if (import.meta.client) window.scrollTo(0, 0);
  }
  function sizeChange() {
    pager.pageNo = 1;
    sync();
  }

  return { pager, rows, setPage, sizeChange };
}
