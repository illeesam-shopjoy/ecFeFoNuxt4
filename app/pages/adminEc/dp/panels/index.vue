<template>
  <div class="pt-6 px-6 pb-10">
    <h1 class="text-xl font-bold text-gray-800 mb-1">전시패널관리</h1>
    <p class="text-sm text-gray-500 mb-4">
      홈 화면의 히어로 슬라이더 · 고객후기 · 브랜드 로고처럼 예전엔 소스코드에 하드코딩돼 있던 콘텐츠를
      여기서 직접 수정할 수 있습니다. 저장하면 다음 배포 없이 바로 화면에 반영됩니다.
    </p>

    <!-- 1단계: UI(최상위 화면 정의) 준비 -->
    <div class="border rounded-lg p-4 mb-6 bg-gray-50">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold text-gray-700">1. UI 준비</h2>
          <p class="text-xs text-gray-500 mt-0.5">모든 영역이 속하는 최상위 화면 정의(UI)입니다. 없으면 먼저 하나 만들어야 합니다.</p>
        </div>
        <button
          v-if="uis.length === 0"
          type="button"
          class="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 shrink-0"
          :disabled="creatingUi"
          @click="createDefaultUi"
        >
          {{ creatingUi ? "생성 중..." : "기본 UI 생성" }}
        </button>
      </div>
      <ul v-if="uis.length" class="mt-2 text-sm text-gray-600">
        <li v-for="ui in uis" :key="ui.uiId">✅ {{ ui.uiNm }} ({{ ui.uiCd }})</li>
      </ul>
      <p v-else class="mt-2 text-sm text-amber-700">아직 UI가 없습니다. 위 버튼으로 먼저 만들어 주세요.</p>
    </div>

    <!-- 2단계: 위젯 슬롯별 관리 -->
    <div class="space-y-3">
      <div v-for="slot in slots" :key="slot.areaCd" class="border rounded-lg overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
          @click="toggleSlot(slot.areaCd)"
        >
          <div>
            <div class="font-medium text-gray-800">{{ slot.label }}</div>
            <div class="text-xs text-gray-500 mt-0.5">
              영역코드: <code class="bg-gray-100 px-1 rounded">{{ slot.areaCd }}</code>
              · 위젯유형: {{ slot.widgetTypeCd }}
              · 상태:
              <span :class="statusOf(slot.areaCd).cls">{{ statusOf(slot.areaCd).label }}</span>
            </div>
          </div>
          <span class="text-gray-400 text-sm">{{ expandedSlot === slot.areaCd ? "접기 ▲" : "펼치기 ▼" }}</span>
        </button>

        <div v-if="expandedSlot === slot.areaCd" class="border-t px-4 py-4 bg-gray-50">
          <!-- 영역 없음 -->
          <div v-if="!areaOf(slot.areaCd)">
            <p class="text-sm text-gray-600 mb-2">이 슬롯의 영역이 아직 없습니다.</p>
            <button
              type="button"
              class="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
              :disabled="uis.length === 0 || busy"
              @click="createSlotArea(slot)"
            >
              영역 생성
            </button>
          </div>

          <!-- 영역은 있는데 패널 없음 -->
          <div v-else-if="!panelOf(slot.areaCd)">
            <p class="text-sm text-gray-600 mb-2">영역은 있지만 패널이 아직 없습니다.</p>
            <button
              type="button"
              class="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
              :disabled="busy"
              @click="createSlotPanel(slot)"
            >
              패널 생성
            </button>
          </div>

          <!-- 패널은 있는데 항목(실제 콘텐츠) 없음 -->
          <div v-else-if="!itemOf(slot.areaCd)">
            <p class="text-sm text-gray-600 mb-2">패널은 있지만 콘텐츠(패널항목)가 아직 없습니다. 기본 템플릿으로 먼저 만드세요.</p>
            <textarea v-model="draftJson[slot.areaCd]" rows="10" class="w-full border rounded p-2 font-mono text-xs" />
            <div class="mt-2 flex gap-2">
              <button
                type="button"
                class="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
                :disabled="busy"
                @click="createSlotItem(slot)"
              >
                콘텐츠 생성
              </button>
              <button type="button" class="px-3 py-1.5 border rounded text-sm hover:bg-gray-100" @click="resetDraft(slot)">
                기본 템플릿으로 되돌리기
              </button>
            </div>
          </div>

          <!-- 전부 있음 — 편집 -->
          <div v-else>
            <div class="flex flex-wrap gap-4 mb-3">
              <label class="flex flex-col gap-1">
                <span class="text-xs text-gray-600">위젯 제목(내부관리용, 화면 미노출)</span>
                <input v-model="draftTitle[slot.areaCd]" type="text" class="border rounded px-2 py-1 text-sm w-64" />
              </label>
              <label class="flex items-center gap-1.5 text-sm text-gray-700 mt-5">
                <input type="checkbox" v-model="draftActive[slot.areaCd]" /> 사용(useYn)
              </label>
              <label class="flex items-center gap-1.5 text-sm text-gray-700 mt-5">
                <input type="checkbox" v-model="draftDisp[slot.areaCd]" /> 전시(dispYn)
              </label>
            </div>
            <textarea v-model="draftJson[slot.areaCd]" rows="12" class="w-full border rounded p-2 font-mono text-xs" />
            <p class="text-xs text-gray-500 mt-1">JSON 배열 형식 — 각 페이지가 그대로 파싱해서 사용합니다. 문법 오류가 있으면 저장이 거부됩니다.</p>
            <div class="mt-2 flex gap-2">
              <button
                type="button"
                class="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
                :disabled="busy"
                @click="saveSlotItem(slot)"
              >
                저장
              </button>
              <button
                type="button"
                class="px-3 py-1.5 border border-red-400 text-red-600 rounded text-sm hover:bg-red-50"
                :disabled="busy"
                @click="deleteSlotItem(slot)"
              >
                콘텐츠 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { usePageTitle } from "~/composables/usePageTitle";
