<template>
  <!-- 2026-09-20(요청사항: 상품상세 "그 밖의 정보들") — ecFeBo "이런 코디 어때요?". 백엔드에 코디 추천 데이터가 없어 ecFeBo 와 같은 고정 문구다. -->
  <div class="rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-7">
    <h3 class="mb-5 flex items-center gap-2 text-[0.95rem] font-bold text-gray-900"><span aria-hidden="true">🎨</span> 이런 코디 어때요?</h3>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div v-for="s in styles" :key="s.label" class="flex flex-col items-center gap-1.5 rounded-lg px-2 py-4 text-center">
        <span class="text-[2rem] leading-none" aria-hidden="true">{{ s.emoji }}</span>
        <span class="mt-1 text-[0.9rem] font-semibold text-gray-900">{{ s.label }}</span>
        <span class="text-[0.78rem] text-[#8a8a8a]">{{ s.desc }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const styles = [
  { emoji: "👖", label: "캐주얼 룩", desc: "데님 팬츠 + 스니커즈" },
  { emoji: "👗", label: "페미닌 룩", desc: "플로럴 스커트와 매치" },
  { emoji: "🧥", label: "레이어드 룩", desc: "오버핏 자켓과 함께" },
  { emoji: "👟", label: "스포티 룩", desc: "트랙 팬츠 + 스니커즈" },
];
</script>
