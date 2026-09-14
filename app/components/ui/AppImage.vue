<template>
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — app-image-* 커스텀 클래스를
       Tailwind로 대체(.app-image-wrap > img 자식결합자는 <img>에 기본 클래스를 직접 부여하는
       방식으로 대체). shimmer 애니메이션은 tailwind.config.ts의 animate-shimmer 재사용. -->
  <div :class="['relative block overflow-hidden', wrapClass]" :style="[wrapStyle, containerAspectStyle]">
    <xdev-file-path-badge :file-path="currentFilePath" :absolute="true" />
    <!-- 스켈레톤 (로딩 중) -->
    <div v-if="loading" class="absolute inset-0 rounded animate-shimmer bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%]" :style="skeletonStyle" />

    <!-- 실제 이미지 -->
    <!-- 2026-09-13: <img>가 width:100%(.w-img)만 상속하고 height/object-fit이 없어서 래퍼 박스를
         못 채우던 문제 — 기본으로 박스를 꽉 채우게 한다. 호출측이 imgStyle로 직접 objectFit 등을
         지정하면 인라인 스타일이라 이 기본 클래스보다 항상 우선한다(안전). -->
    <img
      ref="imgRef"
      v-show="!loading"
      :src="currentSrc"
      :alt="alt"
      :class="['w-full h-full object-cover block', imgClass]"
      :style="imgStyle"
      :loading="imgLoading"
      decoding="async"
      v-bind="$attrs"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
const currentFilePath = useCurrentFilePath();
import { useComponentTitle } from "~/composables/useComponentTitle";
useComponentTitle('이미지');
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// noImage 폴백 SVG (인라인 data URI)
// 2026-09-15(요청사항: "이미지 없음 너무 길쭉한 이미지야 이쁜 동그란 이미지, 정사각형
// 이미지면 좋겠어") — 기존 400x300(4:3) 비율이라 프로필 아바타처럼 동그랗게/정사각형으로
// 잘라 쓰는 자리에서 원본 비율이 뒤틀려 보였다. 1:1 정사각형 viewBox로 바꿔 어떤 크롭
// (원형/정사각형)에도 어색하지 않게 함.
const NO_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3Crect x='90' y='105' width='120' height='90' rx='8' fill='none' stroke='%23ccc' stroke-width='3'/%3E%3Ccircle cx='118' cy='132' r='9' fill='%23ccc'/%3E%3Cpath d='M95 190 l35-35 l25 25 l20-15 l45 40' fill='none' stroke='%23ccc' stroke-width='3'/%3E%3Ctext x='50%25' y='228' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%23aaa'%3E이미지 없음%3C/text%3E%3C/svg%3E`;

interface Props {
  src?: string | null;
  alt?: string;
  wrapClass?: string;
  wrapStyle?: Record<string, string> | string;
  imgClass?: string;
  imgStyle?: Record<string, string> | string;
  skeletonStyle?: Record<string, string> | string;
  /** 스켈레톤 표시 여부를 외부에서 강제로 지정 (미지정시 자체 로딩상태 사용) */
  showSkeleton?: boolean;
  /** 2026-09-15(요청사항: "성능을 저해하는 환경적인 요소가 있으면 적극적으로 수정해줘") —
   * 이 컴포넌트가 사이트 전체 이미지(상품카드 등 30여 곳)의 유일한 통로인데 지금까지
   * <img loading> 속성이 없어 화면 밖 이미지까지 전부 즉시 로드되고 있었다 — 기본을 "lazy"로
   * 바꾸고, 히어로 배너처럼 최초 화면에 바로 보여야 하는 이미지만 호출측에서 "eager"로 넘기면 됨.
   * 내부 로딩상태(스켈레톤용) ref가 이미 `loading`이라는 이름을 쓰고 있어(아래 script) 이름
   * 충돌을 피하려고 브라우저 속성명과 다르게 imgLoading으로 둔다. */
  imgLoading?: "lazy" | "eager";
}

const props = withDefaults(defineProps<Props>(), {
  alt: "이미지",
  wrapClass: "",
  imgLoading: "lazy",
});

// 2026-09-13(요청사항: "상품항목별 이미지란도 약간 크게 해줘") — skeletonStyle의 aspectRatio는
// 로딩 중 스켈레톤 DIV에만 적용되고 실제 <img>/래퍼에는 안 걸려 있었다. 이미지가 로드되면
// 래퍼가 이미지의 원본 비율로 줄어들고(<img>는 width:100%만 있고 height/object-fit이 없어서),
// 그 결과 카드마다 이미지 영역 크기가 들쭉날쭉하고 대체로 데모보다 작아 보였다 — skeletonStyle의
// aspectRatio를 래퍼에도 그대로 유지시켜 로드 후에도 박스 크기가 안 바뀌게 하고, 아래
// object-fit:cover로 그 박스를 항상 꽉 채우게 한다.
const containerAspectStyle = computed(() => {
  const s = props.skeletonStyle;
  if (s && typeof s === "object" && "aspectRatio" in s) {
    return { aspectRatio: (s as Record<string, string>).aspectRatio };
  }
  return {};
});

const imgRef = ref<HTMLImageElement | null>(null);
const loading = ref(true);
const currentSrc = ref(props.src || NO_IMAGE_SVG);

// 2026-09-15(요청사항: "블로그 글등 계속 진행중으로 표시되는경우가 있는데 어느정도
// 시간지나면 default 정보로 표시해줘") — CDN 이미지가 응답이 없거나(네트워크 문제 등)
// load/error 이벤트가 끝내 안 오면 스켈레톤(로딩중 표시)이 무한정 떠 있었다. 일정 시간
// (8초) 안에 결판이 안 나면 실패로 간주하고 기본(이미지 없음) 표시로 넘어간다.
const LOAD_TIMEOUT_MS = 8000;
let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;
function clearLoadTimeout() {
  if (loadTimeoutId) {
    clearTimeout(loadTimeoutId);
    loadTimeoutId = null;
  }
}
function armLoadTimeout() {
  clearLoadTimeout();
  if (currentSrc.value === NO_IMAGE_SVG) return;
  loadTimeoutId = setTimeout(() => {
    if (loading.value) onError();
  }, LOAD_TIMEOUT_MS);
}

watch(
  () => props.src,
  (newSrc) => {
    loading.value = true;
    currentSrc.value = newSrc || NO_IMAGE_SVG;
    armLoadTimeout();
  }
);

// SSR 하이드레이션 후 이미 로드된 이미지 처리
// (서버에서 렌더링된 img가 Vue 이벤트 리스너 등록 전에 로드 완료된 경우)
onMounted(() => {
  armLoadTimeout();
  const img = imgRef.value;
  if (!img || !img.complete) return;
  if (img.naturalWidth === 0) {
    onError();
  } else {
    onLoad();
  }
});

onUnmounted(clearLoadTimeout);

function onLoad() {
  loading.value = false;
  clearLoadTimeout();
}

function onError() {
  loading.value = false;
  currentSrc.value = NO_IMAGE_SVG;
  clearLoadTimeout();
}
</script>
