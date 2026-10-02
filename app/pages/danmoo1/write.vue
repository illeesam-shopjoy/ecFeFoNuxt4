<template>
  <!-- 글쓰기 — 동네생활 글(블로그 등록) / 내 물건 팔기(판매자 상품 등록: 사진 1장·카테고리·가격/나눔·설명·창고). 로그인 필요 -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar :title="type === 'prod' ? '내 물건 팔기' : '동네생활 글쓰기'" :back="false" close fallback="/">
        <template #right><button type="button" class="text-[15px] font-bold px-3" :class="canSubmit ? 'primary' : 'muted'" :disabled="!canSubmit || saving" @click="handleBtnAction('write-submit')">{{ saving ? "저장 중…" : "완료" }}</button></template>
      </dm-title-bar>
      <div class="dm-segs">
        <button v-for="t in TYPES" :key="t.key" type="button" class="dm-seg" :class="{ on: type === t.key }" @click="type = t.key">{{ t.label }}</button>
      </div>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-edit" title="로그인하면 글을 쓸 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: route.fullPath } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready" class="p-8 text-center muted">확인 중…</div>

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
      <dm-empty v-if="!isSeller" icon="far fa-store" title="판매자만 물건을 올릴 수 있어요" desc="판매자 신청·승인은 ShopJoy 마이페이지(판매자 신청)에서 할 수 있어요. 승인된 계정으로 로그인하면 여기서 바로 올릴 수 있어요" />
      <form v-else class="px-4 py-4 space-y-4" @submit.prevent="handleBtnAction('write-submit')">
        <attach-uploader v-model="imgChanges" title="사진 (대표 1장)" :show-grp="false" grp-code="PROD_IMG" :max-count="1" :accept="['jpg', 'jpeg', 'png', 'gif', 'webp']" />
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
        <select v-model="item.warehouseId" class="input">
          <option value="">출고 창고 선택</option>
          <option v-for="w in warehouses" :key="w.warehouseId" :value="w.warehouseId">{{ w.warehouseNm }}</option>
        </select>
        <p v-if="!warehouses.length && warehousesLoaded" class="text-[12.5px] text-danger">등록된 창고가 없어요. ShopJoy 마이페이지 &gt; 판매자 창고에서 창고를 먼저 만들어 주세요.</p>
        <textarea v-model="item.content" class="input !h-40 py-3 resize-none" placeholder="물건 상태, 구매 시기, 거래 방법 등을 적어 주세요." maxlength="4000"></textarea>
        <p class="text-[13px] muted"><i class="fas fa-map-marker-alt primary mr-1"></i>거래 희망 장소: {{ town }} 근처 (내 동네 설정에서 바꿀 수 있어요)</p>
      </form>
    </template>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import AttachUploader from "~/components/danmoo1/ui/AttachUploader.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_BLOG_CATE_ID, DM_COMMUNITY_CHIPS } from "~/conts/tenant/danmoo1";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import { slSellerWarehouseSvc } from "~/svc/fo/ec/sl/slSellerWarehouseSvc";
import type { PdCategoryType } from "~/types/pd/pdCategoryType";
import type { SlSellerWarehouseType } from "~/types/sl/slSellerWarehouseType";
import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
useHead({ title: "글쓰기" });
const route = useRoute();
const authStore = useAuthStore();
const { town } = useDmTown();
const { openAlert } = useAlert();

const TYPES = [{ key: "community", label: "동네생활" }, { key: "prod", label: "중고거래" }] as const;
const TOPICS = DM_COMMUNITY_CHIPS.filter((c) => c !== "추천" && c !== "인기");
const type = ref<(typeof TYPES)[number]["key"]>(route.query.type === "prod" ? "prod" : "community");
const topic = ref("");
const isSeller = computed(() => (authStore.user?.sellerIds?.length ?? 0) > 0);
const saving = ref(false);
const ready = ref(false);

const post = reactive({ title: "", content: "" });
const item = reactive({ prodNm: "", categoryId: "", salePrice: null as number | null, free: false, offerOk: true, warehouseId: "", content: "" });
const imgChanges = ref<SyAttachChangeType[]>([]);
const cates = ref<PdCategoryType[]>([]);
const warehouses = ref<SlSellerWarehouseType[]>([]);
const warehousesLoaded = ref(false);

const canSubmit = computed(() =>
  authStore.isStLoggedIn && (type.value === "community"
    ? post.title.trim().length > 0 && post.content.trim().length >= 5
    : isSeller.value && item.prodNm.trim().length > 0 && !!item.categoryId && !!item.warehouseId && (item.free || (item.salePrice ?? -1) >= 0)),
);

// 입력 텍스트 → 안전한 HTML(태그 이스케이프, 줄마다 <p>)
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const toHtml = (s: string) => s.trim().split(/\n{2,}/).map((para) => `<p>${esc(para).replace(/\n/g, "<br>")}</p>`).join("");

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "write-submit") {
    if (!canSubmit.value || saving.value) return;
    saving.value = true;
    try {
      if (type.value === "community") {
        const title = (topic.value ? `[${topic.value}] ` : "") + post.title.trim();
        const saved = await coBlogSvc.create({
          blogTitle: title,
          blogContent: toHtml(post.content),
          blogSummary: post.content.trim().replace(/\s+/g, " ").slice(0, 120),
          blogAuthor: authStore.user?.userNm,
          blogCateId: DM_BLOG_CATE_ID,
        });
        return navigateTo(`/community/${saved.blogId}`, { replace: true });
      }
      const extra = [item.offerOk && !item.free ? "가격 제안 환영해요." : "", `거래 희망 장소: ${town.value} 근처`].filter(Boolean).join("\n");
      const saved = await pdMyProdSvc.createProd({
        prodNm: item.prodNm.trim(),
        categoryId: item.categoryId,
        salePrice: item.free ? 0 : Number(item.salePrice ?? 0),
        stockQty: 1,
        warehouseId: item.warehouseId,
        contentHtml: toHtml([item.content.trim(), extra].filter(Boolean).join("\n\n")),
        prodStatusCd: "ACTIVE",
        attachId: imgChanges.value.find((f) => f.rowStatus === "I")?.attachId,
      });
      return navigateTo(`/prod/${saved.prodId}`, { replace: true });
    } catch (e) {
      console.error("[danmoo1/write] 등록 실패", e);
      const msg = String((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "").split("::")[0];
      await openAlert(msg || "등록에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      saving.value = false;
    }
    return;
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadProdForm — 판매자용: 카테고리(1단계) + 내 창고(1개면 자동 선택) */
const fnLoadProdForm = async () => {
  if (!authStore.isStLoggedIn || !isSeller.value || warehousesLoaded.value) return;
  try {
    const [c, w] = await Promise.all([pdMyProdSvc.getCategories(), slSellerWarehouseSvc.getMyWarehouses()]);
    cates.value = c.filter((x) => x.categoryDepth === 1).sort((a, b) => (a.sortOrd ?? 0) - (b.sortOrd ?? 0));
    warehouses.value = w;
    if (w.length === 1) item.warehouseId = w[0]!.warehouseId;
  } catch (e) {
    console.error("[danmoo1/write] 카테고리/창고 조회 실패", e);
  } finally {
    warehousesLoaded.value = true;
  }
};
watch(type, (t) => { if (t === "prod" && ready.value) fnLoadProdForm(); });

/* initPage — 로그인 복원을 기다린 뒤 폼 준비 */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (type.value === "prod") await fnLoadProdForm();
};
onMounted(initPage);
</script>
