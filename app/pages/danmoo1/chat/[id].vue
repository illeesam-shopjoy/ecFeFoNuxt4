<template>
  <!-- 채팅방 — 상단에 문의 중인 물건 카드(상품 참조 메시지 기준), 메시지 목록(3초마다 새 메시지 폴링), 입력창(+ 사진 전송·자주 쓰는 문구). 내 메시지(MEMBER)는 오른쪽 주황, 운영자/시스템은 왼쪽 -->
  <layout :tabs="false">
    <template #top>
      <dm-title-bar :title="room?.subject || '채팅'" fallback="/chat">
        <template #right><span v-if="room?.chattStatusCd === 'DONE'" class="text-[12px] muted px-2">종료된 대화</span></template>
      </dm-title-bar>
      <nuxt-link v-if="refProd" :to="`/prod/${refProd.prodId}`" class="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--dm-line)] bg-[var(--dm-bg-soft)]">
        <span class="w-11 h-11 rounded-lg bg-[var(--dm-chip)] overflow-hidden flex-none"><img v-if="refProd.img" :src="refProd.img" :alt="refProd.prodNm" class="w-full h-full object-cover" /></span>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] truncate"><span v-if="refStatus" class="text-[11px] font-bold mr-1" :class="refStatus.cls === 'sold' ? 'muted' : 'text-[#2f9e44]'">{{ refStatus.label }}</span>{{ refProd.prodNm }}</p>
          <b class="text-[14px]">{{ formatWon(refProd.discntPrice ?? refProd.salePrice) }}</b>
        </div>
        <i class="fas fa-chevron-right text-[12px] muted"></i>
      </nuxt-link>
    </template>
    <xdev-file-path-badge :file-path="currentFilePath" position="top-right" :absolute="true" />

    <div class="px-4 pt-4 pb-24 space-y-2.5">
      <p v-if="loading" class="text-center muted text-[13px]">불러오는 중…</p>
      <p v-else-if="!msgs.length" class="text-center muted text-[13px] py-10">첫 메시지를 보내 보세요. 운영자가 확인 후 답장해 드려요.</p>
      <template v-for="(m, i) in msgs" :key="m.chattMsgId">
        <div v-if="dayLabel(m, msgs[i - 1])" class="text-center text-[12px] muted py-2">{{ dayLabel(m, msgs[i - 1]) }}</div>
        <div v-if="m.msgTypeCd === 'SYSTEM' || m.senderTypeCd === 'SYSTEM'" class="text-center text-[12px] muted">{{ m.msgText }}</div>
        <div v-else class="flex items-end gap-1.5" :class="isMine(m) ? 'flex-row-reverse' : ''">
          <span v-if="!isMine(m)" class="w-8 h-8 rounded-full bg-[var(--dm-primary-soft)] text-[var(--dm-primary)] inline-flex items-center justify-center text-[13px] flex-none mb-4"><i class="fas fa-headset"></i></span>
          <div class="max-w-[72%]">
            <p v-if="!isMine(m) && m.senderNm" class="text-[11px] muted mb-0.5 ml-1">{{ m.senderNm }}</p>
            <div class="rounded-2xl text-[15px] break-words whitespace-pre-wrap" :class="[isMine(m) ? 'bg-[var(--dm-primary)] text-white rounded-br-md' : 'bg-[var(--dm-chip)] rounded-bl-md', m.msgTypeCd === 'IMAGE' ? 'p-1 overflow-hidden' : 'px-3.5 py-2']">
              <a v-if="m.msgTypeCd === 'IMAGE'" :href="m.msgText" target="_blank" rel="noopener"><img :src="m.msgText" alt="사진" class="max-w-full max-h-72 rounded-xl" loading="lazy" /></a>
              <template v-else>{{ m.msgText }}</template>
            </div>
          </div>
          <span class="text-[11px] muted flex-none">{{ hm(m.sendDate || m.regDate) }}</span>
        </div>
      </template>
      <p v-if="uploading" class="text-right text-[12px] muted">사진 보내는 중… {{ uploadPct }}%</p>
    </div>

    <form class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[640px] flex items-center gap-1.5 px-3 py-2 bg-[var(--dm-bg)] border-t border-[var(--dm-line)] z-40" style="padding-bottom: calc(8px + env(safe-area-inset-bottom))" @submit.prevent="handleBtnAction('msg-send')">
      <button type="button" class="icon-btn muted" aria-label="자주 쓰는 문구" @click="quickOpen = true"><i class="far fa-plus-square"></i></button>
      <button type="button" class="icon-btn muted" aria-label="사진 보내기" :disabled="uploading || !room" @click="fileInput?.click()"><i class="far fa-image"></i></button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleBtnAction('img-pick')" />
      <input v-model="text" class="input !h-11 flex-1 !rounded-full" placeholder="메시지 보내기" :disabled="sending || !room" enterkeyhint="send" maxlength="1000" />
      <button type="submit" class="w-11 h-11 rounded-full bg-[var(--dm-primary)] text-white flex-none disabled:opacity-40" :disabled="!text.trim() || sending || !room" aria-label="보내기"><i class="fas fa-arrow-up"></i></button>
    </form>

    <!-- 자주 쓰는 문구 -->
    <dm-sheet :open="quickOpen" title="자주 쓰는 문구" @close="quickOpen = false">
      <ul class="divide-y divide-[var(--dm-line)]">
        <li v-for="qm in QUICK" :key="qm"><button type="button" class="w-full h-12 text-left text-[15px]" @click="text = qm; quickOpen = false">{{ qm }}</button></li>
      </ul>
    </dm-sheet>
  </layout>
