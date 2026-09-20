/**
 * usePassIdentity — PASS 본인인증(포트원 V2) 실행 공통 로직. 비회원 결제·회원가입·회원정보에서 같이 쓴다.
 * 흐름: 인증창(PASS) 호출 → 인증 건 ID(identityVerificationId) → 서버(/api/identity/verify)가 포트원에서 결과를 직접 확인.
 * 연동 키가 없거나 실패하면 알림창에 사유와 (일부 가린) 설정 키 정보를 보여준다.
 */
import { ref } from "vue";
import { identitySvc } from "~/svc/co/identity/identitySvc";
import { loadScriptOnce } from "~/utils/loadScript";
import type { MbIdentityVerifyType } from "~/types/mb/mbIdentityVerifyType";
import type { MbPortOneType } from "~/types/mb/mbIdentityReqType";

const PORTONE_SCRIPT = "https://cdn.portone.io/v2/browser-sdk.js";
const maskCfg = (k?: string) => (!k ? "(미설정)" : k.length <= 14 ? "***" : `${k.slice(0, 8)}***${k.slice(-4)}`);
export const maskName = (n: string) => (n.length <= 2 ? `${n.slice(0, 1)}*` : `${n.slice(0, 1)}${"*".repeat(n.length - 2)}${n.slice(-1)}`);
export const maskPhone = (p: string) => (p.length >= 10 ? `${p.slice(0, 3)}-****-${p.slice(-4)}` : "***");

export function usePassIdentity() {
  const cfg = useRuntimeConfig().public as { mode?: string; portoneStoreId?: string; portoneIdvChannelKey?: string };
  const busy = ref(false);
  const error = ref("");

  const keyInfo = () => [
    { label: "실행 모드(RUN_MODE)", value: String(cfg.mode ?? "-") },
    { label: "스토어 ID", value: maskCfg(cfg.portoneStoreId) },
    { label: "PASS 채널 키", value: maskCfg(cfg.portoneIdvChannelKey) },
  ];
  async function fail(message: string) {
    error.value = message;
    await useAlert().openAlert({ title: "본인인증 실패", variant: "error", message, details: keyInfo() });
  }

  /** PASS 인증을 진행하고, 서버가 확인한 인증 결과를 돌려준다. 취소/실패면 null */
  async function start(): Promise<MbIdentityVerifyType | null> {
    error.value = "";
    if (!cfg.portoneStoreId || !cfg.portoneIdvChannelKey) {
      await fail("본인인증(PASS) 연동 키가 설정되지 않았습니다.\n(.env 의 NUXT_PUBLIC_PORTONE_STORE_ID / NUXT_PUBLIC_PORTONE_IDV_CHANNEL_KEY)");
      return null;
    }
    busy.value = true;
    try {
      await loadScriptOnce(PORTONE_SCRIPT);
      const PortOne = (window as unknown as { PortOne?: MbPortOneType }).PortOne;
      if (!PortOne) throw new Error("포트원 SDK 를 초기화하지 못했습니다.");
      const identityVerificationId = `idv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const r = await PortOne.requestIdentityVerification({ storeId: cfg.portoneStoreId, identityVerificationId, channelKey: cfg.portoneIdvChannelKey });
      if (r?.code) {
        if (/CANCEL/i.test(r.code)) return null; // 사용자가 인증창을 닫음
        throw new Error(`${r.message ?? "인증에 실패했습니다."}\n(오류 코드: ${r.code})`);
      }
      return await identitySvc.verify(identityVerificationId); // 서버가 포트원에서 결과를 직접 확인
    } catch (e) {
      const err = e as { statusMessage?: string; data?: { statusMessage?: string; message?: string }; message?: string };
      await fail(err?.data?.statusMessage ?? err?.data?.message ?? err?.statusMessage ?? err?.message ?? "본인인증에 실패했습니다.");
      return null;
    } finally {
      busy.value = false;
    }
  }

  return { busy, error, start, keyInfo };
}
