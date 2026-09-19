<template>
  <layout :transparent="true">
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />
    <breadcrumb-area title="FAQ" subtitle="FAQ" />

    <!-- 2026-09-19(요청사항: "FAQ / FAQ 반응형 … ecFeFoNuxt4 페이지에 만들어줘, 특정영역별 컴포넌트로 분리 안해도 되") —
         ecFeBo(pages/fo/Faq.js) 이식. 좌: 분류 트리(대분류/중분류 + 건수), 우: FAQ 아코디언 + 페이지네이션. 좁은 화면에서는 트리가 위로 올라간다. -->
    <section class="pt-16 pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 items-start">
          <!-- ── 분류 트리 ── -->
          <aside class="bg-white border border-[#e5e7eb] rounded-lg py-3 px-2 lg:sticky lg:top-24">
            <div class="text-[0.8rem] font-extrabold text-gray-500 px-2.5 pt-1 pb-2.5 mb-1.5 border-b border-[#e5e7eb]">
              <i class="fas fa-folder-open text-theme mr-1.5"></i>분류
            </div>
            <button
              type="button"
              class="flex items-center justify-between w-full px-2.5 py-2 rounded-md text-[0.88rem] text-left border-0 cursor-pointer"
              :class="selectedPathId === null ? 'bg-theme text-white font-bold' : 'bg-transparent text-gray-800 hover:bg-[#f5f5f5]'"
              @click="selectPath(null)"
            >
              <span>전체</span>
              <span class="text-[0.72rem] opacity-90">{{ treeData?.total ?? 0 }}</span>
            </button>
            <template v-for="root in treeData?.tree ?? []" :key="root.id">
              <button
                type="button"
                class="flex items-center justify-between w-full px-2.5 py-2 mt-0.5 rounded-md text-[0.88rem] text-left border-0 cursor-pointer"
                :class="selectedPathId === root.id ? 'bg-theme text-white font-bold' : 'bg-transparent text-gray-800 font-semibold hover:bg-[#f5f5f5]'"
                @click="selectPath(root.id)"
              >
                <span>{{ root.label }}</span>
                <span class="text-[0.72rem] opacity-90">{{ root.count }}</span>
              </button>
              <button
                v-for="ch in root.children"
                :key="ch.id"
                type="button"
                class="flex items-center justify-between w-full pl-6 pr-2.5 py-1.5 rounded-md text-[0.82rem] text-left border-0 cursor-pointer"
                :class="selectedPathId === ch.id ? 'bg-theme text-white font-bold' : 'bg-transparent text-gray-600 hover:bg-[#f5f5f5]'"
                @click="selectPath(ch.id)"
              >
                <span>{{ ch.label }}</span>
                <span class="text-[0.72rem] opacity-80">{{ ch.count }}</span>
              </button>
            </template>
          </aside>

          <!-- ── FAQ 목록 ── -->
          <div class="min-w-0">
            <div class="bg-white border border-[#e5e7eb] rounded-lg px-3 sm:px-7 mb-4">
              <div v-if="!faqs.length" class="text-center py-12 text-gray-400 text-[0.9rem]">
                {{ loading ? "불러오는 중..." : errorMsg || "해당 분류의 FAQ가 없습니다." }}
              </div>
              <div v-for="(faq, idx) in faqs" :key="faq.faqId" class="border-b border-[#f0f0f0] last:border-b-0">
                <button
                  type="button"
                  class="flex items-center w-full py-4 bg-transparent border-0 text-left cursor-pointer text-[0.95rem] font-semibold text-gray-900"
                  :aria-expanded="openFaqId === faq.faqId"
                  @click="toggleFaq(faq)"
                >
                  <span class="shrink-0 mr-3 min-w-[24px] text-right text-[0.85rem] font-bold text-gray-400">{{ (pageNo - 1) * pageSize + idx + 1 }}</span>
                  <span class="flex-1 pr-3">{{ faq.q }}</span>
                  <span class="shrink-0 mr-2.5 text-[0.72rem] text-gray-400 font-medium whitespace-nowrap" title="읽음 수">
                    <i class="far fa-eye mr-1"></i>{{ (faq.viewCount || 0).toLocaleString() }}
                  </span>
                  <span class="shrink-0 text-[0.7rem] text-gray-800 transition-transform duration-200" :class="{ 'rotate-180': openFaqId === faq.faqId }">▼</span>
                </button>
                <div v-show="openFaqId === faq.faqId" class="pb-5 pl-9 pr-2 text-[0.9rem] text-gray-600 leading-[1.8]">
                  <!-- 답변은 관리자가 작성한 HTML(이미지 포함) — 화면 폭을 넘지 않게 이미지 폭만 제한 -->
                  <div v-if="faq.a" class="[&_img]:max-w-full [&_img]:h-auto [&_p]:mb-2" v-html="faq.a"></div>
                  <div v-else class="text-gray-400">등록된 답변이 없습니다.</div>
                </div>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="faqs.length" class="flex flex-wrap items-center justify-center gap-1.5 mb-8">
              <button type="button" class="pg-btn" :disabled="pageNo <= 1" aria-label="처음" @click="goPage(1)">«</button>
              <button type="button" class="pg-btn" :disabled="pageNo <= 1" aria-label="이전" @click="goPage(pageNo - 1)">‹</button>
              <button v-for="n in pageNumbers" :key="n" type="button" class="pg-btn" :class="{ 'pg-on': n === pageNo }" @click="goPage(n)">{{ n }}</button>
              <button type="button" class="pg-btn" :disabled="pageNo >= pageTotalPage" aria-label="다음" @click="goPage(pageNo + 1)">›</button>
              <button type="button" class="pg-btn" :disabled="pageNo >= pageTotalPage" aria-label="마지막" @click="goPage(pageTotalPage)">»</button>
              <select v-model.number="pageSize" class="ml-1.5 h-9 px-2 border border-[#e5e7eb] rounded-md bg-white text-[0.82rem] cursor-pointer" aria-label="페이지 크기" @change="changePageSize">
                <option v-for="s in PAGE_SIZES" :key="s" :value="s">{{ s }}개</option>
              </select>
            </div>

            <!-- 문의 유도 -->
            <div class="text-center py-4">
              <p class="text-gray-400 text-[0.875rem] mb-4">원하시는 답변을 찾지 못하셨나요?</p>
              <nuxt-link to="/contact" class="os-btn os-btn-black os-btn-3 inline-block">1:1 문의하기</nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </layout>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import Layout from "~/layout/Layout.vue";
