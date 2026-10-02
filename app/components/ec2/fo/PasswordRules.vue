<template>
  <!-- 비밀번호 입력 아래에 규칙별 충족 여부를 한 줄로 보여준다(충족하면 초록 체크, 아니면 회색 원) -->
  <ul class="pw-rules m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[0.78rem]" aria-label="비밀번호 규칙">
    <li v-for="r in rules" :key="r.key" class="flex items-center gap-1" :class="r.ok ? 'font-semibold text-[#16a34a]' : 'text-gray-400'">
      <i :class="r.ok ? 'fas fa-check-circle' : 'far fa-circle'" class="text-[0.85rem]"></i>{{ r.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { checkPassword } from "~/utils/passwordPolicy";

const props = defineProps<{ value: string }>();
const rules = computed(() => checkPassword(props.value));
</script>
