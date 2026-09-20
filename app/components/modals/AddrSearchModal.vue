<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="addr-search-title" @click.self="close">
      <div class="relative w-full max-w-[520px] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col" style="height: 540px">
        <div class="flex items-center justify-between px-4 py-3 border-b border-[#f0e2cf] bg-[#faf3ea] flex-shrink-0">
          <h3 id="addr-search-title" class="text-base font-semibold text-gray-900">주소 검색</h3>
          <div class="flex items-center gap-3">
            <span class="text-[11px] text-gray-300">https://postcode.map.kakao.com/search</span>
            <button type="button" class="p-1.5 rounded hover:bg-gray-100" @click="close" aria-label="닫기">
              <i class="fal fa-times"></i>
            </button>
          </div>
        </div>
        <div ref="layerRef" class="flex-1 overflow-hidden"></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { SyAddrSearchResultType } from "~/types/sy/syAddrSearchResultType";

/**
 * 2026-09-15(요청사항: "주문하기의 카카오주소검색이야 모달처럼 띄워지는데
 * http://localhost:3100/checkout 에도 추가해줘") — ecFeBo(components/modals/FoModals.js의
 * FoAddrSearchModal)의 카카오/다음 우편번호 인라인 임베드 모달을 Outstock 체크아웃에 이식.
 * daum.Postcode는 .open() 대신 .embed(엘리먼트)를 쓰면 별도 팝업창 없이 이 모달 안에
 * 검색 UI(iframe)를 그려준다.
 */
import { ref, nextTick } from "vue";

interface DaumPostcodeResult {
  zonecode: string;
  address: string;
  roadAddress?: string;
  jibunAddress?: string;
  sido?: string;
  sigungu?: string;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: { oncomplete: (data: DaumPostcodeResult) => void }) => { embed: (el: HTMLElement) => void };
    };
  }
}

const SDK_ID = "daum-postcode-sdk";
const SDK_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

const emit = defineEmits<{ (e: "select", result: SyAddrSearchResultType): void }>();

const visible = ref(false);
const layerRef = ref<HTMLDivElement | null>(null);

function loadSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("주소 검색 스크립트를 불러오지 못했습니다.")));
      return;
    }
    const s = document.createElement("script");
    s.id = SDK_ID;
    s.src = SDK_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("주소 검색 스크립트를 불러오지 못했습니다."));
    document.head.appendChild(s);
  });
}

function onPicked(data: DaumPostcodeResult) {
  emit("select", {
    zonecode: data.zonecode,
    address: data.roadAddress || data.jibunAddress || data.address,
    sido: data.sido ?? "",
    sigungu: data.sigungu ?? "",
  });
  visible.value = false;
}

async function embed() {
  try {
    await loadSdk();
  } catch (err) {
    console.warn("[AddrSearchModal]", err);
    return;
  }
  await nextTick();
  if (!layerRef.value || !window.daum) return;
  layerRef.value.innerHTML = "";
  new window.daum.Postcode({ oncomplete: onPicked }).embed(layerRef.value);
}

async function show() {
  visible.value = true;
  await embed();
}
function close() {
  visible.value = false;
}

defineExpose({ show });
</script>
