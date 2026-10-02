<template>
  <!-- 알림 — 활동(마이페이지 알림 API) / 새 글(검색에서 등록한 키워드의 새 물건, 이 브라우저 저장) -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar title="알림">
        <template #right>
          <button v-if="tab === 'act' && notis.some((n) => n.readYn !== 'Y')" type="button" class="text-[13px] muted px-2" @click="handleBtnAction('noti-read-all')">모두 읽음</button>
          <nuxt-link v-if="tab === 'new'" to="/my/settings" class="text-[13px] muted px-2">키워드 관리</nuxt-link>
        </template>
      </dm-title-bar>
      <div class="dm-segs">
        <button v-for="t in TABS" :key="t.key" type="button" class="dm-seg" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <!-- 활동 알림 -->
    <div v-if="tab === 'act'">
      <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-bell" title="로그인하면 알림을 볼 수 있어요">
        <nuxt-link :to="{ path: '/login', query: { redirect: '/noti' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
      </dm-empty>
      <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
      <dm-empty v-else-if="!notis.length" icon="far fa-bell-slash" title="새로운 알림이 없어요" desc="채팅·거래·댓글 소식이 여기에 모여요" />
      <ul v-else>
        <li v-for="n in notis" :key="n.notiId" class="flex gap-3 px-4 py-3.5 border-b border-[var(--dm-line)]" :class="{ 'bg-[var(--dm-primary-soft)]/40': n.readYn !== 'Y' }">
          <span class="w-10 h-10 rounded-full flex-none flex items-center justify-center bg-[var(--dm-chip)] text-[var(--dm-primary)]"><i :class="iconOf(n.notiTypeCd)"></i></span>
          <button type="button" class="flex-1 min-w-0 text-left" @click="handleSelectAction('noti-open', n)">
            <div class="flex items-center gap-2 text-[12px] muted"><span>{{ n.notiTypeCdNm || "알림" }}</span><span>·</span><span>{{ timeAgo(n.regDate) }}</span></div>
            <p class="text-[15px] mt-0.5" :class="{ 'font-bold': n.readYn !== 'Y' }">{{ n.notiTitle }}</p>
            <p v-if="n.notiContent" class="text-[13px] muted clamp-2 mt-0.5">{{ n.notiContent }}</p>
          </button>
          <button type="button" class="icon-btn !w-8 !h-8 text-[14px] muted" aria-label="삭제" @click="handleSelectAction('noti-remove', n)"><i class="fas fa-times"></i></button>
        </li>
      </ul>
    </div>

    <!-- 키워드 새 글 -->
    <div v-else>
      <dm-empty v-if="!keywords.length" icon="far fa-tag" title="키워드 알림을 등록해 보세요" desc="검색 결과에서 '키워드 알림'을 누르면 그 키워드의 새 물건을 여기서 모아 볼 수 있어요">
        <nuxt-link to="/search" class="btn-primary mt-3 px-8">검색하러 가기</nuxt-link>
      </dm-empty>
      <section v-for="k in keywords" :key="k" class="border-b border-[var(--dm-line)]">
        <div class="flex items-center justify-between px-4 pt-4 pb-1">
          <nuxt-link :to="{ path: '/search', query: { q: k } }" class="text-[16px] font-bold"><i class="far fa-tag primary mr-1.5"></i>{{ k }}</nuxt-link>
          <button type="button" class="text-[13px] muted" @click="handleSelectAction('keyword-remove', k)">알림 해제</button>
        </div>
        <template v-if="kwItems[k]?.length"><dm-prod-card v-for="p in kwItems[k]" :key="p.prodId" :prod="p" /></template>
        <p v-else class="muted text-[14px] px-4 pb-4">{{ kwLoading ? "확인 중…" : "아직 새 물건이 없어요" }}</p>
      </section>
    </div>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmProdCard from "~/components/danmoo1/dm/DmProdCard.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { readLocalList, writeLocalList } from "~/composables/useDmTown";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { DM_KEYWORD_ALERT_KEY } from "~/conts/tenant/danmoo1";
