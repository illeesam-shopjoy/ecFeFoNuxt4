<template>
  <!-- 2026-09-19(요청사항: "최상단 알림기능도 추가해줘") — ecFeBo CoNotiBell 이식. 로그인 회원에게 온 알림(ecBeBo /api/fo/my/noti)을
       종 아이콘 + 안읽음 배지 + 팝오버 목록으로 보여준다. HeaderTopActions 가 장바구니 오른쪽에 둔다(비로그인도 종은 보이고 로그인 안내를 보여준다). -->
  <div ref="wrapRef" class="relative inline-flex items-center">
    <button
      type="button"
      class="relative flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-[#e5e7eb] bg-white text-gray-600 cursor-pointer hover:border-gray-400 transition"
      :class="{ 'noti-shake': shake }"
      :aria-label="`알림 ${unread}건`"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <i class="fas fa-bell text-[0.95rem]"></i>
      <span v-if="unread > 0" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[0.65rem] font-bold flex items-center justify-center leading-none">{{ unread > 99 ? "99+" : unread }}</span>
    </button>

    <div v-show="open" class="absolute top-[calc(100%+14px)] right-0 w-[340px] max-w-[92vw] max-sm:fixed max-sm:top-[64px] max-sm:left-2 max-sm:right-2 max-sm:w-auto max-sm:max-w-none bg-white rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.16)] border border-[#e5e7eb] z-[9999] text-gray-800" @click.stop>
      <!-- 비로그인: 알림 종은 항상 보이되 로그인 안내만 보여준다 -->
      <div v-if="!isLoggedIn" class="px-5 py-8 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#faf3ea] text-[1.2rem] text-theme"><i class="fas fa-bell"></i></div>
        <p class="m-0 mb-4 text-[0.85rem] text-gray-600">로그인하면 주문·배송·문의 알림을<br />이곳에서 확인할 수 있습니다.</p>
        <nuxt-link to="/login" class="inline-block rounded-lg bg-theme px-5 py-2 text-[0.82rem] font-semibold text-white" @click="open = false">로그인</nuxt-link>
      </div>
      <template v-else>
      <div class="flex items-center gap-2 px-3.5 py-2.5 border-b border-[#f0f0f0]">
        <span class="text-[0.85rem] font-bold flex-1">알림 <span class="font-normal text-gray-400">{{ items.length }}건 · 안읽음 {{ unread }}</span></span>
        <button type="button" class="noti-btn" title="새로고침" aria-label="새로고침" @click="reload"><i class="fas fa-sync-alt text-[0.7rem]" :class="{ 'animate-spin': loading }"></i></button>
        <button type="button" class="noti-btn text-[0.72rem]" :disabled="unread === 0" @click="readAll">모두 읽음</button>
      </div>

      <div class="max-h-[380px] overflow-y-auto">
        <div v-if="errorMsg" class="px-4 py-6 text-center text-[0.82rem] text-red-500">{{ errorMsg }}</div>
        <div v-else-if="!items.length" class="px-4 py-10 text-center text-[0.85rem] text-gray-400">{{ loading ? "불러오는 중..." : "받은 알림이 없습니다." }}</div>
        <ul v-else class="list-none m-0 p-0">
          <li v-for="n in items" :key="n.notiId" class="border-b border-[#f6f6f6] last:border-b-0">
            <button type="button" class="w-full text-left flex gap-2.5 px-3.5 py-3 bg-transparent border-0 cursor-pointer hover:bg-[#fafafa]" @click="clickItem(n)">
              <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="n.readYn === 'Y' ? 'bg-transparent' : 'bg-theme'"></span>
              <span class="flex-1 min-w-0">
                <span class="block text-[0.85rem] leading-snug" :class="n.readYn === 'Y' ? 'text-gray-500' : 'text-gray-900 font-semibold'">{{ n.notiTitle || "알림" }}</span>
                <span v-if="expandedId === n.notiId && n.notiContent" class="block text-[0.78rem] text-gray-500 mt-1 leading-relaxed whitespace-pre-line break-words">{{ n.notiContent }}</span>
                <span class="block text-[0.7rem] text-gray-400 mt-1">{{ fmtTime(n.regDate) }}<template v-if="goLink(n)"> · <span class="text-theme">바로가기 ›</span></template></span>
              </span>
            </button>
          </li>
        </ul>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { myNotiSvc } from "~/svc/fo/my/myNotiSvc";
import type { SyNotiType } from "~/types/sy/syNotiType";

const open = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const items = ref<SyNotiType[]>([]);
const unread = ref(0);
const expandedId = ref<string | null>(null);
const shake = ref(false);
const wrapRef = ref<HTMLElement | null>(null);
const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isStLoggedIn);