</template>

<script setup lang="ts">
import Layout from "~/layout/danmoo1/Layout.vue";
import DmTitleBar from "~/components/danmoo1/dm/DmTitleBar.vue";
import DmSheet from "~/components/danmoo1/dm/DmSheet.vue";
import { useCurrentFilePath } from "~/composables/useCurrentFilePath";
import { useAuthReady } from "~/composables/useAuthReady";
import { useAuthStore } from "~/store/useAuthStore";
import { dmStatusOf } from "~/conts/tenant/danmoo1";
import { myChatSvc } from "~/svc/fo/my/chat/myChatSvc";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";
import { coUploadSvc } from "~/svc/co/cm/coUploadSvc";
import { fixInternalCdnUrl, resolveCdnUrl } from "~/utils/cdnUrl";
import { formatWon } from "~/utils/timeAgo";
import type { CmChattType } from "~/types/cm/cmChattType";
import type { CmChattMsgType } from "~/types/cm/cmChattMsgType";
import type { PdProdType } from "~/types/pd/pdProdType";

/* ##### [01] 초기 변수 정의 ################################################## */

const currentFilePath = useCurrentFilePath();
useHead({ title: "채팅" });
const route = useRoute();
const authStore = useAuthStore();
const { openAlert } = useAlert();
const cdnBase = useRuntimeConfig().public.prodCdnBase as string;
const chattId = String(route.params.id);
const room = ref<CmChattType | null>(null);
const msgs = ref<CmChattMsgType[]>([]);
const refProd = ref<PdProdType | null>(null);
const text = ref("");
const loading = ref(true);
const sending = ref(false);
const uploading = ref(false);
const uploadPct = ref(0);
const quickOpen = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;
let refProdId = "";

const QUICK = ["안녕하세요, 아직 판매 중인가요?", "직거래 가능한 시간이 언제인가요?", "네고 가능할까요?", "감사합니다. 확인했어요!"];
const refStatus = computed(() => (refProd.value ? dmStatusOf(refProd.value) : null));
const isMine = (m: CmChattMsgType) => m.senderTypeCd === "MEMBER" || (!!m.senderId && m.senderId === authStore.user?.memberId);
const hm = (v?: string) => (v ? String(v).replace(" ", "T").slice(11, 16) : "");
const dayLabel = (m: CmChattMsgType, prev?: CmChattMsgType) => {
  const d = String(m.sendDate || m.regDate || "").slice(0, 10);
  const p = String(prev?.sendDate || prev?.regDate || "").slice(0, 10);
  return d && d !== p ? d.replace(/-/g, ".") : "";
};

/* ##### [02] 액션 모음 (dispatch) ############################################## */

/* handleBtnAction — 버튼 액션 dispatch (cmd: '{영역명}-기능명') */
const handleBtnAction = async (cmd: string) => {
  if (cmd === "msg-send") {
    const t = text.value.trim();
    if (!t || sending.value) return;
    sending.value = true;
    try {
      // 문의 중인 물건이 있으면 참조를 이어 붙여 운영자가 어느 물건 얘긴지 알 수 있게
      const saved = refProdId ? await myChatSvc.sendRefMsg(chattId, t, "PRODUCT", refProdId) : await myChatSvc.sendMsg(chattId, t);
      msgs.value.push(saved);
      text.value = "";
      fnScrollBottom();
    } catch (e) {
      console.error("[danmoo1/chat/[id]] 메시지 전송 실패", e);
      await openAlert("메시지를 보내지 못했어요. 종료된 대화면 채팅 목록에서 새 문의를 열어 주세요.");
    } finally {
      sending.value = false;
    }
    return;
  }
  if (cmd === "img-pick") {
    const file = fileInput.value?.files?.[0];
    if (fileInput.value) fileInput.value.value = "";
    if (file) await fnSendImage(file);
    return;
  }
  console.warn("[handleBtnAction] unknown cmd:", cmd);
};

/* ##### [03] 내장 사용 함수 ################################################### */

const fnScrollBottom = () => nextTick(() => window.scrollTo({ top: document.body.scrollHeight }));

