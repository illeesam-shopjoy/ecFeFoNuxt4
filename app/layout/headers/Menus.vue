<template>
  <ul>
    <li v-for="item in menus" :key="item.menuId" :class="`${item.hasDropdown && !item.megamenu ? 'active has-dropdown' : item.megamenu && 'mega-menu has-dropdown'}`">
      <nuxt-link :to="`${item.link}`">{{ item.title }}</nuxt-link>

      <ul v-if="item?.hasDropdown && !item.megamenu" class="submenu transition-3">
        <li v-for="(menu, index) in item.dropdownItems" :key="index">
          <nuxt-link :to="`${menu.link}`">{{ menu.title }}</nuxt-link>
        </li>
      </ul>

      <ul v-if="item.hasDropdown && item.megamenu" class="submenu transition-3" :style="{ backgroundImage: `url(${BG})` }">
        <li v-for="(m_mnu, index) in item.dropdownItems" :key="index" class="has-dropdown">
          <nuxt-link :to="`${m_mnu.link}`">{{ m_mnu.title }}</nuxt-link>
          <ul>
            <li v-for="(m, index) in m_mnu.dropdownMenu" :key="index">
              <nuxt-link :to="`${m.link}`">{{ m.title }}</nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { CDN_URL } from "~/conts/baseConst";
import { STATIC_MENUS } from "~/conts/foMenus";

const BG = `${CDN_URL}/cdn/prod/img/bg/mega-menu-bg.jpg`;

// 2026-09-20: 메뉴는 정적 데이터라 API(/api/fo/menu) 없이 상수(conts/foMenus.ts)를 그대로 쓴다.
const menus = STATIC_MENUS;
</script>
