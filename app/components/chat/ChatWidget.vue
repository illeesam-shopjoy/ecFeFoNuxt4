<template>
  <div>
    <!-- 채팅 패널 -->
    <div
      v-if="chatState.open"
      class="fixed z-[8800] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#ffe4ec]"
      style="right: 19px; bottom: calc(156px + var(--fab-lift, 0px)); transition: bottom 0.2s ease; width: min(340px, calc(100vw - 38px)); height: 480px"
    >
      <!-- 패널 헤더 -->
      <div class="border-b border-[#ffc9d6]" style="background: linear-gradient(135deg, #fff0f4 0%, #ffe4ec 60%, #ffd5e1 100%)">
        <div class="flex items-center gap-2 px-3.5 pt-3 pb-2">
          <span class="text-lg">💬</span>
          <div class="flex-1">
            <div class="text-[13px] font-extrabold text-[#9f2946]">채팅 상담</div>
            <div class="text-[11px] mt-0.5">
              <span v-if="chatState.needAuth" class="text-indigo-500">● 로그인 필요</span>
              <span v-else-if="chatState.status === 'ACTIVE'" class="text-green-700">● 상담 중</span>
              <span v-else-if="chatState.status === 'PENDING'" class="text-amber-700">● 대기 중</span>
              <span v-else-if="chatState.status === 'CLOSED'" class="text-gray-400">○ 종료됨</span>
              <span v-else class="text-gray-300">연결 중...</span>
            </div>
          </div>
          <button
            v-if="!chatState.needAuth"
            type="button"
            class="text-[11px] px-2 py-1 bg-white/60 border border-[#ffc9d6] rounded text-[#9f2946]"
            :title="chatState.view === 'list' ? '대화로 돌아가기' : '지난 채팅 목록'"
            @click="chatState.view === 'list' ? (chatState.view = 'chat') : showRoomList()"
          >
            {{ chatState.view === "list" ? "대화" : "목록" }}
          </button>
          <button
            v-if="chatState.status !== 'CLOSED' && !chatState.needAuth && chatState.view === 'chat'"
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
        <div class="text-sm font-bold text-gray-800 leading-relaxed">채팅 상담은 로그인 또는<br />휴대폰 인증 후 이용할 수 있습니다.</div>
        <!-- 휴대폰 문자인증 -->
        <div class="w-full max-w-[240px] flex flex-col gap-2 text-left">
          <div class="flex gap-1.5">
            <input
              v-model="sms.phone"
              type="tel"
              inputmode="numeric"
              maxlength="13"
              placeholder="휴대폰 번호 (- 없이)"
              class="flex-1 min-w-0 border border-gray-300 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-[#e8587a]"
              :disabled="sms.busy"
              @keydown.enter.prevent="sendSmsCode"
            />
            <button
              type="button"
              class="px-2.5 rounded-lg bg-gray-900 text-white text-[12px] font-bold disabled:opacity-50 whitespace-nowrap"
              :disabled="sms.busy || sms.cooldown > 0"
              @click="sendSmsCode"
            >
              {{ sms.cooldown > 0 ? sms.cooldown + "초" : sms.sent ? "재전송" : "인증번호" }}
            </button>
          </div>
          <div v-if="sms.sent" class="flex gap-1.5">
            <input
              v-model="sms.code"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="인증번호 6자리"
              class="flex-1 min-w-0 border border-gray-300 rounded-lg px-2.5 py-2 text-[13px] tracking-widest outline-none focus:border-[#e8587a]"
              :disabled="sms.busy"
              @keydown.enter.prevent="verifySmsCode"
            />
            <button
              type="button"
              class="px-2.5 rounded-lg text-white text-[12px] font-bold disabled:opacity-50 whitespace-nowrap"
              style="background: linear-gradient(135deg, #ff8fab, #e8587a)"
              :disabled="sms.busy || sms.code.trim().length < 4"
              @click="verifySmsCode"
            >
              확인
            </button>
          </div>
          <p v-if="sms.info" class="m-0 text-[11px] leading-snug text-gray-500">{{ sms.info }}</p>
          <p v-if="sms.err" class="m-0 text-[11px] leading-snug text-red-500">{{ sms.err }}</p>
        </div>
        <button
          v-if="passEnabled"
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
      <!-- 지난 채팅 목록 (진행중/종료) — 클릭하면 그 대화로 이동해 이어간다 -->
      <div v-if="!chatState.needAuth && chatState.view === 'list'" class="flex-1 overflow-y-auto bg-gray-50">
        <button
          type="button"
          class="w-full text-left px-3.5 py-2.5 text-[12px] font-bold text-[#9f2946] bg-white border-b border-[#ffe4ec] hover:bg-[#fff5f8]"
          @click="startNewChat"
        >
          ＋ 새 채팅 상담 시작
        </button>
        <div v-if="chatState.roomsLoading" class="text-center text-gray-300 text-xs py-6">⏳ 불러오는 중...</div>
        <div v-else-if="chatState.rooms.length === 0" class="text-center text-gray-300 text-xs py-8">지난 채팅이 없습니다.</div>
        <button
          v-for="r in chatState.rooms"
          :key="r.chattId"
          type="button"
          class="w-full text-left px-3.5 py-2.5 border-b border-[#ffe4ec] bg-white hover:bg-[#fff5f8] flex items-center gap-2"
          @click="openExistingRoom(r)"
        >
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-semibold text-gray-800 truncate">{{ r.subject || "채팅 상담" }}</div>
            <div class="text-[11px] text-gray-400 mt-0.5">{{ String(r.lastMsgDate || r.regDate || "").slice(0, 16).replace("T", " ") }}</div>
          </div>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
            :class="r.chattStatusCd === 'CLOSED' || r.chattStatusCd === 'DONE' ? 'bg-gray-100 text-gray-500' : r.chattStatusCd === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ r.chattStatusCd === "CLOSED" || r.chattStatusCd === "DONE" ? "종료" : r.chattStatusCd === "ACTIVE" ? "진행중" : "대기중" }}
          </span>
        </button>
      </div>

      <div v-if="!chatState.needAuth && chatState.view === 'chat'" id="fo-chat-msgbox" class="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50">
        <div v-if="chatState.loading" class="text-center text-gray-300 text-xs py-5">⏳ 연결 중...</div>
        <template v-for="m in chatState.msgs" :key="m.chattMsgId">
          <div v-if="m.senderTypeCd === 'SYSTEM'" class="text-center text-[11px] text-gray-400 bg-gray-100 rounded-lg py-1.5 px-2.5 mx-5">{{ m.msgText }}</div>
          <div v-else-if="m.senderTypeCd === 'ADMIN'" class="flex items-end gap-1.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style="background: linear-gradient(135deg, #ff8fab, #e8587a)">💁</div>
            <div class="max-w-[75%]">
              <div class="text-[10px] text-gray-400 mb-0.5">상담사</div>
              <div class="bg-white border border-[#ffe4ec] rounded-tr-lg rounded-br-lg rounded-bl-lg px-2.5 py-2 text-[13px] leading-relaxed text-gray-800 shadow-sm">
                <img v-if="m.msgTypeCd === 'IMAGE'" :src="fnImgSrc(m)" alt="첨부 사진" class="max-w-full max-h-[220px] rounded-lg cursor-pointer" @click="openImg(fnImgSrc(m))" />
                <template v-else>{{ m.msgText }}</template>
              </div>
              <div class="text-[10px] text-gray-300 mt-0.5">{{ m.sendDate ? String(m.sendDate).slice(11, 16) : "" }}</div>
            </div>
          </div>
          <div v-else class="flex flex-row-reverse items-end gap-1.5">
            <div class="max-w-[75%]">
              <div class="rounded-tl-lg rounded-bl-lg rounded-br-lg px-2.5 py-2 text-[13px] leading-relaxed text-white" :class="m._error ? 'opacity-60' : ''" style="background: linear-gradient(135deg, #ff8fab, #e8587a)">
                <img v-if="m.msgTypeCd === 'IMAGE'" :src="fnImgSrc(m)" alt="보낸 사진" class="max-w-full max-h-[220px] rounded-lg cursor-pointer" :class="m._pending ? 'opacity-60' : ''" @click="openImg(fnImgSrc(m))" />
                <template v-else>{{ m.msgText }}</template>
              </div>
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

      <!-- 종료된 채팅을 보고 있을 때: 다시 열어 이어가기 -->
      <div v-if="!chatState.needAuth && chatState.view === 'chat' && chatState.status === 'CLOSED' && chatState.roomId && chatState.roomId !== '_local'" class="p-2.5 border-t border-[#ffe4ec] bg-white">
        <button
          type="button"
          class="w-full py-2 rounded-lg text-white text-[13px] font-bold transition hover:opacity-85"
          style="background: linear-gradient(135deg, #ff8fab, #e8587a)"
          :disabled="chatState.loading"
          @click="reopenCurrentRoom"
        >
          🔁 이 대화 이어서 문의하기
        </button>
      </div>

      <!-- 입력 영역 (로그인 후) -->
      <div v-if="!chatState.needAuth && chatState.view === 'chat' && !(chatState.status === 'CLOSED' && chatState.roomId)" class="p-2.5 border-t border-[#ffe4ec] bg-white flex gap-1.5 items-end">
        <!-- 사진 첨부 / 카메라 촬영 -->
        <div class="flex flex-col gap-1 flex-shrink-0">
          <button
            type="button"
            class="w-[30px] h-[30px] rounded-full border border-[#ffd5e1] bg-white text-[15px] flex items-center justify-center hover:bg-[#fff5f8] disabled:opacity-40"
            title="사진 첨부"
            :disabled="chatState.sending || !chatState.roomId"
            @click="imgInput?.click()"
          >
            🖼️
          </button>
          <button
            type="button"
            class="w-[30px] h-[30px] rounded-full border border-[#ffd5e1] bg-white text-[15px] flex items-center justify-center hover:bg-[#fff5f8] disabled:opacity-40"
            title="카메라로 촬영"
            :disabled="chatState.sending || !chatState.roomId"
            @click="onCameraClick"
          >
            📷
          </button>
        </div>
        <input ref="imgInput" type="file" accept="image/*" class="hidden" @change="onPickImage" />
        <input ref="camInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onPickImage" />
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

    <!-- 사진 오류 안내 -->
    <div v-if="imgErr && chatState.open" class="fixed z-[8850] rounded-lg bg-red-500 text-white text-[12px] px-3 py-1.5 shadow-lg" style="right: 27px; bottom: calc(156px + var(--fab-lift, 0px))" @click="imgErr = ''">{{ imgErr }}</div>

    <!-- PC 웹캠 촬영 창 -->
    <Teleport to="body">
      <div v-if="camOpen" class="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 p-4" @click.self="closeCam">
        <div class="w-full max-w-[420px] rounded-xl bg-white p-4 shadow-xl">
          <p class="m-0 mb-2 text-[0.95rem] font-bold text-gray-800">사진 찍기</p>
          <div class="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
            <video ref="camVideo" autoplay playsinline muted class="h-full w-full -scale-x-100 object-cover"></video>
            <div v-if="camLoading" class="absolute inset-0 flex items-center justify-center text-white">⏳</div>
          </div>
          <p v-if="camErr" class="m-0 mt-2 text-[0.78rem] text-red-500">{{ camErr }}</p>
          <div class="mt-3 flex gap-2">
            <button type="button" class="flex-1 cursor-pointer rounded-md border border-[#c9ced6] bg-white py-2 text-[0.85rem] font-semibold text-gray-700" @click="closeCam">취소</button>
            <button type="button" class="flex-1 cursor-pointer rounded-md bg-[#e8587a] py-2 text-[0.85rem] font-semibold text-white disabled:opacity-40" :disabled="camLoading || !!camErr" @click="snapCam">📸 촬영해서 보내기</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 채팅 플로팅 버튼 — 2026-09-15(요청사항: "최상위버튼과, 채팅버튼이 겹치는네
         최하단에 바가 들어올수 있으니 약간 공백을둬줘") — BackToTop(#scroll a)과 우측 하단에서
         겹쳐 있어 뒤로 밀어 쌓고(_common.scss #scroll a bottom:106px), 화면 맨 아래엔 결제하기
         같은 고정 바가 올라올 여유를 두려고 bottom을 28px→40px로 올림. -->
    <button
      type="button"
      class="fixed z-[8801] w-10 h-10 rounded-full text-white text-lg flex items-center justify-center shadow-lg transition-[bottom,transform] duration-200 hover:scale-110"
      style="right: 19px; bottom: calc(92px + var(--fab-lift, 0px)); background: linear-gradient(135deg, #ff8fab, #e8587a); box-shadow: 0 2px 8px rgba(232, 88, 122, 0.4)"
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
import { reactive, ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/store/useAuthStore";
import { usePassIdentity } from "~/composables/usePassIdentity";
import { authSvc } from "~/svc/co/auth/authSvc";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";
import { openChatStream, type ChatStreamHandle } from "~/composables/useChatStream";
import type { CmChattMsgViewType } from "~/types/cm/cmChattMsgViewType";
import type { CmChattParticipantType } from "~/types/cm/cmChattParticipantType";
import type { CmChattType } from "~/types/cm/cmChattType";

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
  view: "chat" as "chat" | "list", // 대화 화면 / 지난 채팅 목록
  rooms: [] as CmChattType[],
  roomsLoading: false,
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

/** 새 메시지 조회 — 마지막 메시지 ID 이후만 가져온다(스트림 신호·폴링 공용) */
let lastFetchAt = 0;
async function fnFetchNewMsgs() {
  if (!chatState.roomId || chatState.roomId === "_local" || !chatState.open) return;
  lastFetchAt = Date.now();
  try {
    const real = chatState.msgs.filter((m) => !String(m.chattMsgId).startsWith("_"));
    const lastId = real.length > 0 ? real[real.length - 1]!.chattMsgId : null;
    const newMsgs = await myChatSvc.getMessages(chatState.roomId, lastId);
    // 내가 방금 보낸 임시 메시지(_tmp_)는 서버 메시지로 대체된다
    const fresh = newMsgs.filter((m) => !chatState.msgs.some((x) => x.chattMsgId === m.chattMsgId));
    if (fresh.length > 0) {
      chatState.msgs = chatState.msgs.filter((m) => !(String(m.chattMsgId).startsWith("_tmp_") && fresh.some((f) => f.msgText === m.msgText && f.senderTypeCd === m.senderTypeCd)));
      chatState.msgs.push(...fresh);
      fnChatScrollBottom();
    }
  } catch (err) {
    console.warn("[chatFetch]", err);
  }
}

// 실시간: 서버가 새 메시지/상태 변경 신호를 보내면(SSE) 바로 조회한다. 스트림이 끊겨 있는 동안만 3초 폴링이 보완하고,
// 연결돼 있을 때는 20초에 한 번만 확인한다(안전망).
let chatStream: ChatStreamHandle | null = null;
let chatStreamRoom: string | null = null;
let streamConnected = false;

function fnStartChatStream() {
  if (!chatState.roomId || chatState.roomId === "_local") return;
  if (chatStream && chatStreamRoom === chatState.roomId) return;
  chatStream?.close();
  chatStreamRoom = chatState.roomId;
  chatStream = openChatStream(
    `/fo/my/chat/${encodeURIComponent(chatState.roomId)}/stream`,
    (event, data) => {
      if (event === "status" && typeof data.statusCd === "string") chatState.status = data.statusCd;
      if (event === "msg" || event === "status") void fnFetchNewMsgs();
    },
    (connected) => {
      streamConnected = connected;
      if (connected) void fnFetchNewMsgs(); // 연결(재연결) 직후 놓친 메시지 보충
    },
    () => myChatSvc.getMyList(), // 재연결 전에 토큰 갱신 유도
  );
}

function fnStartChatPoll() {
  fnStartChatStream();
  if (chatPollTimer) return;
  chatPollTimer = setInterval(() => {
    if (streamConnected && Date.now() - lastFetchAt < 20000) return;
    void fnFetchNewMsgs();
  }, 3000);
}
function fnStopChatPoll() {
  if (chatPollTimer) {
    clearInterval(chatPollTimer);
    chatPollTimer = null;
  }
  chatStream?.close();
  chatStream = null;
  chatStreamRoom = null;
  streamConnected = false;
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

/** 지난 채팅 목록 (진행중/대기/종료) */
async function showRoomList() {
  chatState.view = "list";
  chatState.roomsLoading = true;
  try {
    const rooms = await myChatSvc.getMyList();
    chatState.rooms = [...rooms].sort((a, b) => String(b.lastMsgDate || b.regDate || "").localeCompare(String(a.lastMsgDate || a.regDate || "")));
  } catch (err) {
    console.warn("[showRoomList]", err);
    chatState.rooms = [];
  } finally {
    chatState.roomsLoading = false;
  }
}

/** 목록에서 채팅방 선택 → 그 대화를 불러와 이어간다(종료된 방은 읽기 전용 + 다시 열기 버튼) */
async function openExistingRoom(room: CmChattType) {
  fnStopChatPoll();
  chatState.roomId = room.chattId;
  chatState.status = room.chattStatusCd ?? null;
  chatState.msgs = [];
  chatState.view = "chat";
  chatState.loading = true;
  try {
    chatState.msgs = await myChatSvc.getMessages(room.chattId);
  } catch (err) {
    console.warn("[openExistingRoom]", err);
  } finally {
    chatState.loading = false;
    fnChatScrollBottom();
  }
  if (chatState.status !== "CLOSED") fnStartChatPoll();
  nextTick(() => chatInputRef.value?.focus());
}

/** 종료된 대화를 다시 열어 이어간다 */
async function reopenCurrentRoom() {
  if (!chatState.roomId || chatState.roomId === "_local") return;
  chatState.loading = true;
  try {
    const r = await myChatSvc.reopen(chatState.roomId);
    chatState.status = r.chattStatusCd ?? "PENDING";
    fnStartChatPoll();
    nextTick(() => chatInputRef.value?.focus());
  } catch (err) {
    console.warn("[reopenCurrentRoom]", err);
  } finally {
    chatState.loading = false;
  }
}

/** 새 채팅 상담 시작 — 진행중인 방이 있으면 그 방으로, 없으면 새로 만든다 */
async function startNewChat() {
  fnStopChatPoll();
  chatState.roomId = null;
  chatState.msgs = [];
  chatState.status = null;
  chatState.view = "chat";
  await fnLoadOrCreateRoom();
  if (chatState.roomId && chatState.roomId !== "_local") fnStartChatPoll();
  nextTick(() => chatInputRef.value?.focus());
}

/** 로그아웃 시 채팅 상태를 전부 비운다 — 이전 사용자의 대화가 화면에 남지 않도록 */
function resetChatState() {
  fnStopChatPoll();
  chatState.open = false;
  chatState.roomId = null;
  chatState.msgs = [];
  chatState.inputText = "";
  chatState.sending = false;
  chatState.loading = false;
  chatState.unread = 0;
  chatState.status = null;
  chatState.needAuth = false;
  chatState.tooltipId = null;
  chatState.view = "chat";
  chatState.rooms = [];
  chatState.roomsLoading = false;
  sms.phone = "";
  sms.code = "";
  sms.sent = false;
  sms.err = "";
  sms.info = "";
}
watch(
  () => authStore.isStLoggedIn,
  (loggedIn, was) => {
    if (was && !loggedIn) resetChatState();
  },
);

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
// PASS 연동 키(포트원)가 설정된 환경에서만 PASS 버튼을 보인다(미설정이면 눌러도 오류만 난다)
const passEnabled = computed(() => !!String(useRuntimeConfig().public.portoneStoreId ?? "").trim() && !!String(useRuntimeConfig().public.portoneIdvChannelKey ?? "").trim());

// 휴대폰 문자인증(SMS OTP): 번호 입력 → 인증번호 문자 수신 → 확인 → 임시회원으로 로그인하고 채팅을 연다
const sms = reactive({ phone: "", code: "", sent: false, busy: false, err: "", info: "", cooldown: 0 });
let smsTimer: ReturnType<typeof setInterval> | null = null;
function smsStartCooldown(sec: number) {
  sms.cooldown = sec;
  if (smsTimer) clearInterval(smsTimer);
  smsTimer = setInterval(() => {
    sms.cooldown -= 1;
    if (sms.cooldown <= 0 && smsTimer) {
      clearInterval(smsTimer);
      smsTimer = null;
    }
  }, 1000);
}
const smsErrText = (err: unknown): string => {
  const e = err as { response?: { data?: { message?: string } }; data?: { message?: string }; message?: string };
  return String(e?.response?.data?.message ?? e?.data?.message ?? "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.").split("::")[0]!;
};
async function sendSmsCode() {
  if (sms.busy || sms.cooldown > 0) return;
  sms.err = "";
  sms.info = "";
  if (!/^0\d{9,10}$/.test(sms.phone.replace(/[^0-9]/g, ""))) return void (sms.err = "휴대폰 번호를 정확히 입력해 주세요.");
  sms.busy = true;
  try {
    const r = await authSvc.sendSmsCode(sms.phone);
    sms.sent = true;
    sms.code = "";
    sms.info = `인증번호를 문자로 보냈습니다. (${Math.round(r.expireSeconds / 60)}분 안에 입력)` + (r.devCode ? ` [개발용 인증번호: ${r.devCode}]` : "");
    smsStartCooldown(r.resendSeconds || 60);
  } catch (err) {
    sms.err = smsErrText(err);
  } finally {
    sms.busy = false;
  }
}
async function verifySmsCode() {
  if (sms.busy) return;
  sms.err = "";
  sms.busy = true;
  try {
    const r = await authStore.smsGuestLogin(sms.phone, sms.code.trim());
    if (!r.ok) return void (sms.err = r.message ?? "인증에 실패했습니다.");
    chatState.needAuth = false;
    sms.code = "";
    sms.sent = false;
    sms.info = "";
    if (!chatState.roomId) await fnLoadOrCreateRoom();
    if (chatState.roomId && chatState.roomId !== "_local") fnStartChatPoll();
    nextTick(() => chatInputRef.value?.focus());
  } finally {
    sms.busy = false;
  }
}
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

// ── 사진 첨부 / 카메라 촬영 ─────────────────────────────────────────────
// 갤러리·파일 선택은 <input type=file>, 촬영은 터치 기기(폰/태블릿)에서는 capture 입력으로 카메라 앱을 바로 열고,
// PC 는 웹캠 미리보기 창(getUserMedia)을 쓴다. 올리기 전에 긴 변 1280px 이하 JPEG 로 줄여 용량을 낮춘다.
const cdnBase = useRuntimeConfig().public.prodCdnBase as string;
const imgInput = ref<HTMLInputElement | null>(null);
const camInput = ref<HTMLInputElement | null>(null);
const touchDevice = ref(false);
const imgErr = ref("");
onMounted(() => {
  touchDevice.value = window.matchMedia?.("(pointer: coarse)").matches === true;
});

/** 화면에 보일 사진 주소 — 업로드 중이면 로컬 미리보기, 아니면 CDN 주소(내부 주소는 공개 CDN 으로 보정) */
function fnImgSrc(m: LocalMsg): string {
  return m._preview || fixInternalCdnUrl(resolveCdnUrl(m.msgText, cdnBase), cdnBase) || "";
}
function openImg(src: string) {
  if (src) window.open(src, "_blank", "noopener");
}

async function shrinkImage(src: Blob | HTMLVideoElement, name: string): Promise<File> {
  const MAX = 1280;
  const bmp = src instanceof Blob ? await createImageBitmap(src) : null;
  const sw = bmp ? bmp.width : (src as HTMLVideoElement).videoWidth;
  const sh = bmp ? bmp.height : (src as HTMLVideoElement).videoHeight;
  const scale = Math.min(1, MAX / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  canvas.getContext("2d")!.drawImage((bmp ?? src) as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  bmp?.close();
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("이미지를 만들지 못했습니다.");
  return new File([blob], name, { type: "image/jpeg" });
}

async function sendImageFile(file: File) {
  imgErr.value = "";
  if (!file.type.startsWith("image/")) return void (imgErr.value = "이미지 파일만 보낼 수 있습니다.");
  const roomId = chatState.roomId;
  if (!roomId || roomId === "_local" || chatState.status === "CLOSED" || chatState.sending) return void (imgErr.value = "지금은 사진을 보낼 수 없습니다.");
  chatState.sending = true;
  let small = file;
  try {
    small = await shrinkImage(file, `chat_${Date.now()}.jpg`);
  } catch {
    /* 축소 실패 시 원본으로 진행 */
  }
  if (small.size > 8 * 1024 * 1024) {
    chatState.sending = false;
    return void (imgErr.value = "사진은 8MB 이하만 보낼 수 있습니다.");
  }
  chatState.msgs.push({
    chattMsgId: "_tmp_" + Date.now(),
    chattId: roomId,
    senderTypeCd: "MEMBER",
    msgTypeCd: "IMAGE",
    msgText: "",
    sendDate: new Date().toISOString(),
    _pending: true,
    _preview: URL.createObjectURL(small),
  });
  const t = chatState.msgs[chatState.msgs.length - 1]!; // 반응형 프록시로 다시 잡아야 화면이 갱신된다
  fnChatScrollBottom();
  try {
    const res = await coUploadSvc.uploadMulti([small], "chat");
    const f = res.files?.[0];
    const url = fixInternalCdnUrl(resolveCdnUrl(f?.cdnImgUrl || f?.filePath, cdnBase), cdnBase);
    if (!url || !f?.attachId) throw new Error("업로드 응답에 사진 주소가 없습니다.");
    await myChatSvc.sendImage(roomId, url, f.attachId);
    if (t._preview) URL.revokeObjectURL(t._preview);
    t._preview = undefined;
    t.msgText = url; // 서버 메시지와 같은 값 → 다음 조회 때 임시 메시지가 서버 메시지로 대체된다
    t._pending = false;
    if (chatState.status === "PENDING") chatState.status = "ACTIVE";
  } catch (err) {
    console.warn("[sendImageFile]", err);
    t._error = true;
    t._pending = false;
    imgErr.value = "사진 전송에 실패했습니다.";
  } finally {
    chatState.sending = false;
  }
}

async function onPickImage(e: Event) {
  const el = e.target as HTMLInputElement;
  const file = el.files?.[0];
  el.value = "";
  if (file) await sendImageFile(file);
}

// PC 웹캠 촬영
const camOpen = ref(false);
const camLoading = ref(false);
const camErr = ref("");
const camVideo = ref<HTMLVideoElement | null>(null);
let camStream: MediaStream | null = null;

function stopCamStream() {
  camStream?.getTracks().forEach((tr) => tr.stop());
  camStream = null;
}
function closeCam() {
  stopCamStream();
  camOpen.value = false;
}
async function onCameraClick() {
  imgErr.value = "";
  if (touchDevice.value || !navigator.mediaDevices?.getUserMedia) return void camInput.value?.click();
  camErr.value = "";
  camLoading.value = true;
  camOpen.value = true;
  await nextTick();
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (camVideo.value) {
      camVideo.value.srcObject = camStream;
      await camVideo.value.play().catch(() => undefined);
    }
  } catch (e) {
    const name = (e as { name?: string })?.name;
    camErr.value = name === "NotAllowedError" ? "카메라 사용이 차단되었습니다. 주소창의 카메라 권한을 허용해 주세요." : name === "NotFoundError" ? "사용할 수 있는 카메라가 없습니다." : "카메라를 열 수 없습니다.";
  } finally {
    camLoading.value = false;
  }
}
async function snapCam() {
  const v = camVideo.value;
  if (!v || !v.videoWidth) return;
  try {
    const file = await shrinkImage(v, `chat_${Date.now()}.jpg`);
    closeCam();
    await sendImageFile(file);
  } catch {
    camErr.value = "촬영에 실패했습니다. 다시 시도해 주세요.";
  }
}
onUnmounted(stopCamStream);

function onChatKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMsg();
  }
}

onUnmounted(() => fnStopChatPoll());
</script>
