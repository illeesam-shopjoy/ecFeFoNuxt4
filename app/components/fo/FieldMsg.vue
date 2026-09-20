<template>
  <!-- 입력 항목 아래 한 줄 결과 메시지: 성공은 초록 체크, 실패는 빨간 X (예: "비밀번호가 일치합니다", "휴대폰 인증이 완료되었습니다") -->
  <div class="flex items-center gap-1 text-[0.78rem] font-medium" :class="ok ? 'text-[#16a34a]' : 'text-red-500'" role="status">
    <i :class="ok ? 'far fa-check-circle' : 'far fa-times-circle'"></i>{{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ ok: boolean; text: string }>();
</script>
