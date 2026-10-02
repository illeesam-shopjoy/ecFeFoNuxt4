<template>
  <!-- 나의 danmoo — 프로필·매너온도 · 머니(적립금 잔액) · 나의 거래(판매/구매/관심/쿠폰/모아보기) · 나의 동네 · 설정. 로그인 안 했으면 로그인 유도 -->
  <layout>
    <template #top>
      <dm-title-bar title="나의 danmoo" :back="false">
        <template #right><nuxt-link to="/my/settings" class="icon-btn" aria-label="설정"><i class="far fa-cog"></i></nuxt-link></template>
      </dm-title-bar>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <!-- 프로필 -->
    <section class="px-4 py-5">
      <template v-if="authStore.isStLoggedIn">
        <div class="flex items-center gap-3.5">
          <span class="w-14 h-14 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] inline-flex items-center justify-center text-[22px] font-extrabold">{{ (user?.userNm || "나").slice(0, 1) }}</span>
          <div class="flex-1 min-w-0">
            <b class="text-[18px]">{{ user?.userNm }}</b>
            <p class="text-[13px] muted truncate">{{ user?.userEmail }} · {{ town }}</p>
          </div>
          <button type="button" class="btn-soft !h-9 text-[13px]" @click="handleBtnAction('my-profile')">프로필 보기</button>
        </div>
        <div class="mt-4 rounded-xl bg-[var(--dm-bg-soft)] px-4 py-3 flex items-center justify-between">
          <div><span class="text-[13px] muted">매너온도</span><b class="ml-2 primary text-[16px]">36.5°C</b></div>
          <div class="h-1.5 w-32 rounded-full bg-[var(--dm-chip)] overflow-hidden"><div class="h-full w-[36%] bg-[var(--dm-primary)]"></div></div>
        </div>
        <!-- 요약 숫자 -->
        <ul class="grid grid-cols-4 mt-4 rounded-xl border border-[var(--dm-line)] divide-x divide-[var(--dm-line)]">
          <li v-for="s in stats" :key="s.label"><nuxt-link :to="s.to" class="flex flex-col items-center py-3"><b class="text-[17px]">{{ s.value ?? "—" }}</b><span class="text-[12px] muted">{{ s.label }}</span></nuxt-link></li>
        </ul>
      </template>
      <div v-else-if="ready" class="rounded-2xl bg-[var(--dm-bg-soft)] p-5 text-center">
        <p class="text-[16px] font-bold">로그인하고 danmoo를 시작해 보세요</p>
        <p class="text-[13px] muted mt-1">관심목록 · 채팅 · 알림 · 가격 제안을 쓸 수 있어요</p>
        <nuxt-link :to="{ path: '/login', query: { redirect: '/my' } }" class="btn-primary w-full mt-4">로그인</nuxt-link>
      </div>
      <div v-else class="skeleton h-24 rounded-2xl"></div>
    </section>

    <!-- 머니 -->
    <section v-if="authStore.isStLoggedIn" class="mx-4 rounded-2xl border border-[var(--dm-line)] px-4 py-4 flex items-center justify-between">
      <div><span class="text-[13px] muted">danmoo 머니 <span class="text-[11px]">(쇼핑몰 적립금과 같은 지갑)</span></span><p class="text-[20px] font-extrabold">{{ money === null ? "—" : `${money.toLocaleString()}원` }}</p></div>
      <button type="button" class="btn-soft" @click="handleBtnAction('money-charge')">충전</button>
    </section>

    <!-- 메뉴 -->
    <section v-for="g in menuGroups" :key="g.title" class="px-4 pt-6">
      <h2 class="text-[15px] font-extrabold muted mb-1">{{ g.title }}</h2>
      <ul>
        <li v-for="m in g.items" :key="m.label">
          <button type="button" class="dm-menu" @click="handleSelectAction('menu-open', m)">
            <span><i :class="m.icon"></i>{{ m.label }}</span>
            <span class="r"><template v-if="m.key === 'town'">{{ town }}</template><i class="fas fa-chevron-right text-[11px]"></i></span>
          </button>
        </li>
      </ul>
    </section>

    <p class="muted text-[11px] mt-8 mb-6 text-center">site {{ tenant.siteId }} · {{ tenant.moduleId }} · {{ envNm }}</p>

    <dm-sheet :open="townOpen" title="내 동네 설정" @close="townOpen = false">
      <div class="grid grid-cols-2 gap-2">
        <button v-for="n in DM_NEIGHBORHOODS" :key="n" type="button" class="h-11 rounded-lg text-[15px] font-semibold" :class="n === town ? 'bg-[var(--dm-primary)] text-white' : 'bg-[var(--dm-chip)]'" @click="handleSelectAction('town-pick', n)">{{ n }}</button>
      </div>
    </dm-sheet>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useDmTown } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_NEIGHBORHOODS } from "~/conts/tenant/danmoo1";
