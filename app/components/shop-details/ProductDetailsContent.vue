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
          <span><i class="text-[#f5a623]" :class="s <= filledStars ? 'fas fa-star' : 'fal fa-star'"></i></span>
        </li>
      </ul>
      <span class="rating-no ml-10">{{ Number(item.rating || 0).toFixed(1) }} ({{ reviewCount }})</span>
    </div>
    <div class="product__price-2 mb-25">
      <span>{{ formatPrice(item.salePrice + selectedAddPrice) }}</span>
      <span v-if="item.stdPrice" class="old-price">{{ formatPrice(item.stdPrice) }}</span>
      <!-- 선택한 사이즈(옵션 조합)에 추가금액이 있으면 알려준다 -->
      <span v-if="selectedAddPrice > 0" class="ml-2 rounded-full bg-[#fdecea] px-2.5 py-[3px] text-[0.75rem] font-semibold text-[#c0392b]">옵션 추가금액 +{{ formatPrice(selectedAddPrice) }}</span>
    </div>
    <!-- 짧은 설명이 없으면 이 박스(위/아래 테두리선)를 그리지 않는다 — 비어 있으면 빈 줄이 두 개 보였다 -->
    <div v-if="item.smDesc" class="product__modal-des mb-30">
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
        <!-- 2026-09-20(요청사항: "상품유형이 옵션상품인경우만 옵션선택 : 색상, 사이즈 란 표시해줘") — 상품유형이 OPTION(옵션상품)일 때만 옵션 영역을 보인다.
             단품/묶음/세트/사은품은 고를 옵션이 없어 영역 자체를 숨기고, 담기 검증에서도 사이즈 필수를 요구하지 않는다. -->
        <div v-if="isOptionProd" class="mb-5">
        <div class="mb-3 border-b border-[#e5e7eb] pb-2 text-[0.9rem] font-bold text-gray-800">옵션선택 : <span class="font-medium text-gray-600">색상, 사이즈</span></div>
        <div class="product__modal-input color mb-20 relative after:!hidden">
          <!-- 2026-09-22(요청사항: "필수 마킹이 라벨에 바로 붙어있어야, '필수' 글자는 필요없음") — 별표(*)만 라벨에 바로 붙이고 별도 "필수" 문구는 뺐다. -->
          <label>
            색상<i class="fas fa-star-of-life ml-1"></i>
            <!-- 2026-09-22(요청사항: "색상상태도움말 — 좀더 의미있는 아이콘으로") — 재고없음/판매중지/추가금액 표식이 뭘 뜻하는지 설명하는 모달.
                 사이즈의 "?"(사이즈 가이드)와 헷갈리지 않도록 채워진 원 뱃지로 다르게 표시, 아이콘은 표식/태그를 뜻하는 fa-tag. -->
            <button type="button" class="status-help-badge" aria-label="색상 상태 안내" title="색상 상태 안내" @click.stop.prevent="colorStatusHelpRef?.show()"><i class="fas fa-tag text-[9px]"></i></button>
          </label>
          <div class="flex flex-wrap items-center gap-2.5 mt-2.5 mb-2">
            <button
              v-for="opt in visibleColors"
              :key="opt.prodOptStdCd ?? opt.prodOptId"
              type="button"
              :title="optTitle(opt, 'color')"
              :aria-label="optTitle(opt, 'color')"
              :disabled="soldOut(opt, 'color')"
              class="relative w-[26px] h-[26px] rounded-full border-[1.5px] border-black/10 cursor-pointer bg-[var(--swatch-color)] shadow-[0_1px_3px_rgba(0,0,0,0.14)] transition-[transform,box-shadow] duration-150 hover:scale-110 hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              :class="{ 'scale-110 !border-white !shadow-[0_0_0_2px_#fff,0_0_0_5px_#bc8246,0_3px_8px_rgba(0,0,0,0.3)]': selectedColor === optKey(opt) }"
              :style="{ '--swatch-color': swatchColor(opt) }"
              :aria-pressed="selectedColor === optKey(opt)"
              @click="selectedColor = optKey(opt)"
            >
              <i v-if="selectedColor === optKey(opt)" class="fas fa-check absolute inset-0 flex items-center justify-center text-[11px] text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.85)]"></i>
              <!-- 재고없음/판매중지: 대각선(색상으로 구분 — 빨강:재고없음, 회색:판매중지). 색상·사이즈에 동일하게 적용(표식 통일). -->
              <span v-if="soldOut(opt, 'color')" class="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded" :style="{ background: strikeColor(opt, 'color') }"></span>
            </button>
            <button
              v-if="hasMoreColors"
              type="button"
              class="ml-auto w-[26px] h-[26px] rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[#666] flex items-center justify-center cursor-pointer hover:border-[#888] hover:bg-[#f0f0f0]"
              :title="`색상 전체 보기 (${colors.length})`"
              :aria-label="`색상 전체 보기 (${colors.length})`"
              aria-haspopup="true"
              :aria-expanded="openPopover === 'color'"
              @click.stop="togglePopover('color')"
            >
              <i class="fas fa-ellipsis-h text-[0.7rem]"></i>
            </button>
          </div>
          <span v-if="selectedColor" class="text-xs text-[#666] ml-0.5">선택: {{ selectedColorOpt?.prodOptNm }}<span v-if="selectedColorOpt && optAdd(selectedColorOpt, 'color') > 0" class="ml-1 font-semibold text-[#c0392b]">+{{ formatPrice(optAdd(selectedColorOpt, 'color')) }}</span></span>
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
                :key="opt.prodOptStdCd ?? opt.prodOptId"
                type="button"
                class="flex items-center gap-2 rounded px-1.5 py-1 text-left text-[13px] text-[#444] bg-transparent border-0 cursor-pointer hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'font-bold bg-[#f4f4f4]': selectedColor === optKey(opt) }"
                :disabled="soldOut(opt, 'color')"
                @click="pickColor(opt)"
              >
                <span
                  class="inline-block w-[20px] h-[20px] shrink-0 rounded-full border-[1.5px] border-black/10 bg-[var(--swatch-color)]"
                  :class="{ '!shadow-[0_0_0_2px_#fff,0_0_0_4px_#bc8246]': selectedColor === optKey(opt) }"
                  :style="{ '--swatch-color': swatchColor(opt) }"
                ></span>
                <span class="truncate" :class="{ 'line-through': soldOut(opt, 'color') }">{{ opt.prodOptNm }}</span>
                <span v-if="soldOut(opt, 'color')" class="shrink-0 text-[11px] font-semibold text-[#c0392b]">{{ stateLabel(opt, 'color') }}</span>
                <span v-else-if="optAdd(opt, 'color') > 0" class="shrink-0 text-[11px] font-semibold text-[#c0392b]">+{{ formatPrice(optAdd(opt, 'color')) }}</span>
              </button>
            </div>
          </div>
        </div>
        <!-- 사이즈 선택 (아래) -->
        <div class="product__modal-input size mb-20 relative after:!hidden">
          <label>
            사이즈<i class="fas fa-star-of-life ml-1"></i>
            <!-- 2026-09-22(요청사항: "사이즈상태도움말 — 좀더 의미있는 아이콘, (?)는 뒤로") — 색상과 같은 뱃지(fa-tag)를 먼저,
                 사이즈 가이드/세계 표준을 보여주는 "?"는 그 뒤로 옮겼다. -->
            <button type="button" class="status-help-badge" aria-label="사이즈 상태 안내" title="사이즈 상태 안내" @click.stop.prevent="sizeStatusHelpRef?.show()"><i class="fas fa-tag text-[9px]"></i></button>
            <button type="button" class="ml-1.5 inline-flex h-[19px] w-[19px] cursor-pointer items-center justify-center rounded-full border border-solid border-[#b8b8b8] bg-white p-0 align-middle text-[11px] font-bold leading-none text-[#666] hover:border-[#bc8246] hover:text-[#bc8246]" aria-label="사이즈 안내" title="사이즈 안내" @click.stop.prevent="sizeGuideRef?.show()">?</button>
          </label>
          <div class="flex flex-wrap items-center gap-2 mt-2.5">
            <span v-if="!sizes.length" class="text-[13px] text-[#aaa]">사이즈 없음</span>
            <button
              v-for="opt in visibleSizes"
              :key="opt.prodOptStdCd ?? opt.prodOptId"
              type="button"
              class="px-4 py-1.5 rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[13px] font-medium text-[#444] cursor-pointer transition-colors tracking-wide hover:border-[#888] hover:bg-[#f0f0f0] hover:text-[#222] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[#d0d0d0] disabled:hover:bg-[#fafafa]"
              :class="{ '!border-[#222] !bg-[#222] !text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]': selectedSize === optKey(opt) }"
              :disabled="soldOut(opt, 'size')"
              @click="selectedSize = optKey(opt)"
            >
              <!-- 2026-09-22(요청사항: "사이즈 아래 판매중지 이런 설명은 안 넣어도 되고 사이즈상태도움말에 표시 — 색상·사이즈 표식 통일") —
                   글자 라벨 대신 색상 스와치와 같은 대각선 표식만(빨강:재고없음, 회색:판매중지). 의미는 위 ⓘ 도움말에서 설명. -->
              <span class="relative inline-flex items-center">
                {{ opt.prodOptNm }}
                <span v-if="soldOut(opt, 'size')" class="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded" :style="{ background: strikeColor(opt, 'size') }"></span>
              </span>
              <span v-if="optAdd(opt, 'size') > 0" class="ml-1 text-[11px] font-semibold" :class="selectedSize === optKey(opt) ? 'text-[#ffd9a0]' : 'text-[#c0392b]'">+{{ formatPrice(optAdd(opt, 'size')) }}</span>
            </button>
            <!-- 2026-09-22(요청사항: "사이즈의 ... 표시 개행되어 보여지면 안 됨") — ml-auto 는 줄이 안 넘칠 때만 오른쪽으로 붙고, 사이즈 칩이 넘쳐 줄바꿈되면
                 혼자 뚝 떨어진 새 줄로 밀려나 어색했다. ml-auto 를 빼서 다른 칩들처럼 바로 이어 붙게 한다. -->
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
                :key="opt.prodOptStdCd ?? opt.prodOptId"
                type="button"
                class="px-4 py-1.5 rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[13px] font-medium text-[#444] cursor-pointer transition-colors tracking-wide hover:border-[#888] hover:bg-[#f0f0f0] hover:text-[#222] disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ '!border-[#222] !bg-[#222] !text-white': selectedSize === optKey(opt) }"
                :disabled="soldOut(opt, 'size')"
                @click="pickSize(opt)"
              >
                <span :class="{ 'line-through': soldOut(opt, 'size') }">{{ opt.prodOptNm }}</span><span v-if="soldOut(opt, 'size')" class="ml-1 text-[11px] font-semibold text-[#c0392b]">{{ stateLabel(opt, 'size') }}</span><span v-else-if="optAdd(opt, 'size') > 0" class="ml-1 text-[11px] font-semibold text-[#c0392b]">+{{ formatPrice(optAdd(opt, 'size')) }}</span>
              </button>
            </div>
          </div>
        </div>
        <size-guide-modal ref="sizeGuideRef" />
        <option-status-help-modal ref="colorStatusHelpRef" title="색상" />
        <option-status-help-modal ref="sizeStatusHelpRef" title="사이즈" />
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
            <!-- 2026-09-22(요청사항: "상품문의하기 링크는 없어도 되") -->
            <button type="button" class="h-12 w-full cursor-pointer rounded-[10px] border-2 border-solid border-[#222] bg-white text-[0.95rem] font-semibold text-[#222] transition-colors hover:bg-[#222] hover:text-white" @click.prevent="handleBuyNow">⚡ 바로구매</button>
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
import { type PdProdType } from "~/types/pd/pdProdType";
import { useCartStore } from "~/store/useCartStore";

