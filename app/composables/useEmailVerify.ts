/**
 * useEmailVerify — 이메일 링크 인증 요청/폴링 공통 로직 (2026-10-02, PASS 대체).
 * 흐름: send(email) → 인증 메일 발송 → 사용자가 메일 링크(/verify-email)를 열어 완료 → 이 화면은 3초마다 상태를 확인해 verified 가 된다.
 * 가입/로그인/신청 같은 실제 처리 때 verifyId 를 서버로 보내면 서버가 1회 소비한다.
 */
import { onBeforeUnmount, ref } from "vue";
import { emailVerifySvc } from "~/svc/co/auth/emailVerifySvc";
import type { MbEmailVerifyPurposeType } from "~/types/mb/mbEmailVerifyType";

const POLL_MS = 3000;
const errText = (e: unknown, fb: string) => String((e as { data?: { message?: string }; message?: string })?.data?.message ?? (e as { message?: string })?.message ?? fb).split("::")[0]!;

export function useEmailVerify(purposeCd: MbEmailVerifyPurposeType) {
  const verifyId = ref("");
  const sentTo = ref("");
  const expireMinutes = ref(30);
  const sending = ref(false);
  const sent = ref(false);
  const verified = ref(false);
  const error = ref("");
  let timer: ReturnType<typeof setInterval> | null = null;
  let deadline = 0;

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function reset() {
    stop();
    verifyId.value = "";
    sentTo.value = "";
    sent.value = false;
    verified.value = false;
    error.value = "";
  }
  function poll() {
    stop();
    timer = setInterval(async () => {
      if (Date.now() > deadline) {
        stop();
        sent.value = false;
        error.value = "인증 시간이 지났습니다. 인증 메일을 다시 보내 주세요.";
        return;
      }
      try {
        if ((await emailVerifySvc.status(verifyId.value)).verified) {
          verified.value = true;
          stop();
        }
      } catch {
        /* 일시적인 네트워크 오류는 다음 주기에 다시 시도 */
      }
    }, POLL_MS);
  }

  /** 인증 메일 발송. 로그인 목적(MYPAGE/SELLER_APPLY)은 email 을 무시하고 서버가 내 이메일로 보낸다. 성공 true */
  async function send(email: string): Promise<boolean> {
    error.value = "";
    sending.value = true;
    try {
      const r = await emailVerifySvc.request(purposeCd, email);
      verifyId.value = r.verifyId;
      sentTo.value = r.maskedEmail;
      expireMinutes.value = r.expireMinutes;
      sent.value = true;
      verified.value = false;
      deadline = Date.now() + r.expireMinutes * 60 * 1000;
      poll();
      return true;
    } catch (e) {
      error.value = errText(e, "인증 메일을 보내지 못했습니다.");
      return false;
    } finally {
      sending.value = false;
    }
  }

  onBeforeUnmount(stop);
  return { verifyId, sentTo, expireMinutes, sending, sent, verified, error, send, reset };
}
