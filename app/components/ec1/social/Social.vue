<template>
  <li v-for="(item, i) in social_links" :key="i">
    <xdev-file-path-badge file-path="app/components/social/Social.vue" :absolute="true" />
    <a :href="item.link" :target="item.target" :style="colored ? { color: item.color } : undefined">
      <i :class="item.icon"></i>
    </a>
  </li>
</template>

<script setup lang="ts">
import { useComponentTitle } from "~/composables/useComponentTitle";
// colored: 각 SNS 브랜드 색으로 표시(2026-09-20 요청: 문의하기 좌측 하단 링크를 해당 링크 컬러로)
defineProps<{ colored?: boolean }>();
useComponentTitle('소셜 링크');
</script>

<script lang="ts">
export default {
  data() {
    return {
      social_links: [
        {
          link: "http://facebook.com",
          target: "_blank",
          icon: "fab fa-facebook-f",
          name: "Facebook",
          color: "#1877f2",
        },
        {
          link: "http://twitter.com",
          target: "_blank",
          icon: "fab fa-twitter",
          name: "Twitter",
          color: "#1da1f2",
        },
        {
          link: "https://www.behance.net/",
          target: "_blank",
          icon: "fab fa-behance",
          name: "Behance",
          color: "#1769ff",
        },
        {
          link: "https://dribbble.com/",
          target: "_blank",
          icon: "fab fa-dribbble",
          name: "Dribbble",
          color: "#ea4c89",
        },
      ],
    };
  },
};
</script>
