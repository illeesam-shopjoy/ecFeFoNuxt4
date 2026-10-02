<template>
  <div>
    <Header :transparent="transparent" :white_bg="white_bg" />
    <slot></slot>
    <Footer />
    <back-to-top />
    <!-- 2026-09-28(성능 개선): 채팅 위젯은 무거워서(SSE·SMS 인증 포함) 첫 화면 번들에서 분리 — 브라우저에서만 지연 로드 -->
    <client-only><chat-widget /></client-only>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import Header from "./headers/Header.vue";
import Footer from "./footers/Footer.vue";
import BackToTop from "~/components/ec2/back-to-top/BackToTop.vue";

const ChatWidget = defineAsyncComponent(() => import("~/components/ec2/chat/ChatWidget.vue"));

defineProps({
  transparent: { type: Boolean, default: false },
  white_bg: { type: Boolean, default: false },
});
</script>
