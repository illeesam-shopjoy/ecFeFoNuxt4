<template>
  <!-- 프로필 이미지 — 원형 미리보기 + 올리기/삭제. 이미지 파일(5MB 이하)만, 올리면 CDN 주소를 v-model 로 돌려준다. -->
  <div class="flex items-center gap-4">
    <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#e5e7eb] bg-[#f3f4f6]">
      <img v-if="modelValue" :src="modelValue" alt="프로필 이미지" class="h-full w-full object-cover" />
      <div v-else class="flex h-full w-full items-center justify-center text-[1.6rem] text-gray-400"><i class="fas fa-user"></i></div>
      <div v-if="busy" class="absolute inset-0 flex items-center justify-center bg-black/40 text-white"><i class="fas fa-spinner fa-spin"></i></div>
    </div>
    <div class="min-w-0">
      <span class="mb-1 block text-[0.78rem] text-gray-500">프로필 이미지</span>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="cursor-pointer rounded-md border border-[#c9ced6] bg-[#f3f4f6] px-3 py-1.5 text-[0.8rem] font-semibold text-gray-700" :disabled="busy" @click="input?.click()">{{ modelValue ? "이미지 변경" : "이미지 올리기" }}</button>
        <button v-if="modelValue" type="button" class="cursor-pointer rounded-md border border-[#fecaca] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-red-500" :disabled="busy" @click="emit('update:modelValue', '')">삭제</button>
      </div>
      <input ref="input" type="file" accept="image/*" class="hidden" @change="onPick" />
      <p class="m-0 mt-1 text-[0.72rem] text-gray-400">JPG·PNG 등 이미지, 5MB 이하</p>
      <p v-if="err" class="m-0 mt-1 text-[0.75rem] text-red-500">{{ err }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
const cdnBase = useRuntimeConfig().public.prodCdnBase as string;
const input = ref<HTMLInputElement | null>(null);
const busy = ref(false);
const err = ref("");

async function onPick(e: Event) {
  const el = e.target as HTMLInputElement;
  const file = el.files?.[0];
  el.value = "";
  err.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) return void (err.value = "이미지 파일만 올릴 수 있습니다.");
  if (file.size > 5 * 1024 * 1024) return void (err.value = "이미지는 5MB 이하만 올릴 수 있습니다.");
  busy.value = true;
  try {
    const res = await coUploadSvc.uploadMulti([file], "MEMBER_PROFILE_IMG");
    const f = res.files?.[0];
    const src = fixInternalCdnUrl(resolveCdnUrl(f?.cdnImgUrl || f?.filePath, cdnBase), cdnBase);
    if (!src) throw new Error("업로드 응답에 이미지 주소가 없습니다.");
    emit("update:modelValue", src);
  } catch {
    err.value = "이미지 업로드에 실패했습니다.";
  } finally {
    busy.value = false;
  }
}
</script>
