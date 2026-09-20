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
      <nav class="side-mobile-menu block lg:hidden mm-menu">
        <ul>
          <template v-for="(menu, i) in mobile_menus" :key="i">
            <li
              v-if="menu.dropdownMenu"
              :class="`menu-item-has-children has-droupdown
              ${activeMenu === menu.title ? 'active' : ''}`"
            >
              <a @click.prevent="handleOpenMenu(menu.title)">
                {{ menu.title }}
              </a>
              <ul @click.prevent="showSidebar = false" :class="`sub-menu ${activeMenu === menu.title ? 'active' : ''}`">
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

const activeMenu = ref("");
const showSidebar = ref(false);
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
  if (navTitle === activeMenu.value) {
    activeMenu.value = "";
  } else {
    activeMenu.value = navTitle;
  }
}
defineExpose({ OpenOffcanvas });
</script>
