<template>
  <Teleport to="body">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 2026-09-14(요청사항: "상세보기시 부모화면의 최상단이 위로 보여 모달에서는 모달이
         최상위가 되어야 해") — 헤더의 스크롤 고정용 .sticky 클래스가 z-index:999(!important,
         _header.scss)라 기존 z-50/z-[100]보다 높아, 모달이 떠 있는 동안 뒤 페이지가 스크롤돼
         헤더가 sticky로 전환되면 헤더가 모달 위로 올라와 보였다. z-[1000]으로 항상 헤더보다
         위에 오도록 하고, 아예 모달이 열려있는 동안 배경 스크롤 자체를 막는다(전역
         modal-scroll-lock.client.ts 플러그인이 이 role="dialog"를 감시해 처리). -->
    <!-- 2026-09-22(요청사항: "단품 클릭 후 옵션상품 클릭하면 ... 왜 이리 차이가 나?") — 목록 카드마다 이 모달이 하나씩
         v-show로 항상 마운트돼 있어, 실제로 한 번도 열지 않아도 안의 ProductDetailsContent(색상/사이즈 선택기 등,
         옵션상품일수록 훨씬 무겁다)까지 카드 수만큼 숨겨진 채 렌더링되고 있었다. 필터를 바꿔 카드 목록이 통째로
         교체될 때마다 그 무게가 그대로 다시 만들어져 저성능 모바일에서 특히 크게 느려졌다. exit 트랜지션이 없어
         v-if로 바꿔도 안전하다 — 실제로 빠른보기를 연 적 있는 카드만 DOM에 만들어진다. -->
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#1a1410]/55 backdrop-blur-[2px]" :id="`${list ? `productModalListId-${item.prodId}` : `productModalId-${item.prodId}`}`" role="dialog" aria-hidden="true" @click.self="close">
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
import { ref, watch } from "vue";
import ProductDetailsContent from "~/components/shop-details/ProductDetailsContent.vue";
import { type PdProdType } from "~/types/pd/pdProdType";
import AppImage from "~/components/ui/AppImage.vue";

const props = defineProps<{
  item: PdProdType;
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
// 2026-09-22 버그수정(요청사항: "상품상세 탭이 고정 안되는게 있던데") — 여기서 직접
// body.style.overflow를 잠그던 코드가, 같은 날 추가된 전역 modal-scroll-lock.client.ts
// 플러그인(role="dialog"인 이 모달도 감시 대상)의 "열기 전 원래 값 저장" 시점과 경쟁해
// 잘못된 값("hidden")을 원래값으로 저장하게 만들었다 — 이 모달을 닫아도 plugin이 body를
// "hidden"으로 복원해버려, 이후 페이지의 position:sticky(상품상세 탭 등)가 영구히 깨졌다.
// 이제 body 잠금은 그 플러그인 하나만 담당한다(이 role="dialog" 엘리먼트를 자동으로 감시함).
function show() {
  active_img.value = props.item.img;
  visible.value = true;
}
function close() {
  visible.value = false;
}
defineExpose({ show, close });
</script>
