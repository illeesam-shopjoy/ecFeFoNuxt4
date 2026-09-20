<template>
  <!-- 2026-09-20(요청사항: "문의내용에 html editor") — ecFeBo BaseHtmlEditor 대응. TipTap(ProseMirror) 기반 WYSIWYG.
       [디자인 | HTML | 미리보기] 전환 + 툴바(제목/굵게/기울임/취소선/구분선/인용/목록/링크/이미지) + 비우기. v-model 은 HTML 문자열. -->
  <div class="html-editor" :class="{ 'is-invalid': invalid }">
    <div class="flex items-center gap-1.5 mb-1.5">
      <button v-for="m in MODES" :key="m.key" type="button" class="he-tab" :class="{ 'he-tab--on': mode === m.key }" @click="setMode(m.key)">{{ m.label }}</button>
      <button type="button" class="he-tab ml-auto he-tab--danger" @click="clearAll">비우기</button>
    </div>

    <div class="he-box">
      <!-- 툴바 (디자인 모드에서만) -->
      <div v-if="mode === 'design'" class="he-toolbar" role="toolbar" aria-label="서식">
        <button type="button" title="제목" :class="{ on: editor?.isActive('heading', { level: 3 }) }" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"><i class="fas fa-heading"></i></button>
        <button type="button" title="굵게" :class="{ on: editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()"><i class="fas fa-bold"></i></button>
        <button type="button" title="기울임" :class="{ on: editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()"><i class="fas fa-italic"></i></button>
        <button type="button" title="취소선" :class="{ on: editor?.isActive('strike') }" @click="editor?.chain().focus().toggleStrike().run()"><i class="fas fa-strikethrough"></i></button>
        <span class="sep"></span>
        <button type="button" title="구분선" @click="editor?.chain().focus().setHorizontalRule().run()"><i class="fas fa-minus"></i></button>
        <button type="button" title="인용" :class="{ on: editor?.isActive('blockquote') }" @click="editor?.chain().focus().toggleBlockquote().run()"><i class="fas fa-quote-right"></i></button>
        <span class="sep"></span>
        <button type="button" title="글머리 기호" :class="{ on: editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()"><i class="fas fa-list-ul"></i></button>
        <button type="button" title="번호 목록" :class="{ on: editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()"><i class="fas fa-list-ol"></i></button>
        <span class="sep"></span>
        <button type="button" title="링크" :class="{ on: editor?.isActive('link') }" @click="setLink"><i class="fas fa-link"></i></button>
        <button type="button" title="이미지 삽입" :disabled="imgUploading" @click="imgInput?.click()"><i :class="imgUploading ? 'fas fa-spinner fa-spin' : 'fas fa-image'"></i></button>
        <input ref="imgInput" type="file" accept="image/*" class="hidden" @change="onPickImage" />
      </div>

      <!-- 디자인 -->
      <editor-content v-show="mode === 'design'" :editor="editor ?? undefined" class="he-content" :style="{ minHeight: height }" />
      <!-- HTML -->
      <textarea v-if="mode === 'html'" v-model="htmlText" class="he-html" :style="{ minHeight: height }" spellcheck="false" @input="onHtmlInput"></textarea>
      <!-- 미리보기 -->
      <div v-if="mode === 'preview'" class="he-content he-preview" :style="{ minHeight: height }" v-html="previewHtml || '<p style=&quot;color:#9ca3af&quot;>내용이 없습니다.</p>'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";

const props = withDefaults(defineProps<{ modelValue: string; height?: string; placeholder?: string; invalid?: boolean; uploadCode?: string }>(), {
  height: "220px",
  placeholder: "내용을 입력하세요",
  invalid: false,
  uploadCode: "CONTACT_CONTENT_IMG",
});
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();

type Mode = "design" | "html" | "preview";
const MODES: { key: Mode; label: string }[] = [
  { key: "design", label: "디자인" },
  { key: "html", label: "</> HTML" },
  { key: "preview", label: "👁 미리보기" },
];
const mode = ref<Mode>("design");
const htmlText = ref(props.modelValue);
const imgInput = ref<HTMLInputElement | null>(null);
const imgUploading = ref(false);
const cdnBase = useRuntimeConfig().public.prodCdnBase as string; // 비동기 구간 전(setup)에 캡처

// TipTap 은 빈 문서를 "<p></p>" 로 낸다 — 외부로는 빈 문자열로 통일
const normalize = (html: string) => (html === "<p></p>" ? "" : html);

// TipTap 인스턴스는 반응형 프록시로 감싸면 안 된다(shallowRef) — 브라우저에서만 마운트 시 생성
const editor = shallowRef<Editor | null>(null);
onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }), Image.configure({ inline: false }), Placeholder.configure({ placeholder: props.placeholder })],
    onUpdate: ({ editor: e }) => {
      const html = normalize(e.getHTML());
      htmlText.value = html;
      if (html !== props.modelValue) emit("update:modelValue", html);
    },
  });
});