import { dpAdminSvc, type DpUiRow, type DpAreaRow, type DpPanelRow } from "~/svc/fo/ec/dp/dpAdminSvc";
import type { DpAreaWidgetItem } from "~/svc/fo/ec/dp/dpAreaSvc";
import { useAuthStore } from "~/store/useAuthStore";

definePageMeta({ layout: "admin" });
usePageTitle("전시패널관리");

/**
 * 전시패널관리 — 2026-09-13 신설.
 * "전시관리 > 전시관리 > 전시패널관리" 메뉴(사용자 지정 경로)로 연결되는 실제 화면.
 * dp_ui > dp_area > dp_panel > dp_panel_item 4단 구조를 이 한 화면에서 바텀업으로 준비/편집한다.
 * FoDpAdminController(FO_ONLY)를 통해 호출 — [[ecfefonuxt4-dp-widget-migration]] 메모리 참조.
 */

interface SlotDef {
  areaCd: string;
  label: string;
  widgetTypeCd: "SLIDER" | "TESTIMONIAL" | "BRAND_LOGO";
  defaultJson: unknown;
}

const slots: SlotDef[] = [
  {
    areaCd: "HERO_SLIDER_MAIN",
    label: "메인 히어로 슬라이더 (home-6, index)",
    widgetTypeCd: "SLIDER",
    defaultJson: [
      { heroSliderId: "heroSliderId01", bgImg: "/cdn/img/slider/slider-1.jpg", title: "핸드메이드 <br /> 핸드카브 커피", subtile: "의도한 커피 원두만큼 풍부하고 독특한 이 작은 스쿱이, 매일 아침을 특별한 순간으로 만들어 드립니다." },
      { heroSliderId: "heroSliderId02", bgImg: "/cdn/img/slider/slider-2.jpg", title: "다르게 생각하고 <br /> 다르게 실행하세요", subtile: "다르게 생각하고, 독창적으로 실천하세요. 변화하는 트렌드를 따라갑니다." },
      { heroSliderId: "heroSliderId03", bgImg: "/cdn/img/slider/slider-3.jpg", title: "하이빔<br /> by  태희", subtile: "하이빔은 각도 조절이 가능한 책상·선반용 조명으로, 다양한 조명 연출이 가능합니다." },
    ],
  },
  {
    areaCd: "HERO_SLIDER_TWO",
    label: "히어로 슬라이더 2 (home-2, home-3)",
    widgetTypeCd: "SLIDER",
    defaultJson: [
      { heroSliderId: "heroSliderId01", bgImg: "/cdn/img/slider/03/slider-01.jpg", isDark: true, title: "조명 <br /> 크리에이티브 가구", subtile: "크리에이티브 가구를 바로 보세요." },
      { heroSliderId: "heroSliderId02", bgImg: "/cdn/img/slider/03/slider-02.jpg", title: "조명 <br /> 크리에이티브 가구", subtile: "크리에이티브 가구를 바로 보세요." },
      { heroSliderId: "heroSliderId03", bgImg: "/cdn/img/slider/03/slider-03.jpg", title: "드롭 체어 <br /> 블랙 레더 에디션", subtile: "크리에이티브 가구를 바로 보세요." },
    ],
  },
  {
    areaCd: "HERO_SLIDER_HOME4",
    label: "홈4 히어로 슬라이더",
    widgetTypeCd: "SLIDER",
    defaultJson: [
      { heroSliderId: "heroSliderId01", bgImg: "/cdn/img/slider/04/slider-01.jpg", title: "핸드메이드 <br /> 핸드카브 커피", subtile: "원두 본연의 풍부하고 독특한 맛을 담아낸 이 작은 스쿱은 매일 아침 당신의 아침 루틴을 특별한 순간으로 만들어 줄 것입니다." },
      { heroSliderId: "heroSliderId02", bgImg: "/cdn/img/slider/slider-2.jpg", title: "다르게 생각하고 <br /> 다르게 실행하세요", subtile: "원두 본연의 풍부하고 독특한 맛을 담아낸 이 작은 스쿱은 매일 아침 당신의 아침 루틴을 특별한 순간으로 만들어 줄 것입니다." },
      { heroSliderId: "heroSliderId03", bgImg: "/cdn/img/slider/slider-3.jpg", title: "하이빔<br /> by  태희", subtile: "원두 본연의 풍부하고 독특한 맛을 담아낸 이 작은 스쿱은 매일 아침 당신의 아침 루틴을 특별한 순간으로 만들어 줄 것입니다." },
    ],
  },
  {
    areaCd: "HERO_SLIDER_HOME5",
    label: "홈5 히어로 슬라이더",
    widgetTypeCd: "SLIDER",
    defaultJson: [
      { heroSliderId: "heroSliderId01", bgImg: "/cdn/img/slider/slider-1.jpg", title: "핸드메이드 <br> 핸드카브 커피", subtile: "의도한 커피 원두만큼 풍부하고 독특한 이 작은 스쿱이, 매일 아침을 특별한 순간으로 만들어 드립니다." },
      { heroSliderId: "heroSliderId02", bgImg: "/cdn/img/slider/slider-2.jpg", title: "다르게 생각하고 <br> 다르게 실행하세요", subtile: "다르게 생각하고, 독창적으로 실천하세요. 변화하는 트렌드를 따라갑니다." },
      { heroSliderId: "heroSliderId03", bgImg: "/cdn/img/slider/slider-3.jpg", title: "하이빔<br> by 송성일", subtile: "하이빔은 각도 조절이 가능한 책상·선반용 조명으로, 다양한 조명 연출이 가능합니다." },
    ],
  },
  {
    areaCd: "HERO_SLIDER_HOME7",
    label: "홈7 히어로 슬라이더",
    widgetTypeCd: "SLIDER",
    defaultJson: [
      { heroSliderId: "heroSliderId01", bgImg: "/cdn/img/slider/05/slide111.webp", sm_title: "최대 50% 할인", meta: true, title: "당신에게 필요한 <br/>라이프스타일.", subtitle: "다양한 라이프스타일을 경험해 보세요." },
      { heroSliderId: "heroSliderId02", bgImg: "/cdn/img/slider/05/slide112.webp", sm_title: "빠른 배송", title: "크리에이티브 테마 <br/>어썸.", subtitle: "다양한 라이프스타일을 경험해 보세요." },
      { heroSliderId: "heroSliderId03", bgImg: "/cdn/img/slider/05/slide113.webp", sm_title: "빠른 배송", title: "세상은<br/>만들어 갑니다.", subtitle: "다양한 라이프스타일을 경험해 보세요." },
    ],
  },
  {
    areaCd: "TESTIMONIAL_HOME3",
    label: "홈3 고객 후기",
    widgetTypeCd: "TESTIMONIAL",
    defaultJson: [
      { id: 1, img: "/cdn/img/testimonial/person-1.jpg", name: "Mason Robinson", title: "UX 디자이너", desc: "명확한 가독성과 사용자 경험을 고려한 디자인이 인상적이었습니다." },
      { id: 2, img: "/cdn/img/testimonial/person-2.jpg", name: "David Cruso", title: "웹 개발자", desc: "구조가 분명하고 유지보수가 쉽습니다." },
      { id: 3, img: "/cdn/img/testimonial/person-3.jpg", name: "Naim Ahmed", title: "웹 개발자", desc: "직관적인 구성과 빠른 반응 속도가 좋았습니다." },
      { id: 4, img: "/cdn/img/testimonial/person-4.jpg", name: "Salim Rana", title: "워드프레스 전문가", desc: "전문성과 세심한 배려가 돋보이는 서비스였습니다." },
    ],
  },
  {
    areaCd: "TESTIMONIAL_HOME7",
    label: "홈7 고객 후기",
    widgetTypeCd: "TESTIMONIAL",
    defaultJson: [
      { id: 1, img: "/cdn/img/testimonial/testi1.webp", desc: "당신의 하루를 조금 더 특별하게 만들어 줄 단 하나의 선택, 바로 이 상품입니다." },
      { id: 2, img: "/cdn/img/testimonial/testi2.webp", desc: "지금 이 상품은 단순한 제품이 아니라, 당신의 시간을 아끼고 삶의 질을 높여주는 해결책입니다." },
      { id: 3, img: "/cdn/img/testimonial/testi3.webp", desc: "많은 분들이 찾고 계신 바로 그 상품, 지금 이 순간에만 만나실 수 있습니다." },
    ],
  },
  {
    areaCd: "BRAND_LOGO_MAIN",
    label: "브랜드 로고 슬라이더 (home-2, home-3, index)",
    widgetTypeCd: "BRAND_LOGO",
    defaultJson: [
      "/cdn/img/client/client-1.jpg",
      "/cdn/img/client/client-2.jpg",
      "/cdn/img/client/client-3.jpg",
      "/cdn/img/client/client-4.jpg",
      "/cdn/img/client/client-5.jpg",
    ],
  },
];