import { useWishlistStore } from "~/store/useWishlistStore";
import { prodTypeLabel } from "~/conts/pdConst";
import { prodOptSwatchColor } from "~/utils/prodOptColor";
import SizeGuideModal from "~/components/modals/SizeGuideModal.vue";
import OptionStatusHelpModal from "~/components/modals/OptionStatusHelpModal.vue";

const props = defineProps<{
  item: PdProdType;
  style_2?: boolean;
  /** 상품 상세 페이지 전용 모드 — 유형·카테고리 칩, 찜·공유, 바로구매, 문의하기, 배송 안내를 함께 보여준다(빠른보기 모달은 false) */
  detail?: boolean;
}>();
const emit = defineEmits<{ (e: "inquiry"): void; (e: "color-change", prodOptId: string): void }>();
const state = useCartStore();
const wishlist = useWishlistStore();
const shareTools = useShareTools();
const isWished = computed(() => wishlist.wishlists.some((p) => p.prodId === props.item.prodId));
const prodTypeNm = computed(() => prodTypeLabel(props.item.prodTypeCd));
const isOptionProd = computed(() => props.item.prodTypeCd === "OPTION"); // 옵션상품만 색상/사이즈 선택 영역 표시
const reviewCount = computed(() => props.item.reviews?.length ?? 0);
const filledStars = computed(() => Math.max(0, Math.min(5, Math.round(Number(props.item.rating) || 0))));
const buyEl = ref<HTMLElement | null>(null); // 구매 버튼 영역 — 하단 구매바가 "본문 버튼이 화면 밖으로 나갔는지" 판단하는 기준
const { formatPrice } = usePrice();