import { myNotiSvc } from "~/svc/fo/my/myNotiSvc";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { timeAgo } from "~/utils/timeAgo";
import type { SyNotiType } from "~/types/sy/syNotiType";
import type { PdProdType } from "~/types/pd/pdProdType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
useHead({ title: "알림" });
const authStore = useAuthStore();
const route = useRoute();
const { openAlert } = useAlert();

const TABS = [{ key: "act", label: "활동 알림" }, { key: "new", label: "새 글 알림" }] as const;
const tab = ref<(typeof TABS)[number]["key"]>(route.query.tab === "new" ? "new" : "act");
const notis = ref<SyNotiType[]>([]);
const loading = ref(false);
const ready = ref(false);
const keywords = ref<string[]>([]);
const kwItems = reactive<Record<string, PdProdType[]>>({});
const kwLoading = ref(false);

const iconOf = (cd?: string) => ({ CHAT: "far fa-comment", ORDER: "far fa-shopping-bag", PROMO: "far fa-gift", SYSTEM: "far fa-info-circle" })[String(cd ?? "").toUpperCase()] ?? "far fa-bell";

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "noti-read-all") {
    try {
      await myNotiSvc.markAllRead();
      notis.value = notis.value.map((n) => ({ ...n, readYn: "Y" }));
    } catch (e) {
      console.error("[danmoo1/noti] 전체 읽음 실패", e);
      await openAlert("읽음 처리에 실패했어요.");
    }
    return;
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* handleSelectAction — 행 액션 dispatch (cmd: '{영역명}-기능명') */
const handleSelectAction = async (cmd: string, param: SyNotiType | string) => {
  if (cmd === "noti-open" && typeof param !== "string") {
    if (param.readYn !== "Y") {
      param.readYn = "Y";
      myNotiSvc.markRead(param.notiId).catch((e) => console.error("[danmoo1/noti] 읽음 처리 실패", e));
    }
    // 링크가 쇼핑몰(ec1) 주소면 danmoo1 에 없는 화면일 수 있어 홈 하위 주소만 따라간다
    if (param.linkPage && param.linkPage.startsWith("/")) return navigateTo(param.linkPage);
    return;
  }
  if (cmd === "noti-remove" && typeof param !== "string") {
    try {
      await myNotiSvc.remove(param.notiId);
      notis.value = notis.value.filter((n) => n.notiId !== param.notiId);
    } catch (e) {
      console.error("[danmoo1/noti] 알림 삭제 실패", e);
    }
    return;
  }
  if (cmd === "keyword-remove" && typeof param === "string") {
    keywords.value = keywords.value.filter((k) => k !== param);
    writeLocalList(DM_KEYWORD_ALERT_KEY, keywords.value);
    return;
  }
  console.warn("[handleSelectAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* fnLoadNotis — 로그인 복원 후 활동 알림 50건 */
const fnLoadNotis = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  loading.value = true;
  try {
    notis.value = await myNotiSvc.getList(50);
  } catch (e) {
    console.error("[danmoo1/noti] 알림 조회 실패", e);
  } finally {
    loading.value = false;
  }
};

/* fnLoadKeywords — 키워드마다 최신 물건 5건 */
const fnLoadKeywords = async () => {
  keywords.value = readLocalList(DM_KEYWORD_ALERT_KEY, 10);
  if (!keywords.value.length) return;
  kwLoading.value = true;
  await Promise.all(
    keywords.value.map(async (k) => {
      try {
        kwItems[k] = (await pdProductSvc.getPaged({ pageNo: 1, pageSize: 5, keyword: k, sort: "regDate desc" })).items;
      } catch (e) {
        console.error("[danmoo1/noti] 키워드 조회 실패", k, e);
        kwItems[k] = [];
      }
    }),
  );
  kwLoading.value = false;
};

onMounted(() => Promise.all([fnLoadNotis(), fnLoadKeywords()]));
</script>
