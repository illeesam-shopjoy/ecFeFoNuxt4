<template>
  <!-- Q&A 목록 + 작성/수정/삭제. 2026-09-20(요청사항: "상품평/Q&A 에 아무나 등록, 비회원은 이름 입력, 글비밀번호로 수정·삭제, 동영상·여러 파일 첨부")
       — 로그인 회원은 회원 명의, 비회원은 이름+글 비밀번호. 조회는 브라우저가 ecBeBo 를 직접 호출한다. -->
  <div>
    <!-- 목록 -->
    <div v-if="!loaded" class="rounded-xl border border-[#e5e7eb] bg-white p-10 text-center text-[#9ca3af]">불러오는 중...</div>
    <div v-else-if="!list.length" class="rounded-xl border border-[#e5e7eb] bg-white p-10 text-center text-[#9ca3af]">등록된 Q&amp;A가 없습니다.</div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="q in list" :key="q.prodQnaId" class="rounded-xl border border-[#e5e7eb] bg-white p-5" :class="{ 'ring-2 ring-[#bc8246]/40': editingId === q.prodQnaId }">
        <div class="flex items-start gap-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8587a] text-[0.8rem] font-bold text-white">Q</div>
          <div class="min-w-0 flex-1">
            <div class="mb-1.5 flex items-center justify-between gap-3">
              <span class="text-[0.82rem] font-semibold text-gray-900">{{ writerLabel(q) }}</span>
              <span class="flex items-center gap-3 text-[0.76rem] text-[#9ca3af]">
                <template v-if="canModify(q)">
                  <button v-if="q.scrtYn !== 'Y'" type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[length:inherit] text-gray-500 hover:text-gray-900 hover:underline" @click="startEdit(q)">수정</button>
                  <button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-[length:inherit] text-red-500 hover:underline disabled:opacity-50" :disabled="busyId === q.prodQnaId" @click="remove(q)">삭제</button>
                </template>
                {{ ymdDot(q.regDate) }}
              </span>
            </div>
            <div class="whitespace-pre-wrap text-[0.88rem] leading-relaxed text-gray-900">
              <template v-if="q.scrtYn === 'Y'"><i class="fas fa-lock mr-1 text-[#9ca3af]"></i>비밀글입니다.</template>
              <template v-else>{{ q.prodQnaContent || q.prodQnaTitle }}</template>
            </div>
            <!-- 첨부: 이미지·동영상은 썸네일(누르면 뷰어), 그 외 파일은 링크 -->
            <div v-if="q.scrtYn !== 'Y' && (q.attachFiles?.length ?? 0) > 0" class="mt-3 flex flex-col gap-2">
              <div v-if="mediaOf(q).length" class="flex flex-wrap gap-1.5">
                <button v-for="(m, i) in mediaOf(q)" :key="m.attachId" type="button" class="h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded border border-gray-200 bg-gray-100 p-0 hover:opacity-90" :title="m.fileNm" @click="openViewer(mediaOf(q), i)">
                  <img v-if="isImageExt(m.fileExt)" :src="m.thumbCdnUrl || m.cdnImgUrl" :alt="m.fileNm" class="h-full w-full object-cover" />
                  <span v-else class="flex h-full w-full items-center justify-center bg-gray-500"><i class="fa fa-play text-white"></i></span>
                </button>
              </div>
              <ul v-if="otherFilesOf(q).length" class="m-0 flex list-none flex-col gap-1 p-0">
                <li v-for="f in otherFilesOf(q)" :key="f.attachId" class="text-[0.8rem]">
                  <a :href="f.cdnImgUrl" target="_blank" rel="noopener" :download="f.fileNm" class="text-[#2563eb] hover:underline"><i class="far fa-file mr-1"></i>{{ f.fileNm }}</a>
                  <span class="ml-1 text-gray-400">{{ fmtSize(f.fileSize) }}</span>
                </li>
              </ul>
            </div>
            <div v-if="q.scrtYn !== 'Y' && q.answYn === 'Y' && q.answContent" class="mt-3 flex gap-2.5 rounded-lg bg-[#f6f7f9] p-3">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8a8a8a] text-[0.75rem] font-bold text-white">A</div>
              <div class="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-gray-700">{{ q.answContent }}</div>
            </div>
            <div v-else-if="q.answYn !== 'Y'" class="mt-2">
              <span class="rounded bg-[#f6f7f9] px-2 py-[3px] text-[0.76rem] text-[#9ca3af]">답변 대기중</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 작성 / 수정 폼 -->
    <form ref="formEl" class="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-5" @submit.prevent="submit">
      <h3 class="m-0 mb-3 text-[1.05rem] font-bold text-gray-900">{{ editingId ? "Q&A 수정" : "Q&A 쓰기" }}</h3>
      <div v-if="!isLoggedIn && !editingId" class="mb-3 grid gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-[0.78rem] text-gray-500">이름<span class="ml-0.5 text-theme">*</span></span>
          <input v-model="writerNm" type="text" maxlength="20" placeholder="이름 (2~20자)" class="w-full rounded-lg border-[1.5px] border-[#e5e7eb] px-[13px] py-[10px] text-[0.88rem] outline-none focus:border-[#bc8246]" />
        </label>
        <label class="block">
          <span class="mb-1 block text-[0.78rem] text-gray-500">글 비밀번호<span class="ml-0.5 text-theme">*</span> <span class="text-gray-400">(수정·삭제할 때 필요)</span></span>
          <input v-model="writerPwd" type="password" maxlength="20" autocomplete="new-password" placeholder="4~20자" class="w-full rounded-lg border-[1.5px] border-[#e5e7eb] px-[13px] py-[10px] text-[0.88rem] outline-none focus:border-[#bc8246]" />
        </label>
      </div>
      <textarea v-model="content" rows="5" maxlength="4000" placeholder="문의 내용을 입력해 주세요" class="w-full resize-y rounded-lg border-[1.5px] border-[#e5e7eb] px-[13px] py-[10px] text-[0.88rem] outline-none focus:border-[#bc8246]"></textarea>
      <div class="mt-3">
        <attach-uploader v-model="attachChanges" :initial-files="editingFiles" :title="'첨부파일'" :show-grp="false" grp-code="PROD_QNA" :max-count="10" :accept="ATTACH_ACCEPT" />
      </div>
      <div v-if="formError" class="mb-0 mt-3 text-[0.82rem] leading-snug text-red-500">{{ formError }}</div>
      <div class="mt-4 flex justify-center gap-2">
        <button v-if="editingId" type="button" class="rounded-lg border border-[#d1d5db] bg-white px-5 py-3 text-[0.88rem] font-semibold text-gray-700" @click="cancelEdit">취소</button>
        <button type="submit" class="rounded-lg border-0 bg-gray-900 px-6 py-3 text-[0.88rem] font-bold text-white disabled:opacity-60" :disabled="saving">{{ saving ? "저장 중…" : editingId ? "수정 저장" : "Q&A 등록" }}</button>
      </div>
    </form>

    <writer-pwd-modal ref="pwdModal" />
    <media-viewer-modal :open="viewerOpen" :items="viewerItems" :initial-index="viewerIndex" @close="viewerOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import type { PdProdQnaType } from "~/types/pd/pdProdQnaType";
