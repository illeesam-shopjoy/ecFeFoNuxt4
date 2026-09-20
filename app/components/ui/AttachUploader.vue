<template>
  <!-- 첨부파일 위젯 — ecFeBo BaseAttachGrp 대응. 파일을 고르면(여러 개 한 번에 가능) 즉시 /co/cm/upload/multi 로 올리고(미연계),
       v-model 에는 부모 저장 요청에 그대로 실어 보낼 attachFiles 변경 목록이 담긴다:
         · 이번에 올린 파일 → { attachId, rowStatus: 'I' }
         · 수정 화면에서 기존(initialFiles) 첨부를 지우면 → { attachId, rowStatus: 'D' }
       이번에 올렸다가 지운 파일은 아직 연계 전이므로 서버에서도 바로 삭제한다.
       2026-09-20: 동영상(파일당 100MB)·여러 종류 파일 지원 — 유형별 용량 한도는 서버(FileUploadUtil)와 동일하게 적용한다. -->
  <div class="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-3">
    <div v-if="title" class="flex items-center gap-2 text-[0.75rem] text-gray-500 mb-2 bg-white border border-[#eee] rounded px-2.5 py-1.5">
      <span class="font-semibold text-gray-700">📁 {{ title }}</span>
      <template v-if="showGrp">
        <span class="text-gray-300">|</span>
        <span>분류</span>
        <code class="px-1.5 py-px rounded bg-[#eef2ff] text-[#4338ca] text-[0.7rem]">{{ grpCode }}</code>
      </template>
    </div>

    <ul v-if="rows.length" class="list-none m-0 p-0 mb-2 flex flex-col gap-1.5">
      <li v-for="f in rows" :key="f.attachId" class="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-[0.82rem]">
        <img v-if="f.thumb" :src="f.thumb" alt="" class="w-8 h-8 rounded object-cover shrink-0" />
        <span v-else class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><i :class="f.isVideo ? 'far fa-file-video' : 'far fa-file'"></i></span>
        <span class="flex-1 min-w-0 truncate text-gray-800">{{ f.name }}</span>
        <span v-if="f.existing" class="text-[0.68rem] text-gray-400 shrink-0">기존</span>
        <span class="text-[0.72rem] text-gray-400 shrink-0">{{ fmtSize(f.size) }}</span>
        <button type="button" class="w-6 h-6 rounded-full border-0 bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer" aria-label="삭제" @click="remove(f)"><i class="fal fa-times"></i></button>
      </li>
    </ul>
    <div v-else class="text-[0.8rem] text-gray-400 px-1 mb-2">📂 첨부된 파일이 없습니다.</div>

    <div v-if="uploading" class="mb-2">
      <div class="h-1.5 rounded bg-gray-200 overflow-hidden"><div class="h-full bg-theme transition-[width] duration-150" :style="{ width: progress + '%' }"></div></div>
      <div class="text-[0.72rem] text-gray-500 mt-1">업로드중… {{ progress }}%<template v-if="progress >= 100"> (서버에서 처리 중 — 동영상은 시간이 걸릴 수 있습니다)</template></div>
    </div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button type="button" class="px-3 py-1.5 rounded-md border border-[#d1d5db] bg-white text-[0.8rem] font-semibold text-gray-700 cursor-pointer hover:border-theme hover:text-theme disabled:opacity-50" :disabled="uploading || rows.length >= maxCount" @click="picker?.click()">
        {{ uploading ? "업로드중…" : "📎 파일첨부" }}
      </button>
      <span class="text-[0.72rem] text-gray-400">{{ rows.length }} / {{ maxCount }}개 <span class="mx-1">|</span> {{ limitText }}</span>
      <input ref="picker" type="file" multiple class="hidden" :accept="accept.map((e) => '.' + e).join(',')" @change="onPick" />
    </div>
    <div v-if="msg" class="text-[0.78rem] leading-snug mt-2 mb-0" :class="msgErr ? 'text-red-500' : 'text-green-600'">{{ msg }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { isImageExt, isVideoExt } from "~/utils/mapProduct";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";
import type { SyAttachType } from "~/types/sy/syAttachType";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

interface AttachRow { attachId: string; name: string; size: number; thumb?: string; isVideo: boolean; existing: boolean }

const props = withDefaults(
  defineProps<{
    modelValue?: SyAttachChangeType[];
    grpCode?: string;
    title?: string;
    showGrp?: boolean;
    maxCount?: number;
    accept?: string[];
    initialFiles?: SyAttachType[]; // 수정 화면: 이미 연계된 기존 첨부
    imageMaxMb?: number;
    docMaxMb?: number;
    videoMaxMb?: number;
    etcMaxMb?: number;
  }>(),
  {
    modelValue: () => [],
    grpCode: "CONTACT_CONTENT_ATTACH",
    title: "문의 첨부파일",
    showGrp: true,
    maxCount: 5,
    accept: () => ["jpg", "jpeg", "png", "gif", "pdf", "xlsx", "docx", "zip"],
    initialFiles: () => [],
    // 서버 FileUploadUtil 기본 한도와 같은 값 — 이미지 5MB / 문서 20MB / 동영상 100MB / 그 외 10MB
    imageMaxMb: 5,
    docMaxMb: 20,
    videoMaxMb: 100,
    etcMaxMb: 10,
  }
);
const emit = defineEmits<{ (e: "update:modelValue", v: SyAttachChangeType[]): void }>();

const cdnBase = useRuntimeConfig().public.prodCdnBase as string;
const picker = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const progress = ref(0);
const msg = ref("");
const msgErr = ref(false);

const existing = ref<AttachRow[]>([]); // 기존 첨부(서버에 이미 연계된 것)
const added = ref<AttachRow[]>([]); // 이번에 올린 것
const removedIds = ref<string[]>([]); // 지운 기존 첨부

const DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"];
const say = (m: string, err = false) => { msg.value = m; msgErr.value = err; };
const fmtSize = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
const rows = computed(() => [...existing.value, ...added.value]);

const limitMbOf = (ext: string) => (isVideoExt(ext) ? props.videoMaxMb : isImageExt(ext) ? props.imageMaxMb : DOC_EXT.includes(ext) ? props.docMaxMb : props.etcMaxMb);
const limitText = computed(() => {
  const parts: string[] = [];
  if (props.accept.some(isImageExt)) parts.push(`이미지 ${props.imageMaxMb}MB`);
  if (props.accept.some(isVideoExt)) parts.push(`동영상 ${props.videoMaxMb}MB`);
  if (props.accept.some((e) => DOC_EXT.includes(e))) parts.push(`문서 ${props.docMaxMb}MB`);
  if (props.accept.some((e) => !isImageExt(e) && !isVideoExt(e) && !DOC_EXT.includes(e))) parts.push(`기타 ${props.etcMaxMb}MB`);
  return `파일당 ${parts.join(" · ")} 이하`;
});

const toRow = (a: SyAttachType): AttachRow => ({
  attachId: a.attachId,
  name: a.fileNm,
  size: a.fileSize,
  thumb: isImageExt(a.fileExt) || isVideoExt(a.fileExt) ? a.thumbCdnUrl || (isImageExt(a.fileExt) ? a.cdnImgUrl : undefined) : undefined,
  isVideo: isVideoExt(a.fileExt),
  existing: true,
});

// 수정 대상이 바뀌면(또는 처음) 기존 첨부를 다시 채운다
watch(() => props.initialFiles, (list) => { existing.value = (list ?? []).map(toRow); added.value = []; removedIds.value = []; }, { immediate: true, deep: true });

// 부모가 v-model 을 비우면(등록 완료 후 초기화) 이번에 올린 것/지운 것 표시도 초기화한다
watch(() => props.modelValue, (v) => {
  if (!v.length && (added.value.length || removedIds.value.length)) {
    added.value = [];
    removedIds.value = [];
    existing.value = (props.initialFiles ?? []).map(toRow);
    say("");
  }
});

const sync = () => emit("update:modelValue", [
  ...added.value.map((f) => ({ attachId: f.attachId, rowStatus: "I" as const })),
  ...removedIds.value.map((id) => ({ attachId: id, rowStatus: "D" as const })),
]);

async function onPick(e: Event) {
  const input = e.target as HTMLInputElement;
  const picked = [...(input.files ?? [])];
  input.value = "";
  if (!picked.length) return;
  say("");
  const valid: File[] = [];
  const skipped: string[] = []; // 거부된 파일 안내 — 이후 업로드 결과 메시지와 합쳐서 보여준다(덮어쓰지 않게)
  for (const f of picked) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const limit = limitMbOf(ext);
    if (!props.accept.includes(ext)) { skipped.push(`${f.name}: 허용되지 않는 형식`); continue; }
    if (f.size > limit * 1048576) { skipped.push(`${f.name}: ${isVideoExt(ext) ? "동영상 " : ""}${limit}MB 초과`); continue; }
    if (rows.value.length + valid.length >= props.maxCount) { skipped.push(`${f.name}: 최대 ${props.maxCount}개 초과`); continue; }
    valid.push(f);
  }
  const skippedMsg = skipped.length ? ` (제외 ${skipped.length}건 — ${skipped.join(", ")})` : "";
  if (!valid.length) return say(`첨부할 수 있는 파일이 없습니다${skippedMsg}`, true);
  uploading.value = true;
  progress.value = 0;
  try {
    const res = await coUploadSvc.uploadMulti(valid, props.grpCode, (p) => (progress.value = p));
    for (const u of res.files ?? []) {
      const ext = (u.fileExt || "").toLowerCase();
      const isImg = isImageExt(ext);
      const isVid = isVideoExt(ext);
      added.value.push({
        attachId: u.attachId,
        name: u.originalName,
        size: u.fileSize,
        thumb: isImg || isVid ? fixInternalCdnUrl(resolveCdnUrl(u.thumbCdnUrl || (isImg ? u.cdnImgUrl : undefined), cdnBase), cdnBase) : undefined,
        isVideo: isVid,
        existing: false,
      });
    }
    sync();
    if ((res.failedCount ?? 0) > 0 && !(res.uploadedCount ?? 0)) say(`업로드 실패: ${(res.failedFiles ?? []).join(", ") || "파일 검증 오류"}${skippedMsg}`, true);
    else if ((res.failedCount ?? 0) > 0) say(`${res.uploadedCount}개 업로드, ${res.failedCount}개 실패 — ${(res.failedFiles ?? []).join(", ")}${skippedMsg}`, true);
    else say(`${res.uploadedCount ?? valid.length}개 파일이 업로드되었습니다${skippedMsg}`, skipped.length > 0);
  } catch (e) {
    const err = e as { data?: { message?: string } };
    say(`업로드 중 오류가 발생했습니다${err?.data?.message ? ` — ${err.data.message}` : ""}`, true);
  } finally {
    uploading.value = false;
  }
}

async function remove(f: AttachRow) {
  if (f.existing) {
    // 이미 글에 연계된 첨부 — 지금 서버에서 지우지 않고, 저장할 때 rowStatus:'D' 로 연계 해제
    existing.value = existing.value.filter((x) => x.attachId !== f.attachId);
    removedIds.value.push(f.attachId);
    sync();
    return;
  }
  added.value = added.value.filter((x) => x.attachId !== f.attachId);
  sync();
  try { await coUploadSvc.deleteAttach(f.attachId); } catch { /* 미연계 고아 파일은 서버 정리 대상 — 화면 동작에는 영향 없음 */ }
}
</script>
