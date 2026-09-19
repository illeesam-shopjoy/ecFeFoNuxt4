<template>
  <layout :transparent="true">
    <xdev-file-path-badge v-if="filePath" :file-path="filePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="마이페이지" subtitle="마이페이지" />

    <!-- 2026-09-19 — 마이페이지 6개 화면(pages/my/{order,claim,coupon,cache,contact,chatt}.vue)이 함께 쓰는 틀:
         탭 바 + 등록기간 조회 + 총건수/페이지크기 + 로딩/오류/빈 상태 + 페이지네이션. 각 화면은 목록 내용(default 슬롯)과
         탭별 필터(top 슬롯)만 채운다. 조회 상태는 useMyList(composables/useMyList.ts)가 관리한다. -->
    <section class="pt-14 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 탭 -->
        <nav class="flex flex-wrap gap-1 p-1.5 mb-5 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]" aria-label="마이페이지 메뉴">
          <nuxt-link
            v-for="t in MY_TABS"
            :key="t.key"
            :to="`/my/${t.key}`"
            class="flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[0.9rem] font-semibold no-underline transition-colors"
            :class="tab === t.key ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-[#f5f5f5]'"
          >
            <span>{{ t.icon }}</span>{{ t.label }}
          </nuxt-link>
        </nav>

        <!-- 기간 조회 -->
        <div class="flex flex-wrap items-center gap-2 px-4 py-3 mb-4 bg-white border border-[#e5e7eb] rounded-lg">
          <span class="text-[0.85rem] text-gray-500 mr-1">등록기간</span>
          <input v-model="my.dateStart" type="date" class="my-in" aria-label="시작일" />
          <span class="text-gray-400">~</span>
          <input v-model="my.dateEnd" type="date" class="my-in" aria-label="종료일" />
          <select v-model.number="my.preset" class="my-in cursor-pointer" aria-label="기간 선택" @change="my.applyPreset()">
            <option v-for="p in MY_PRESETS" :key="p.months" :value="p.months">{{ p.label }}</option>
          </select>
          <button type="button" class="h-10 px-5 bg-gray-900 text-white border-0 rounded-md text-[0.85rem] font-semibold cursor-pointer" @click="my.search()">조회</button>
          <button type="button" class="h-10 px-4 bg-white text-gray-600 border border-[#e5e7eb] rounded-md text-[0.85rem] font-medium cursor-pointer" @click="my.resetSearch()">초기화</button>
        </div>

        <!-- 탭별 필터/부가 영역 -->
        <slot name="top" />

        <!-- 총건수 + 페이지 크기 -->
        <div class="flex items-center justify-between my-3.5 text-[0.88rem] text-gray-600">
          <span>총 <b class="text-gray-900">{{ count ?? my.total }}</b>건</span>
          <select v-model.number="my.pageSize" class="my-in cursor-pointer" aria-label="페이지 크기" @change="my.changePageSize()">
            <option v-for="s in [10, 20, 50, 100]" :key="s" :value="s">{{ s }}개씩</option>
          </select>
        </div>

        <!-- 로딩 / 오류 / 빈 상태 / 목록 -->
        <div v-if="my.loading && !my.rows.length" class="py-16 text-center text-gray-400">불러오는 중...</div>
        <div v-else-if="my.errorMsg" class="py-16 text-center text-red-500">{{ my.errorMsg }}</div>
        <div v-else-if="(shown ?? my.rows.length) === 0" class="py-16 text-center text-gray-400 text-[1rem]">
          {{ emptyText }}
          <slot name="empty" />
        </div>
        <slot v-else />

        <!-- 목록 아래 안내 -->
        <slot name="bottom" />

        <!-- 페이지네이션 -->
        <div v-if="my.pageTotalPage > 1" class="flex flex-wrap items-center justify-center gap-1.5 mt-8">
          <button type="button" class="pg-btn" :disabled="my.pageNo <= 1" aria-label="이전" @click="my.goPage(my.pageNo - 1)">‹</button>
          <button v-for="n in my.pageNumbers()" :key="n" type="button" class="pg-btn" :class="{ 'pg-on': n === my.pageNo }" @click="my.goPage(n)">{{ n }}</button>
          <button type="button" class="pg-btn" :disabled="my.pageNo >= my.pageTotalPage" aria-label="다음" @click="my.goPage(my.pageNo + 1)">›</button>
        </div>
      </div>
    </section>

    <!-- 화면별 모달(예: 주문 진행 안내) -->
    <slot name="modal" />
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { MY_PRESETS, MY_TABS, type MyListState, type MyTabKey } from "~/composables/useMyList";

defineProps<{
  /** 현재 탭 (MY_TABS 의 key) */
  tab: MyTabKey;
  /** 로컬 모드 파일경로 배지용 (useCurrentFilePath()) */
  filePath?: string | null;
  /** useMyList() 반환값 */
  my: MyListState;
  /** 목록이 비었을 때 문구 */
  emptyText: string;
  /** "총 N건" 을 서버 총건수 대신 다른 값으로 보여줄 때(예: 쿠폰의 미사용/사용 탭 필터 결과) */
  count?: number;
  /** 화면에 보여줄 행 수를 my.rows 와 다르게 셀 때(클라이언트 필터가 있는 화면) */
  shown?: number;
}>();
</script>

<style scoped>
.my-in {
  height: 40px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font-size: 0.85rem;
}
.pg-btn {
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
.pg-btn:hover:not(:disabled) {
  border-color: #9ca3af;
}
.pg-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.pg-on {
  background: #171717;
  border-color: #171717;
  color: #fff;
  font-weight: 700;
}
</style>
