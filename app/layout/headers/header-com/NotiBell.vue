<template>
  <!-- 2026-09-19(요청사항: "최상단 알림기능도 추가해줘") — ecFeBo CoNotiBell 이식. 로그인 회원에게 온 알림(ecBeBo /api/fo/my/noti)을
       종 아이콘 + 안읽음 배지 + 팝오버 목록으로 보여준다. UserDropdown 안에서 로그인 상태일 때만 렌더링된다. -->
  <div ref="wrapRef" class="relative inline-flex items-center">
    <button
      type="button"
      class="relative flex items-center justify-center w-10 h-10 rounded-xl border border-[#e5e7eb] bg-white text-gray-600 cursor-pointer hover:border-gray-400 transition"
      :class="{ 'noti-shake': shake }"
      :aria-label="`알림 ${unread}건`"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <i class="fas fa-bell text-[0.95rem]"></i>
      <span v-if="unread > 0" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[0.65rem] font-bold flex items-center justify-center leading-none">{{ unread > 99 ? "99+" : unread }}</span>
    </button>

    <div v-show="open" class="absolute top-[calc(100%+14px)] right-0 w-[340px] max-w-[92vw] bg-white rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.16)] border border-[#e5e7eb] z-[9999] text-gray-800" @click.stop>
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
    unread.value = Number(await myNotiSvc.getUnreadCount()) || 0;
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
    items.value = await myNotiSvc.getList(30);
    unread.value = items.value.filter((n) => n.readYn !== "Y").length;
  } catch {
    errorMsg.value = "알림을 불러오지 못했습니다.";
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
    try {
      await myNotiSvc.markRead(n.notiId, "Y");
      n.readYn = "Y";
      unread.value = Math.max(0, unread.value - 1);
    } catch {
      /* 읽음 처리 실패해도 화면 이동/펼침은 계속 */
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
  if (isLoggedIn.value) loadUnread(false);
  timer = setInterval(() => {
    if (isLoggedIn.value && !open.value && document.visibilityState === "visible") loadUnread();
  }, 60_000); // 1분마다 안읽음 수 갱신(팝오버가 닫혀 있고 탭이 보일 때만)
});
watch(isLoggedIn, (v) => {
  if (v) loadUnread(false);
  else {
    unread.value = 0;
    items.value = [];
  }
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onOutside);
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
