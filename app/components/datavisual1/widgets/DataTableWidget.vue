<template>
  <!-- 데이터 테이블 — 검색·머리글 눌러 정렬(▲▼)·상태 배지(예시 값, ↻ 로 새 값) -->
  <dv-widget-card :title="title" icon="📋" body-style="padding:0;" @refresh="generate">
    <template #actions>
      <input v-model="search" type="search" class="dv-table-search" placeholder="검색…" aria-label="표 검색" />
    </template>
    <div class="widget-body-scroll">
      <table class="dv-table">
        <thead>
          <tr>
            <th v-for="c in COLS" :key="c.key" style="cursor: pointer" :aria-sort="sortKey === c.key ? (sortAsc ? 'ascending' : 'descending') : 'none'" @click="sortBy(c.key)">
              {{ c.label }} {{ sortKey === c.key ? (sortAsc ? "▲" : "▼") : "" }}
            </th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">
            <td style="font-weight: 600; color: var(--text-primary)">{{ row.name }}</td>
            <td><span class="badge badge-blue" style="font-size: 0.65rem">{{ row.cat }}</span></td>
            <td style="font-family: monospace; color: var(--blue)">{{ row.salesFmt }}</td>
            <td>
              <span :style="{ color: row.growth >= 0 ? 'var(--green)' : 'var(--red)' }">{{ row.growth >= 0 ? "▲" : "▼" }} {{ Math.abs(row.growth).toFixed(1) }}%</span>
            </td>
            <td>
              <span class="badge" :class="row.status === '활성' ? 'badge-green' : row.status === '주의' ? 'badge-orange' : 'badge-purple'">{{ row.status }}</span>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px">검색 결과 없음</td>
          </tr>
        </tbody>
      </table>
    </div>
  </dv-widget-card>
</template>

<script setup lang="ts">
import DvWidgetCard from "~/components/datavisual1/widgets/DvWidgetCard.vue";
import { DvData } from "~/conts/tenant/datavisual1";

const props = withDefaults(defineProps<{ title?: string; rows?: number }>(), { title: "데이터 테이블", rows: 8 });

interface Row { id: number; name: string; cat: string; sales: number; salesFmt: string; growth: number; status: string }
type SortKey = "name" | "cat" | "sales" | "growth";
const COLS: { key: SortKey; label: string }[] = [
  { key: "name", label: "제품명" },
  { key: "cat", label: "카테고리" },
  { key: "sales", label: "매출" },
  { key: "growth", label: "성장률" },
];
const PRODUCTS = ["DataPulse", "WorkFlow", "SecureVault", "CloudNest", "AppForge", "SalesBot", "MarketAI", "TechSync", "WebCraft", "DevTools"];
const CATS = ["분석", "협업", "보안", "클라우드", "앱", "마케팅", "AI", "인프라"];
const STATUSES = ["활성", "활성", "활성", "주의", "대기"];
const EDITIONS = ["Pro", "Lite", "Enterprise", "Plus"];

const rowsData = ref<Row[]>([]);
const search = ref("");
const sortKey = ref<SortKey>("sales");
const sortAsc = ref(false);

function generate() {
  rowsData.value = Array.from({ length: props.rows + 4 }, (_, i) => {
    const sales = DvData.rand(500, 9800) * 1000;
    return {
      id: i,
      name: `${PRODUCTS[i % PRODUCTS.length]} ${EDITIONS[i % EDITIONS.length]}`,
      cat: CATS[i % CATS.length]!,
      sales,
      salesFmt: `₩${(sales / 10000).toFixed(0)}만`,
      growth: DvData.randFloat(-15, 35),
      status: STATUSES[i % STATUSES.length]!,
    };
  });
}
function sortBy(key: SortKey) {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value;
  else {
    sortKey.value = key;
    sortAsc.value = false;
  }
}
const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  const rows = q ? rowsData.value.filter((r) => r.name.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q)) : rowsData.value;
  return [...rows].sort((a, b) => {
    const av = a[sortKey.value];
    const bv = b[sortKey.value];
    const cmp = typeof av === "string" ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
    return sortAsc.value ? cmp : -cmp;
  });
});

generate();
</script>
