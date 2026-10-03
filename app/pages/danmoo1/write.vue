<template>
  <!-- 글쓰기/수정 — 동네생활 글(블로그 등록·수정) / 내 물건 팔기(상품 등록·수정: 사진 1장·카테고리·가격/나눔·거래 방법·설명). ?edit=<id> 면 수정. 로그인 필요.
       2026-10-03: danmoo1 은 개인간 거래 사이트 — 로그인한 회원 누구나 바로 올린다(처음 올릴 때 서버가 개인 판매자를 만든다), 창고 없음,
       거래 방법은 직거래·문고리거래·택배거래 중 하나 이상(사용자 "사람간 직거래, 문고리거래, 택배거래가 주야"). -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar :title="titleText" :back="false" close fallback="/">
        <template #right><button type="button" class="text-[15px] font-bold px-3" :class="canSubmit ? 'primary' : 'muted'" :disabled="!canSubmit || saving" @click="handleBtnAction('write-submit')">{{ saving ? "저장 중…" : "완료" }}</button></template>
      </dm-title-bar>
      <div v-if="!editId" class="dm-segs">
        <button v-for="t in TYPES" :key="t.key" type="button" class="dm-seg" :class="{ on: type === t.key }" @click="type = t.key">{{ t.label }}</button>
      </div>
    </template>

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-edit" title="로그인하면 글을 쓸 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: route.fullPath } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready || loadingEdit" class="p-8 text-center muted">{{ loadingEdit ? "불러오는 중…" : "확인 중…" }}</div>

    <!-- 동네생활 -->
    <form v-else-if="type === 'community'" class="px-4 py-4 space-y-3" @submit.prevent="handleBtnAction('write-submit')">
      <p class="text-[13px] muted">{{ town }} 이웃에게 공개되는 글이에요. 작성자: <b class="text-[var(--dm-text)]">{{ authStore.user?.userNm }}</b></p>
      <div class="flex gap-2 overflow-x-auto no-scrollbar">
        <button v-for="tp in TOPICS" :key="tp" type="button" class="h-9 px-3.5 rounded-full text-[14px] font-semibold flex-none" :class="topic === tp ? 'bg-[var(--dm-text)] text-[var(--dm-bg)]' : 'bg-[var(--dm-chip)]'" @click="topic = topic === tp ? '' : tp">{{ tp }}</button>
      </div>
      <input v-model="post.title" class="input" placeholder="제목" maxlength="200" />
      <textarea v-model="post.content" class="input !h-56 py-3 resize-none" :placeholder="`${town} 이웃과 이야기를 나눠보세요. (5자 이상)`" maxlength="4000"></textarea>
      <p class="text-[12px] muted text-right">{{ post.content.length }} / 4000</p>
    </form>

    <!-- 내 물건 팔기 -->
    <template v-else>
      <form class="px-4 py-4 space-y-4" @submit.prevent="handleBtnAction('write-submit')">
        <attach-uploader v-model="imgChanges" :title="editId ? '사진 (새로 올리면 교체)' : '사진 (대표 1장)'" :show-grp="false" grp-code="PROD_IMG" :max-count="1" :accept="['jpg', 'jpeg', 'png', 'gif', 'webp']" />
        <img v-if="editId && item.thumbnailUrl && !imgChanges.length" :src="item.thumbnailUrl" alt="현재 사진" class="w-24 h-24 rounded-lg object-cover" />
        <input v-model="item.prodNm" class="input" placeholder="제목(상품명)" maxlength="200" />
        <select v-model="item.categoryId" class="input">
          <option value="">카테고리 선택</option>
          <option v-for="c in cates" :key="c.categoryId" :value="c.categoryId">{{ c.categoryNm }}</option>
        </select>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="h-11 rounded-lg text-[15px] font-semibold" :class="!item.free ? 'bg-[var(--dm-text)] text-[var(--dm-bg)]' : 'bg-[var(--dm-chip)]'" @click="item.free = false">판매하기</button>
          <button type="button" class="h-11 rounded-lg text-[15px] font-semibold" :class="item.free ? 'bg-[var(--dm-text)] text-[var(--dm-bg)]' : 'bg-[var(--dm-chip)]'" @click="item.free = true; item.salePrice = 0">나눔하기</button>
        </div>
        <div v-if="!item.free" class="relative"><input v-model.number="item.salePrice" type="number" min="0" step="100" class="input !pl-7" placeholder="가격" /><span class="absolute left-3 top-1/2 -translate-y-1/2 muted">₩</span></div>
        <label v-if="!item.free" class="flex items-center gap-2 text-[14px]"><input v-model="item.offerOk" type="checkbox" class="w-4 h-4 accent-[var(--dm-primary)]" />가격 제안 받기</label>
        <div>
          <p class="text-[15px] font-bold mb-2">거래 방법 <span class="text-[12.5px] muted font-normal">여러 개 고를 수 있어요</span></p>
          <div class="grid grid-cols-3 gap-2" role="group" aria-label="거래 방법">
            <button
              v-for="m in DM_TRADE_METHODS"
              :key="m.code"
              type="button"
              class="h-[68px] rounded-lg flex flex-col items-center justify-center gap-1 text-[14px] font-semibold border"
              :class="item.tradeMethods.includes(m.code) ? 'border-[var(--dm-primary)] text-[var(--dm-primary)] bg-[var(--dm-primary-soft)]' : 'border-[var(--dm-line)] bg-[var(--dm-bg)]'"
              :aria-pressed="item.tradeMethods.includes(m.code)"
              @click="handleSelectAction('trade-toggle', m.code)"
            >
              <i :class="m.icon" class="text-[18px]"></i>{{ m.label }}
            </button>
          </div>
          <ul class="mt-2 space-y-1 text-[12.5px] muted">
            <li v-for="m in pickedMethods" :key="m.code"><b class="text-[var(--dm-text)]">{{ m.label }}</b> — {{ m.desc }}{{ TRADE_TIP[m.code] }}</li>
            <li v-if="!pickedMethods.length" class="text-danger">거래 방법을 하나 이상 골라 주세요.</li>
          </ul>
        </div>
        <textarea v-model="item.content" class="input !h-40 py-3 resize-none" placeholder="물건 상태, 구매 시기, 택배비 등을 적어 주세요." maxlength="4000"></textarea>
        <p v-if="placeLine" class="text-[13px] muted"><i class="fas fa-map-marker-alt primary mr-1"></i>{{ placeLine }} (내 동네 설정에서 바꿀 수 있어요)</p>
      </form>
    </template>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import AttachUploader from "~/components/danmoo1/ui/AttachUploader.vue";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_BLOG_CATE_ID, DM_COMMUNITY_CHIPS, DM_TRADE_METHODS, dmTradeMethods, type DmTradeMethodCd } from "~/conts/tenant/danmoo1";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import type { PdCategoryType } from "~/types/pd/pdCategoryType";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";