import { pdQnaSvc } from "~/svc/fo/ec/pd/pdQnaSvc";
import { useAuthStore } from "~/store/useAuthStore";
import { isImageExt, isVideoExt } from "~/utils/mapProduct";
import type { SyAttachType } from "~/types/sy/syAttachType";
import AttachUploader from "~/components/ui/AttachUploader.vue";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";
import WriterPwdModal from "~/components/modals/WriterPwdModal.vue";
import MediaViewerModal from "~/components/modals/MediaViewerModal.vue";

// 서버 허용 확장자(FileUploadUtil) 중 이미지·문서·압축·동영상 전부 — 동영상은 파일당 100MB(AttachUploader 기본)
const ATTACH_ACCEPT = ["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip", "mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv", "flv"];

const props = defineProps<{ prodId: string }>();
const emit = defineEmits<{ (e: "count", n: number): void }>();

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isStLoggedIn);
const myMemberId = computed(() => authStore.user?.memberId ?? "");
const { $toast } = useNuxtApp();

// SEO 대상이 아니라 서버 렌더에서는 뺀다 — 브라우저가 ecBeBo 를 직접 호출
const { data, status, refresh } = useAsyncData<PdProdQnaType[]>(`prod-qna-${props.prodId}`, () => pdProductSvc.getQna(props.prodId).catch(() => []), { default: () => [], lazy: true, server: false });
const list = computed(() => data.value ?? []);
// "불러오는 중"은 서버 렌더와 하이드레이션 시점의 상태(idle/pending)가 달라 pending 으로 판단하면 하이드레이션 불일치가 난다 —
// 조회가 끝났는지(success/error)만 기준으로 삼으면 서버·브라우저 첫 렌더가 항상 같다(둘 다 "불러오는 중").
const loaded = computed(() => status.value === "success" || status.value === "error");
watch(list, (l) => emit("count", l.length), { immediate: true });

const ymdDot = (v?: string | null) => (v ? String(v).slice(0, 10).replace(/-/g, ".") : "");
const fmtSize = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
const writerLabel = (q: PdProdQnaType) => q.writerNm || (q.memberId ? q.memberId.slice(0, 1) + "**" : "비회원");
// 회원 글은 본인만, 비회원 글(memberId 없음)은 누구에게나 버튼을 보이고 글 비밀번호로 서버가 판정한다
const canModify = (q: PdProdQnaType) => !q.memberId || (isLoggedIn.value && q.memberId === myMemberId.value);
const mediaOf = (q: PdProdQnaType) => (q.attachFiles ?? []).filter((f) => f.cdnImgUrl && (isImageExt(f.fileExt) || isVideoExt(f.fileExt)));
const otherFilesOf = (q: PdProdQnaType) => (q.attachFiles ?? []).filter((f) => f.cdnImgUrl && !isImageExt(f.fileExt) && !isVideoExt(f.fileExt));

