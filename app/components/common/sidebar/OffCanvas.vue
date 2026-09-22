<template>
  <section :class="`extra__info transition-3 ${showSidebar ? 'info-opened' : ''}`">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <div class="extra__info-inner">
      <div class="extra__info-close text-end" @click="showSidebar = false">
        <a @click.prevent="showSidebar = false" href="#" class="extra__info-close-btn">
          <i class="fal fa-times"></i>
        </a>
      </div>

      <!-- 모바일 사이드 메뉴 시작 -->
      <!-- 2026-09-22(요청사항: "전체 펼치기 할때 제일 아래 넘어가는데 스크롤 나오게") — 패널 자체(.extra__info-inner)는 overflow-y:auto 로 바꿨지만(SCSS),
           그 안의 로고/메뉴/닫기버튼이 전부 한 흐름이라 메뉴만 스크롤되게 이 nav 에 자체 스크롤 영역을 둔다. -->
      <nav class="side-mobile-menu block lg:hidden mm-menu max-h-[calc(100vh-90px)] overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]">
        <!-- 2026-09-22(요청사항: "전체 펼치기 버튼") — 서브메뉴가 있는 메뉴를 한 번에 펼치거나 접는다 -->
        <div class="mb-2 flex justify-end">
          <button type="button" class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-[#d8dce2] bg-white px-3.5 py-1.5 text-[0.8rem] font-semibold text-gray-600 hover:border-[#bc8246] hover:text-[#bc8246]" @click="toggleAll">
            <i class="fas text-[0.7rem]" :class="allOpen ? 'fa-angle-double-up' : 'fa-angle-double-down'"></i>{{ allOpen ? "전체 접기" : "전체 펼치기" }}
          </button>
        </div>
        <ul>
          <template v-for="(menu, i) in mobile_menus" :key="i">
            <li
              v-if="menu.dropdownMenu"
              :class="`menu-item-has-children has-droupdown
              ${isOpen(menu.title) ? 'active' : ''}`"
            >
              <a @click.prevent="handleOpenMenu(menu.title)">
                {{ menu.title }}
              </a>
              <ul @click.prevent="showSidebar = false" :class="`sub-menu ${isOpen(menu.title) ? 'active' : ''}`">
                <li v-for="(sub_m, index) in menu.dropdownMenu" :key="index">
                  <nuxt-link :to="`${sub_m.link}`">
                    {{ sub_m.title }}
                  </nuxt-link>
                </li>
              </ul>
            </li>

            <li v-if="!menu.dropdownMenu">
              <nuxt-link :to="`${menu.link}`">{{ menu.title }}</nuxt-link>
            </li>
          </template>
        </ul>
      </nav>
      <!-- 모바일 사이드 메뉴 끝 -->
    </div>
  </section>

  <!--  body overlay  -->
  <div @click="showSidebar = false" :class="`body-overlay transition-3 ${showSidebar ? 'opened' : ''}`"></div>
</template>

<script setup lang="ts">
import type { SyMenuMobileType } from "~/types/sy/syMenuMobileType";

import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('오프캔버스 메뉴');
import { ref } from "vue";
import { STATIC_MENUS } from "~/conts/foMenus";

// 2026-09-22(요청사항: "1레벨 메뉴를 클릭하면 첫번째 메뉴 오픈하면되") — 평소엔 아코디언(한 번에 하나만 펼침).
// "전체 펼치기" 버튼을 누르면 전부 펼쳐 한눈에 보여주고(allOpen), 그 상태에서 메뉴를 다시 클릭하면 아코디언 모드로 돌아간다.
const openTitle = ref<string | null>(null);
const allOpen = ref(false);
const showSidebar = ref(false);
const isOpen = (title: string) => allOpen.value || openTitle.value === title;
// 상단 메뉴(STATIC_MENUS)와 같은 목록을 쓴다 — 메뉴가 추가/삭제돼도 모바일 메뉴가 어긋나지 않게(고객센터 누락 방지).
// 메가메뉴의 그룹(쇼핑 레이아웃/상품·주문 등)은 모바일에서 한 단계로 펼쳐 보여준다.
const mobile_menus: SyMenuMobileType[] = STATIC_MENUS.map((m) => {
  const subs = (m.dropdownItems ?? []).flatMap((it) => (it.dropdownMenu?.length ? it.dropdownMenu : [it]));
  const seen = new Set<string>();
  const dropdownMenu = subs
    .map((it) => ({ link: it.link, title: it.title }))
    .filter((it) => (seen.has(it.link + it.title) ? false : (seen.add(it.link + it.title), true)));
  return dropdownMenu.length ? { title: m.title, dropdown: true, dropdownMenu } : { title: m.title, link: m.link, dropdown: false };
});

function OpenOffcanvas() {
  showSidebar.value = true;
}
function handleOpenMenu(navTitle: string) {
  const wasOpen = isOpen(navTitle);
  allOpen.value = false; // 개별 클릭은 항상 아코디언 모드로
  openTitle.value = wasOpen ? null : navTitle;
}
function toggleAll() {
  allOpen.value = !allOpen.value;
  if (!allOpen.value) openTitle.value = null; // 전체 접기 — 아무것도 안 펼친 상태로
}
defineExpose({ OpenOffcanvas });
</script>
