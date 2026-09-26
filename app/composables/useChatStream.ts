/**
 * useChatStream — 채팅 실시간 스트림(SSE) 연결 (ecBeBo FoCmChattController GET /api/fo/my/chat/{id}/stream).
 *
 * 브라우저 EventSource 는 Authorization 헤더를 붙일 수 없어 fetch 스트림으로 직접 읽는다.
 * 서버는 새 메시지/상태 변경 "신호"(msg / status)만 보내고, 신호를 받으면 호출한 쪽이 기존 API 로 내용을 가져온다.
 * 연결이 끊기면(프록시 유휴 종료·토큰 만료·네트워크) 지수 백오프로 재연결하며, 그 사이에는 호출한 쪽의 폴링이 보완한다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";

export type ChatStreamHandle = { close: () => void };

/**
 * @param path        baseURL(/api) 이후의 경로. 예: `/fo/my/chat/{id}/stream`
 * @param onSignal    서버 이벤트 수신 콜백 (event: msg/status/room ..., data: JSON)
 * @param onState     연결 상태 변경 콜백 (true=연결됨)
 * @param ensureAuth  재연결 직전 호출 — 토큰 만료 시 갱신을 유도하는 가벼운 인증 요청(선택)
 */
export function openChatStream(
  path: string,
  onSignal: (event: string, data: Record<string, unknown>) => void,
  onState?: (connected: boolean) => void,
  ensureAuth?: () => Promise<unknown>,
): ChatStreamHandle {
  let stopped = false;
  let ctrl: AbortController | null = null;
  let retry = 0;

  const parseBlock = (block: string) => {
    let event = "message";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith(":")) continue; // 하트비트 주석
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    if (!data) return;
    try {
      onSignal(event, JSON.parse(data));
    } catch {
      onSignal(event, {});
    }
  };

  const run = async () => {
    while (!stopped) {
      ctrl = new AbortController();
      try {
        if (retry > 0 && ensureAuth) await ensureAuth().catch(() => undefined);
        const base = String(axiosCsr.defaults.baseURL ?? "").replace(/\/+$/, "");
        const res = await fetch(`${base}${path}`, {
          headers: { ...useAuthHeaders(), Accept: "text/event-stream" },
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        onState?.(true);
        retry = 0;
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          let idx: number;
          while ((idx = buf.indexOf("\n\n")) >= 0) {
            parseBlock(buf.slice(0, idx));
            buf = buf.slice(idx + 2);
          }
        }
      } catch {
        /* 끊김/오류 — 아래에서 재연결 */
      }
      onState?.(false);
      if (stopped) break;
      await new Promise((r) => setTimeout(r, Math.min(30000, 1000 * 2 ** Math.min(retry++, 5))));
    }
  };
  void run();

  return {
    close() {
      stopped = true;
      ctrl?.abort();
      onState?.(false);
    },
  };
}
