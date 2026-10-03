<template>
  <!-- 물건 상세 — 사진(가로 스와이프) · 판매자 · 상태/제목/카테고리/시간 · 설명 · 거래 방법(직거래/문고리/택배) · 거래 희망 장소 · 판매자의 다른 물건 · 비슷한 물건, 하단 고정바(관심 ♥ · 가격/가격 제안 · 채팅하기) -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="" fallback="/">
        <template #right>
          <button type="button" class="icon-btn" aria-label="공유" @click="handleBtnAction('prod-share')"><i class="far fa-share-square"></i></button>
          <button type="button" class="icon-btn" aria-label="더보기" @click="moreOpen = true"><i class="fas fa-ellipsis-v"></i></button>
        </template>
      </dm-title-bar>
    </template>

    <div v-if="pending" class="space-y-3"><div class="skeleton aspect-square"></div><div class="p-4 space-y-2"><div class="skeleton h-6 w-3/4 rounded"></div><div class="skeleton h-4 w-1/3 rounded"></div><div class="skeleton h-24 rounded"></div></div></div>

    <template v-else-if="prod">
      <!-- 사진 -->
      <div class="relative bg-[var(--dm-chip)]">
        <div ref="galleryRef" class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-square" @scroll.passive="onGalleryScroll">
          <img v-for="(src, i) in images" :key="i" :src="src" :alt="prod.prodNm" class="w-full h-full object-cover flex-none snap-center" :loading="i ? 'lazy' : 'eager'" />
          <div v-if="!images.length" class="w-full h-full flex items-center justify-center text-[var(--dm-text-3)] text-5xl"><i class="far fa-image"></i></div>
        </div>
        <div v-if="images.length > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          <span v-for="(_, i) in images" :key="i" class="w-1.5 h-1.5 rounded-full" :class="i === slide ? 'bg-white' : 'bg-white/50'"></span>
        </div>
        <span v-if="images.length > 1" class="absolute bottom-3 right-3 text-[11px] px-2 py-0.5 rounded-full bg-black/50 text-white">{{ slide + 1 }} / {{ images.length }}</span>
      </div>

      <!-- 판매자 -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-[var(--dm-line)]">
        <span class="w-11 h-11 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] inline-flex items-center justify-center font-extrabold">{{ sellerNm.slice(0, 1) }}</span>
        <div class="flex-1 min-w-0"><b class="text-[15px]">{{ sellerNm }}</b><p class="text-[13px] muted">{{ prodTown }}</p></div>
        <div class="text-right"><b class="primary text-[15px]">36.5°C</b><p class="text-[11px] muted">매너온도</p></div>
      </div>

      <!-- 본문 -->
      <section class="px-4 py-5">
        <div v-if="status" class="mb-2"><span class="text-[12px] font-bold px-2 py-0.5 rounded text-white" :class="status.cls === 'sold' ? 'bg-[var(--dm-text-2)]' : 'bg-[#2f9e44]'">{{ status.label }}</span></div>
        <h1 class="text-[20px] font-extrabold leading-snug">{{ prod.prodNm }}</h1>
        <p class="text-[13px] muted mt-1.5">{{ prod.cateNm || prod.category?.categoryNm || "기타" }} · {{ timeAgo(prod.regDate) || "최근" }}</p>
        <div class="dm-content text-[15.5px] leading-[1.7] mt-4 break-words" v-html="contentHtml"></div>
        <p class="text-[13px] muted mt-5">조회 {{ prod.viewCount ?? 0 }}<template v-if="liked"> · 관심 1</template><template v-if="prod.prodStock > 0"> · 수량 {{ prod.prodStock }}</template></p>
        <button type="button" class="text-[13px] muted underline mt-3" @click="handleBtnAction('prod-report')">이 게시글 신고하기</button>
      </section>

      <!-- 거래 방법 (2026-10-03, 판매자가 고른 것 — 이 기능 전에 올린 물건은 없을 수 있다) -->
      <section v-if="tradeMethods.length" class="px-4 pt-5 pb-5 border-t border-[var(--dm-line)]">
        <h2 class="text-[17px] font-extrabold mb-3">거래 방법</h2>
        <ul class="space-y-2.5">
          <li v-for="m in tradeMethods" :key="m.code" class="flex items-center gap-3">
            <span class="w-9 h-9 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] inline-flex items-center justify-center flex-none"><i :class="m.icon"></i></span>
            <div><b class="text-[15px]">{{ m.label }}</b><p class="text-[13px] muted">{{ m.desc }}</p></div>
          </li>
        </ul>
      </section>

      <!-- 거래 희망 장소 — 직거래·문고리거래(동네에서 주고받기)일 때. 택배만이면 숨긴다 -->
      <section v-if="meetsInTown" class="px-4 pt-5 pb-6 border-t border-[var(--dm-line)]">
        <h2 class="text-[17px] font-extrabold">거래 희망 장소</h2>
        <p class="text-[13.5px] muted mt-1 mb-3"><i class="fas fa-map-marker-alt primary mr-1"></i>성남시 {{ prodTown }} 근처{{ placeMethods ? ` · ${placeMethods}` : "" }}</p>
        <client-only>
          <div class="rounded-xl overflow-hidden"><map-switch :addr="`성남시 ${prodTown}`" :lat="coords.lat" :lng="coords.lng" height-css="180px" toolbar-position="bottom" /></div>
          <template #fallback><div class="skeleton h-[180px] rounded-xl"></div></template>
        </client-only>
      </section>

      <!-- 판매자의 다른 물건 -->
      <section v-if="sellerProds.length" class="px-4 pt-5 pb-6 border-t border-[var(--dm-line)]">
        <div class="flex items-baseline justify-between mb-3"><h2 class="text-[17px] font-extrabold">{{ sellerNm }}님의 다른 물건</h2><span class="text-[12px] muted">{{ sellerProds.length }}개</span></div>
        <ul class="grid grid-cols-2 gap-x-3 gap-y-5">
          <li v-for="r in sellerProds" :key="r.prodId"><dm-mini-card :prod="r" /></li>
        </ul>
      </section>

      <!-- 비슷한 물건 -->
      <section v-if="related.length" class="px-4 pt-5 pb-8 border-t border-[var(--dm-line)]">
        <h2 class="text-[17px] font-extrabold mb-3">이런 물건은 어때요?</h2>
        <ul class="grid grid-cols-2 gap-x-3 gap-y-5">
          <li v-for="r in related" :key="r.prodId"><dm-mini-card :prod="r" /></li>
        </ul>
      </section>

      <!-- 하단 고정바 -->
      <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] flex items-center gap-3 px-4 py-3 bg-[var(--dm-bg)] border-t border-[var(--dm-line)] z-40" style="padding-bottom: calc(12px + env(safe-area-inset-bottom))">
        <button type="button" class="icon-btn text-[22px]" :class="liked ? 'text-[var(--dm-primary)]' : 'muted'" aria-label="관심" @click="handleBtnAction('prod-like')"><i :class="liked ? 'fas fa-heart' : 'far fa-heart'"></i></button>
        <div class="flex-1 border-l border-[var(--dm-line)] pl-3 min-w-0">
          <b class="text-[17px]">{{ formatWon(prod.discntPrice ?? prod.salePrice) }}</b>
          <p v-if="prod.stdPrice && prod.stdPrice > prod.salePrice" class="text-[12px] muted line-through">{{ formatWon(prod.stdPrice) }}</p>
          <button v-else-if="(prod.discntPrice ?? prod.salePrice) > 0" type="button" class="block text-[12.5px] primary font-bold underline" @click="handleBtnAction('offer-open')">가격 제안하기</button>
          <p v-else class="text-[12px] muted">나눔 — 채팅으로 받아가요</p>
        </div>
        <button type="button" class="btn-primary !h-11 px-5" :disabled="chatting" @click="handleBtnAction('prod-chat')">{{ chatting ? "연결 중…" : "채팅하기" }}</button>
      </div>
      <div class="h-6"></div>

      <!-- 가격 제안 시트 -->
      <dm-sheet :open="offerOpen" title="가격 제안하기" @close="offerOpen = false">
        <p class="text-[14px] muted mb-3">판매 가격 <b class="text-[var(--dm-text)]">{{ formatWon(prod.discntPrice ?? prod.salePrice) }}</b> — 제안 금액은 채팅으로 판매자에게 전달돼요.</p>
        <div class="relative"><input v-model.number="offer" type="number" min="0" step="1000" class="input !pl-7 !h-12 text-[18px] font-bold" placeholder="제안 금액" /><span class="absolute left-3 top-1/2 -translate-y-1/2 muted">₩</span></div>
        <ul class="flex gap-2 mt-3">
          <li v-for="r in [0.9, 0.8, 0.7]" :key="r"><button type="button" class="h-9 px-3 rounded-full bg-[var(--dm-chip)] text-[13.5px] font-semibold" @click="offer = Math.round(((prod.discntPrice ?? prod.salePrice) * r) / 1000) * 1000">{{ Math.round((1 - r) * 100) }}% 할인</button></li>
        </ul>
        <template #foot><button type="button" class="btn-primary w-full" :disabled="!offer || offer <= 0 || chatting" @click="handleBtnAction('offer-send')">{{ chatting ? "보내는 중…" : "제안 보내기" }}</button></template>
      </dm-sheet>

      <!-- 더보기 시트 -->
      <dm-sheet :open="moreOpen" @close="moreOpen = false">
        <ul class="divide-y divide-[var(--dm-line)]">
          <li><button type="button" class="w-full h-12 text-left text-[15.5px]" @click="moreOpen = false; handleBtnAction('prod-share')"><i class="far fa-share-square w-7 muted"></i>공유하기</button></li>
          <li><button type="button" class="w-full h-12 text-left text-[15.5px]" @click="moreOpen = false; handleBtnAction('prod-copy')"><i class="far fa-copy w-7 muted"></i>링크 복사</button></li>
          <li><button type="button" class="w-full h-12 text-left text-[15.5px] text-danger" @click="moreOpen = false; handleBtnAction('prod-report')"><i class="far fa-flag w-7"></i>신고하기</button></li>
        </ul>
      </dm-sheet>
    </template>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import DmMiniCard from "~/components/danmoo1/dm/DmMiniCard.vue";