const authStore = useAuthStore();
const siteId = computed(() => authStore.user?.siteId ?? "");

const uis = reactive<DpUiRow[]>([]);
const areas = reactive<DpAreaRow[]>([]);
const panels = reactive<DpPanelRow[]>([]);
const creatingUi = ref(false);
const busy = ref(false);
const expandedSlot = ref<string | null>(null);

const draftJson = reactive<Record<string, string>>({});
const draftTitle = reactive<Record<string, string>>({});
const draftActive = reactive<Record<string, boolean>>({});
const draftDisp = reactive<Record<string, boolean>>({});

function areaOf(areaCd: string): DpAreaRow | undefined {
  return areas.find((a) => a.areaCd === areaCd);
}
function panelOf(areaCd: string): DpPanelRow | undefined {
  const area = areaOf(areaCd);
  if (!area) return undefined;
  return panels.find((p) => p.areaId === area.areaId);
}
function itemOf(areaCd: string): DpAreaWidgetItem | undefined {
  return panelOf(areaCd)?.panelItems?.[0];
}

function statusOf(areaCd: string): { label: string; cls: string } {
  if (!areaOf(areaCd)) return { label: "미생성", cls: "text-gray-400" };
  if (!panelOf(areaCd)) return { label: "영역만 생성됨", cls: "text-amber-600" };
  if (!itemOf(areaCd)) return { label: "패널만 생성됨", cls: "text-amber-600" };
  return { label: "콘텐츠 등록됨", cls: "text-green-600 font-medium" };
}