const sizeGuideRef = ref<InstanceType<typeof SizeGuideModal> | null>(null);
const colorStatusHelpRef = ref<InstanceType<typeof OptionStatusHelpModal> | null>(null);
const sizeStatusHelpRef = ref<InstanceType<typeof OptionStatusHelpModal> | null>(null);
const selectedColor = ref("");
const selectedSize = ref("");
// 선택한 색상 옵션ID 를 상세 갤러리에 알린다 — 그 색상의 이미지를 먼저 보여주기 위해(선택 해제 시 "")
watch(selectedColor, (key) => emit("color-change", (props.item.prodOpt2List ?? []).find((o) => (o.prodOptStdCd ?? String(o.prodOptId)) === key)?.prodOptId ?? ""));

// ── 옵션 더보기 팝오버 (2026-09-19) ──────────────────────────────────────
type OptionItem = PdProdType["prodOpt2List"][number];
const COLOR_VISIBLE = 8; // 색상표는 이 개수까지만 한 줄에 노출, 넘으면 "…" 팝오버
const SIZE_VISIBLE = 6; // 사이즈 칩도 동일
// 2026-09-22(요청사항: "판매 안하는 색상/사이즈는 안 보여주고, 판매종료·품절은 품절 표시, 추가비용 있으면 표시") — 사용여부 N 인 옵션은 목록에서 뺀다
const colors = computed<OptionItem[]>(() => (props.item.prodOpt2List ?? []).filter((o) => o.useYn !== "N"));
const sizes = computed<OptionItem[]>(() => (props.item.prodOpt1List ?? []).filter((o) => o.useYn !== "N"));
const selectedColorOpt = computed(() => colors.value.find((o) => optKey(o) === selectedColor.value));
const optKey = (o: OptionItem) => o.prodOptStdCd ?? String(o.prodOptId);

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
// prodOpt2List/prodOpt1List 의 prodOptTypeLevel(1|2)로 prodOpt1Id/prodOpt2Id 중 어느 자리와
// 비교해야 하는지 판별한다(상품마다 어느 레벨이 색상/사이즈인지 다를 수 있음).
/** 선택한 색상·사이즈 조합의 추가금액 (사이즈를 고른 뒤에만 — 없으면 0) */
const selectedAddPrice = computed(() => (selectedSize.value ? Number(findMatchedSku()?.addPrice ?? 0) : 0));