import MapSwitch from "~/components/danmoo1/common/map/MapSwitch.vue";
import { pushLocalList, useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_RECENT_VIEW_KEY, coordsOf, dmStatusOf, dmTradeMethods, townOf } from "~/conts/tenant/danmoo1";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { mbLikeSvc } from "~/svc/fo/ec/mb/mbLikeSvc";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";
import { toSafeHtml } from "~/utils/htmlSafe";
import { formatWon, timeAgo } from "~/utils/timeAgo";
import type { PdProdType } from "~/types/pd/pdProdType";

/* ##### [01] 초기 변수 정의 ################################################## */

const route = useRoute();
const authStore = useAuthStore();
const { town } = useDmTown();
const { openAlert } = useAlert();
const { openConfirm } = useConfirm();

const prodId = computed(() => String(route.params.id));
const prod = ref<PdProdType | null>(null);
const related = ref<PdProdType[]>([]);
const sellerProds = ref<PdProdType[]>([]);
const pending = ref(true);
const liked = ref(false);
const chatting = ref(false);
const slide = ref(0);
const galleryRef = ref<HTMLElement | null>(null);
const offerOpen = ref(false);
const offer = ref<number | null>(null);
const moreOpen = ref(false);

const images = computed(() => {
  const p = prod.value;
  if (!p) return [];
  const list = (p.prodImgs ?? []).map((i) => i.url).filter((u): u is string => !!u);
  return list.length ? list : [p.img].filter(Boolean);
});
// 개인간 거래 물건은 판매자 = 회원(sellerNm). 예전 시드 상품은 브랜드/업체 이름
const sellerNm = computed(() => prod.value?.sellerNm || prod.value?.brandNm || prod.value?.brand?.brandNm || prod.value?.vendorNm || "danmoo 이웃");
const tradeMethods = computed(() => dmTradeMethods(prod.value?.tradeMethodCds));
/** 동네에서 만나거나(직거래) 문 앞에 두는(문고리) 거래가 있거나, 거래 방법이 없던 예전 물건이면 장소를 보여 준다 */
const meetsInTown = computed(() => !tradeMethods.value.length || tradeMethods.value.some((m) => m.code === "DIRECT" || m.code === "DOOR"));
const placeMethods = computed(() => (tradeMethods.value.length ? tradeMethods.value.filter((m) => m.code !== "PARCEL").map((m) => m.label).join(" · ") : "직거래"));
const prodTown = computed(() => (prod.value ? townOf(prod.value.prodId, town.value) : town.value));
const coords = computed(() => coordsOf(prodTown.value));
const status = computed(() => (prod.value ? dmStatusOf(prod.value) : null));
const contentHtml = computed(() => {
  const c = prod.value?.contentHtml?.trim();
  return c ? toSafeHtml(c) : toSafeHtml(prod.value?.smDesc || prod.value?.advrtStmt || "설명이 없어요.");
});
useHead({ title: () => prod.value?.prodNm ?? "물건" });

