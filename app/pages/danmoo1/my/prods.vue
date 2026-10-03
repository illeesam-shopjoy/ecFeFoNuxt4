<template>
  <!-- 판매내역 — 내가 올린 물건(판매자 상품 API). 상태별 탭(판매중/예약중·중지/완료), 물건마다 ⋯ 시트(예약중↔판매중, 끌어올리기, 수정, 판매완료). 판매자가 아니면 안내 -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="판매내역" fallback="/my">
        <template #right><nuxt-link v-if="isSeller" to="/write?type=prod" class="text-[14px] primary font-bold px-2">물건 올리기</nuxt-link></template>
      </dm-title-bar>
      <div v-if="isSeller" class="dm-segs">
        <button v-for="t in TABS" :key="t.key" type="button" class="dm-seg" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }} <span class="text-[12px] muted">{{ countOf(t.key) }}</span></button>
      </div>
    </template>

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-clipboard" title="로그인하면 판매내역을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/my/prods' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <dm-empty v-else-if="ready && !isSeller" icon="far fa-store" title="판매자만 물건을 올릴 수 있어요" desc="판매자 신청·승인은 ShopJoy 마이페이지(판매자 신청)에서 할 수 있어요. 승인된 계정으로 로그인하면 여기서 물건을 올리고 관리해요" />
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!visible.length" icon="far fa-box-open" :title="prods.length ? '해당하는 물건이 없어요' : '판매 중인 물건이 없어요'">
      <nuxt-link v-if="!prods.length" to="/write?type=prod" class="btn-primary mt-3 px-8">첫 물건 올리기</nuxt-link>
    </dm-empty>
    <ul v-else>
      <li v-for="p in visible" :key="p.prodId" class="flex gap-3.5 px-4 py-3.5 border-b border-[var(--dm-line)]">
        <nuxt-link :to="`/prod/${p.prodId}`" class="flex gap-3.5 flex-1 min-w-0">
          <span class="w-24 h-24 rounded-[10px] bg-[var(--dm-chip)] overflow-hidden flex-none"><img v-if="p.thumbnailUrl" :src="p.thumbnailUrl" :alt="p.prodNm" class="w-full h-full object-cover" loading="lazy" /></span>
          <div class="flex-1 min-w-0">
            <span class="inline-block text-[11px] px-1.5 py-0.5 rounded mb-1" :class="badgeCls(p.prodStatusCd)">{{ statusNm(p.prodStatusCd) }}</span>
            <p class="text-[15.5px] clamp-2">{{ p.prodNm }}</p>
            <p class="text-[16px] font-bold mt-1">{{ formatWon(p.salePrice) }}</p>
            <p class="text-[12.5px] muted mt-0.5">재고 {{ p.stockQty ?? 0 }} · {{ p.warehouseNm || "창고 미지정" }}</p>
          </div>
        </nuxt-link>
        <button type="button" class="icon-btn self-start muted" aria-label="더보기" @click="handleSelectAction('prod-menu', p)"><i class="fas fa-ellipsis-v"></i></button>
      </li>
    </ul>

    <!-- 물건 관리 시트 -->
    <dm-sheet :open="!!target" :title="target?.prodNm" @close="target = null">
      <ul v-if="target" class="divide-y divide-[var(--dm-line)]">
        <li v-if="target.prodStatusCd === 'ACTIVE'"><button type="button" class="w-full h-12 text-left text-[15.5px]" :disabled="busy" @click="handleBtnAction('prod-reserve')"><i class="far fa-clock w-7 muted"></i>예약중으로 변경</button></li>
        <li v-if="target.prodStatusCd === 'INACTIVE'"><button type="button" class="w-full h-12 text-left text-[15.5px]" :disabled="busy" @click="handleBtnAction('prod-resume')"><i class="far fa-play-circle w-7 muted"></i>판매중으로 변경</button></li>
        <li v-if="target.prodStatusCd !== 'ENDED'"><button type="button" class="w-full h-12 text-left text-[15.5px]" :disabled="busy" @click="handleBtnAction('prod-bump')"><i class="far fa-arrow-alt-circle-up w-7 muted"></i>끌어올리기 <span class="text-[12px] muted ml-1">목록 맨 위로</span></button></li>
        <li v-if="target.prodStatusCd !== 'ENDED'"><nuxt-link :to="{ path: '/write', query: { type: 'prod', edit: target.prodId } }" class="flex items-center h-12 text-[15.5px]" @click="target = null"><i class="far fa-edit w-7 muted"></i>수정</nuxt-link></li>
        <li v-if="target.prodStatusCd !== 'ENDED'"><button type="button" class="w-full h-12 text-left text-[15.5px] text-danger" :disabled="busy" @click="handleBtnAction('prod-end')"><i class="far fa-check-circle w-7"></i>판매완료로 변경</button></li>
        <li v-else class="py-3 text-[14px] muted">판매가 끝난 물건이에요. 상세는 볼 수 있지만 다시 판매하려면 새로 올려 주세요.</li>
      </ul>
    </dm-sheet>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { pdMyProdSvc } from "~/svc/fo/ec/pd/pdMyProdSvc";
