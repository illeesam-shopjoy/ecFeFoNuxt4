<template>
  <div>
    <!-- 채팅 패널 -->
    <div
      v-if="chatState.open"
      class="fixed z-[8800] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#ffe4ec]"
      style="right: 12px; bottom: calc(156px + var(--fab-lift, 0px)); transition: bottom 0.2s ease; width: min(340px, calc(100vw - 24px)); height: 480px"
    >
      <!-- 패널 헤더 -->
      <div class="border-b border-[#ffc9d6]" style="background: linear-gradient(135deg, #fff0f4 0%, #ffe4ec 60%, #ffd5e1 100%)">
        <div class="flex items-center gap-2 px-3.5 pt-3 pb-2">
          <span class="text-lg">💬</span>
          <div class="flex-1">
            <div class="text-[13px] font-extrabold text-[#9f2946]">채팅 상담</div>
            <div class="text-[11px] mt-0.5">
              <span v-if="chatState.status === 'ACTIVE'" class="text-green-700">● 상담 중</span>
              <span v-else-if="chatState.status === 'PENDING'" class="text-amber-700">● 대기 중</span>
              <span v-else-if="chatState.status === 'CLOSED'" class="text-gray-400">○ 종료됨</span>
              <span v-else-if="chatState.needAuth" class="text-indigo-500">● 로그인 필요</span>
              <span v-else class="text-gray-300">연결 중...</span>
            </div>
          </div>
          <button
            v-if="chatState.status !== 'CLOSED' && !chatState.needAuth"
            type="button"
            class="text-[11px] px-2 py-1 bg-white/60 border border-[#ffc9d6] rounded text-[#9f2946]"
            @click="endChat"
          >
            종료
          </button>
          <button
            type="button"
            class="w-[26px] h-[26px] rounded-full bg-white/60 text-[#9f2946] text-xs inline-flex items-center justify-center hover:bg-[#e8587a] hover:text-white transition"
            @click="closeChat"
            aria-label="채팅 닫기"
          >
            ✕
          </button>
        </div>
        <!-- 참여자 뱃지 행 (로그인 상태일 때만) -->
        <div v-if="!chatState.needAuth" class="px-3.5 pb-2.5 flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] text-[#b06070] font-semibold mr-0.5">참여자</span>
          <div v-for="p in participants" :key="p.id" class="relative inline-flex">
            <button
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 bg-white/75 border border-[#ffc9d6] rounded-full text-[11px] text-[#9f2946] font-semibold whitespace-nowrap hover:bg-white hover:border-[#e8587a] transition"
              @click="chatState.tooltipId = chatState.tooltipId === p.id ? null : p.id"
            >
              <span>{{ p.icon }}</span>
              <span>{{ p.name }}</span>
            </button>
            <div
              v-if="chatState.tooltipId === p.id"
              class="absolute z-[8900] bg-white border border-[#ffe4ec] rounded-lg shadow-lg px-3 py-2.5 min-w-[190px] whitespace-nowrap"
              style="bottom: calc(100% + 6px); left: 0"
            >
              <div class="fixed inset-0" @click="chatState.tooltipId = null"></div>
              <div class="relative z-[1]">
                <div class="text-xs font-extrabold text-[#9f2946] mb-1.5 pb-1.5 border-b border-[#ffe4ec]">{{ p.icon }} {{ p.name }}</div>
                <table class="border-collapse w-full">
                  <tr><td class="text-[10px] text-gray-400 pr-1.5 py-0.5 whitespace-nowrap align-top">사용자유형</td><td class="text-[11px] text-gray-700 font-semibold py-0.5">{{ p.userType || "-" }}</td></tr>
                  <tr><td class="text-[10px] text-gray-400 pr-1.5 py-0.5 whitespace-nowrap align-top">이메일</td><td class="text-[11px] text-gray-700 py-0.5 break-all whitespace-normal">{{ p.email || "-" }}</td></tr>
                  <tr><td class="text-[10px] text-gray-400 pr-1.5 py-0.5 whitespace-nowrap align-top">전화번호</td><td class="text-[11px] text-gray-700 py-0.5">{{ p.phone || "-" }}</td></tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- needAuth: 로그인 유도 화면 -->
      <div v-if="chatState.needAuth" class="flex-1 flex flex-col items-center justify-center px-6 py-7 gap-4 bg-gray-50 text-center">
        <div class="text-4xl leading-none">🔐</div>
        <div class="text-sm font-bold text-gray-800 leading-relaxed">채팅 상담은 로그인 또는<br />PASS 본인인증 후 이용할 수 있습니다.</div>
        <button
          type="button"
          class="w-full max-w-[220px] py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-bold transition hover:opacity-85 disabled:opacity-60"
          :disabled="passBusy"
          @click="startPassChat"
        >
          {{ passBusy ? "인증 중..." : "📱 PASS 본인인증으로 채팅" }}
        </button>
        <p v-if="passErr" class="m-0 text-[11px] leading-snug text-red-500">{{ passErr }}</p>
        <button
          type="button"
          class="w-full max-w-[200px] py-2.5 rounded-lg text-white text-[13px] font-bold transition hover:opacity-85"
          style="background: linear-gradient(135deg, #ff8fab, #e8587a)"
          @click="goLogin"
        >
          🔑 로그인하기
        </button>
      </div>

      <!-- 메시지 영역 (로그인 후) -->
      <div v-if="!chatState.needAuth" id="fo-chat-msgbox" class="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50">
        <div v-if="chatState.loading" class="text-center text-gray-300 text-xs py-5">⏳ 연결 중...</div>
        <template v-for="m in chatState.msgs" :key="m.chattMsgId">
          <div v-if="m.senderTypeCd === 'SYSTEM'" class="text-center text-[11px] text-gray-400 bg-gray-100 rounded-lg py-1.5 px-2.5 mx-5">{{ m.msgText }}</div>
          <div v-else-if="m.senderTypeCd === 'ADMIN'" class="flex items-end gap-1.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background: linear-gradient(135deg, #ff8fab, #e8587a)">💁</div>
            <div class="max-w-[75%]">
              <div class="text-[10px] text-gray-400 mb-0.5">상담사</div>
              <div class="bg-white border border-[#ffe4ec] rounded-tr-lg rounded-br-lg rounded-bl-lg px-2.5 py-2 text-[13px] leading-relaxed text-gray-800 shadow-sm">{{ m.msgText }}</div>
              <div class="text-[10px] text-gray-300 mt-0.5">{{ m.sendDate ? String(m.sendDate).slice(11, 16) : "" }}</div>
            </div>
          </div>
          <div v-else class="flex flex-row-reverse items-end gap-1.5">
            <div class="max-w-[75%]">
              <div class="rounded-tl-lg rounded-bl-lg rounded-br-lg px-2.5 py-2 text-[13px] leading-relaxed text-white" :class="m._error ? 'opacity-60' : ''" style="background: linear-gradient(135deg, #ff8fab, #e8587a)">{{ m.msgText }}</div>
              <div class="text-[10px] text-gray-300 mt-0.5 text-right">
                <span v-if="m._pending" class="text-gray-400">전송 중...</span>
                <span v-else-if="m._error" class="text-red-400">전송 실패</span>
                <span v-else>{{ m.sendDate ? String(m.sendDate).slice(11, 16) : "" }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-if="!chatState.loading && chatState.msgs.length === 0" class="text-center text-gray-300 text-xs py-8">메시지가 없습니다.<br />아래 입력창으로 문의하세요.</div>
      </div>

      <!-- 입력 영역 (로그인 후) -->
      <div v-if="!chatState.needAuth" class="p-2.5 border-t border-[#ffe4ec] bg-white flex gap-1.5 items-end">
        <textarea
          ref="chatInputRef"
          v-model="chatState.inputText"
          placeholder="메시지를 입력하세요 (Enter: 전송)"
          :disabled="chatState.sending || chatState.status === 'CLOSED'"
          rows="2"
          class="flex-1 resize-none border border-[#ffd5e1] rounded-lg px-2.5 py-2 text-[13px] outline-none leading-snug font-sans bg-[#fffafb] focus:border-[#e8587a]"
          @keydown="onChatKeydown"
        ></textarea>
        <button
          type="button"
          class="w-[38px] h-[38px] rounded-full text-white text-base flex items-center justify-center flex-shrink-0 transition"
          :class="!chatState.inputText.trim() || chatState.sending || chatState.status === 'CLOSED' ? 'opacity-40 cursor-not-allowed' : ''"
          style="background: linear-gradient(135deg, #ff8fab, #e8587a)"
          :disabled="!chatState.inputText.trim() || chatState.sending || chatState.status === 'CLOSED'"
          @click="sendChatMsg"
        >
          ➤
        </button>
      </div>
    </div>

    <!-- 채팅 플로팅 버튼 — 2026-09-15(요청사항: "최상위버튼과, 채팅버튼이 겹치는네
         최하단에 바가 들어올수 있으니 약간 공백을둬줘") — BackToTop(#scroll a)과 우측 하단에서
         겹쳐 있어 뒤로 밀어 쌓고(_common.scss #scroll a bottom:106px), 화면 맨 아래엔 결제하기
         같은 고정 바가 올라올 여유를 두려고 bottom을 28px→40px로 올림. -->
    <button
      type="button"
      class="fixed z-[8801] w-[54px] h-[54px] rounded-full text-white text-2xl flex items-center justify-center shadow-lg transition-[bottom,transform] duration-200 hover:scale-110"
      style="right: 12px; bottom: calc(92px + var(--fab-lift, 0px)); background: linear-gradient(135deg, #ff8fab, #e8587a); box-shadow: 0 4px 20px rgba(232, 88, 122, 0.45)"
      :title="chatState.open ? '채팅 닫기' : '채팅 상담 열기'"
      @click="toggleChat"
    >
      <span v-if="chatState.unread > 0 && !chatState.open" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white">
        {{ chatState.unread > 9 ? "9+" : chatState.unread }}
      </span>
      <span v-if="chatState.open">✕</span>
      <span v-else>💬</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 2026-09-15(요청사항: "채팅 outstock 에도 추가해줘") — ecFeBo(components/layout/foAppFooter.js)의
 * 채팅상담 플로팅 버튼+패널을 Outstock(ecFeFoNuxt4)에 이식. Layout.vue에 <back-to-top />처럼
 * 전역 마운트해서 모든 페이지에 노출된다.
 *
 * ecFeBo 원본과의 차이(둘 다 실제 동작하도록 바로잡음, [[ecfefonuxt4-bff-migration-plan]] 참조):
 *  - 방ID 필드는 실제 DTO상 chattRoomId가 아니라 chattId, 발신자 필드는 senderCd가 아니라
 *    senderTypeCd — ecFeBo 쪽 코드가 쓰던 이름은 백엔드 DTO에 없어 항상 undefined였다.
 *  - 방 목록 조회는 실제 컨트롤러 경로인 GET /fo/my/chat(접미사 없음)을 쓴다 — ecFeBo가 쓰던
 *    "/fo/my/chat/list"는 컨트롤러에 없어 GET /{id}(id="list")로 잘못 라우팅되는 경로였다.
 */
import { reactive, ref, computed, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/store/useAuthStore";
import { usePassIdentity } from "~/composables/usePassIdentity";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";
import type { CmChattMsgViewType } from "~/types/cm/cmChattMsgViewType";
import type { CmChattParticipantType } from "~/types/cm/cmChattParticipantType";

type LocalMsg = CmChattMsgViewType;

const router = useRouter();
const authStore = useAuthStore();

const chatState = reactive({
  open: false,
  roomId: null as string | null,
  msgs: [] as LocalMsg[],
  inputText: "",
  sending: false,
  loading: false,
  unread: 0,
  status: null as string | null,
  needAuth: false,
  tooltipId: null as string | null,
});
let chatPollTimer: ReturnType<typeof setInterval> | null = null;
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

const participants = computed<CmChattParticipantType[]>(() => {
  const result: CmChattParticipantType[] = [{ id: "_admin", icon: "💁", name: "상담사", email: "cs@shopjoy.com", userType: "상담 직원", phone: "" }];
  const user = authStore.user;
  if (user) {
    result.push({
      id: user.memberId,
      icon: "👤",
      name: user.userNm || "회원",
      email: user.userEmail || "",
      userType: "회원",
      phone: user.userPhone || "",
    });
  }
  return result;
});

function fnChatScrollBottom() {
  nextTick(() => {
    const el = document.getElementById("fo-chat-msgbox");
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function fnStartChatPoll() {
  if (chatPollTimer) return;
  chatPollTimer = setInterval(async () => {
    if (!chatState.roomId || chatState.roomId === "_local" || !chatState.open) return;
    try {
      const lastId = chatState.msgs.length > 0 ? chatState.msgs[chatState.msgs.length - 1]!.chattMsgId : null;
      const newMsgs = await myChatSvc.getMessages(chatState.roomId, lastId);
      if (newMsgs.length > 0) {
        chatState.msgs.push(...newMsgs);
        fnChatScrollBottom();
      }
    } catch (err) {
      console.warn("[chatPoll]", err);
    }
  }, 3000);
}
function fnStopChatPoll() {
  if (chatPollTimer) {
    clearInterval(chatPollTimer);
    chatPollTimer = null;
  }
}

async function fnLoadOrCreateRoom() {
  chatState.loading = true;
  try {
    const rooms = await myChatSvc.getMyList();
    const activeRoom = rooms.find((r) => r.chattStatusCd === "PENDING" || r.chattStatusCd === "ACTIVE");
    if (activeRoom) {
      chatState.roomId = activeRoom.chattId;
      chatState.status = activeRoom.chattStatusCd ?? null;
      chatState.msgs = await myChatSvc.getMessages(chatState.roomId);
    } else {
      const newRoom = await myChatSvc.openRoom("채팅 상담 문의");
      chatState.roomId = newRoom.chattId;
      chatState.status = "PENDING";
      chatState.msgs = [{ chattMsgId: "_welcome", chattId: newRoom.chattId, senderTypeCd: "SYSTEM", msgText: "안녕하세요! 채팅 상담을 시작합니다. 담당자가 곧 연결됩니다.", sendDate: new Date().toISOString() }];
    }
  } catch (err) {
    console.warn("[fnLoadOrCreateRoom]", err);
    chatState.roomId = "_local";
    chatState.status = "PENDING";
    chatState.msgs = [{ chattMsgId: "_welcome", chattId: "_local", senderTypeCd: "SYSTEM", msgText: "채팅 상담에 오신 것을 환영합니다. 로그인 후 상담을 시작할 수 있습니다.", sendDate: new Date().toISOString() }];
  } finally {
    chatState.loading = false;
    fnChatScrollBottom();
  }
}

async function toggleChat() {
  chatState.open = !chatState.open;
  chatState.unread = 0;
  chatState.needAuth = false;
  if (chatState.open) {
    if (!authStore.isStLoggedIn) {
      chatState.needAuth = true;
      return;
    }
    if (!chatState.roomId) await fnLoadOrCreateRoom();
    if (chatState.roomId && chatState.roomId !== "_local") fnStartChatPoll();
    nextTick(() => chatInputRef.value?.focus());
  } else {
    fnStopChatPoll();
  }
}

function closeChat() {
  chatState.open = false;
  fnStopChatPoll();
}

// 비로그인: PASS 본인인증 → PASS 임시회원으로 로그인한 뒤 바로 채팅을 연다
const pass = usePassIdentity();
const passBusy = pass.busy;
const passErr = ref("");
async function startPassChat() {
  passErr.value = "";
  const v = await pass.start();
  if (!v) return;
  const r = await authStore.passGuestLogin(v.identityVerificationId);
  if (!r.ok) return void (passErr.value = r.message ?? "본인인증 로그인에 실패했습니다.");
  chatState.needAuth = false;
  if (!chatState.roomId) await fnLoadOrCreateRoom();
  if (chatState.roomId && chatState.roomId !== "_local") fnStartChatPoll();
  nextTick(() => chatInputRef.value?.focus());
}

function goLogin() {
  chatState.open = false;
  router.push("/login");
}

async function sendChatMsg() {
  const text = chatState.inputText.trim();
  if (!text || chatState.sending) return;
  chatState.sending = true;
  const tempMsg: LocalMsg = { chattMsgId: "_tmp_" + Date.now(), chattId: chatState.roomId ?? "_local", senderTypeCd: "MEMBER", msgText: text, sendDate: new Date().toISOString(), _pending: true };
  chatState.msgs.push(tempMsg);
  chatState.inputText = "";
  fnChatScrollBottom();
  try {
    if (chatState.roomId && chatState.roomId !== "_local") {
      await myChatSvc.sendMsg(chatState.roomId, text);
      tempMsg._pending = false;
      if (chatState.status === "PENDING") chatState.status = "ACTIVE";
    }
  } catch (err) {
    console.warn("[sendChatMsg]", err);
    tempMsg._error = true;
    tempMsg._pending = false;
  } finally {
    chatState.sending = false;
  }
}

async function endChat() {
  if (chatState.roomId && chatState.roomId !== "_local") {
    try {
      await myChatSvc.sendMsg(chatState.roomId, "[채팅 종료 요청]");
    } catch {
      /** 무시 */
    }
  }
  chatState.msgs.push({ chattMsgId: "_end", chattId: chatState.roomId ?? "_local", senderTypeCd: "SYSTEM", msgText: "채팅을 종료했습니다. 이용해 주셔서 감사합니다.", sendDate: new Date().toISOString() });
  chatState.status = "CLOSED";
  chatState.roomId = null;
  fnStopChatPoll();
  fnChatScrollBottom();
}

function onChatKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMsg();
  }
}

onUnmounted(() => fnStopChatPoll());
</script>