import type { CmBlogType } from "~/types/cm/cmBlogType";

/* ##### [01] 초기 변수 정의 ################################################## */

const route = useRoute();
const authStore = useAuthStore();
const { town } = useDmTown();
const { openAlert } = useAlert();

const TYPES = [{ key: "community", label: "동네생활" }, { key: "prod", label: "중고거래" }] as const;
const TOPICS = DM_COMMUNITY_CHIPS.filter((c) => c !== "추천" && c !== "인기");
const type = ref<(typeof TYPES)[number]["key"]>(route.query.type === "prod" ? "prod" : "community");
const editId = computed(() => String(route.query.edit ?? "").trim());
const topic = ref("");
const saving = ref(false);
const ready = ref(false);
const loadingEdit = ref(false);
const titleText = computed(() => (type.value === "prod" ? (editId.value ? "물건 수정" : "내 물건 팔기") : editId.value ? "글 수정" : "동네생활 글쓰기"));
useHead({ title: () => titleText.value });

const post = reactive({ title: "", content: "" });
let editingPost: CmBlogType | null = null; // 수정 중인 글(카테고리·구분·조회수를 그대로 돌려보내기 위해)
const item = reactive({ prodNm: "", categoryId: "", salePrice: null as number | null, free: false, offerOk: true, tradeMethods: ["DIRECT"] as DmTradeMethodCd[], content: "", stockQty: 1, stdPrice: undefined as number | undefined, thumbnailUrl: "" });
const imgChanges = ref<SyAttachChangeType[]>([]);
const cates = ref<PdCategoryType[]>([]);
const catesLoaded = ref(false);
/** 거래 방법별 덧붙임 안내 */
const TRADE_TIP: Record<string, string> = { DIRECT: "", DOOR: " · 주소는 채팅으로만 알려 주세요", PARCEL: " · 택배비는 설명에 적어 주세요" };
const pickedMethods = computed(() => dmTradeMethods(item.tradeMethods.join(",")));
/** 직거래·문고리는 동네에서 주고받으니 거래 희망 장소를 붙인다(택배만이면 없음) */
const placeLine = computed(() => (item.tradeMethods.includes("DIRECT") || item.tradeMethods.includes("DOOR") ? `거래 희망 장소: ${town.value} 근처` : ""));

