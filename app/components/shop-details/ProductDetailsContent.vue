<template>
  <div :class="`product__modal-content ${style_2 ? 'product__modal-content-2' : ''}`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-20(요청사항: 상품상세를 ecFeBo 처럼) — 상품유형 + 카테고리 이름 칩(상품명 위) -->
    <div v-if="detail && (prodTypeNm || item.category?.categoryNm)" class="mb-2 flex flex-wrap items-center gap-1.5">
      <span v-if="prodTypeNm" class="rounded-full border border-[#e5e7eb] bg-[#f6f7f9] px-2.5 py-[3px] text-[0.72rem] font-semibold text-[#6b7280]">{{ prodTypeNm }}</span>
      <span v-if="item.category?.categoryNm" class="rounded-full bg-[#eef2ff] px-2.5 py-[3px] text-[0.72rem] font-semibold text-[#4f46e5]">{{ item.category.categoryNm }}</span>
    </div>
    <h4>
      <nuxt-link :to="`/prod-dtl/${item.prodId}`">
        <span v-html="item.prodNm"></span>
      </nuxt-link>
    </h4>
    <div class="rating rating-shop mb-15">
      <!-- 2026-09-20: 예전엔 별 4개 고정 + "N개 평점" 이었다 — 실제 평균 평점과 리뷰 수를 보여준다 -->
      <ul>
        <li v-for="s in 5" :key="s">
          <span><i :class="s <= filledStars ? 'fas fa-star' : 'fal fa-star'"></i></span>
        </li>
      </ul>
      <span class="rating-no ml-10">{{ Number(item.rating || 0).toFixed(1) }} ({{ reviewCount }})</span>
    </div>
    <div class="product__price-2 mb-25">
      <span>{{ formatPrice(item.salePrice) }}</span>
      <span v-if="item.stdPrice" class="old-price">{{ formatPrice(item.stdPrice) }}</span>
    </div>
    <div class="product__modal-des mb-30">
      <p>{{ item.smDesc }}</p>
    </div>
    <div class="product__modal-form">
      <form action="#">
        <!-- 색상 선택 (위) -->
        <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — color-swatch/size-chip
             커스텀 클래스를 Tailwind로 대체. --swatch-color 커스텀 프로퍼티는 옵션별로 값이 달라
             인라인 :style은 유지하고, 소비하는 쪽만 bg-[var(--swatch-color)]로 바꿈.
             2026-09-19(요청사항: "옵션이 어느정도 이상되면 더보기아이콘 표시되고 popover 표시") — 색상은 COLOR_VISIBLE(8)개,
             사이즈는 SIZE_VISIBLE(6)개까지만 한 줄에 보이고 나머지는 "…" 버튼을 누르면 뜨는 팝오버에 전체 목록이 나온다.
             선택한 옵션이 접힌 쪽에 있어도 줄 안에 보이도록(마지막 칸과 교체) 처리하고, 바깥 클릭/Esc 로 팝오버가 닫힌다.
             색상표는 옵션코드가 VAL_COLOR_* 인데 매핑이 color01.. 형식뿐이라 전부 회색으로 보이던 것도 함께 수정(colorMap). -->
        <div class="product__modal-input color mb-20 relative">
          <label>색상 선택</label>
          <div class="flex flex-wrap items-center gap-2.5 mt-2.5 mb-2">
            <button
              v-for="opt in visibleColors"
              :key="opt.optionCode ?? opt.optionId"
              type="button"
              :title="opt.optionNm"
              :aria-label="opt.optionNm"
              class="relative w-[26px] h-[26px] rounded-full border-[1.5px] border-black/10 cursor-pointer bg-[var(--swatch-color)] shadow-[0_1px_3px_rgba(0,0,0,0.14)] transition-[transform,box-shadow] duration-150 hover:scale-110 hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
              :class="{ 'scale-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#555,0_2px_6px_rgba(0,0,0,0.2)]': selectedColor === optKey(opt) }"
              :style="{ '--swatch-color': swatchColor(opt) }"
              @click="selectedColor = optKey(opt)"
            ></button>
            <button
              v-if="hasMoreColors"
              type="button"
              class="w-[26px] h-[26px] rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[#666] flex items-center justify-center cursor-pointer hover:border-[#888] hover:bg-[#f0f0f0]"
              :title="`색상 전체 보기 (${colors.length})`"
              :aria-label="`색상 전체 보기 (${colors.length})`"
              aria-haspopup="true"
              :aria-expanded="openPopover === 'color'"
              @click.stop="togglePopover('color')"
            >
              <i class="fas fa-ellipsis-h text-[0.7rem]"></i>
            </button>
          </div>
          <span v-if="selectedColor" class="text-xs text-[#666] ml-0.5">선택: {{ colors.find((o) => optKey(o) === selectedColor)?.optionNm }}</span>
          <!-- 색상 전체 팝오버 -->
          <div
            v-if="openPopover === 'color'"
            class="absolute left-0 top-full z-30 mt-1 w-[min(100%,360px)] max-h-[260px] overflow-y-auto rounded-lg border border-[#e0e0e0] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
            role="dialog"
            aria-label="색상 전체 목록"
            @click.stop
          >
            <div class="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
              <button
                v-for="opt in colors"
                :key="opt.optionCode ?? opt.optionId"
                type="button"
                class="flex items-center gap-2 rounded px-1.5 py-1 text-left text-[13px] text-[#444] bg-transparent border-0 cursor-pointer hover:bg-[#f4f4f4]"
                :class="{ 'font-bold bg-[#f4f4f4]': selectedColor === optKey(opt) }"
                @click="pickColor(opt)"
              >
                <span
                  class="inline-block w-[20px] h-[20px] shrink-0 rounded-full border-[1.5px] border-black/10 bg-[var(--swatch-color)]"
                  :class="{ 'shadow-[0_0_0_2px_#fff,0_0_0_3.5px_#555]': selectedColor === optKey(opt) }"
                  :style="{ '--swatch-color': swatchColor(opt) }"
                ></span>
                <span class="truncate">{{ opt.optionNm }}</span>
              </button>
            </div>
          </div>
        </div>
        <!-- 사이즈 선택 (아래) -->
        <div class="product__modal-input size mb-20 relative">
          <label>사이즈 <i class="fas fa-star-of-life"></i></label>
          <div class="flex flex-wrap items-center gap-2 mt-2.5">
            <span v-if="!sizes.length" class="text-[13px] text-[#aaa]">사이즈 없음</span>
            <button
              v-for="opt in visibleSizes"
              :key="opt.optionCode ?? opt.optionId"
              type="button"
              class="px-4 py-1.5 rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[13px] font-medium text-[#444] cursor-pointer transition-colors tracking-wide hover:border-[#888] hover:bg-[#f0f0f0] hover:text-[#222]"
              :class="{ '!border-[#222] !bg-[#222] !text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]': selectedSize === optKey(opt) }"
              @click="selectedSize = optKey(opt)"
            >
              {{ opt.optionNm }}
            </button>
            <button
              v-if="hasMoreSizes"
              type="button"
              class="px-3 py-1.5 rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[#666] flex items-center justify-center cursor-pointer hover:border-[#888] hover:bg-[#f0f0f0]"
              :title="`사이즈 전체 보기 (${sizes.length})`"
              :aria-label="`사이즈 전체 보기 (${sizes.length})`"
              aria-haspopup="true"
              :aria-expanded="openPopover === 'size'"
              @click.stop="togglePopover('size')"
            >
              <i class="fas fa-ellipsis-h text-[0.8rem]"></i>
            </button>
          </div>
          <!-- 사이즈 전체 팝오버 -->
          <div
            v-if="openPopover === 'size'"
            class="absolute left-0 top-full z-30 mt-1 w-[min(100%,360px)] max-h-[260px] overflow-y-auto rounded-lg border border-[#e0e0e0] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
            role="dialog"
            aria-label="사이즈 전체 목록"
            @click.stop
          >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in sizes"
                :key="opt.optionCode ?? opt.optionId"
                type="button"
                class="px-4 py-1.5 rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[13px] font-medium text-[#444] cursor-pointer transition-colors tracking-wide hover:border-[#888] hover:bg-[#f0f0f0] hover:text-[#222]"
                :class="{ '!border-[#222] !bg-[#222] !text-white': selectedSize === optKey(opt) }"
                @click="pickSize(opt)"
              >
                {{ opt.optionNm }}
              </button>
            </div>
          </div>
        </div>
        <div class="product__modal-required mb-5">
          <span>필수 입력 항목 *</span>
        </div>
        <!-- 2026-09-13(요청사항: "모바일로 보기에서 [장바구니추가] 버튼이 커서 우측에 숨겨진거 같아") —
             기존 flex-nowrap이 좁은 화면에서도 한 줄을 강제해 버튼이 화면 밖으로 밀려나갔다.
             좁은 화면(max-sm)에서는 줄바꿈을 허용하고 버튼은 다음 줄에서 꽉 채워 보이게 한다. -->
        <!-- ===== 상세 페이지 전용 구매 영역 (2026-09-20: ecFeBo 처럼 장바구니 담기·찜·카카오 공유·바로구매·문의하기·배송 안내) ===== -->
        <div v-if="detail" ref="buyEl">
          <div class="mb-4 flex items-center gap-3">
            <label class="text-[0.85rem] text-[#555]">수량</label>
            <div class="product-quantity shrink-0">
              <div class="cart-plus-minus">
                <input type="text" v-model="state.orderQuantity" />
                <div @click="state.orderQuantity > 1 ? state.orderQuantity-- : (state.orderQuantity = 1)" class="dec qtybutton">-</div>
                <div @click="state.orderQuantity++" class="inc qtybutton">+</div>
              </div>
            </div>
          </div>
          <div class="mb-4 flex flex-col gap-2">
            <div class="flex gap-2">
              <button type="button" class="h-12 flex-1 cursor-pointer rounded-[10px] border-0 bg-[#222] text-[0.95rem] font-semibold text-white transition-colors hover:bg-black" @click.prevent="handleAddToCart">🛒 장바구니 담기</button>
              <button
                type="button"
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-solid border-[#e5e7eb] bg-white p-0 text-xl leading-none cursor-pointer hover:border-[#bbb]"
                :title="isWished ? '찜 해제' : '찜하기'"
                :aria-label="isWished ? '찜 해제' : '찜하기'"
                @click.prevent="wishlist.addStWishlistProduct(item)"
              >
                <span :class="isWished ? 'text-red-500' : 'text-gray-400'">{{ isWished ? "♥" : "♡" }}</span>
              </button>
              <button type="button" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border-0 bg-[#FEE500] p-0 text-xl leading-none text-[#191919] cursor-pointer" title="카카오톡 공유" aria-label="카카오톡 공유" @click.prevent="shareTools.shareKakao()">💬</button>
            </div>
            <button type="button" class="h-12 w-full cursor-pointer rounded-[10px] border-2 border-solid border-[#222] bg-white text-[0.95rem] font-semibold text-[#222] transition-colors hover:bg-[#222] hover:text-white" @click.prevent="handleBuyNow">⚡ 바로구매</button>
            <button type="button" class="cursor-pointer border-0 bg-transparent py-1 text-center text-[0.8rem] text-[#9ca3af] underline" @click.prevent="emit('inquiry')">상품 문의하기</button>
          </div>
          <div class="flex flex-col gap-1.5 border-t border-[#e5e7eb] pt-3.5 text-[0.8rem] text-[#555]">
            <div class="flex gap-2"><span aria-hidden="true">🚚</span><span>결제 확인 후 <strong>1~2 영업일</strong> 내 출고</span></div>
            <div class="flex gap-2"><span aria-hidden="true">↩️</span><span>수령 후 <strong>7일 이내</strong> 교환·반품 가능</span></div>
            <div class="flex gap-2"><span aria-hidden="true">💳</span><span>결제: <strong>토스페이먼츠</strong> (카드·계좌이체 등)</span></div>
          </div>
        </div>
        <div v-else class="pro-quan-area flex flex-wrap items-center gap-3">
          <div class="product-quantity-title shrink-0">
            <label>수량</label>
          </div>
          <div class="product-quantity shrink-0">
            <div class="cart-plus-minus">
              <input type="text" v-model="state.orderQuantity" />
              <div @click="state.orderQuantity > 1 ? state.orderQuantity-- : (state.orderQuantity = 1)" class="dec qtybutton">-</div>
              <div @click="state.orderQuantity++" class="inc qtybutton">+</div>
            </div>
          </div>
          <div class="pro-cart-btn shrink-0 max-sm:w-full">
            <a
              @click.prevent="handleAddToCart"
              href="#"
              class="os-btn os-btn-black os-btn-3 max-sm:flex max-sm:justify-center max-sm:w-full"
              >+ 장바구니 추가</a
            >
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle("상품 상세 내용");
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { type PdProductType } from "~/types/pdProductType";
import { useCartStore } from "~/store/useCartStore";

import { useWishlistStore } from "~/store/useWishlistStore";
import { prodTypeLabel } from "~/conts/pdConst";

const props = defineProps<{
  item: PdProductType;
  style_2?: boolean;
  /** 상품 상세 페이지 전용 모드 — 유형·카테고리 칩, 찜·공유, 바로구매, 문의하기, 배송 안내를 함께 보여준다(빠른보기 모달은 false) */
  detail?: boolean;
}>();
const emit = defineEmits<{ (e: "inquiry"): void }>();
const state = useCartStore();
const wishlist = useWishlistStore();
const shareTools = useShareTools();
const isWished = computed(() => wishlist.wishlists.some((p) => p.prodId === props.item.prodId));
const prodTypeNm = computed(() => prodTypeLabel(props.item.prodTypeCd));
const reviewCount = computed(() => props.item.reviews?.length ?? 0);
const filledStars = computed(() => Math.max(0, Math.min(5, Math.round(Number(props.item.rating) || 0))));
const buyEl = ref<HTMLElement | null>(null); // 구매 버튼 영역 — 하단 구매바가 "본문 버튼이 화면 밖으로 나갔는지" 판단하는 기준
const { formatPrice } = usePrice();

const selectedColor = ref("");
const selectedSize = ref("");

// ── 옵션 더보기 팝오버 (2026-09-19) ──────────────────────────────────────
type OptionItem = PdProductType["optionColors"][number];
const COLOR_VISIBLE = 8; // 색상표는 이 개수까지만 한 줄에 노출, 넘으면 "…" 팝오버
const SIZE_VISIBLE = 6; // 사이즈 칩도 동일
const colors = computed<OptionItem[]>(() => props.item.optionColors ?? []);
const sizes = computed<OptionItem[]>(() => props.item.optionSizes ?? []);
const optKey = (o: OptionItem) => o.optionCode ?? String(o.optionId);

// 앞쪽 N개를 보여주되, 선택한 옵션이 접힌 쪽에 있으면 마지막 칸을 그 옵션으로 교체해 선택 상태가 줄 안에서 보이게 한다
function foldOptions(all: OptionItem[], limit: number, selected: string): OptionItem[] {
  if (all.length <= limit) return all;
  const head = all.slice(0, limit);
  if (!selected || head.some((o) => optKey(o) === selected)) return head;
  const sel = all.find((o) => optKey(o) === selected);
  return sel ? [...head.slice(0, limit - 1), sel] : head;
}
const visibleColors = computed(() => foldOptions(colors.value, COLOR_VISIBLE, selectedColor.value));
const visibleSizes = computed(() => foldOptions(sizes.value, SIZE_VISIBLE, selectedSize.value));
const hasMoreColors = computed(() => colors.value.length > COLOR_VISIBLE);
const hasMoreSizes = computed(() => sizes.value.length > SIZE_VISIBLE);

const openPopover = ref<"color" | "size" | null>(null);
function togglePopover(kind: "color" | "size") {
  openPopover.value = openPopover.value === kind ? null : kind;
}
function pickColor(opt: OptionItem) {
  selectedColor.value = optKey(opt);
  openPopover.value = null;
}
function pickSize(opt: OptionItem) {
  selectedSize.value = optKey(opt);
  openPopover.value = null;
}
function closePopover() {
  openPopover.value = null;
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closePopover();
}
onMounted(() => {
  document.addEventListener("click", closePopover); // 팝오버 내부/트리거는 @click.stop 으로 막혀 있어 바깥 클릭에만 닫힌다
  document.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", closePopover);
  document.removeEventListener("keydown", onKeydown);
});

// 2026-09 추가 — 선택한 옵션조합(색상/사이즈)에 해당하는 SKU를 찾아 장바구니에 담는다.
// optionColors/optionSizes 의 optionLevel(1|2)로 prodOpt1Id/prodOpt2Id 중 어느 자리와
// 비교해야 하는지 판별한다(상품마다 어느 레벨이 색상/사이즈인지 다를 수 있음).
function findMatchedSku() {
  const skus = props.item.prodSkus ?? [];
  if (!skus.length) return undefined;

  const selectedColorOpt = props.item.optionColors?.find((o) => (o.optionCode ?? String(o.optionId)) === selectedColor.value);
  const selectedSizeOpt = props.item.optionSizes?.find((o) => (o.optionCode ?? String(o.optionId)) === selectedSize.value);

  const matchesLevel = (skuOpt1?: string | null, skuOpt2?: string | null, opt?: typeof selectedColorOpt) => {
    if (!opt) return true; // 이 슬롯에 해당하는 옵션 선택이 없으면(옵션 자체가 없는 상품) 통과
    const skuOptId = opt.optionLevel === 2 ? skuOpt2 : skuOpt1;
    return skuOptId === opt.optionId;
  };

  return skus.find((s) => matchesLevel(s.prodOpt1Id, s.prodOpt2Id, selectedColorOpt) && matchesLevel(s.prodOpt1Id, s.prodOpt2Id, selectedSizeOpt));
}

/** 옵션(사이즈)·SKU·재고를 검증하고 담을 SKU 를 돌려준다. 실패하면 토스트를 띄우고 null. (장바구니 담기/바로구매 공통) */
function resolveSelection(): { prodSkuId?: string } | null {
  if (props.item.optionSizes?.length && !selectedSize.value) {
    useNuxtApp().$toast.error("사이즈를 선택해주세요.");
    return null;
  }
  const matchedSku = findMatchedSku();
  if (props.item.prodSkus?.length && !matchedSku) {
    useNuxtApp().$toast.error("선택한 옵션 조합의 재고 정보를 찾을 수 없습니다.");
    return null;
  }
  if (matchedSku?.stockQty != null && matchedSku.stockQty <= 0) {
    useNuxtApp().$toast.error("선택한 옵션은 품절되었습니다.");
    return null;
  }
  return { prodSkuId: matchedSku?.prodSkuId };
}

function handleAddToCart() {
  const sel = resolveSelection();
  if (!sel) return;
  const existed = state.cartProducts.some((i) => i.prodId === props.item.prodId && i.selectedProdSkuId === sel.prodSkuId);
  state.addStCartProduct(props.item, sel.prodSkuId);
  // 스토어는 새 줄을 항상 수량 1 로 만든다(이미 담긴 줄만 선택 수량을 더한다) — 새로 담는 경우에도 선택한 수량을 반영한다
  if (!existed) state.setStQuantity(props.item.prodId, sel.prodSkuId, state.orderQuantity);
}

/**
 * 바로구매 (2026-09-20) — 옵션 검증 후 선택한 수량으로 장바구니에 담고 곧바로 결제 화면(/checkout)으로 이동한다.
 * 이미 담겨 있던 같은 상품(같은 SKU)은 수량을 누적하지 않고 선택한 수량으로 맞춘다.
 */
async function handleBuyNow() {
  const sel = resolveSelection();
  if (!sel) return;
  const exists = state.cartProducts.some((i) => i.prodId === props.item.prodId && i.selectedProdSkuId === sel.prodSkuId);
  if (!exists) state.addStCartProduct(props.item, sel.prodSkuId);
  state.setStQuantity(props.item.prodId, sel.prodSkuId, state.orderQuantity);
  await navigateTo("/checkout");
}

// 페이지(하단 구매바 등)가 같은 검증·동작을 그대로 쓰도록 노출
defineExpose({ addToCart: handleAddToCart, buyNow: handleBuyNow, getBuyEl: () => buyEl.value });

const colorMap: Record<string, string> = {
  color01: "#E74C3C", // 빨강
  color02: "#3498DB", // 파랑
  color03: "#2ECC71", // 초록
  color04: "#F1C40F", // 노랑
  color05: "#9B59B6", // 보라
  color06: "#1A1A1A", // 검정
  color07: "#95A5A6", // 회색
  color08: "#F8F9FA", // 흰색
  color09: "#8B6347", // 갈색
  color10: "#000000", // 블랙
  // 2026-09-19: 실제 옵션코드는 VAL_COLOR_* (pd_prod_opt_val) — 위 color01..10 매핑만으로는 전부 회색(#ccc)으로 나왔다
  VAL_COLOR_BLACK: "#1A1A1A", // 블랙
  VAL_COLOR_WHITE: "#FFFFFF", // 화이트
  VAL_COLOR_IVORY: "#F5EFDC", // 아이보리
  VAL_COLOR_GRAY: "#9E9E9E", // 그레이
  VAL_COLOR_CHARCOAL: "#36454F", // 차콜
  VAL_COLOR_NAVY: "#1F2A44", // 네이비
  VAL_COLOR_BLUE: "#2F6FDE", // 블루
  VAL_COLOR_KHAKI: "#8B8A55", // 카키
  VAL_COLOR_BEIGE: "#D9C3A0", // 베이지
  VAL_COLOR_BROWN: "#7B4B2A", // 브라운
  VAL_COLOR_RED: "#D32F2F", // 레드
  VAL_COLOR_BURGUNDY: "#7B1E3A", // 버건디
  VAL_COLOR_PINK: "#F4A6C0", // 핑크
  VAL_COLOR_PURPLE: "#7E57C2", // 퍼플
  VAL_COLOR_MUSTARD: "#D4A017", // 머스타드
  VAL_COLOR_ORANGE: "#F57C00", // 오렌지
};
const swatchColor = (opt: OptionItem) => colorMap[opt.optionCode ?? ""] ?? "#ccc";
</script>