const onGalleryScroll = () => {
  const el = galleryRef.value;
  if (el && el.clientWidth) slide.value = Math.round(el.scrollLeft / el.clientWidth);
};

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "prod-like") {
    if (!authStore.isStLoggedIn) return fnAskLogin("관심 등록은 로그인 후 할 수 있어요.");
    try {
      liked.value = await mbLikeSvc.toggle(prodId.value, "PRODUCT");
    } catch (e) {
      console.error("[danmoo1/prod] 관심 토글 실패", e);
      await openAlert("관심 등록에 실패했어요.");
    }
    return;
  }
  if (cmd === "prod-chat") return fnOpenChat(`[상품 문의] ${prod.value?.prodNm} · ${formatWon(prod.value?.discntPrice ?? prod.value?.salePrice)}`);
  if (cmd === "offer-open") {
    if (!authStore.isStLoggedIn) return fnAskLogin("가격 제안은 로그인 후 할 수 있어요.");
    offer.value = null;
    offerOpen.value = true;
    return;
  }
  if (cmd === "offer-send") {
    if (!offer.value || offer.value <= 0) return;
    offerOpen.value = false;
    return fnOpenChat(`[가격 제안] ${prod.value?.prodNm} → ${offer.value.toLocaleString()}원에 거래 가능할까요?`);
  }
  if (cmd === "prod-share" || cmd === "prod-copy") {
    const url = window.location.href;
    try {
      if (cmd === "prod-share" && navigator.share) await navigator.share({ title: prod.value?.prodNm, url });
      else {
        await navigator.clipboard.writeText(url);
        await openAlert({ title: "공유", message: "링크를 복사했어요.", variant: "success" });
      }
    } catch { /* 공유 취소 */ }
    return;
  }
  if (cmd === "prod-report") return openAlert({ title: "신고", message: "신고 기능은 준비 중이에요.", variant: "info" });
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnAskLogin — 로그인 화면으로(돌아올 주소 포함) */
const fnAskLogin = async (msg: string) => {
  if (await openConfirm({ title: "로그인", message: msg, confirmText: "로그인" })) return navigateTo({ path: "/login", query: { redirect: route.fullPath } });
};

