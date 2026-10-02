<template>
  <!-- 판매내역 — 내가 올린 물건(판매자 상품 API). 판매자가 아니면 안내. 상태별 탭(판매중/예약·중지/완료) -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="판매내역" fallback="/my">
        <template #right><nuxt-link v-if="isSeller" to="/write?type=prod" class="text-[14px] primary font-bold px-2">물건 올리기</nuxt-link></template>
      </dm-title-bar>
      <div v-if="isSeller" class="dm-segs">
        <button v-for="t in TABS" :key="t.key" type="button" class="dm-seg" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }} <span class="text-[12px] muted">{{ countOf(t.key) }}</span></button>
      </div>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-clipboard" title="로그인하면 판매내역을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/my/prods' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <dm-empty v-else-if="ready && !isSeller" icon="far fa-store" title="판매자만 물건을 올릴 수 있어요" desc="판매자 신청·승인은 ShopJoy 마이페이지(판매자 신청)에서 할 수 있어요. 승인된 계정으로 로그인하면 여기서 물건을 올리고 관리해요" />
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!visible.length" icon="far fa-box-open" :title="prods.length ? '해당하는 물건이 없어요' : '판매 중인 물건이 없어요'">
      <nuxt-link v-if="!prods.length" to="/write?type=prod" class="btn-primary mt-3 px-8">첫 물건 올리기</nuxt-link>
    </dm-empty>
    <ul v-else>
      <li v-for="p in visible" :key="p.prodId">
        <nuxt-link :to="`/prod/${p.prodId}`" class="flex gap-3.5 px-4 py-3.5 border-b border-[var(--dm-line)]">
          <span class="w-24 h-24 rounded-[10px] bg-[var(--dm-chip)] overflow-hidden flex-none"><img v-if="p.thumbnailUrl" :src="p.thumbnailUrl" :alt="p.prodNm" class="w-full h-full object-cover" loading="lazy" /></span>
          <div class="flex-1 min-w-0">
            <span class="inline-block text-[11px] px-1.5 py-0.5 rounded mb-1" :class="p.prodStatusCd === 'ACTIVE' ? 'bg-[var(--dm-primary-soft)] text-[var(--dm-primary)]' : 'bg-[var(--dm-chip)] muted'">{{ statusNm(p.prodStatusCd) }}</span>
            <p class="text-[15.5px] clamp-2">{{ p.prodNm }}</p>
            <p class="text-[16px] font-bold mt-1">{{ formatWon(p.salePrice) }}</p>
            <p class="text-[12.5px] muted mt-0.5">재고 {{ p.stockQty ?? 0 }} · {{ p.warehouseNm || "창고 미지정" }}</p>
          </div>
        </nuxt-link>
      </li>
    </ul>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import { formatWon } from "~/utils/timeAgo";
import type { PdMyProdType } from "~/types/pd/pdMyProdType";

const currentFilePath = useCurrentFilePath();
useHead({ title: "판매내역" });
const authStore = useAuthStore();
const isSeller = computed(() => (authStore.user?.sellerIds?.length ?? 0) > 0);
const TABS = [{ key: "on", label: "판매중" }, { key: "hold", label: "예약·중지" }, { key: "done", label: "완료" }] as const;
const tab = ref<(typeof TABS)[number]["key"]>("on");
const prods = ref<PdMyProdType[]>([]);
const loading = ref(false);
const ready = ref(false);
const groupOf = (cd?: string) => (cd === "ACTIVE" ? "on" : cd === "ENDED" ? "done" : "hold");
const visible = computed(() => prods.value.filter((p) => groupOf(p.prodStatusCd) === tab.value));
const countOf = (k: string) => prods.value.filter((p) => groupOf(p.prodStatusCd) === k).length;
const statusNm = (cd?: string) => ({ ACTIVE: "판매중", INACTIVE: "판매중지", DRAFT: "임시저장", ENDED: "판매완료" })[String(cd ?? "")] ?? String(cd ?? "");

/* initPage — 로그인 복원 후 판매자면 내 상품 목록 */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn || !isSeller.value) return;
  loading.value = true;
  try {
    prods.value = await pdMyProdSvc.getMyProds();
  } catch (e) {
    console.error("[danmoo1/my/prods] 판매 물건 조회 실패", e);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
