<template>
  <div>
    <Header :transparent="transparent" :white_bg="white_bg" />
    <slot></slot>
    <Footer />
    <back-to-top />
    <chat-widget />
  </div>
</template>

<script setup lang="ts">
import Header from "./headers/Header.vue";
import Footer from "./footers/Footer.vue";
import BackToTop from "~/components/back-to-top/BackToTop.vue";
import ChatWidget from "~/components/chat/ChatWidget.vue";

defineProps({
  transparent: { type: Boolean, default: false },
  white_bg: { type: Boolean, default: false },
});
</script>