/* fnShrink — 긴 변 1280px·JPEG 85% 로 줄여 올린다(실패하면 원본) */
const fnShrink = (file: File): Promise<File> =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => resolve(b ? new File([b], `chat_${Date.now()}.jpg`, { type: "image/jpeg" }) : file), "image/jpeg", 0.85);
      } catch {
        resolve(file);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

/* fnSendImage — 사진 업로드(CDN, 업무코드 chat) 후 IMAGE 메시지로 전송 */
const fnSendImage = async (file: File) => {
  if (!file.type.startsWith("image/")) return openAlert("이미지 파일만 보낼 수 있어요.");
  if (!room.value || room.value.chattStatusCd === "DONE") return openAlert("종료된 대화에는 사진을 보낼 수 없어요.");
  uploading.value = true;
  uploadPct.value = 0;
  try {
    const small = await fnShrink(file);
    if (small.size > 8 * 1024 * 1024) return openAlert("사진은 8MB 이하만 보낼 수 있어요.");
    const res = await coUploadSvc.uploadMulti([small], "chat", (p) => (uploadPct.value = p));
    const f = res.files?.[0];
    const url = fixInternalCdnUrl(resolveCdnUrl(f?.cdnImgUrl || f?.filePath, cdnBase), cdnBase);
    if (!url || !f?.attachId) throw new Error("업로드 응답에 사진 주소가 없습니다.");
    const saved = await myChatSvc.sendImage(chattId, url, f.attachId);
    msgs.value.push(saved);
    fnScrollBottom();
  } catch (e) {
    console.error("[danmoo1/chat/[id]] 사진 전송 실패", e);
    await openAlert("사진을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
  } finally {
    uploading.value = false;
  }
};

/* fnSyncRefProd — 가장 최근 상품 참조 메시지의 물건을 상단 카드로 */
const fnSyncRefProd = async () => {
  const last = [...msgs.value].reverse().find((m) => m.refTypeCd === "PRODUCT" && m.refId);
  if (!last?.refId || last.refId === refProdId) return;
  refProdId = last.refId;
  try {
    refProd.value = await pdProductSvc.getById(refProdId);
  } catch (e) {
    console.error("[danmoo1/chat/[id]] 참조 상품 조회 실패", e);
  }
};

/* fnStopPoll — 3초 폴링 중지 (2026-10-03 API오류로그 정비) */
const fnStopPoll = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

/* fnPoll — 마지막 메시지 이후 새 메시지만 가져온다 */
const fnPoll = async () => {
  // 2026-10-03 API오류로그 정비: 로그아웃(비로그인) 상태면 폴링을 멈춘다 — 3초마다 401 오류로그가 쌓이던 문제
  if (!authStore.isStLoggedIn) {
    fnStopPoll();
    return;
  }
  try {
    const last = msgs.value[msgs.value.length - 1]?.chattMsgId ?? null;
    const more = await myChatSvc.getMessages(chattId, last);
    if (more.length) {
      const seen = new Set(msgs.value.map((m) => m.chattMsgId));
      msgs.value.push(...more.filter((m) => !seen.has(m.chattMsgId)));
      await fnSyncRefProd();
      fnScrollBottom();
    }
  } catch (e) {
    console.error("[danmoo1/chat/[id]] 메시지 조회 실패", e);
    // 2026-10-03 API오류로그 정비: 401(axiosCsr 가 토큰 갱신까지 시도한 뒤에도 인증 실패)이면 폴링 중지
    const err = e as { statusCode?: number; response?: { status?: number } };
    if (err?.statusCode === 401 || err?.response?.status === 401) fnStopPoll();
  }
};

/* initPage — 로그인 확인 → 방 정보(목록에서 찾기) → 메시지 전체 → 참조 상품 → 3초 폴링 */
const initPage = async () => {
  await useAuthReady();
  if (!authStore.isStLoggedIn) return navigateTo({ path: "/login", query: { redirect: route.fullPath } });
  try {
    const [rooms, list] = await Promise.all([myChatSvc.getMyList(), myChatSvc.getMessages(chattId)]);
    room.value = rooms.find((r) => r.chattId === chattId) ?? { chattId, subject: "채팅" };
    msgs.value = list;
    await fnSyncRefProd();
    fnScrollBottom();
    // 2026-10-03 API오류로그 정비: 첫 조회가 성공했을 때만 3초 폴링을 시작한다(실패한 방을 계속 두드려 오류로그가 쌓이던 문제)
    fnStopPoll();
    timer = setInterval(fnPoll, 3000);
  } catch (e) {
    console.error("[danmoo1/chat/[id]] 채팅방 조회 실패", e);
    await openAlert("채팅방을 불러오지 못했어요.");
  } finally {
    loading.value = false;
  }
};
onMounted(initPage);
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>