/* fnOpenChat — 고객센터 채팅방(회원당 1개, 운영자 응대)을 열고 상품 참조가 붙은 첫 메시지를 남긴 뒤 채팅방으로 */
const fnOpenChat = async (firstMsg: string) => {
  if (!authStore.isStLoggedIn) return fnAskLogin("채팅은 로그인 후 할 수 있어요.");
  if (!prod.value) return;
  chatting.value = true;
  try {
    const room = await myChatSvc.openRoom(`[중고거래] ${prod.value.prodNm}`);
    await myChatSvc.sendRefMsg(room.chattId, firstMsg, "PRODUCT", prod.value.prodId);
    return navigateTo(`/chat/${room.chattId}`);
  } catch (e) {
    console.error("[danmoo1/prod] 채팅방 열기 실패", e);
    await openAlert("채팅방을 열지 못했어요.");
  } finally {
    chatting.value = false;
  }
};

/* fnLoadLiked — 내 찜 목록에 이 상품이 있는지 */
const fnLoadLiked = async () => {
  await useAuthReady();
  if (!authStore.isStLoggedIn) return;
  try {
    liked.value = (await mbLikeSvc.getMyLikes("PRODUCT")).some((l) => l.targetId === prodId.value);
  } catch (e) {
    console.error("[danmoo1/prod] 관심 여부 조회 실패", e);
  }
};

