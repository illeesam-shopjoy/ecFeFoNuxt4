<template>
  <div :class="`banner__area ${style_2 ? 'pt-95' : ''} ${style_3 ? 'pt-20' : ''} ${style_4 ? 'pt-30' : ''}`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div :class="`container mx-auto ${style_3 ? 'custom-container' : ''}`">
      <div :class="`${style_2 ? '' : !style_3 && !style_4 && 'banner__inner relative mt--95'} ${style_4 ? 'banner__inner-2 relative' : ''}`">
        <div class="row flex justify-center">
          <div v-for="item in categoryItems" :key="item.categoryId" class="col-xl-4 col-lg-4 col-md-6">
            <div class="banner__item mb-30 relative">
              <div class="banner__thumb fix">
                <nuxt-link href="/shop" class="w-img">
                  <!-- 2026-09-13(요청사항: "height 우측에 보이것만큼 줄여줘" → 이후 "좀더 늘려줘")
                       4/3→2/1로 낮췄더니 이번엔 너무 납작해져서 3/2로 절충. -->
                  <app-image
                    :src="item.img"
                    alt="banner"
                    wrap-class="w-img"
                    :skeleton-style="{ width: '100%', aspectRatio: '3/2' }"
                  />
                </nuxt-link>
              </div>
              <!-- 2026-09-13(요청사항: "코멘트가 좌측정렬되어야 해") — banner__content--center는
                   중앙 정렬 모디파이어라 데모(좌측 정렬)와 달랐다. 기본 banner__content가 이미
                   좌측 정렬로 설계돼 있어 그대로 사용. -->
              <div class="banner__content absolute transition-3">
                <h5>
                  <nuxt-link href="/shop">
                    <span v-html="item.parentTitle"></span>
                  </nuxt-link>
                </h5>
                <nuxt-link href="/shop" class="link-btn">둘러보기</nuxt-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('카테고리');
import { computed } from "vue";
import AppImage from "~/components/ui/AppImage.vue";
import { pdCategorySvc, type CategoryTreeResponse } from "~/svc/fo/ec/pd/pdCategorySvc";

defineProps({
  style_2: { type: Boolean, default: false },
  style_3: { type: Boolean, default: false },
  style_4: { type: Boolean, default: false },
});

// 2026-09-13(성능 개선): lazy:true — 화면 마운트를 블로킹하지 않고 카테고리 로드 완료 시
// categoryItems(computed)가 자동 갱신된다. default 폴백이 있어 로딩 중엔 빈 배열로 안전하게 렌더.
const { data: catData } = useAsyncData<CategoryTreeResponse>(
  "category-tree",
  () => pdCategorySvc.getCategoryTree(),
  { default: () => ({ categoryTree: [], categoryIdToName: {} }), lazy: true }
);

const categoryItems = computed(() => (catData.value?.categoryTree ?? []).slice(0, 3));
</script>