// 부모가 값을 바꾼 경우(폼 초기화 등) 에디터에 반영
watch(
  () => props.modelValue,
  (v) => {
    htmlText.value = v;
    const ed = editor.value;
    if (ed && normalize(ed.getHTML()) !== v) ed.commands.setContent(v || "", { emitUpdate: false });
  }
);

function setMode(m: Mode) {
  if (m === "design" && mode.value === "html") editor.value?.commands.setContent(htmlText.value || "", { emitUpdate: false });
  mode.value = m;
}
function onHtmlInput() {
  emit("update:modelValue", htmlText.value);
}
function clearAll() {
  htmlText.value = "";
  editor.value?.commands.clearContent(false);
  emit("update:modelValue", "");
}

function setLink() {
  const ed = editor.value;
  if (!ed) return;
  const prev = ed.getAttributes("link").href as string | undefined;
  const url = window.prompt("링크 주소(https://...)", prev || "https://");
  if (url === null) return;
  if (url === "") return void ed.chain().focus().extendMarkRange("link").unsetLink().run();
  if (!/^https?:\/\//i.test(url)) return void window.alert("http:// 또는 https:// 로 시작하는 주소만 사용할 수 있습니다.");
  ed.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

async function onPickImage(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) return void window.alert("이미지는 10MB 이하만 올릴 수 있습니다.");
  imgUploading.value = true;
  try {
    const res = await coUploadSvc.uploadMulti([file], props.uploadCode);
    const f = res.files?.[0];
    const src = fixInternalCdnUrl(resolveCdnUrl(f?.cdnImgUrl || f?.filePath, cdnBase), cdnBase);
    if (!src) throw new Error("업로드 응답에 이미지 주소가 없습니다.");
    editor.value?.chain().focus().setImage({ src, alt: file.name }).run();
  } catch {
    window.alert("이미지 업로드에 실패했습니다.");
  } finally {
    imgUploading.value = false;
  }
}

// 미리보기 — 사용자가 HTML 탭에 직접 넣을 수 있으므로 스크립트/이벤트 속성/javascript: 를 제거해서 그린다
const previewHtml = computed(() => (mode.value === "preview" ? sanitize(props.modelValue) : ""));
function sanitize(html: string): string {
  if (!import.meta.client || !html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,iframe,object,embed,style,link,meta,form").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name) || (/^(href|src|xlink:href)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) el.removeAttribute(a.name);
    }
  });
  return doc.body.innerHTML;
}

onBeforeUnmount(() => editor.value?.destroy());
</script>

<style scoped>
.he-tab { padding: 3px 10px; font-size: 0.75rem; font-weight: 600; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; color: #374151; cursor: pointer; }
.he-tab--on { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
.he-tab--danger { border-color: #fca5a5; color: #dc2626; }
.he-box { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; }
.is-invalid .he-box { border-color: #ef4444; }
.he-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; padding: 6px 8px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.he-toolbar button { width: 32px; height: 30px; border: 0; border-radius: 6px; background: transparent; color: #4b5563; cursor: pointer; font-size: 0.85rem; }
.he-toolbar button:hover { background: #e5e7eb; }
.he-toolbar button.on { background: #dbeafe; color: #1d4ed8; }
.he-toolbar button:disabled { opacity: 0.5; cursor: default; }
.he-toolbar .sep { width: 1px; height: 18px; background: #d1d5db; margin: 0 6px; }
.he-content { padding: 12px 14px; font-size: 0.9rem; line-height: 1.7; color: #1f2937; }
.he-html { display: block; width: 100%; padding: 12px 14px; border: 0; outline: 0; resize: vertical; font-family: ui-monospace, Consolas, monospace; font-size: 0.8rem; line-height: 1.6; color: #1f2937; }
:deep(.tiptap) { outline: none; min-height: inherit; }
:deep(.tiptap p), :deep(.he-preview p) { color: #1f2937; margin: 0 0 0.5em; }
:deep(.tiptap p.is-editor-empty:first-child::before) { content: attr(data-placeholder); color: #9ca3af; float: left; height: 0; pointer-events: none; }
:deep(.tiptap h2), :deep(.tiptap h3), :deep(.tiptap h4), :deep(.he-preview h2), :deep(.he-preview h3) { font-weight: 800; margin: 0.6em 0 0.3em; }
:deep(.tiptap ul), :deep(.he-preview ul) { list-style: disc; padding-left: 1.4em; }
:deep(.tiptap ol), :deep(.he-preview ol) { list-style: decimal; padding-left: 1.4em; }
:deep(.tiptap blockquote), :deep(.he-preview blockquote) { border-left: 3px solid #d1d5db; padding-left: 12px; color: #6b7280; margin: 0.5em 0; }
:deep(.tiptap hr), :deep(.he-preview hr) { border: 0; border-top: 1px solid #e5e7eb; margin: 0.8em 0; }
:deep(.tiptap a), :deep(.he-preview a) { color: #2563eb; text-decoration: underline; }
:deep(.tiptap img), :deep(.he-preview img) { max-width: 100%; height: auto; border-radius: 6px; }
</style>