type SkuItem = NonNullable<PdProdType["prodSkus"]>[number];
const skuOptOf = (level: number | undefined, s: SkuItem) => (level === 2 ? s.prodOpt2Id : s.prodOpt1Id);

/** 이 옵션(색상/사이즈)의 SKU 들 — 반대편(사이즈↔색상)을 이미 골랐다면 그 조합으로 한정 */
function skusOf(opt: OptionItem, kind: "color" | "size"): SkuItem[] {
  const other = kind === "color" ? sizes.value.find((o) => optKey(o) === selectedSize.value) : selectedColorOpt.value;
  return (props.item.prodSkus ?? []).filter((s) => skuOptOf(opt.prodOptTypeLevel, s) === opt.prodOptId && (!other || skuOptOf(other.prodOptTypeLevel, s) === other.prodOptId));
}
/**
 * 옵션 상태 (2026-09-22 요청사항: "색상을 선택하면 사이즈가 품절 또는 판매중지 여부 표시 — 상품 조회 때 받은 정보로 화면 조작 시 반영")
 *  - "soldout" 품절: 이 옵션(반대편 옵션을 골랐다면 그 조합)의 판매 가능한 SKU 가 전부 재고 0
 *  - "stopped" 판매중지: 판매하는 SKU 가 없다(SKU 가 아예 없거나 전부 useYn=N)
 *  - "" 구매 가능. 상품에 SKU 정보 자체가 없으면 판단하지 않는다.
 */
