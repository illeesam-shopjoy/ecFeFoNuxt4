/**
 * payRecord.ts — PG 결제 결과를 ecBeBo 에 기록(POST /api/co/pay/record, 서버 간 호출).
 * 브라우저가 아니라 Nuxt 서버가 PG 에 직접 승인/조회한 결과만 넘긴다. 공유 키(runtimeConfig.paySyncKey ↔ 백엔드 app.pay.sync-key)로 인증한다.
 * 키가 없으면 기록을 건너뛴다(결제 승인 자체는 막지 않는다).
 */
export interface PayRecordResult {
  ok: boolean;
  payStatus?: string;
  orderStatus?: string;
  changed?: boolean;
  skipped?: string; // 기록을 건너뛴 이유
}

export async function recordPay(orderId: string | null | undefined, payment: Record<string, unknown>): Promise<PayRecordResult> {
  const cfg = useRuntimeConfig();
  const key = String(cfg.paySyncKey ?? "");
  if (!key) return { ok: false, skipped: "PAY_SYNC_KEY 미설정" };
  const base = `${String(cfg.apiBaseUrl).replace(/\/+$/, "")}/api`;
  const res = await $fetch<{ ok?: boolean; data?: PayRecordResult }>(`${base}/co/pay/record`, {
    method: "POST",
    headers: { "X-Pay-Sync-Key": key, "Content-Type": "application/json" },
    body: { orderId: orderId || undefined, payment },
    timeout: 8000,
  });
  return { ...(res?.data ?? { ok: false }) };
}
