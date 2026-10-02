<template>
  <!-- 프로필 이미지 — 원형 미리보기 + 올리기/사진 찍기/삭제. 이미지 파일(5MB 이하)만, 올리면 CDN 주소를 v-model 로 돌려준다. -->
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
        <button type="button" class="cursor-pointer rounded-md border border-[#c9ced6] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-gray-700" :disabled="busy" @click="onCameraClick"><i class="fas fa-camera mr-1"></i>사진 찍기</button>
        <button v-if="modelValue" type="button" class="cursor-pointer rounded-md border border-[#fecaca] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-red-500" :disabled="busy" @click="emit('update:modelValue', '')">삭제</button>
      </div>
      <!-- 갤러리/파일 선택 -->
      <input ref="input" type="file" accept="image/*" class="hidden" @change="(e) => onPick(e, false)" />
      <!-- 폰/태블릿: 전면 카메라로 바로 촬영 (capture 는 터치 기기에서만 카메라를 연다) -->
      <input ref="camInput" type="file" accept="image/*" capture="user" class="hidden" @change="(e) => onPick(e, true)" />
      <p class="m-0 mt-1 text-[0.72rem] text-gray-400">JPG·PNG 등 이미지, 5MB 이하</p>
      <p v-if="err" class="m-0 mt-1 text-[0.75rem] text-red-500">{{ err }}</p>
    </div>

    <!-- PC(웹캠): 카메라 미리보기 → 촬영 -->
    <Teleport to="body">
      <div v-if="camOpen" class="fixed inset-0 z-[1300] flex items-center justify-center bg-black/60 p-4" @click.self="closeCam">
        <div class="w-full max-w-[420px] rounded-xl bg-white p-4 shadow-xl">
          <p class="m-0 mb-2 text-[0.95rem] font-bold text-gray-800">사진 찍기</p>
          <div class="relative mx-auto aspect-square w-full overflow-hidden rounded-lg bg-black">
            <video ref="video" autoplay playsinline muted class="h-full w-full -scale-x-100 object-cover"></video>
            <div v-if="camLoading" class="absolute inset-0 flex items-center justify-center text-white"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
          <p v-if="camErr" class="m-0 mt-2 text-[0.78rem] text-red-500">{{ camErr }}</p>
          <div class="mt-3 flex gap-2">
            <button type="button" class="flex-1 cursor-pointer rounded-md border border-[#c9ced6] bg-white py-2 text-[0.85rem] font-semibold text-gray-700" @click="closeCam">취소</button>
            <button type="button" class="flex-1 cursor-pointer rounded-md bg-[#1a1410] py-2 text-[0.85rem] font-semibold text-white disabled:opacity-40" :disabled="camLoading || !!camErr" @click="snap"><i class="fas fa-camera mr-1"></i>촬영</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";

defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();
const cdnBase = useRuntimeConfig().public.prodCdnBase as string;
const input = ref<HTMLInputElement | null>(null);
const camInput = ref<HTMLInputElement | null>(null);
const busy = ref(false);
const err = ref("");

// 터치 기기(폰/태블릿)는 capture 입력으로 카메라 앱을 바로 열고, PC 는 웹캠 미리보기 창(getUserMedia)을 쓴다
const touchDevice = ref(false);
onMounted(() => {
  touchDevice.value = window.matchMedia?.("(pointer: coarse)").matches === true;
});

/** 카메라 촬영본은 원본이 수 MB 라 5MB 제한에 걸리기 쉽다 — 긴 변 1024px 이하 JPEG 로 줄여 올린다 */
async function shrink(src: Blob | HTMLVideoElement, name: string): Promise<File> {
  const MAX = 1024;
  const bmp = src instanceof Blob ? await createImageBitmap(src) : null;
  const sw = bmp ? bmp.width : (src as HTMLVideoElement).videoWidth;
  const sh = bmp ? bmp.height : (src as HTMLVideoElement).videoHeight;
  // 프로필은 원형/정사각 표시라 가운데 정사각형으로 자른다
  const side = Math.min(sw, sh);
  const sx = (sw - side) / 2;
  const sy = (sh - side) / 2;
  const out = Math.min(side, MAX);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  canvas.getContext("2d")!.drawImage((bmp ?? src) as CanvasImageSource, sx, sy, side, side, 0, 0, out, out);
  bmp?.close();
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("이미지를 만들지 못했습니다.");
  return new File([blob], name, { type: "image/jpeg" });
}

async function upload(file: File) {
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

async function onPick(e: Event, fromCamera: boolean) {
  const el = e.target as HTMLInputElement;
  let file = el.files?.[0];
  el.value = "";
  err.value = "";
  if (!file) return;
  if (fromCamera && file.type.startsWith("image/")) {
    try {
      file = await shrink(file, `profile_${Date.now()}.jpg`);
    } catch {
      /* 축소 실패 시 원본으로 진행(5MB 검사에서 걸러짐) */
    }
  }
  await upload(file);
}

// ── PC 웹캠 촬영 ──
const camOpen = ref(false);
const camLoading = ref(false);
const camErr = ref("");
const video = ref<HTMLVideoElement | null>(null);
let stream: MediaStream | null = null;

function stopStream() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}
function closeCam() {
  stopStream();
  camOpen.value = false;
}

async function onCameraClick() {
  err.value = "";
  if (touchDevice.value) return void camInput.value?.click();
  if (!navigator.mediaDevices?.getUserMedia) {
    // 카메라 API 를 못 쓰는 환경(http 등) — 파일 선택(촬영 가능한 기기면 카메라)으로 대체
    return void camInput.value?.click();
  }
  camErr.value = "";
  camLoading.value = true;
  camOpen.value = true;
  await nextTick();
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (video.value) {
      video.value.srcObject = stream;
      await video.value.play().catch(() => undefined);
    }
  } catch (e) {
    const name = (e as { name?: string })?.name;
    camErr.value =
      name === "NotAllowedError" ? "카메라 사용이 차단되었습니다. 주소창의 카메라 권한을 허용해 주세요." : name === "NotFoundError" ? "사용할 수 있는 카메라를 찾지 못했습니다." : "카메라를 열 수 없습니다.";
  } finally {
    camLoading.value = false;
  }
}

async function snap() {
  const v = video.value;
  if (!v || !v.videoWidth) return;
  try {
    const file = await shrink(v, `profile_${Date.now()}.jpg`);
    closeCam();
    await upload(file);
  } catch {
    camErr.value = "촬영에 실패했습니다. 다시 시도해 주세요.";
  }
}

onBeforeUnmount(stopStream);
</script>