import { formatWon } from "~/utils/timeAgo";
import type { PdMyProdType, PdMyProdSaveType } from "~/types/pd/pdMyProdType";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "판매내역" });
const authStore = useAuthStore();
const { openAlert } = useAlert();
const { openConfirm } = useConfirm();
const isSeller = computed(() => (authStore.user?.sellerIds?.length ?? 0) > 0);
const TABS = [{ key: "on", label: "판매중" }, { key: "hold", label: "예약·중지" }, { key: "done", label: "완료" }] as const;
const tab = ref<(typeof TABS)[number]["key"]>("on");
const prods = ref<PdMyProdType[]>([]);
const loading = ref(false);
const ready = ref(false);
const target = ref<PdMyProdType | null>(null);
const busy = ref(false);
const groupOf = (cd?: string) => (cd === "ACTIVE" ? "on" : cd === "ENDED" ? "done" : "hold");
const visible = computed(() => prods.value.filter((p) => groupOf(p.prodStatusCd) === tab.value));
const countOf = (k: string) => prods.value.filter((p) => groupOf(p.prodStatusCd) === k).length;
const statusNm = (cd?: string) => ({ ACTIVE: "판매중", INACTIVE: "예약중", DRAFT: "임시저장", ENDED: "판매완료" })[String(cd ?? "")] ?? String(cd ?? "");
const badgeCls = (cd?: string) => (cd === "ACTIVE" ? "bg-[var(--dm-primary-soft)] text-[var(--dm-primary)]" : cd === "INACTIVE" ? "bg-[#e6f6ec] text-[#2f9e44]" : "bg-[var(--dm-chip)] muted");

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleSelectAction — 행 액션 dispatch */
const handleSelectAction = (cmd: string, p: PdMyProdType) => {
  if (cmd === "prod-menu") return (target.value = p);
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* handleBtnAction — 시트 버튼 dispatch (cmd: '{영역명}-기능명'). 상태 변경은 상품 전체(PUT)로 보내므로 상세를 먼저 읽어 그대로 돌려보낸다 */
const handleBtnAction = async (cmd: string) => {
  const p = target.value;
  if (!p || busy.value) return;
  busy.value = true;
  try {
    if (cmd === "prod-end") {
      if (!(await openConfirm({ title: "판매완료", message: `'${p.prodNm}' 을(를) 판매완료로 바꿀까요? 목록에서 내려가고 다시 판매하려면 새로 올려야 해요.`, confirmText: "판매완료", variant: "danger" }))) return;
      await pdMyProdSvc.endProd(p.prodId);
      p.prodStatusCd = "ENDED";
      target.value = null;
      return openAlert({ title: "판매완료", message: "거래가 완료된 물건으로 표시했어요. 수고하셨어요!", variant: "success" });
    }
    if (cmd === "prod-reserve" || cmd === "prod-resume" || cmd === "prod-bump") {
      const detail = await pdMyProdSvc.getMyProd(p.prodId);
      const body: PdMyProdSaveType = {
        prodNm: detail.prodNm,
        categoryId: detail.categoryId ?? p.categoryId ?? "",
        salePrice: Number(detail.salePrice ?? 0),
        stdPrice: detail.stdPrice ?? undefined,
        stockQty: Number(detail.stockQty ?? p.stockQty ?? 1),
        warehouseId: detail.warehouseId ?? p.warehouseId ?? "",
        contentHtml: detail.contentHtml ?? undefined,
        prodStatusCd: cmd === "prod-reserve" ? "INACTIVE" : "ACTIVE",
      };
      const saved = await pdMyProdSvc.updateProd(p.prodId, body);
      p.prodStatusCd = saved.prodStatusCd ?? body.prodStatusCd;
      target.value = null;
      const msg = cmd === "prod-reserve" ? "예약중으로 바꿨어요. 홈에서 '예약중' 표시가 붙어요." : cmd === "prod-resume" ? "다시 판매중으로 바꿨어요." : "끌어올렸어요. 홈 목록에서 '끌올'로 보여요.";
      return openAlert({ title: cmd === "prod-bump" ? "끌어올리기" : "상태 변경", message: msg, variant: "success" });
    }
    console.warn("[handleBtnAction] unknown cmd:", cmd);
  } catch (e) {
    console.error("[danmoo1/my/prods] 물건 상태 변경 실패", e);
    await openAlert(String((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "").split("::")[0] || "처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
  } finally {
    busy.value = false;
  }
};

/* ##### [03] 내장 사용 함수 ################################################### */

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