import BreadcrumbArea from "~/components/common/breadcrumb/BreadcrumbArea.vue";
import { coFaqSvc, type FaqItemType, type FaqTreeType } from "~/svc/fo/ec/cm/coFaqSvc";
import { usePageTitle } from "~/composables/usePageTitle";

useHead({ title: "FAQ" });
usePageTitle("FAQ");

const PAGE_SIZES = [5, 10, 20, 30, 50];

// ── 분류 트리(+건수 배지) ─────────────────────────────────────────────
const { data: treeData } = useAsyncData<FaqTreeType>("faq-tree", () => coFaqSvc.getTree(), { lazy: true, server: false });

// ── 목록 (분류·페이지·페이지크기가 바뀔 때마다 서버 재조회) ────────────────────
const selectedPathId = ref<string | null>(null);
const faqs = ref<FaqItemType[]>([]);
const pageNo = ref(1);
const pageSize = ref(10);
const pageTotalPage = ref(1);
const loading = ref(false);
const errorMsg = ref("");
const openFaqId = ref<string | null>(null);

async function loadFaqs() {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await coFaqSvc.getPage({ pageNo: pageNo.value, pageSize: pageSize.value, pathId: selectedPathId.value });
    faqs.value = res.items;
    pageTotalPage.value = res.pageTotalPage || 1;
  } catch {
    faqs.value = [];
    pageTotalPage.value = 1;
    errorMsg.value = "FAQ를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  } finally {
    loading.value = false;
  }
}

function selectPath(id: string | null) {
  selectedPathId.value = id;
  openFaqId.value = null;
  pageNo.value = 1;
  loadFaqs();
}
function goPage(n: number) {
  if (n < 1 || n > pageTotalPage.value || n === pageNo.value) return;
  pageNo.value = n;
  openFaqId.value = null;
  loadFaqs();
}
function changePageSize() {
  pageNo.value = 1;
  openFaqId.value = null;
  loadFaqs();
}

// 현재 페이지 기준 최대 5개 번호 창
const pageNumbers = computed(() => {
  const total = pageTotalPage.value;
  const start = Math.max(1, Math.min(pageNo.value - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// ── 아코디언: 펼칠 때 처음 읽는 FAQ만 조회수 +1 (이번 세션 중복 증가 방지) ────────────
const viewedIds = new Set<string>();
async function toggleFaq(faq: FaqItemType) {
  const willOpen = openFaqId.value !== faq.faqId;
  openFaqId.value = willOpen ? faq.faqId : null;
  if (!willOpen || viewedIds.has(faq.faqId)) return;
  viewedIds.add(faq.faqId);
  try {
    const next = await coFaqSvc.incrView(faq.faqId);
    if (typeof next === "number") faq.viewCount = next;
  } catch {
    viewedIds.delete(faq.faqId); // 실패하면 다음 펼침에 재시도
  }
}

onMounted(loadFaqs);
</script>

<style scoped>
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
