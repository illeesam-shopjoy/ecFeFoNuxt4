<template>
  <!-- 2026-09-20(요청사항: "카카오맵/네이버지도/구글지도 버튼 클릭하면 내용을 해당 맵으로 교체, 활성 맵 버튼 강조") — 회사소개(오시는 길)/위치안내 공용.
       구글: embed iframe(키 불필요). 카카오: map.kakao.com 주소검색 화면을 iframe(키 불필요, X-Frame-Options 없음 확인).
       네이버: map.naver.com 은 X-Frame-Options 로 iframe 이 막혀 있어 JS SDK(Client ID) 로만 삽입 가능 —
       ecBeBo /api/co/cm/map/keys 의 naverMapClientId 가 설정돼 있으면 SDK 지도, 없으면 안내 + 새 창 링크. -->
  <div>
    <div v-if="toolbarPosition === 'top'" :class="barClass"><slot /><map-buttons class="ml-auto" /></div>

    <div class="relative w-full" :style="{ height: heightCss }">
      <iframe
        v-if="provider === 'google'"
        :key="'google'"
        :src="googleSrc"
        title="구글지도"
        class="block w-full h-full border-0"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
      <iframe v-else-if="provider === 'kakao'" :key="'kakao'" :src="kakaoSrc" title="카카오맵" class="block w-full h-full border-0" allowfullscreen></iframe>
      <!-- 네이버 SDK 컨테이너: 지도를 만든 뒤에도 재사용하므로 v-show -->
      <div v-show="provider === 'naver' && naverState === 'ready'" ref="naverEl" class="w-full h-full"></div>
      <div v-if="provider === 'naver' && naverState !== 'ready'" class="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#f4f6f8] text-center px-6">
        <template v-if="naverState === 'loading'"><span class="text-sm text-gray-500">네이버지도를 불러오는 중...</span></template>
        <template v-else>
          <span class="text-sm text-gray-600 leading-relaxed">
            네이버지도는 사이트 안에 삽입하려면 Client ID(도메인 등록)가 필요합니다.<br />
            <span class="text-gray-400 text-[0.78rem]">{{ naverState === 'nokey' ? "관리자 설정(naverMapClientId)이 비어 있습니다." : "지도 SDK 로드에 실패했습니다(Client ID·도메인 등록 확인)." }}</span>
          </span>
          <a :href="naverLink" target="_blank" rel="noopener" class="map-link" style="background: #03c75a; color: #fff">네이버지도에서 열기 ↗</a>
        </template>
      </div>
    </div>

    <div v-if="toolbarPosition === 'bottom'" :class="barClass"><slot /><map-buttons class="ml-auto" /></div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { coMapSvc } from "~/svc/co/cm/coMapSvc";

type Provider = "kakao" | "naver" | "google";
const props = withDefaults(
  defineProps<{
    addr: string;
    lat: number;
    lng: number;
    heightCss?: string;
    toolbarPosition?: "top" | "bottom";
    barClass?: string;
    defaultProvider?: Provider;
  }>(),
  { heightCss: "clamp(280px, 40vw, 380px)", toolbarPosition: "bottom", barClass: "flex flex-wrap items-center gap-2 px-5 py-3", defaultProvider: "google" }
);

const provider = ref<Provider>(props.defaultProvider);
const addrEnc = computed(() => encodeURIComponent(props.addr));
const googleSrc = computed(() => `https://maps.google.com/maps?q=${addrEnc.value}&output=embed&hl=ko&z=17`);
const kakaoSrc = computed(() => `https://map.kakao.com/?q=${encodeURIComponent(props.addr)}`);
const naverLink = computed(() => `https://map.naver.com/p/search/${addrEnc.value}`);

// 버튼 정의 — 활성: 브랜드색 채움 + 링 + ✓ 표시 / 비활성: 흰 배경 + 색 테두리
const BTNS: { key: Provider; label: string; bg: string; fg: string }[] = [
  { key: "kakao", label: "카카오맵", bg: "#fee500", fg: "#3c1e1e" },
  { key: "naver", label: "네이버지도", bg: "#03c75a", fg: "#fff" },
  { key: "google", label: "구글지도", bg: "#4285f4", fg: "#fff" },
];
const MapButtons = defineComponent({
  setup() {
    return () =>
      h(
        "span",
        { class: "flex gap-1.5 shrink-0 flex-wrap", role: "group", "aria-label": "지도 선택" },
        BTNS.map((b) => {
          const active = provider.value === b.key;
          return h(
            "button",
            {
              type: "button",
              class: "map-link",
              "aria-pressed": String(active),
              style: active
                ? { background: b.bg, color: b.fg, border: `2px solid ${b.bg}`, boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${b.bg}` }
                : { background: "#fff", color: "#555", border: `2px solid ${b.bg}`, opacity: 0.85 },
              onClick: () => (provider.value = b.key),
            },
            [active ? h("span", { class: "mr-1" }, "✓") : null, b.label]
          );
        })
      );
  },
});

// ── 네이버 SDK ──
const naverEl = ref<HTMLElement | null>(null);
const naverState = ref<"idle" | "loading" | "nokey" | "error" | "ready">("idle");
let naverMap: any = null;
let naverScript: Promise<void> | null = null;

function loadNaverSdk(clientId: string): Promise<void> {
  if (naverScript) return naverScript;
  naverScript = new Promise<void>((resolve, reject) => {
    (window as any).navermap_authFailure = () => reject(new Error("naver auth failure"));
    const s = document.createElement("script");
    s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("naver sdk load failed"));
    document.head.appendChild(s);
  });
  return naverScript;
}

async function showNaver() {
  if (naverMap) return (naverState.value = "ready");
  naverState.value = "loading";
  try {
    const clientId = (await coMapSvc.getKeys("FO")).naverMapClientId;
    if (!clientId) return (naverState.value = "nokey");
    await loadNaverSdk(clientId);
    naverState.value = "ready";
    await nextTick();
    const maps = (window as any).naver?.maps;
    if (!maps || !naverEl.value) throw new Error("naver maps unavailable");
    const center = new maps.LatLng(props.lat, props.lng);
    naverMap = new maps.Map(naverEl.value, { center, zoom: 16 });
    new maps.Marker({ map: naverMap, position: center, title: "ShopJoy" });
  } catch {
    naverScript = null;
    naverState.value = "error";
  }
}

watch(provider, (p) => {
  if (p === "naver") showNaver();
}, { immediate: true });

onBeforeUnmount(() => { naverMap = null; });
</script>

<style scoped>
:deep(.map-link) {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: box-shadow 0.15s, opacity 0.15s;
}
</style>
