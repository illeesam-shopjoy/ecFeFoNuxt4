<template>
  <!-- 2026-09-20(요청사항: 상품상세 "그 밖의 정보들") — ecFeBo 사이즈 가이드. 백엔드에 상품별 실측 데이터가 없어 ecFeBo 와 같은 공통 표(고정값)를 보여준다. -->
  <div class="rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-7">
    <h3 class="mb-4 flex items-center gap-2 text-[0.95rem] font-bold text-gray-900"><span aria-hidden="true">📏</span> 사이즈 가이드</h3>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-center text-[0.86rem]">
        <thead>
          <tr class="bg-[#f6f7f9] text-gray-700">
            <th v-for="c in cols" :key="c" class="border border-[#eceef1] px-3 py-2.5 font-semibold">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in rows" :key="r[0]" :class="i % 2 ? 'bg-[#fafbfc]' : ''">
            <td v-for="(v, j) in r" :key="j" class="border border-[#eceef1] px-3 py-2 text-gray-800" :class="j === 0 ? 'font-semibold' : ''">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-[0.78rem] text-[#8a8a8a]">* 측정 방법에 따라 1~2cm 오차가 있을 수 있습니다.</p>
  </div>
</template>

<script setup lang="ts">
const cols = ["사이즈", "어깨 (cm)", "가슴 (cm)", "총장 (cm)"];
const rows: string[][] = [
  ["XS", "36", "82", "60"],
  ["S", "38", "86", "62"],
  ["M", "40", "90", "64"],
  ["L", "42", "96", "66"],
  ["XL", "44", "102", "68"],
  ["XXL", "46", "108", "70"],
];
</script>
