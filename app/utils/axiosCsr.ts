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
import axios, { AxiosError, type AxiosResponse } from "axios";
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

// ─── 요청 인터셉터 ───────────────────────────────────────────────────────────

axiosCsr.interceptors.request.use(
  (config) => {
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
  (error: AxiosError<CoBeEnvelopeType>) => {
    const status = error.response?.status ?? "NETWORK";
    console.error(`[axiosCsr] ✖ 응답 오류 [${status}] ${error.config?.method?.toUpperCase() ?? "-"} ${error.config?.baseURL ?? ""}${error.config?.url ?? ""} — ${error.message}`);
    return Promise.reject(toBeError(error, undefined, error.code === "ECONNABORTED" ? "요청 시간이 초과되었습니다." : error.response ? undefined : "서버에 연결할 수 없습니다."));
  }
);

export { axiosCsr };
export default axiosCsr;
