<template>
  <div :class="`product__modal-content ${style_2 ? 'product__modal-content-2' : ''}`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <h4>
      <nuxt-link :to="`/prod-dtl/${item.prodId}`">
        <span v-html="item.prodNm"></span>
      </nuxt-link>
    </h4>
    <div class="rating rating-shop mb-15">
      <ul>
        <li>
          <span><i class="fas fa-star"></i></span>
        </li>
        <li>
          <span><i class="fas fa-star"></i></span>
        </li>
        <li>
          <span><i class="fas fa-star"></i></span>
        </li>
        <li>
          <span><i class="fas fa-star"></i></span>
        </li>
        <li>
          <span><i class="fal fa-star"></i></span>
        </li>
      </ul>
      <span class="rating-no ml-10"> {{ item.rating }}개 평점 </span>
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
             인라인 :style은 유지하고, 소비하는 쪽만 bg-[var(--swatch-color)]로 바꿈. -->
        <div class="product__modal-input color mb-20">
          <label>색상 선택</label>
          <div class="flex flex-wrap gap-2.5 mt-2.5 mb-2">
            <button
              v-for="opt in item.optionColors"
              :key="opt.optionCode ?? opt.optionId"
              type="button"
              :title="opt.optionNm"
              class="relative w-[26px] h-[26px] rounded-full border-[1.5px] border-black/10 cursor-pointer bg-[var(--swatch-color)] shadow-[0_1px_3px_rgba(0,0,0,0.14)] transition-[transform,box-shadow] duration-150 hover:scale-110 hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
              :class="{ 'scale-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#555,0_2px_6px_rgba(0,0,0,0.2)]': selectedColor === (opt.optionCode ?? String(opt.optionId)) }"
              :style="{ '--swatch-color': colorMap[opt.optionCode ?? ''] ?? '#ccc' }"
              @click="selectedColor = opt.optionCode ?? String(opt.optionId)"
            ></button>
          </div>
          <span v-if="selectedColor" class="text-xs text-[#666] ml-0.5">선택: {{ item.optionColors.find((o) => (o.optionCode ?? String(o.optionId)) === selectedColor)?.optionNm }}</span>
        </div>
        <!-- 사이즈 선택 (아래) -->
        <div class="product__modal-input size mb-20">
          <label>사이즈 <i class="fas fa-star-of-life"></i></label>
          <div class="flex flex-wrap gap-2 mt-2.5">
            <span v-if="!item.optionSizes?.length" class="text-[13px] text-[#aaa]">사이즈 없음</span>
            <button
              v-for="opt in item.optionSizes"
              :key="opt.optionCode ?? opt.optionId"
              type="button"
              class="px-4 py-1.5 rounded-full border-[1.5px] border-[#d0d0d0] bg-[#fafafa] text-[13px] font-medium text-[#444] cursor-pointer transition-colors tracking-wide hover:border-[#888] hover:bg-[#f0f0f0] hover:text-[#222]"
              :class="{ '!border-[#222] !bg-[#222] !text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]': selectedSize === (opt.optionCode ?? String(opt.optionId)) }"
              @click="selectedSize = opt.optionCode ?? String(opt.optionId)"
            >
              {{ opt.optionNm }}
            </button>
          </div>
        </div>
        <div class="product__modal-required mb-5">
          <span>필수 입력 항목 *</span>
        </div>
        <!-- 2026-09-13(요청사항: "모바일로 보기에서 [장바구니추가] 버튼이 커서 우측에 숨겨진거 같아") —
             기존 flex-nowrap이 좁은 화면에서도 한 줄을 강제해 버튼이 화면 밖으로 밀려나갔다.
             좁은 화면(max-sm)에서는 줄바꿈을 허용하고 버튼은 다음 줄에서 꽉 채워 보이게 한다. -->
        <div class="pro-quan-area flex flex-wrap items-center gap-3">
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
import { ref } from "vue";
import { type PdProductType } from "~/types/pdProductType";
import { useCartStore } from "~/store/useCartStore";

const props = defineProps<{
  item: PdProductType;
  style_2?: boolean;
}>();
const state = useCartStore();
const { formatPrice } = usePrice();

const selectedColor = ref("");
const selectedSize = ref("");

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

function handleAddToCart() {
  if (props.item.optionSizes?.length && !selectedSize.value) {
    useNuxtApp().$toast.error("사이즈를 선택해주세요.");
    return;
  }
  const matchedSku = findMatchedSku();
  if (props.item.prodSkus?.length && !matchedSku) {
    useNuxtApp().$toast.error("선택한 옵션 조합의 재고 정보를 찾을 수 없습니다.");
    return;
  }
  if (matchedSku?.stockQty != null && matchedSku.stockQty <= 0) {
    useNuxtApp().$toast.error("선택한 옵션은 품절되었습니다.");
    return;
  }
  state.addStCartProduct(props.item, matchedSku?.prodSkuId);
}

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
};
</script>