// ── 미디어 뷰어 ──
const viewerOpen = ref(false);
const viewerItems = ref<string[]>([]);
const viewerIndex = ref(0);
function openViewer(files: SyAttachType[], i: number) {
  viewerItems.value = files.map((f) => f.cdnImgUrl ?? "");
  viewerIndex.value = i;
  viewerOpen.value = true;
}

// ── 작성/수정 폼 ──
const formEl = ref<HTMLFormElement | null>(null);
const pwdModal = ref<InstanceType<typeof WriterPwdModal> | null>(null);
const writerNm = ref("");
const writerPwd = ref("");
const content = ref("");
const attachChanges = ref<SyAttachChangeType[]>([]);
const editingId = ref<string | null>(null);
const editingFiles = ref<SyAttachType[]>([]);
const saving = ref(false);
const busyId = ref<string | null>(null);
const formError = ref("");

const errMsg = (e: unknown, fallback: string) => {
  const err = e as { data?: { message?: string }; message?: string };
  return String(err?.data?.message ?? err?.message ?? fallback).split("::")[0] || fallback;
};

function resetForm() {
  writerNm.value = isLoggedIn.value ? "" : writerNm.value; // 이름은 이어서 쓰기 편하게 유지, 비밀번호·내용은 비운다
  writerPwd.value = "";
  content.value = "";
  attachChanges.value = [];
  editingId.value = null;
  editingFiles.value = [];
  formError.value = "";
}
function startEdit(q: PdProdQnaType) {
  editingId.value = q.prodQnaId;
  content.value = q.prodQnaContent ?? "";
  editingFiles.value = q.attachFiles ?? [];
  attachChanges.value = [];
  formError.value = "";
  nextTick(() => formEl.value?.scrollIntoView({ behavior: "smooth", block: "center" }));
}
function cancelEdit() {
  resetForm();
}

async function submit() {
  formError.value = "";
  const text = content.value.trim();
  if (text.length < 2) return void (formError.value = "문의 내용을 2자 이상 입력해 주세요.");
  if (!editingId.value && !isLoggedIn.value) {
    const nm = writerNm.value.trim();
    if (nm.length < 2 || nm.length > 20) return void (formError.value = "이름을 2~20자로 입력해 주세요.");
    if (writerPwd.value.length < 4 || writerPwd.value.length > 20) return void (formError.value = "글 비밀번호를 4~20자로 입력해 주세요.");
  }
  saving.value = true;
  try {
    if (editingId.value) {
      const target = list.value.find((x) => x.prodQnaId === editingId.value);
      let pwd: string | undefined;
      if (target && !target.memberId) {
        const asked = await pwdModal.value?.ask("수정하려면 글 비밀번호를 입력해 주세요.");
        if (asked === null || asked === undefined) return;
        pwd = asked;
      }
      await pdQnaSvc.update(editingId.value, { content: text, writerPwd: pwd, attachFiles: attachChanges.value });
      $toast?.success?.("수정되었습니다.");
    } else {
      await pdQnaSvc.create({ prodId: props.prodId, content: text, writerNm: isLoggedIn.value ? undefined : writerNm.value, writerPwd: isLoggedIn.value ? undefined : writerPwd.value, attachFiles: attachChanges.value });
      $toast?.success?.("Q&A가 등록되었습니다.");
    }
    resetForm();
    await refresh();
  } catch (e) {
    formError.value = errMsg(e, "저장에 실패했습니다.");
  } finally {
    saving.value = false;
  }
}

async function remove(q: PdProdQnaType) {
  const ok = await useConfirm().openConfirm({ title: "삭제 확인", message: "이 Q&A를 삭제할까요?", confirmText: "삭제", cancelText: "취소", variant: "danger" });
  if (!ok) return;
  let pwd: string | undefined;
  if (!q.memberId) {
    const asked = await pwdModal.value?.ask("삭제하려면 글 비밀번호를 입력해 주세요.");
    if (asked === null || asked === undefined) return;
    pwd = asked;
  }
  busyId.value = q.prodQnaId;
  try {
    await pdQnaSvc.remove(q.prodQnaId, pwd);
    $toast?.success?.("삭제되었습니다.");
    if (editingId.value === q.prodQnaId) resetForm();
    await refresh();
  } catch (e) {
    $toast?.error?.(errMsg(e, "삭제에 실패했습니다."));
  } finally {
    busyId.value = null;
  }
}
</script>
