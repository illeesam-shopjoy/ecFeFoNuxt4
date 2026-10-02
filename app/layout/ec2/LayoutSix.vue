<template>
  <div>
    <header-three />
    <slot></slot>
    <Footer />
    <back-to-top />
  </div>
</template>

<script setup lang="ts">
import HeaderThree from "./headers/HeaderThree.vue";
import Footer from "./footers/Footer.vue";
import BackToTop from "~/components/ec2/back-to-top/BackToTop.vue";
</script>
