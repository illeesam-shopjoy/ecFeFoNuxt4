/**
 * beApi.ts — ecBeBo(Spring Boot 백엔드) 호출 전용 BFF 프록시 헬퍼.
 *
 * ecFeFoNuxt4는 DB에 직접 접속하지 않는다(BFF 방식, 2026-09 전환). 이 파일이 그 유일한
 * 출입구 — server/api/** 라우트는 전부 이 함수들을 통해서만 ecBeBo를 호출한다.
 *
 * ecBeBo 응답 envelope: { ok, status, data, message } (common.response.ApiResponse).
 * ok=false 면 오류로 간주하고 그 status/message를 그대로 Nuxt 쪽 H3 오류로 변환한다.
 *
 * Base URL: runtimeConfig.apiBaseUrl (env NUXT_API_BASE_URL, 기본값은 nuxt.config.ts 참조).
 */
import type { H3Event } from "h3";
import { logger } from "~~/server/utils/logger";

interface BeEnvelope<T> {
  ok: boolean;
  status: number;
  data: T;
  message?: string;
}

interface BeCallOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, unknown>;
  body?: unknown;
  /** 로그인 필요한 엔드포인트 호출 시 클라이언트의 Authorization 헤더를 그대로 전달할 때 사용 */
  headers?: Record<string, string>;
  /** 백엔드가 이 값보다 오래 응답 없으면 502로 처리 (ms) */
  timeout?: number;
}

function beBaseUrl(): string {
  const { apiBaseUrl } = useRuntimeConfig();
  return `${String(apiBaseUrl).replace(/\/+$/, "")}/api`;
}

/** 들어온 요청의 Authorization 헤더를 그대로 백엔드로 전달할 때 쓰는 헬퍼 (주문생성/내리뷰 등 로그인 필요 API) */
export function authHeaderFrom(event: H3Event): Record<string, string> {
  const auth = getHeader(event, "authorization");
  return auth ? { authorization: auth } : {};
}

async function beFetchOnce<T>(url: string, method: string, opts: BeCallOptions): Promise<T> {
  const res = await $fetch<BeEnvelope<T>>(url, {
    method,
    query: opts.query,
    body: opts.body,
    headers: opts.headers,
    // 2026-09-13 재조정: 8초는 재시도까지 겹치면(8+8=16초) 페이지 전체가 15초 넘게
    // 멎어 보이는 원인이었다 — 자택 NAS가 느릴 땐 8초를 기다려도 대체로 성공하지
    // 않았으므로(직접 curl은 항상 0.2~2초) 5초로 낮춰 실패를 더 빨리 확정한다.
    timeout: opts.timeout ?? 5000,
    // ecBeBo는 오류도 200이 아닌 실제 HTTP status(400/401/404/500...)로 내려준다.
    // $fetch가 던지는 FetchError를 아래 catch에서 envelope 형태로 다시 해석한다.
  } as Parameters<typeof $fetch>[1]);
  if (!res || res.ok === false) {
    throw createError({ statusCode: res?.status ?? 502, statusMessage: res?.message ?? "백엔드 오류가 발생했습니다." });
  }
  return res.data as T;
}

async function beFetch<T>(path: string, opts: BeCallOptions = {}): Promise<T> {
  const url = `${beBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const method = opts.method ?? "GET";
  try {
    return await beFetchOnce<T>(url, method, opts);
  } catch (err: unknown) {
    // $fetch가 4xx/5xx에서 던지는 FetchError는 err.data 에 envelope이 들어있다.
    const fetchErr = err as { data?: BeEnvelope<unknown>; statusCode?: number; message?: string };
    if (fetchErr?.data && typeof fetchErr.data === "object" && "ok" in fetchErr.data) {
      const envelope = fetchErr.data as BeEnvelope<unknown>;
      logger.warn("[beApi]", method, url, "→", envelope.status, envelope.message);
      throw createError({ statusCode: envelope.status ?? 502, statusMessage: envelope.message ?? "백엔드 오류가 발생했습니다." });
    }
    if (fetchErr?.statusCode) throw err as never;

    // 2026-09-13: Netlify Functions(AWS Lambda) → 자택 Synology NAS 백엔드 사이의 네트워크가
    // 간헐적으로 연결 실패/타임아웃을 일으키는 사례 확인(동일 URL을 직접 curl하면 정상 응답).
    // GET은 멱등하므로 진짜 네트워크 레벨 오류(응답 envelope도, statusCode도 없는 경우)에
    // 한해 1회 재시도 — POST/PUT/DELETE는 중복 처리(중복 주문 등) 위험이 있어 재시도하지 않는다.
    //
    // 2026-09-13 재조정: 실패 사유가 "타임아웃"이면 재시도를 건너뛴다 — NAS가 동시접속으로
    // 이미 밀린 상태라 바로 다시 붙어도 또 5초를 태울 뿐 성공률이 크게 오르지 않았고,
    // 오히려 사용자 체감 대기시간만 두 배(최대 10초)로 늘렸다. 타임아웃이 아닌 순간적인
    // 연결 오류(ECONNRESET 등)만 재시도 가치가 있다고 보고 그 경우에만 1회 재시도한다.
    const isTimeout = (fetchErr?.message ?? "").toLowerCase().includes("timeout") || (err as { name?: string })?.name === "TimeoutError";
    if (method === "GET" && !isTimeout) {
      logger.warn("[beApi]", method, url, "연결 실패 — 1회 재시도:", fetchErr?.message ?? err);
      try {
        return await beFetchOnce<T>(url, method, opts);
      } catch (retryErr) {
        logger.error("[beApi]", method, url, "재시도도 실패:", (retryErr as { message?: string })?.message ?? retryErr);
      }
    } else {
      logger.error("[beApi]", method, url, isTimeout ? "타임아웃(재시도 생략):" : "호출 실패:", fetchErr?.message ?? err);
    }
    throw createError({ statusCode: 502, statusMessage: "백엔드(ecBeBo) 서버에 연결할 수 없습니다." });
  }
}

export const beApi = {
  get: <T>(path: string, query?: Record<string, unknown>, headers?: Record<string, string>) => beFetch<T>(path, { method: "GET", query, headers }),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) => beFetch<T>(path, { method: "POST", body, headers }),
  put: <T>(path: string, body?: unknown, headers?: Record<string, string>) => beFetch<T>(path, { method: "PUT", body, headers }),
  delete: <T>(path: string, headers?: Record<string, string>) => beFetch<T>(path, { method: "DELETE", headers }),
};

/** ecBeBo 페이지 응답 { pageList, pageTotalCount, ... } 공통 형태 */
export interface BePage<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}