import { myInfoSvc } from "~/svc/fo/ec/my/myInfoSvc";
import { mbLikeSvc } from "~/svc/fo/ec/mb/mbLikeSvc";
import { myCouponSvc } from "~/svc/fo/my/myCouponSvc";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";

/* ##### [01] 초기 변수 정의 ################################################## */

type MenuItem = { key: string; label: string; icon: string; to?: string };
const currentFilePath = useCurrentFilePath();
useHead({ title: "나의 danmoo" });
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const tenant = useTenant();
const envNm = useRuntimeConfig().public.envNm;
const { town, setTown } = useDmTown();
const { openAlert } = useAlert();
const { openConfirm } = useConfirm();
const money = ref<number | null>(null);
const likeCnt = ref<number | null>(null);
const couponCnt = ref<number | null>(null);
const chatCnt = ref<number | null>(null);
const townOpen = ref(false);
const ready = ref(false);

const stats = computed(() => [
  { label: "관심", value: likeCnt.value, to: "/my/likes" },
  { label: "채팅", value: chatCnt.value, to: "/chat" },
  { label: "쿠폰", value: couponCnt.value, to: "/my/coupons" },
  { label: "판매", value: (authStore.user?.sellerIds?.length ?? 0) > 0 ? "판매자" : "-", to: "/my/prods" },
]);
const menuGroups = computed<{ title: string; items: MenuItem[] }[]>(() => [
  { title: "나의 거래", items: [
    { key: "sales", label: "판매내역", icon: "far fa-clipboard", to: "/my/prods" },
    { key: "buys", label: "구매내역", icon: "far fa-shopping-bag", to: "/my/orders" },
    { key: "likes", label: "관심목록", icon: "far fa-heart", to: "/my/likes" },
    { key: "coupons", label: "쿠폰함", icon: "far fa-ticket-alt", to: "/my/coupons" },
    { key: "posts", label: "모아보기 (내가 쓴 글)", icon: "far fa-folder-open", to: "/my/posts" },
  ] },
  { title: "나의 동네", items: [
    { key: "town", label: "내 동네 설정", icon: "far fa-map-marker-alt" },
    { key: "verify", label: "동네 인증하기", icon: "far fa-check-circle" },
    { key: "community", label: "동네생활 글", icon: "far fa-comments", to: "/community" },
    { key: "map", label: "동네지도", icon: "far fa-map", to: "/map" },
  ] },
  { title: "기타", items: [
    { key: "noti", label: "알림", icon: "far fa-bell", to: "/noti" },
    { key: "settings", label: "설정 (테마·키워드·계정)", icon: "far fa-cog", to: "/my/settings" },
    ...(authStore.isStLoggedIn ? [{ key: "logout", label: "로그아웃", icon: "far fa-sign-out-alt" }] : []),
  ] },
]);

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = (cmd: string) => {
  if (cmd === "my-profile") return openAlert({ title: "프로필", message: "프로필 편집은 준비 중이에요. 이름·연락처는 ShopJoy 마이페이지에서 바꿀 수 있어요.", variant: "info" });
  if (cmd === "money-charge") return openAlert({ title: "danmoo 머니", message: "머니 충전은 준비 중이에요. (잔액은 쇼핑몰 적립금과 같은 값이에요)", variant: "info" });
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 메뉴/동네 선택 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = async (cmd: string, param: MenuItem | string) => {
  if (cmd === "town-pick" && typeof param === "string") {
    setTown(param);
    townOpen.value = false;
    return;
  }
  if (cmd === "menu-open" && typeof param !== "string") {
    if (param.to) return navigateTo(param.to);
    if (param.key === "town") return (townOpen.value = true);
    if (param.key === "logout") {
      if (!(await openConfirm({ title: "로그아웃", message: "로그아웃 할까요?" }))) return;
      await authStore.setStLogout();
      money.value = likeCnt.value = couponCnt.value = chatCnt.value = null;
      return;
    }
    return openAlert({ title: param.label, message: "준비 중인 기능이에요.", variant: "info" });
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* initPage — 로그인 복원을 기다린 뒤 머니·관심·쿠폰·채팅 수 */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  const safe = <T,>(p: Promise<T>, label: string): Promise<T | null> => p.catch((e) => { console.error(`[danmoo1/my] ${label} 조회 실패`, e); return null; });
  const [m, likes, coupons, chats] = await Promise.all([
    safe(myInfoSvc.getCacheBalance(), "머니 잔액"),
    safe(mbLikeSvc.getMyLikes("PRODUCT"), "관심"),
    safe(myCouponSvc.getList({}), "쿠폰"),
    safe(myChatSvc.getMyList(), "채팅"),
  ]);
  money.value = m ?? 0;
  likeCnt.value = likes?.length ?? 0;
  couponCnt.value = coupons?.length ?? 0;
  chatCnt.value = chats?.length ?? 0;
};
onMounted(initPage);
</script>