async function loadAll() {
  const [uiList, areaList] = await Promise.all([dpAdminSvc.listUis(), dpAdminSvc.listAreas()]);
  uis.splice(0, uis.length, ...uiList);
  areas.splice(0, areas.length, ...areaList);
  const panelList = await dpAdminSvc.listPanels();
  panels.splice(0, panels.length, ...panelList);
}

async function createDefaultUi() {
  if (!siteId.value) {
    await useAlert().openAlert("로그인 정보에 siteId가 없어 UI를 만들 수 없습니다.");
    return;
  }
  creatingUi.value = true;
  try {
    await dpAdminSvc.createUi({ siteId: siteId.value, uiCd: "MAIN_UI", uiNm: "메인 UI", useYn: "Y" });
    await loadAll();
  } finally {
    creatingUi.value = false;
  }
}

function resetDraft(slot: SlotDef) {
  draftJson[slot.areaCd] = JSON.stringify(slot.defaultJson, null, 2);
}

function toggleSlot(areaCd: string) {
  expandedSlot.value = expandedSlot.value === areaCd ? null : areaCd;
  if (expandedSlot.value !== areaCd) return;
  const slot = slots.find((s) => s.areaCd === areaCd)!;
  const item = itemOf(areaCd);
  if (item) {
    draftJson[areaCd] = item.widgetConfigJson ? JSON.stringify(JSON.parse(item.widgetConfigJson), null, 2) : "[]";
    draftTitle[areaCd] = item.widgetTitle ?? slot.label;
    draftActive[areaCd] = true;
    draftDisp[areaCd] = true;
  } else if (!draftJson[areaCd]) {
    resetDraft(slot);
  }
}

