/**
 * axiosCsr.ts
 * CSR(브라우저) 전용 HTTP 클라이언트 (axios 기반) — ecBeBo(Spring Boot 백엔드)를 **직접** 호출한다.
 *
 * 2026-09-20: 예전엔 브라우저 → Netlify Function(server/api, 미국 Ohio) → 자택 NAS 의 2단 프록시(BFF)였는데,
 * 서울↔Ohio 왕복 + Lambda→NAS 새 연결 비용 때문에 캐시 미스가 ~9초까지 걸렸다(NAS 직접 호출은 0.3초).
 * 그래서 app/svc/** 는 이 클라이언트로 ecBeBo 를 직접 부른다. (ecBeBo 는 CORS 허용 — allowedOriginPatterns "*".)
 * server/api 는 SEO 단위화면(/shop, 상품상세, 블로그상세)의 SSR 전용이며 그쪽은 axiosSsr 를 쓴다.
 *
 * - baseURL: runtimeConfig.public.beBaseUrl + "/api"  (예: https://22300.illeesam.synology.me/api) — app/plugins/beClient.ts 가 앱 시작 시 주입한다
 *   (비동기 구간에선 useRuntimeConfig() 컨텍스트가 사라질 수 있어 인터셉터에서 읽지 않는다).
 * - ecBeBo 응답 envelope { ok, status, data, message } 를 벗겨 response.data 가 곧 실데이터가 되게 한다.
 *   (svc 는 기존처럼 `.then((r) => r.data)` 만 하면 된다.)
 * - 오류는 소비처가 읽어오던 모양(err.statusCode / err.statusMessage / err.data.message)을 맞춰 붙여서 던진다.
 * - 인증이 필요한 호출은 svc 가 `headers: useAuthHeaders()` 를 명시한다(공개 API 에 만료 토큰이 붙어 401 나는 것 방지).
 */
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { CoBeEnvelopeType, CoBeErrorType } from "~/types/co/coBeErrorType";

const axiosCsr = axios.create({
  timeout: 15000,
  // 배열은 categoryIds=a&categoryIds=b 형태(Spring @ModelAttribute List<String> 바인딩)로 직렬화 — axios 기본은 categoryIds[]=a
  paramsSerializer: { indexes: null },
});

function toBeError(error: AxiosError<CoBeEnvelopeType>, fallbackStatus?: number, fallbackMessage?: string): CoBeErrorType {
  const e = error as CoBeErrorType;
  const env = error.response?.data;
  const status = env?.status ?? error.response?.status ?? fallbackStatus;
  const message = env?.message ?? fallbackMessage ?? error.message;
  e.statusCode = status;
  e.statusMessage = message;
  e.data = { message, statusMessage: message };
  return e;
}

// ─── accessToken 자동 갱신 ────────────────────────────────────────────────────
// FO accessToken 은 15분이면 만료된다(서버 fo-access-expiry). 인증이 필요한 요청은
//  ① 요청 직전에 토큰 만료가 임박(30초 이내)했거나 이미 만료됐으면 먼저 refresh 하고,
//  ② 그래도 401 이 오면 한 번 refresh 한 뒤 같은 요청을 다시 보낸다.
// refresh 자체는 스토어가 하므로(순환 import 방지) 앱 시작 시 plugins/authRefresh.client.ts 가 setAuthRefresher 로 등록한다.
// 동시에 여러 요청이 만료돼도 refresh 는 한 번만 나간다(single-flight).

/** 사용한 accessToken 을 받아 새 accessToken 을 돌려준다(갱신 불가면 null) */
type AuthRefresher = (usedToken: string) => Promise<string | null>;
let authRefresher: AuthRefresher | null = null;
let refreshing: Promise<string | null> | null = null;
export const setAuthRefresher = (fn: AuthRefresher) => {
  authRefresher = fn;
};
const refreshOnce = (usedToken: string): Promise<string | null> => (refreshing ??= authRefresher!(usedToken).finally(() => (refreshing = null)));

/** JWT 만료 시각(ms). 읽을 수 없으면 0 */
function jwtExpMs(token: string): number {
  try {
    const payload = token.split(".")[1] ?? "";
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return Number(json.exp) * 1000 || 0;
  } catch {
    return 0;
  }
}
const bearerOf = (config: InternalAxiosRequestConfig): string => {
  const h = String(config.headers?.Authorization ?? "");
  return h.startsWith("Bearer ") ? h.slice(7) : "";
};
/** 갱신 대상 요청인가 — 인증 헤더가 있고, 인증 API(로그인/갱신/로그아웃) 자체는 제외 */
const canRefresh = (config: InternalAxiosRequestConfig | undefined): config is InternalAxiosRequestConfig =>
  !!authRefresher && !!config && !!bearerOf(config) && !bearerOf(config).startsWith("oauth_") && !String(config.url ?? "").includes("/co/fo-auth/");

// ─── 요청 인터셉터 ───────────────────────────────────────────────────────────

axiosCsr.interceptors.request.use(
  async (config) => {
    if (canRefresh(config)) {
      const used = bearerOf(config);
      const exp = jwtExpMs(used);
      if (exp && exp - Date.now() < 30_000) {
        const fresh = await refreshOnce(used);
        if (fresh) config.headers.Authorization = `Bearer ${fresh}`;
      }
    }
    const paramStr = config.params ? JSON.stringify(config.params) : "";
    console.log(`[axiosCsr] ▶ 요청: ${config.method?.toUpperCase()} ${config.baseURL ?? ""}${config.url ?? ""}`, paramStr || "");
    return config;
  },
  (error) => {
    console.error("[axiosCsr] ✖ 요청 설정 오류:", error?.message ?? error);
    return Promise.reject(error);
  }
);

// ─── 응답 인터셉터 ───────────────────────────────────────────────────────────

axiosCsr.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data as CoBeEnvelopeType | undefined;
    if (body && typeof body === "object" && "ok" in body) {
      // ecBeBo 는 오류도 HTTP 4xx/5xx 로 내려주지만, 200 이면서 ok=false 인 경우도 오류로 취급한다.
      if (body.ok === false) {
        const err = new AxiosError(body.message ?? "백엔드 오류가 발생했습니다.", "ERR_BAD_RESPONSE", response.config, response.request, response);
        return Promise.reject(toBeError(err as AxiosError<CoBeEnvelopeType>, body.status ?? response.status));
      }
      response.data = body.data;
    }
    console.log(`[axiosCsr] ◀ 응답 성공: ${response.status} ${response.config.baseURL ?? ""}${response.config.url ?? ""}`);
    return response;
  },
  async (error: AxiosError<CoBeEnvelopeType>) => {
    const cfg = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && canRefresh(cfg) && !cfg._retried) {
      cfg._retried = true;
      const fresh = await refreshOnce(bearerOf(cfg));
      if (fresh) {
        cfg.headers.Authorization = `Bearer ${fresh}`;
        return axiosCsr(cfg); // 새 토큰으로 같은 요청 재시도
      }
    }
    const status = error.response?.status ?? "NETWORK";
    console.error(`[axiosCsr] ✖ 응답 오류 [${status}] ${error.config?.method?.toUpperCase() ?? "-"} ${error.config?.baseURL ?? ""}${error.config?.url ?? ""} — ${error.message}`);
    return Promise.reject(toBeError(error, undefined, error.code === "ECONNABORTED" ? "요청 시간이 초과되었습니다." : error.response ? undefined : "서버에 연결할 수 없습니다."));
  }
);

export { axiosCsr };
export default axiosCsr;
