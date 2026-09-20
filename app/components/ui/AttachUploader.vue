<template>
  <!-- 2026-09-20(요청사항: "파일첨부 넣어줘") — ecFeBo BaseAttachGrp 대응. 파일을 고르면 즉시 /co/cm/upload/multi 로 올리고(미연계),
       v-model 에는 부모 저장 요청에 그대로 실어 보낼 attachFiles([{attachId,rowStatus:'I'}])가 담긴다.
       화면에서 지운 파일은 아직 연계 전이므로 서버에서도 즉시 삭제한다. -->
  <div class="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-3">
    <div class="flex items-center gap-2 text-[0.75rem] text-gray-500 mb-2 bg-white border border-[#eee] rounded px-2.5 py-1.5">
      <span class="font-semibold text-gray-700">📁 {{ title }}</span>
      <span class="text-gray-300">|</span>
      <span>분류</span>
      <code class="px-1.5 py-px rounded bg-[#eef2ff] text-[#4338ca] text-[0.7rem]">{{ grpCode }}</code>
    </div>

    <ul v-if="files.length" class="list-none m-0 p-0 mb-2 flex flex-col gap-1.5">
      <li v-for="f in files" :key="f.attachId" class="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-md px-2.5 py-1.5 text-[0.82rem]">
        <img v-if="f.thumb" :src="f.thumb" alt="" class="w-8 h-8 rounded object-cover shrink-0" />
        <span v-else class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><i class="far fa-file"></i></span>
        <span class="flex-1 min-w-0 truncate text-gray-800">{{ f.name }}</span>
        <span class="text-[0.72rem] text-gray-400 shrink-0">{{ fmtSize(f.size) }}</span>
        <button type="button" class="w-6 h-6 rounded-full border-0 bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer" aria-label="삭제" @click="remove(f.attachId)"><i class="fal fa-times"></i></button>
      </li>
    </ul>
    <div v-else class="text-[0.8rem] text-gray-400 px-1 mb-2">📂 첨부된 파일이 없습니다.</div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button type="button" class="px-3 py-1.5 rounded-md border border-[#d1d5db] bg-white text-[0.8rem] font-semibold text-gray-700 cursor-pointer hover:border-theme hover:text-theme disabled:opacity-50" :disabled="uploading || files.length >= maxCount" @click="picker?.click()">
        {{ uploading ? "업로드중…" : "📎 파일첨부" }}
      </button>
      <span class="text-[0.72rem] text-gray-400">{{ files.length }} / {{ maxCount }}개 <span class="mx-1">|</span> 최대 {{ maxSizeMb }}MB <span class="mx-1">|</span> {{ accept.join(",") }}</span>
      <input ref="picker" type="file" multiple class="hidden" :accept="accept.map((e) => '.' + e).join(',')" @change="onPick" />
    </div>
    <p v-if="msg" class="text-[0.78rem] mt-2 mb-0" :class="msgErr ? 'text-red-500' : 'text-green-600'">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";

export interface AttachChange { attachId: string; rowStatus: "I" | "D" }
interface AttachRow { attachId: string; name: string; size: number; thumb?: string }

const props = withDefaults(
  defineProps<{ modelValue?: AttachChange[]; grpCode?: string; title?: string; maxCount?: number; maxSizeMb?: number; accept?: string[] }>(),
  { modelValue: () => [], grpCode: "CONTACT_CONTENT_ATTACH", title: "문의 첨부파일", maxCount: 5, maxSizeMb: 10, accept: () => ["jpg", "jpeg", "png", "gif", "pdf", "xlsx", "docx", "zip"] }
);
const emit = defineEmits<{ (e: "update:modelValue", v: AttachChange[]): void }>();

const cdnBase = useRuntimeConfig().public.prodCdnBase as string;
const picker = ref<HTMLInputElement | null>(null);
const files = ref<AttachRow[]>([]);
const uploading = ref(false);
const msg = ref("");
const msgErr = ref(false);

const say = (m: string, err = false) => { msg.value = m; msgErr.value = err; };
const fmtSize = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
const sync = () => emit("update:modelValue", files.value.map((f) => ({ attachId: f.attachId, rowStatus: "I" as const })));

// 부모가 v-model 을 비우면(접수 완료 후 초기화) 목록도 비운다
watch(() => props.modelValue, (v) => { if (!v.length && files.value.length) { files.value = []; say(""); } });

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
    if (!props.accept.includes(ext)) { skipped.push(`${f.name}: 허용되지 않는 형식`); continue; }
    if (f.size > props.maxSizeMb * 1048576) { skipped.push(`${f.name}: ${props.maxSizeMb}MB 초과`); continue; }
    if (files.value.length + valid.length >= props.maxCount) { skipped.push(`${f.name}: 최대 ${props.maxCount}개 초과`); continue; }
    valid.push(f);
  }
  const skippedMsg = skipped.length ? ` (제외 ${skipped.length}건 — ${skipped.join(", ")})` : "";
  if (!valid.length) return say(`첨부할 수 있는 파일이 없습니다${skippedMsg}`, true);
  uploading.value = true;
  try {
    const res = await coUploadSvc.uploadMulti(valid, props.grpCode);
    for (const u of res.files ?? []) {
      files.value.push({ attachId: u.attachId, name: u.originalName, size: u.fileSize, thumb: /^(jpe?g|png|gif)$/i.test(u.fileExt || "") ? fixInternalCdnUrl(resolveCdnUrl(u.thumbCdnUrl || u.cdnImgUrl, cdnBase), cdnBase) : undefined });
    }
    sync();
    if ((res.failedCount ?? 0) > 0 && !(res.uploadedCount ?? 0)) say(`업로드 실패: ${(res.failedFiles ?? []).join(", ") || "파일 검증 오류"}${skippedMsg}`, true);
    else if ((res.failedCount ?? 0) > 0) say(`${res.uploadedCount}개 업로드, ${res.failedCount}개 실패${skippedMsg}`, true);
    else say(`${res.uploadedCount ?? valid.length}개 파일이 업로드되었습니다${skippedMsg}`, skipped.length > 0);
  } catch {
    say("업로드 중 오류가 발생했습니다.", true);
  } finally {
    uploading.value = false;
  }
}

async function remove(attachId: string) {
  files.value = files.value.filter((f) => f.attachId !== attachId);
  sync();
  try { await coUploadSvc.deleteAttach(attachId); } catch { /* 미연계 고아 파일은 서버 정리 대상 — 화면 동작에는 영향 없음 */ }
}
</script>