async function createSlotArea(slot: SlotDef) {
  const firstUi = uis[0];
  if (!siteId.value || !firstUi) return;
  busy.value = true;
  try {
    await dpAdminSvc.createArea({ uiId: firstUi.uiId, siteId: siteId.value, areaCd: slot.areaCd, areaNm: slot.label, useYn: "Y" });
    await loadAll();
  } finally {
    busy.value = false;
  }
}

async function createSlotPanel(slot: SlotDef) {
  const area = areaOf(slot.areaCd);
  if (!area || !siteId.value) return;
  busy.value = true;
  try {
    await dpAdminSvc.createPanel({ areaId: area.areaId, siteId: siteId.value, panelNm: `${slot.label} 패널`, panelTypeCd: "MAIN_BANNER", useYn: "Y", dispPanelStatusCd: "SHOW" });
    await loadAll();
  } finally {
    busy.value = false;
  }
}

async function createSlotItem(slot: SlotDef) {
  const panel = panelOf(slot.areaCd);
  if (!panel || !siteId.value) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(draftJson[slot.areaCd] ?? "[]");
  } catch {
    await useAlert().openAlert("JSON 형식이 올바르지 않습니다.");
    return;
  }
  busy.value = true;
  try {
    await dpAdminSvc.createPanelItem({
      panelId: panel.panelId,
      siteId: siteId.value,
      widgetTypeCd: slot.widgetTypeCd,
      widgetTitle: slot.label,
      widgetConfigJson: JSON.stringify(parsed),
      sortOrd: 1,
      useYn: "Y",
      dispYn: "Y",
    });
    await loadAll();
  } finally {
    busy.value = false;
  }
}

async function saveSlotItem(slot: SlotDef) {
  const item = itemOf(slot.areaCd);
  if (!item) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(draftJson[slot.areaCd] ?? "[]");
  } catch {
    await useAlert().openAlert("JSON 형식이 올바르지 않습니다.");
    return;
  }
  busy.value = true;
  try {
    await dpAdminSvc.updatePanelItem(item.panelItemId, {
      widgetTitle: draftTitle[slot.areaCd],
      widgetConfigJson: JSON.stringify(parsed),
      useYn: draftActive[slot.areaCd] ? "Y" : "N",
      dispYn: draftDisp[slot.areaCd] ? "Y" : "N",
    });
    await useAlert().openAlert("저장되었습니다.");
    await loadAll();
  } finally {
    busy.value = false;
  }
}

async function deleteSlotItem(slot: SlotDef) {
  const item = itemOf(slot.areaCd);
  if (!item) return;
  const ok = await useConfirm().openConfirm({ title: "삭제 확인", message: "이 콘텐츠를 삭제할까요? 화면은 기본값으로 되돌아갑니다.", confirmText: "삭제", variant: "danger" });
  if (!ok) return;
  busy.value = true;
  try {
    await dpAdminSvc.deletePanelItem(item.panelItemId);
    await loadAll();
  } finally {
    busy.value = false;
  }
}

onMounted(loadAll);
</script>
