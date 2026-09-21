<template>
  <!-- 2026-09-22(요청사항: "사이즈 라벨 우측에 사이즈 도움말 아이콘 — 클릭하면 모달로 사이즈 가이드 및 세계 각국 표준") — 상품상세/빠른보기의 사이즈 옆 (?) 에서 연다.
       탭 2개: 사이즈 가이드(이 쇼핑몰 실측표) / 세계 사이즈 표준(한·미·영·유럽·일본 환산). 표는 참고용 일반 기준이라 브랜드·제품마다 다를 수 있다. -->
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9600] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="사이즈 안내" @click.self="hide">
      <div class="flex max-h-[88vh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div class="flex items-center justify-between border-b border-[#eceef1] px-5 py-3.5">
          <h3 class="m-0 flex items-center gap-2 text-[1.05rem] font-bold text-gray-900"><span aria-hidden="true">📏</span> 사이즈 안내</h3>
          <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f1f2f4] text-xl leading-none text-gray-600 hover:bg-[#e4e6ea]" aria-label="닫기" @click="hide">×</button>
        </div>

        <div class="flex gap-1 border-b border-[#eceef1] px-3 pt-2" role="tablist">
          <button
            v-for="t in TABS"
            :key="t.id"
            type="button"
            role="tab"
            :aria-selected="tab === t.id"
            class="cursor-pointer whitespace-nowrap border-0 border-b-[3px] border-solid bg-transparent px-3.5 py-2.5 text-[0.9rem]"
            :class="tab === t.id ? 'border-[#bc8246] font-bold text-[#bc8246]' : 'border-transparent font-medium text-gray-500 hover:text-gray-800'"
            @click="tab = t.id"
          >{{ t.label }}</button>
        </div>

        <div class="overflow-y-auto px-4 py-4 sm:px-5">
          <!-- 사이즈 가이드 -->
          <div v-if="tab === 'guide'">
            <prod-size-guide />
            <div class="mt-4 rounded-xl bg-[#faf6ef] px-4 py-3 text-[0.82rem] leading-relaxed text-gray-700">
              <div class="mb-1 font-bold text-gray-900">💡 이렇게 재보세요</div>
              <ul class="m-0 list-disc pl-4">
                <li><b>어깨</b> — 양쪽 어깨 끝점 사이의 직선 길이</li>
                <li><b>가슴</b> — 겨드랑이 아래 가장 넓은 부분의 단면 폭 × 2</li>
                <li><b>총장</b> — 목 뒤 솔기에서 밑단까지 수직 길이</li>
                <li>가지고 있는 잘 맞는 옷을 평평하게 펼쳐 같은 방법으로 재서 비교하면 가장 정확합니다.</li>
              </ul>
            </div>
          </div>

          <!-- 세계 사이즈 표준 -->
          <div v-else>
            <div class="mb-3 flex flex-wrap gap-1.5">
              <button
                v-for="g in WORLD"
                :key="g.id"
                type="button"
                class="cursor-pointer rounded-full border px-3.5 py-1 text-[0.82rem]"
                :class="world === g.id ? 'border-[#222] bg-[#222] font-semibold text-white' : 'border-[#d5d9df] bg-white text-gray-700 hover:border-gray-500'"
                @click="world = g.id"
              >{{ g.label }}</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[420px] border-collapse text-center text-[0.84rem]">
                <thead>
                  <tr class="bg-[#f6f7f9] text-gray-700">
                    <th v-for="c in curWorld.cols" :key="c" class="whitespace-nowrap border border-[#eceef1] px-2.5 py-2.5 font-semibold">{{ c }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in curWorld.rows" :key="r[0]" :class="i % 2 ? 'bg-[#fafbfc]' : ''">
                    <td v-for="(v, j) in r" :key="j" class="whitespace-nowrap border border-[#eceef1] px-2.5 py-2 text-gray-800" :class="j === 0 ? 'font-semibold' : ''">{{ v }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="mt-3 mb-0 text-[0.78rem] leading-relaxed text-[#8a8a8a]">{{ curWorld.note }}</p>
          </div>
          <p class="mt-3 mb-0 text-[0.75rem] text-[#9ca3af]">* 브랜드·제품마다 실제 치수는 다를 수 있으니 참고용으로 봐주세요.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import ProdSizeGuide from "~/components/prod-detail/ProdSizeGuide.vue";

const TABS = [
  { id: "guide", label: "사이즈 가이드" },
  { id: "world", label: "세계 사이즈 표준" },
] as const;

interface WorldTable { id: string; label: string; cols: string[]; rows: string[][]; note: string }
const WORLD: WorldTable[] = [
  {
    id: "women",
    label: "여성 의류",
    cols: ["표기", "한국", "미국 US", "영국 UK", "유럽 EU", "일본 JP"],
    rows: [
      ["XS", "44", "0–2", "4–6", "32–34", "5"],
      ["S", "55", "4–6", "8–10", "36–38", "7"],
      ["M", "66", "8–10", "12–14", "40–42", "9"],
      ["L", "77", "12–14", "16–18", "44–46", "11"],
      ["XL", "88", "16", "20", "48", "13"],
    ],
    note: "한국 44·55·66·77 은 여성복 호칭 사이즈입니다(55 ≈ 가슴 86cm 안팎).",
  },
  {
    id: "men",
    label: "남성 의류",
    cols: ["표기", "한국", "미국 US", "영국 UK", "유럽 EU", "일본 JP"],
    rows: [
      ["S", "90", "34–36", "34–36", "44–46", "S"],
      ["M", "95", "38", "38", "48", "M"],
      ["L", "100", "40", "40", "50", "L"],
      ["XL", "105", "42", "42", "52", "LL"],
      ["XXL", "110", "44", "44", "54", "3L"],
    ],
    note: "한국 90~110 은 가슴둘레 기준의 남성복 호칭 사이즈입니다. 미국·영국은 인치(chest) 기준입니다.",
  },
  {
    id: "shoes",
    label: "신발",
    cols: ["한국 (mm)", "미국 남성", "미국 여성", "영국 UK", "유럽 EU"],
    rows: [
      ["230", "5", "6.5", "4", "36"],
      ["240", "6", "7.5", "5", "37.5"],
      ["250", "7", "8.5", "6", "39"],
      ["260", "8", "9.5", "7", "40.5"],
      ["270", "9", "10.5", "8", "42"],
      ["280", "10", "11.5", "9", "43.5"],
      ["290", "11", "12.5", "10", "45"],
    ],
    note: "한국 신발 사이즈는 발길이(mm)입니다. 발볼이 넓다면 한 사이즈 크게 고르는 것을 권장합니다.",
  },
];

const open = ref(false);
const tab = ref<(typeof TABS)[number]["id"]>("guide");
const world = ref("women");
const curWorld = computed(() => WORLD.find((w) => w.id === world.value) ?? WORLD[0]!);

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") hide();
}
function show() {
  open.value = true;
  tab.value = "guide";
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKey);
}
function hide() {
  open.value = false;
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKey);
}
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  }
});
defineExpose({ show, hide });
</script>
