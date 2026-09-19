/**
 * axiosSsr.ts
 * SSR(서버 사이드) 전용 HTTP 클라이언트 (axios 기반)
 * - useAsyncData 콜백, 서버 사이드 컴포저블/페이지에서 사용
 * - Node.js는 상대 경로 HTTP 요청 불가 → 서버 사이드에서 baseURL 자동 설정
 *   (브라우저에서는 상대 경로 그대로 사용)
 */
import axios, { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

// ─── SSR baseURL 설정 ────────────────────────────────────────────────────────
// import.meta.server: Nuxt/Vite 빌드 시 서버 번들에서 true, 클라이언트 번들에서 false

// 2026-09-19(운영 Netlify 에서 상품상세/목록 SSR 이 항상 "상품을 찾을 수 없습니다" — 원인): 이 인스턴스는 서버에서
// `http://localhost:PORT` 로 자기 자신에게 HTTP 요청을 보냈다. 상시 실행 Node 서버(synol Docker)에서는 되지만, Netlify 같은
// 서버리스 함수에는 localhost 에서 응답하는 서버가 없어 ECONNREFUSED 로 실패한다(PORT 가 어긋나도 동일).
// 가장 일반적인 해법 — 서버에서는 Nitro 의 내부 $fetch(상대경로면 HTTP 없이 핸들러를 직접 호출)를 어댑터로 사용한다.
// 포트/호스트/프리셋(node-server·netlify·…)과 무관하게 동작하고, 절대 URL 은 그대로 외부 호출된다. 브라우저에서는 기존대로 axios(XHR).
async function nitroInternalAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const target = axios.getUri({ url: config.url, params: config.params, paramsSerializer: config.paramsSerializer });
  const headers: Record<string, string> = {};
  const rawHeaders = AxiosHeaders.from(config.headers as any).toJSON() as Record<string, unknown>;
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (v !== undefined && v !== null && v !== false) headers[k] = Array.isArray(v) ? v.join(", ") : String(v);
  }
  let res: Awaited<ReturnType<typeof $fetch.raw>>;
  try {
    res = await $fetch.raw(target, {
      method: (config.method ?? "get").toUpperCase() as any,
      headers,
      body: config.data as any,
      ignoreResponseError: true, // 4xx/5xx 도 응답 객체로 받아 아래에서 axios 규칙(validateStatus)으로 판정
      timeout: config.timeout || undefined,
    });
  } catch (e: any) {
    throw new AxiosError(e?.message ?? "Network Error", AxiosError.ERR_NETWORK, config, undefined);
  }
  const response: AxiosResponse = {
    data: res._data,
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    config,
    request: {},
  };
  const ok = !config.validateStatus || config.validateStatus(res.status);
  if (ok) return response;
  throw new AxiosError(
    `Request failed with status code ${res.status}`,
    res.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    response.request,
    response
  );
}

const axiosSsr = axios.create({
  adapter: import.meta.server ? nitroInternalAdapter : undefined,
});

// ─── 요청 인터셉터 ───────────────────────────────────────────────────────────

// 2026-09-13(요청사항: "full url로 표시해줘") — config.url만 찍으면 상대경로만 보여서
// baseURL(SSR일 때 자기 자신 localhost:PORT)을 직접 붙여 실제 호출 URL을 남긴다.
// 2026-09-13 추가수정: axiosSsr은 "SSR 전용"이라는 이름과 달리 useAsyncData 콜백이
// 클라이언트 쪽(하이드레이션/클라이언트 내비게이션 시 재실행)에서도 그대로 돌아간다 —
// 그때는 baseURL이 비어있어(import.meta.server===false) 여전히 상대경로만 찍혔던 것.
// axiosCsr.ts와 동일하게 브라우저에서는 location.origin으로 보완한다.
function fullUrl(config: { baseURL?: string; url?: string }): string {
  const base = config.baseURL || (typeof window !== "undefined" ? window.location.origin : "(nitro-internal)");
  const path = config.url ?? "";
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

axiosSsr.interceptors.request.use(
  (config) => {
    const paramStr = config.params ? JSON.stringify(config.params) : "";
    console.log(
      `[axiosSsr] ▶ 요청: ${config.method?.toUpperCase()} ${fullUrl(config)}`,
      paramStr || ""
    );
    return config;
  },
  (error) => {
    console.error("[axiosSsr] ✖ 요청 설정 오류:", error?.message ?? error);
    console.error("[axiosSsr]   상세:", error);
    return Promise.reject(error);
  }
);

// ─── 응답 인터셉터 ───────────────────────────────────────────────────────────

axiosSsr.interceptors.response.use(
  (response) => {
    console.log(
      `[axiosSsr] ◀ 응답 성공: ${response.status} ${fullUrl(response.config)}`,
      Array.isArray(response.data)
        ? `[${response.data.length}건]`
        : typeof response.data === "object" && response.data !== null
          ? `id=${(response.data as any).id ?? "-"}`
          : response.data
    );
    return response;
  },
  (error) => {
    const status  = error?.response?.status  ?? "NETWORK";
    const method  = error?.config?.method?.toUpperCase() ?? "-";
    const url     = error?.config ? fullUrl(error.config) : "-";
    const message = error?.message ?? String(error);
    const resData = error?.response?.data;

    console.error(`[axiosSsr] ✖ 응답 오류 [${status}] ${method} ${url} — ${message}`);
    if (resData !== undefined) {
      console.error("[axiosSsr]   서버 응답 데이터:", resData);
    }
    return Promise.reject(error);
  }
);

export { axiosSsr };
export default axiosSsr;