const canSubmit = computed(() =>
  authStore.isStLoggedIn && (type.value === "community"
    ? post.title.trim().length > 0 && post.content.trim().length >= 5
    : item.prodNm.trim().length > 0 && !!item.categoryId && item.tradeMethods.length > 0 && (item.free || (item.salePrice ?? -1) >= 0)),
);

// 입력 텍스트 ↔ 안전한 HTML(태그 이스케이프, 줄마다 <p>)
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const toHtml = (s: string) => s.trim().split(/\n{2,}/).map((para) => `<p>${esc(para).replace(/\n/g, "<br>")}</p>`).join("");
const fromHtml = (h: string) => {
  const el = document.createElement("div");
  el.innerHTML = h.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n\n");
  return (el.textContent ?? "").trim();
};

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "write-submit") {
    if (!canSubmit.value || saving.value) return;
    saving.value = true;
    try {
      if (type.value === "community") {
        const title = (topic.value ? `[${topic.value}] ` : "") + post.title.trim();
        const body = { blogTitle: title, blogContent: toHtml(post.content), blogSummary: post.content.trim().replace(/\s+/g, " ").slice(0, 120), blogAuthor: authStore.user?.userNm, blogCateId: DM_BLOG_CATE_ID };
        if (editId.value) {
          await coBlogSvc.update(editId.value, { ...body, blogCateId: editingPost?.blogCateId ?? DM_BLOG_CATE_ID, blogTypeCd: editingPost?.blogTypeCd ?? "BLOG", useYn: editingPost?.useYn ?? "Y", isNotice: editingPost?.isNotice ?? "N", viewCount: editingPost?.viewCount ?? 0, blogAuthor: editingPost?.blogAuthor || body.blogAuthor });
          return navigateTo(`/community/${editId.value}`, { replace: true });
        }
        const saved = await coBlogSvc.create(body);
        return navigateTo(`/community/${saved.blogId}`, { replace: true });
      }
      const extra = [item.offerOk && !item.free ? "가격 제안 환영해요." : "", placeLine.value].filter(Boolean).join("\n");
      const content = item.content.trim();
      const body = {
        prodNm: item.prodNm.trim(),
        categoryId: item.categoryId,
        salePrice: item.free ? 0 : Number(item.salePrice ?? 0),
        stdPrice: item.stdPrice,
        stockQty: item.stockQty || 1,
        tradeMethodCds: dmTradeMethods(item.tradeMethods.join(",")).map((m) => m.code).join(","),
        contentHtml: toHtml(editId.value && !content ? extra : [content, extra].filter(Boolean).join("\n\n")),
        prodStatusCd: "ACTIVE" as const,
        attachId: imgChanges.value.find((f) => f.rowStatus === "I")?.attachId,
      };
      const saved = editId.value ? await pdMyProdSvc.updateProd(editId.value, body) : await pdMyProdSvc.createProd(body);
      return navigateTo(`/prod/${saved.prodId}`, { replace: true });
    } catch (e) {
      console.error("[danmoo1/write] 저장 실패", e);
      const msg = String((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "").split("::")[0];
      await openAlert(msg || "저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      saving.value = false;
    }
    return;
  }
  console.warn("[handleBtnAction] 알 수 없는 명령:", cmd);
};

/* handleSelectAction — 선택 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = (cmd: string, code: DmTradeMethodCd) => {
  if (cmd === "trade-toggle") {
    item.tradeMethods = item.tradeMethods.includes(code) ? item.tradeMethods.filter((c) => c !== code) : [...item.tradeMethods, code];
    return;
  }
  console.warn("[handleSelectAction] 알 수 없는 명령:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadProdForm — 물건 등록 폼: 카테고리(1단계). 창고는 쓰지 않는다(개인간 거래) */
const fnLoadProdForm = async () => {
  if (!authStore.isStLoggedIn || catesLoaded.value) return;
  try {
    const c = await pdMyProdSvc.getCategories();
    cates.value = c.filter((x) => x.categoryDepth === 1).sort((a, b) => (a.sortOrd ?? 0) - (b.sortOrd ?? 0));
  } catch (e) {
    console.error("[danmoo1/write] 카테고리 조회 실패", e);
  } finally {
    catesLoaded.value = true;
  }
};

/* fnLoadEdit — 수정 대상 불러와 폼에 채우기 */
const fnLoadEdit = async () => {
  if (!editId.value || !authStore.isStLoggedIn) return;
  loadingEdit.value = true;
  try {
    if (type.value === "community") {
      const p = await coBlogSvc.getById(editId.value);
      if (p.regBy && p.regBy !== authStore.user?.memberId) {
        await openAlert("내가 쓴 글만 수정할 수 있어요.");
        return navigateTo(`/community/${editId.value}`, { replace: true });
      }
      editingPost = p;
      const m = /^\[([^\]]+)\]\s*/.exec(p.blogTitle);
      if (m && TOPICS.includes(m[1]!)) { topic.value = m[1]!; post.title = p.blogTitle.slice(m[0].length); } else post.title = p.blogTitle;
      post.content = fromHtml(p.blogContent ?? "");
    } else {
      const d = await pdMyProdSvc.getMyProd(editId.value);
      item.prodNm = d.prodNm;
      item.categoryId = d.categoryId ?? "";
      item.salePrice = Number(d.salePrice ?? 0);
      item.free = !Number(d.salePrice ?? 0);
      const methods = dmTradeMethods(d.tradeMethodCds).map((m) => m.code);
      item.tradeMethods = methods.length ? methods : ["DIRECT"]; // 이 기능 전에 올린 물건은 직거래로 시작
      item.stockQty = Number(d.stockQty ?? 1) || 1;
      item.stdPrice = d.stdPrice ?? undefined;
      item.thumbnailUrl = d.thumbnailUrl ?? "";
      // 저장할 때 붙이는 안내 줄(가격 제안·거래 장소)은 빼고 본문만 되살린다
      item.content = fromHtml(d.contentHtml ?? "").split("\n").filter((l) => !/^가격 제안 환영해요\.$/.test(l.trim()) && !/^거래 희망 장소:/.test(l.trim())).join("\n").trim();
      item.offerOk = /가격 제안 환영/.test(d.contentHtml ?? "");
    }
  } catch (e) {
    console.error("[danmoo1/write] 수정 대상 조회 실패", e);
    await openAlert("수정할 글을 불러오지 못했어요.");
    return navigateTo("/", { replace: true });
  } finally {
    loadingEdit.value = false;
  }
};

watch(type, (t) => { if (t === "prod" && ready.value) fnLoadProdForm(); });

/* initPage — 로그인 복원을 기다린 뒤 폼 준비(수정이면 대상 불러오기) */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (type.value === "prod") await fnLoadProdForm();
  await fnLoadEdit();
};
onMounted(initPage);
</script>