/* fnLoadRelated — 같은 카테고리 물건 6개 + 같은 판매자 물건 4개(회원이 올린 물건은 판매자ID, 예전 시드 상품은 브랜드), 자기 자신 제외 */
const fnLoadRelated = async (p: PdProdType) => {
  const not = (x: PdProdType) => x.prodId !== p.prodId;
  const sameSeller = p.sellerId
    ? pdProductSvc.getPaged({ pageNo: 1, pageSize: 5, sellerId: p.sellerId, sort: "regDate desc" }).catch(() => null)
    : p.brandId
      ? pdProductSvc.getPaged({ pageNo: 1, pageSize: 5, brandIds: [p.brandId], sort: "regDate desc" }).catch(() => null)
      : Promise.resolve(null);
  const [cat, br] = await Promise.all([
    pdProductSvc.getPaged({ pageNo: 1, pageSize: 7, categoryIds: p.categoryId ? [p.categoryId] : undefined, sort: "regDate desc" }).catch((e) => { console.error("[danmoo1/prod] 비슷한 물건 조회 실패", e); return null; }),
    sameSeller,
  ]);
  sellerProds.value = (br?.items ?? []).filter(not).slice(0, 4);
  const sellerIds = new Set(sellerProds.value.map((x) => x.prodId));
  related.value = (cat?.items ?? []).filter((x) => not(x) && !sellerIds.has(x.prodId)).slice(0, 6);
};

/* initPage — 상품 1건 → 최근 본 물건 기록 → 관심 여부·연관 물건 */
const initPage = async () => {
  pending.value = true;
  slide.value = 0;
  liked.value = false;
  try {
    const p = await pdProductSvc.getById(prodId.value);
    prod.value = p;
    pushLocalList(DM_RECENT_VIEW_KEY, p.prodId, 20);
    await Promise.all([fnLoadLiked(), fnLoadRelated(p)]);
  } catch (e) {
    console.error("[danmoo1/prod] 상품 조회 실패", e);
    showError({ statusCode: 404, statusMessage: "물건을 찾을 수 없어요" });
  } finally {
    pending.value = false;
  }
};
onMounted(initPage);
// 연관 물건을 눌러 같은 화면의 다른 id 로 가면 다시 조회
watch(prodId, () => { if (String(route.name ?? "").startsWith("prod")) { window.scrollTo(0, 0); initPage(); } });
</script>

<style scoped>
.dm-content :deep(img) { max-width: 100%; border-radius: 12px; margin: 12px 0; }
.dm-content :deep(p) { margin: 0 0 10px; }
.line-through { text-decoration: line-through; }
</style>
