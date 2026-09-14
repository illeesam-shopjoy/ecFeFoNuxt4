<template>
  <Teleport to="body">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-14(요청사항: "상세보기시 부모화면의 최상단이 위로 보여 모달에서는 모달이
         최상위가 되어야 해") — 헤더의 스크롤 고정용 .sticky 클래스가 z-index:999(!important,
         _header.scss)라 기존 z-50/z-[100]보다 높아, 모달이 떠 있는 동안 뒤 페이지가 스크롤돼
         헤더가 sticky로 전환되면 헤더가 모달 위로 올라와 보였다. z-[1000]으로 항상 헤더보다
         위에 오도록 하고, 아예 모달이 열려있는 동안 배경 스크롤 자체를 막아(아래 lockScroll)
         헤더가 sticky로 전환될 일이 없게 한다. -->
    <div v-show="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50" :id="`${list ? `productModalListId-${item.prodId}` : `productModalId-${item.prodId}`}`" role="dialog" aria-hidden="true" @click.self="close">
      <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto product-modal rounded-lg bg-white shadow-xl">
        <!-- 2026-09-14(요청사항: "마우스스크롤 아래로내리면 최상단 [X] 버튼도 숨겨지는데
             [X] 버튼란은 고정으로 있어야 해") — 기존엔 이 absolute 닫기버튼이 overflow-y-auto인
             바로 위 스크롤 컨테이너 안 콘텐츠로 취급돼 스크롤과 함께 같이 흘러가버렸다.
             높이 0짜리 sticky 래퍼로 감싸 레이아웃엔 영향 없이 스크롤 컨테이너 상단에 고정시킨다. -->
        <div class="sticky top-0 z-20 h-0">
          <div class="product__modal-close absolute top-4 right-4">
            <button type="button" @click="close" class="p-2 rounded bg-white/80 backdrop-blur-sm shadow hover:bg-gray-100"><i class="fal fa-times"></i></button>
          </div>
        </div>
        <div class="product__modal-wrapper relative p-6">
          <div class="product__modal-inner">
            <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — modal-grid를
                 Tailwind로 대체(sm: 브레이크포인트가 640px로 기존 미디어쿼리와 정확히 일치). -->
            <div class="grid grid-cols-1 sm:grid-cols-[5fr_7fr] gap-6">
              <div>
                <div class="product__modal-box">
                  <div class="mb-5" id="nav-tabContent">
                    <div class="product__modal-img w-img">
                      <app-image :src="active_img" alt="product_img" wrap-class="w-img" :skeleton-style="{ width: '100%', aspectRatio: '1/1' }" />
                    </div>
                  </div>
                  <nav>
                    <div class="flex justify-between gap-2 flex-wrap">
                      <button v-for="(img, i) in item.relatedImages || []" :key="i" :class="`p-1 border rounded ${img === active_img ? 'border-theme ring-1 ring-theme' : 'border-gray-200'}`" @click="handleActiveImg(img)">
                        <app-image :src="img" alt="image" :img-style="{ width: '90px', height: '90px', objectFit: 'cover' }" :skeleton-style="{ width: '90px', height: '90px' }" />
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
              <div style="min-width: 0;">
                <product-details-content :item="item" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('상품 모달');
import { ref, watch, onBeforeUnmount } from "vue";
import ProductDetailsContent from "~/components/shop-details/ProductDetailsContent.vue";
import { type PdProductType } from "~/types/pdProductType";
import AppImage from "~/components/ui/AppImage.vue";

const props = defineProps<{
  item: PdProductType;
  list?: boolean;
}>();
const visible = ref(false);
const active_img = ref(props.item.img);
watch(() => props.item.img, (v) => { active_img.value = v; });

function handleActiveImg(img: string) {
  active_img.value = img;
}
// 2026-09-14(요청사항: "상세보기시 부모화면의 최상단이 위로 보여 모달에서는 모달이
// 최상위가 되어야 해") — 모달이 열려있는 동안 배경(body) 자체가 스크롤되지 않게 막는다.
// 배경이 스크롤되면 헤더의 스크롤 고정 기능(Header.vue isSticky)이 켜져 z-index:999로
// 모달(z-[1000]) 밑에서 위로 올라와 보이는 게 근본 원인이라, 아예 배경 스크롤을 없애 둘 다
// 예방한다.
function lockScroll() {
  if (typeof document !== "undefined") document.body.style.overflow = "hidden";
}
function unlockScroll() {
  if (typeof document !== "undefined") document.body.style.overflow = "";
}
function show() {
  active_img.value = props.item.img;
  visible.value = true;
  lockScroll();
}
function close() {
  visible.value = false;
  unlockScroll();
}
onBeforeUnmount(unlockScroll);
defineExpose({ show, close });
</script>
