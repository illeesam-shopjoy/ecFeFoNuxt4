<template>
  <!-- 비밀번호 입력 + 우측 눈 아이콘(보기/숨기기). 속성·이벤트(class, placeholder, onInput 등)는 모두 <input> 으로 넘긴다. -->
  <div class="relative">
    <input v-bind="$attrs" :value="modelValue" :type="shown ? 'text' : 'password'" style="padding-right: 42px" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <button type="button" class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-gray-400 hover:text-gray-600" :aria-label="shown ? '비밀번호 숨기기' : '비밀번호 보기'" tabindex="-1" @click="shown = !shown">
      <i :class="shown ? 'far fa-eye-slash' : 'far fa-eye'"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
const shown = ref(false);
</script>
