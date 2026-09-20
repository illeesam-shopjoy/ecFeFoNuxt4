<template>
  <!-- 2026-09-20(요청사항: 상품상세 "그 밖의 정보들") — ecFeBo Q&A 목록. 백엔드 GET /fo/ec/pd/prod/{id}/qna 를 브라우저가 직접 조회한다(작성은 아직 없음, 조회 전용). -->
  <div>
    <div v-if="pending" class="rounded-xl border border-[#e5e7eb] bg-white p-10 text-center text-[#9ca3af]">불러오는 중...</div>
    <div v-else-if="!list.length" class="rounded-xl border border-[#e5e7eb] bg-white p-10 text-center text-[#9ca3af]">등록된 Q&amp;A가 없습니다.</div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="q in list" :key="q.prodQnaId" class="rounded-xl border border-[#e5e7eb] bg-white p-5">
        <div class="flex items-start gap-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8587a] text-[0.8rem] font-bold text-white">Q</div>
          <div class="min-w-0 flex-1">
            <div class="mb-1.5 flex items-center justify-between gap-3">
              <span class="text-[0.82rem] font-semibold text-gray-900">{{ q.memberId ? q.memberId.slice(0, 1) + "**" : "비회원" }}</span>
              <span class="text-[0.76rem] text-[#9ca3af]">{{ ymdDot(q.regDate) }}</span>
            </div>
            <div class="whitespace-pre-wrap text-[0.88rem] leading-relaxed text-gray-900">
              <template v-if="q.scrtYn === 'Y'"><i class="fas fa-lock mr-1 text-[#9ca3af]"></i>비밀글입니다.</template>
              <template v-else>{{ q.prodQnaTitle || q.prodQnaContent }}</template>
            </div>
            <div v-if="q.scrtYn !== 'Y' && q.answYn === 'Y' && q.answContent" class="mt-3 flex gap-2.5 rounded-lg bg-[#f6f7f9] p-3">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8a8a8a] text-[0.75rem] font-bold text-white">A</div>
              <div class="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-gray-700">{{ q.answContent }}</div>
            </div>
            <div v-else-if="q.answYn !== 'Y'" class="mt-2">
              <span class="rounded bg-[#f6f7f9] px-2 py-[3px] text-[0.76rem] text-[#9ca3af]">답변 대기중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pdProductSvc, type PdQnaItem } from "~/svc/fo/ec/pd/pdProductSvc";

const props = defineProps<{ prodId: string }>();
const emit = defineEmits<{ (e: "count", n: number): void }>();

// SEO 대상이 아니라 서버 렌더에서는 뺀다 — 브라우저가 ecBeBo 를 직접 호출
const { data, pending } = useAsyncData<PdQnaItem[]>(`prod-qna-${props.prodId}`, () => pdProductSvc.getQna(props.prodId).catch(() => []), { default: () => [], lazy: true, server: false });
const list = computed(() => data.value ?? []);
watch(list, (l) => emit("count", l.length), { immediate: true });

const ymdDot = (v?: string | null) => (v ? String(v).slice(0, 10).replace(/-/g, ".") : "");
</script>