// ── 임의(temp) 알림 — 2026-09-22(요청사항: "로그인되어 있다면 랜덤으로 5분에 한 건씩 추가, 임의 발송이므로 제목 앞에 temp") ──
// 백엔드에 FO 사용자가 자기 알림을 만드는 API 가 없어, 브라우저가 만들어 이 종 목록에만 넣는다(서버에 저장되지 않음 · localStorage 에 최대 20건 보관, 로그아웃하면 비운다).
// 로그인 상태로 페이지가 열려 있는 동안 5분마다 아래 문구 중 하나를 무작위로 골라 1건 추가한다(마지막 추가 시각을 저장해 새로고침해도 5분 간격 유지).
const TEMP_KEY = "shopjoy_temp_noti";
const TEMP_LAST_KEY = "shopjoy_temp_noti_last";
const TEMP_INTERVAL_MS = 5 * 60 * 1000;
const TEMP_MAX = 20;
const TEMP_SAMPLES: { title: string; content: string; linkPage?: string; notiTypeCd?: string }[] = [
  { title: "주문하신 상품이 출고 준비 중입니다", content: "결제가 확인되어 상품을 포장하고 있어요. 곧 배송이 시작됩니다.", linkPage: "myOrder" },
  { title: "배송이 시작되었습니다", content: "오늘 출고된 상품이 택배사로 인계되었습니다. 배송 조회는 주문 내역에서 확인하세요.", linkPage: "myOrder" },
  { title: "새 할인 쿠폰이 도착했어요", content: "사용 기한 안에 쿠폰함에서 확인하고 주문 시 적용해 보세요.", linkPage: "myCoupon" },
  { title: "쿠폰 사용 기한이 곧 끝나요", content: "보유 중인 쿠폰 중 이번 주에 만료되는 쿠폰이 있습니다.", linkPage: "myCoupon" },
  { title: "진행 중인 이벤트가 있어요", content: "지금 참여하면 추가 혜택을 받을 수 있는 이벤트를 확인해 보세요.", linkPage: "event" },
  { title: "캐시가 적립되었습니다", content: "상품평 작성 적립 캐시가 반영되었어요. 다음 주문에서 사용할 수 있습니다.", linkPage: "myCache" },
  { title: "문의하신 내용에 답변이 등록되었습니다", content: "1:1 문의 내역에서 답변을 확인해 주세요.", linkPage: "myContact" },
  { title: "장바구니에 담아 둔 상품이 기다리고 있어요", content: "재고가 소진되기 전에 주문을 마무리해 보세요." },
  { title: "자주 묻는 질문을 확인해 보세요", content: "배송·교환·환불 안내를 한눈에 볼 수 있어요.", linkPage: "faq" },
];
const tempItems = ref<SyNotiType[]>([]);
const isTemp = (n: SyNotiType) => n.notiId.startsWith("temp-");
function loadTemp() {
  try {
    tempItems.value = JSON.parse(localStorage.getItem(TEMP_KEY) || "[]") as SyNotiType[];
  } catch {
    tempItems.value = [];
  }
}
function saveTemp() {
  try {
    localStorage.setItem(TEMP_KEY, JSON.stringify(tempItems.value.slice(0, TEMP_MAX)));
  } catch {
    /* 저장소를 못 써도 이번 화면에서는 동작 */
  }
}
const tempUnread = () => tempItems.value.filter((n) => n.readYn !== "Y").length;
/** 임의 알림 1건 추가 — 제목 앞에 "temp" */
function addTempNoti() {
  const s = TEMP_SAMPLES[Math.floor(Math.random() * TEMP_SAMPLES.length)]!;
  const now = new Date();
  const n: SyNotiType = {
    notiId: `temp-${now.getTime()}`,
    notiTitle: `temp ${s.title}`,
    notiContent: s.content,
    linkPage: s.linkPage,
    readYn: "N",
    regDate: now.toISOString(),
  };
  tempItems.value = [n, ...tempItems.value].slice(0, TEMP_MAX);
  saveTemp();
  try {
    localStorage.setItem(TEMP_LAST_KEY, String(now.getTime()));
  } catch {
    /* ignore */
  }
  unread.value += 1;
  shake.value = true;
  setTimeout(() => (shake.value = false), 2000);
  if (open.value) items.value = mergeItems(items.value.filter((x) => !isTemp(x)));
}
const mergeItems = (server: SyNotiType[]): SyNotiType[] =>
  [...tempItems.value, ...server].sort((a, b) => String(b.regDate ?? "").localeCompare(String(a.regDate ?? "")));

let tempTimer: ReturnType<typeof setTimeout> | null = null;
/** 마지막 추가 시각 기준으로 다음 5분 시점에 추가하고, 이후 5분마다 반복 */
function scheduleTemp() {
  stopTemp();
  if (!isLoggedIn.value) return;
  let last = Number(localStorage.getItem(TEMP_LAST_KEY) || 0);
  if (!last) {
    last = Date.now();
    try {
      localStorage.setItem(TEMP_LAST_KEY, String(last));
    } catch {
      /* ignore */
    }
  }
  const wait = Math.max(0, last + TEMP_INTERVAL_MS - Date.now());
  tempTimer = setTimeout(function tick() {
    if (!isLoggedIn.value) return;
    addTempNoti();
    tempTimer = setTimeout(tick, TEMP_INTERVAL_MS);
  }, wait);
}
function stopTemp() {
  if (tempTimer) clearTimeout(tempTimer);
  tempTimer = null;
}

