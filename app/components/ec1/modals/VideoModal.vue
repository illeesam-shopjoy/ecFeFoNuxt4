<template>
  <div id="video-overlay" class="video-overlay" @click="closeVideo">
    <xdev-file-path-badge file-path="app/components/modals/VideoModal.vue" :absolute="true" />
    <a class="video-overlay-close" @click.prevent="closeVideo">x</a>
  </div>
</template>

<script setup lang="ts">
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('동영상 모달');

// 2026-09-14 버그수정(요청사항: "영상 라이트박스 플레이되도록 확인하여 수정해줘") —
// 이 컴포넌트는 원래 <script setup>(useComponentTitle용) + 별도 Options API <script>
// (playVideo/closeVideo가 methods로 정의됨) 두 블록을 같이 쓰고 있었다. 그런데 SFC에
// <script setup>이 있으면 컴포넌트 public 인스턴스는 기본적으로 "닫힘" 상태가 되어
// defineExpose()로 명시한 것만 부모의 ref로 접근 가능해진다 — Options API의 methods는
// defineExpose 대상이 아니라서 실제로는 노출되지 않았고, home-7.vue의
// video_modal.value?.playVideo()가 playVideo가 undefined인 채로 호출되며 조용히
// TypeError를 던지고 있었다(콘솔에만 에러가 찍히고 화면상 재생 버튼은 아무 반응 없음).
// 전부 <script setup>으로 통합하고 defineExpose로 명시 노출.
const props = withDefaults(defineProps<{ videoUrl?: string }>(), {
  videoUrl: "https://www.youtube.com/embed/EW4ZYb3mCZk",
});

function playVideo() {
  const videoOverlay = document.querySelector("#video-overlay");
  if (!videoOverlay) return;
  // 이미 열려있는 iframe이 있으면(연타 등) 새로 만들지 않고 재사용 — 예전엔 클릭할 때마다
  // 새 iframe을 계속 추가해 쌓이는 문제도 있었다.
  let iframeElement = videoOverlay.querySelector("iframe");
  if (!iframeElement) {
    iframeElement = document.createElement("iframe");
    iframeElement.style.width = "60%";
    iframeElement.style.height = "80%";
    iframeElement.setAttribute("allow", "autoplay; encrypted-media");
    iframeElement.setAttribute("allowfullscreen", "true");
    videoOverlay.appendChild(iframeElement);
  }
  iframeElement.setAttribute("src", props.videoUrl);
  videoOverlay.classList.add("open");
}
function closeVideo() {
  const videoOverlay = document.querySelector("#video-overlay.open");
  const iframeElement = document.querySelector("#video-overlay.open iframe");
  videoOverlay?.classList.remove("open");
  iframeElement?.remove();
}
defineExpose({ playVideo, closeVideo });
</script>