type OptState = "" | "soldout" | "stopped";
function optState(opt: OptionItem, kind: "color" | "size"): OptState {
  if (!(props.item.prodSkus ?? []).length) return "";
  const skus = skusOf(opt, kind);
  const sellable = skus.filter((s) => s.useYn !== "N");
  if (!sellable.length) return "stopped";
  return sellable.every((s) => s.stockQty != null && s.stockQty <= 0) ? "soldout" : "";
}
const soldOut = (opt: OptionItem, kind: "color" | "size"): boolean => optState(opt, kind) !== "";
const stateLabel = (opt: OptionItem, kind: "color" | "size"): string => (optState(opt, kind) === "stopped" ? "판매중지" : "품절");
// 2026-09-22(요청사항: "색상·사이즈에 판매중지/재고없음 표식 통일") — 대각선 표식 색: 재고없음(soldout)=빨강, 판매중지(stopped)=회색
const strikeColor = (opt: OptionItem, kind: "color" | "size"): string => (optState(opt, kind) === "stopped" ? "#9ca3af" : "#c0392b");
/** 추가금액 — 판매 가능한 SKU 중 가장 낮은 추가금액(없으면 0) */
function optAdd(opt: OptionItem, kind: "color" | "size"): number {
  const adds = skusOf(opt, kind)
    .filter((s) => s.useYn !== "N" && !(s.stockQty != null && s.stockQty <= 0))
    .map((s) => Number(s.addPrice ?? 0));
  return adds.length ? Math.min(...adds) : 0;
}
const optTitle = (opt: OptionItem, kind: "color" | "size") => `${opt.prodOptNm}${soldOut(opt, kind) ? ` (${stateLabel(opt, kind)})` : optAdd(opt, kind) > 0 ? ` (+${formatPrice(optAdd(opt, kind))})` : ""}`;

// 반대편 옵션을 바꿔서 이미 고른 옵션이 품절이 되면 선택을 푼다
watch([selectedColor, selectedSize], () => {
  const c = selectedColorOpt.value;
  if (c && soldOut(c, "color")) selectedColor.value = "";
  const z = sizes.value.find((o) => optKey(o) === selectedSize.value);
  if (z && soldOut(z, "size")) selectedSize.value = "";
});

function findMatchedSku() {
  const skus = props.item.prodSkus ?? [];
  if (!skus.length) return undefined;

  const selectedColorOpt = props.item.prodOpt2List?.find((o) => (o.prodOptStdCd ?? String(o.prodOptId)) === selectedColor.value);
  const selectedSizeOpt = props.item.prodOpt1List?.find((o) => (o.prodOptStdCd ?? String(o.prodOptId)) === selectedSize.value);

  const matchesLevel = (skuOpt1?: string | null, skuOpt2?: string | null, opt?: typeof selectedColorOpt) => {
    if (!opt) return true; // 이 슬롯에 해당하는 옵션 선택이 없으면(옵션 자체가 없는 상품) 통과
    const skuOptId = opt.prodOptTypeLevel === 2 ? skuOpt2 : skuOpt1;
    return skuOptId === opt.prodOptId;
  };

  return skus.find((s) => matchesLevel(s.prodOpt1Id, s.prodOpt2Id, selectedColorOpt) && matchesLevel(s.prodOpt1Id, s.prodOpt2Id, selectedSizeOpt));
}

/** 옵션(사이즈)·SKU·재고를 검증하고 담을 SKU 를 돌려준다. 실패하면 토스트를 띄우고 null. (장바구니 담기/바로구매 공통) */
function resolveSelection(): { prodSkuId?: string } | null {
  if (isOptionProd.value && colors.value.length && !selectedColor.value) {
    useNuxtApp().$toast.error("색상을 선택해주세요.");
    return null;
  }
  if (isOptionProd.value && sizes.value.length && !selectedSize.value) {
    useNuxtApp().$toast.error("사이즈를 선택해주세요.");
    return null;
  }
  const matchedSku = findMatchedSku();
  if (props.item.prodSkus?.length && !matchedSku) {
    // 화면에서는 이런 조합이 "판매중지"로 표시되지만, 표시 전에 눌렀거나 상품 데이터가 어긋난 경우의 안전장치
    useNuxtApp().$toast.error("선택한 옵션 조합은 현재 판매하지 않습니다(판매중지).");
    return null;
  }
  if (matchedSku?.useYn === "N") {
    useNuxtApp().$toast.error("선택한 옵션은 판매가 중지되었습니다.");
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

const swatchColor = (opt: OptionItem) => prodOptSwatchColor(opt.prodOptStdCd);
</script>

<style scoped>
/* 2026-09-22(요청사항: "색상/사이즈 상태 도움말 아이콘 — 사이즈의 '?'와는 다른 뱃지로") — 사이즈 가이드의 흰 바탕 외곽선 "?" 원과
   구분되도록 채워진 테마색 원 + i 아이콘으로 만든다. */
.status-help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  margin-left: 5px;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  background: #bc8246;
  color: #fff;
  cursor: pointer;
  vertical-align: middle;
  transition: background-color 0.15s;
}
.status-help-badge:hover {
  background: #a06a35;
}
</style>