// 알림의 linkPage(ecFeBo 화면명) → 이 프로젝트 경로
const PAGE_ROUTES: Record<string, (refId?: string) => string> = {
  myOrder: () => "/my/order",
  myClaim: () => "/my/claim",
  myCoupon: () => "/my/coupon",
  myCache: () => "/my/cache",
  myContact: () => "/my/contact",
  myChatt: () => "/my/chatt",
  event: () => "/event",
  eventView: (id) => (id ? `/event-dtl/${id}` : "/event"),
  faq: () => "/faq",
};
const goLink = (n: SyNotiType): string => {
  const route = n.linkPage ? PAGE_ROUTES[n.linkPage] : undefined;
  return route ? route(n.refId) : "";
};

function fmtTime(v?: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v).slice(0, 16).replace("T", " ");
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return d.toISOString().slice(0, 10);
}

async function loadUnread(silent = true) {
  try {
    const before = unread.value;
    unread.value = (Number(await myNotiSvc.getUnreadCount()) || 0) + tempUnread();
    if (unread.value > before && silent) {
      shake.value = true; // 새 알림이 오면 종이 잠깐 흔들린다
      setTimeout(() => (shake.value = false), 2000);
    }
  } catch {
    /* 알림 수 조회 실패는 조용히 무시(다음 폴링에서 재시도) */
  }
}

async function reload() {
  loading.value = true;
  errorMsg.value = "";
  try {
    items.value = mergeItems(await myNotiSvc.getList(30));
    unread.value = items.value.filter((n) => n.readYn !== "Y").length;
  } catch {
    // 서버 목록을 못 불러와도 임의(temp) 알림은 보여준다
    items.value = mergeItems([]);
    unread.value = tempUnread();
    if (!items.value.length) errorMsg.value = "알림을 불러오지 못했습니다.";
  } finally {
    loading.value = false;
  }
}

function toggle() {
  open.value = !open.value;
  if (open.value && isLoggedIn.value) reload();
}

async function clickItem(n: SyNotiType) {
  expandedId.value = expandedId.value === n.notiId ? null : n.notiId;
  if (n.readYn !== "Y") {
    if (isTemp(n)) {
      // 임의(temp) 알림은 서버에 없으므로 브라우저에서만 읽음 처리
      n.readYn = "Y";
      const t = tempItems.value.find((x) => x.notiId === n.notiId);
      if (t) t.readYn = "Y";
      saveTemp();
      unread.value = Math.max(0, unread.value - 1);
    } else {
      try {
        await myNotiSvc.markRead(n.notiId, "Y");
        n.readYn = "Y";
        unread.value = Math.max(0, unread.value - 1);
      } catch {
        /* 읽음 처리 실패해도 화면 이동/펼침은 계속 */
      }
    }
  }
  const to = goLink(n);
  if (to) {
    open.value = false;
    router.push(to);
  }
}

async function readAll() {
  try {
    await myNotiSvc.markAllRead();
    tempItems.value.forEach((n) => (n.readYn = "Y"));
    saveTemp();
    items.value.forEach((n) => (n.readYn = "Y"));
    unread.value = 0;
  } catch {
    errorMsg.value = "모두 읽음 처리에 실패했습니다.";
  }
}

const onOutside = (e: MouseEvent) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) open.value = false;
};
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  document.addEventListener("click", onOutside);
  loadTemp();
  if (isLoggedIn.value) loadUnread(false);
  scheduleTemp();
  timer = setInterval(() => {
    if (isLoggedIn.value && !open.value && document.visibilityState === "visible") loadUnread();
  }, 60_000); // 1분마다 안읽음 수 갱신(팝오버가 닫혀 있고 탭이 보일 때만)
});
watch(isLoggedIn, (v) => {
  if (v) {
    loadTemp();
    loadUnread(false);
    scheduleTemp();
  } else {
    stopTemp();
    tempItems.value = [];
    try {
      localStorage.removeItem(TEMP_KEY);
      localStorage.removeItem(TEMP_LAST_KEY);
    } catch {
      /* ignore */
    }
    unread.value = 0;
    items.value = [];
  }
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onOutside);
  stopTemp();
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.noti-btn {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  cursor: pointer;
}
.noti-btn:hover:not(:disabled) {
  background: #f3f4f6;
}
.noti-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.noti-shake i {
  animation: noti-shake 1.6s ease-in-out;
  transform-origin: 50% 12%;
}
@keyframes noti-shake {
  0%,
  100% {
    transform: rotate(0);
  }
  10%,
  30%,
  50% {
    transform: rotate(14deg);
  }
  20%,
  40%,
  60% {
    transform: rotate(-14deg);
  }
  70% {
    transform: rotate(0);
  }
}
</style>
