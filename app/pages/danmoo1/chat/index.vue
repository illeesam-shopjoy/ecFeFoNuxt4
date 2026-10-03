<template>
  <!-- 채팅 목록 — ecBeBo 고객센터 채팅방(FoCmChattController, 회원당 진행중 방 1개). 상품 "채팅하기"·가격 제안도 이 방에 상품 참조 메시지로 들어온다(회원끼리 직접 채팅 API 는 없음) -->
  <layout>
    <template #top>
      <dm-title-bar title="채팅" :back="false">
        <template #right><button v-if="authStore.isStLoggedIn" type="button" class="text-[14px] primary font-bold px-2" @click="handleBtnAction('chat-new')"><i class="far fa-plus mr-1"></i>새 문의</button></template>
      </dm-title-bar>
      <div class="dm-segs">
        <button v-for="t in TABS" :key="t.key" type="button" class="dm-seg" :class="{ on: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </div>
    </template>

    <dm-empty v-if="ready && !authStore.isStLoggedIn" icon="far fa-comment-dots" title="로그인하면 채팅을 볼 수 있어요">
      <nuxt-link :to="{ path: '/login', query: { redirect: '/chat' } }" class="btn-primary mt-3 px-8">로그인</nuxt-link>
    </dm-empty>
    <div v-else-if="!ready || loading" class="p-8 text-center muted">불러오는 중…</div>
    <dm-empty v-else-if="!visible.length" icon="far fa-comments" :title="rooms.length ? '해당하는 채팅이 없어요' : '아직 채팅이 없어요'" desc="물건 상세의 '채팅하기'·'가격 제안' 또는 새 문의로 대화를 시작해 보세요 (답장은 운영자가 드려요)">
      <button v-if="!rooms.length" type="button" class="btn-primary mt-3 px-8" @click="handleBtnAction('chat-new')">새 문의 시작</button>
    </dm-empty>
    <ul v-else>
      <li v-for="r in visible" :key="r.chattId">
        <nuxt-link :to="`/chat/${r.chattId}`" class="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--dm-line)]">
          <span class="relative w-12 h-12 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] inline-flex items-center justify-center text-[18px] flex-none">
            <i class="fas fa-headset"></i>
            <span v-if="isUnread(r)" class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--dm-primary)] border-2 border-[var(--dm-bg)]"></span>
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2"><b class="text-[15px] truncate">{{ r.subject || "채팅" }}</b><span class="text-[12px] muted flex-none">{{ timeAgo(r.lastMsgDate || r.regDate) }}</span></div>
            <p class="text-[14px] truncate mt-0.5" :class="isUnread(r) ? 'font-semibold' : 'muted'">{{ r.lastMsg?.msgTypeCd === "IMAGE" ? "사진" : r.lastMsg?.msgText || "대화를 시작해 보세요" }}</p>
          </div>
          <span v-if="r.chattStatusCd === 'DONE'" class="text-[11px] px-1.5 py-0.5 rounded bg-[var(--dm-chip)] muted flex-none">종료</span>
        </nuxt-link>
      </li>
    </ul>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmEmpty from "~/components/danmoo1/dm/DmEmpty.vue";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";
import { timeAgo } from "~/utils/timeAgo";
import type { CmChattType } from "~/types/cm/cmChattType";

/* ##### [01] 초기 변수 정의 ################################################## */

useHead({ title: "채팅" });
const authStore = useAuthStore();
const { openAlert } = useAlert();
const TABS = [{ key: "all", label: "전체" }, { key: "open", label: "진행중" }, { key: "done", label: "종료" }] as const;
const tab = ref<(typeof TABS)[number]["key"]>("all");
const rooms = ref<CmChattType[]>([]);
const loading = ref(false);
const ready = ref(false);
const visible = computed(() => rooms.value.filter((r) => tab.value === "all" || (tab.value === "done" ? r.chattStatusCd === "DONE" : r.chattStatusCd !== "DONE")));
// 마지막 메시지가 상대(운영자) 것이고 아직 안 읽었으면 표시
const isUnread = (r: CmChattType) => !!r.lastMsg && r.lastMsg.senderTypeCd !== "MEMBER" && r.lastMsg.readYn !== "Y";

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "chat-new") {
    try {
      const room = await myChatSvc.openRoom("고객 문의");
      return navigateTo(`/chat/${room.chattId}`);
    } catch (e) {
      console.error("[danmoo1/chat] 채팅방 열기 실패", e);
      return openAlert("채팅방을 열지 못했어요. 다시 로그인한 뒤 시도해 주세요.");
    }
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

/* initPage — 로그인 복원을 기다린 뒤 내 채팅방 목록(최근 메시지순) */
const initPage = async () => {
  await useAuthReady();
  ready.value = true;
  if (!authStore.isStLoggedIn) return;
  loading.value = true;
  try {
    rooms.value = (await myChatSvc.getMyList()).sort((a, b) => String(b.lastMsgDate || b.regDate || "").localeCompare(String(a.lastMsgDate || a.regDate || "")));
  } catch (e) {
    console.error("[danmoo1/chat] 채팅방 목록 조회 실패", e);
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
</script>
