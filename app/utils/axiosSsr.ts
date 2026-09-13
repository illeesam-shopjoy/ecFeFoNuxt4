/**
 * axiosSsr.ts
 * SSR(서버 사이드) 전용 HTTP 클라이언트 (axios 기반)
 * - useAsyncData 콜백, 서버 사이드 컴포저블/페이지에서 사용
 * - Node.js는 상대 경로 HTTP 요청 불가 → 서버 사이드에서 baseURL 자동 설정
 *   (브라우저에서는 상대 경로 그대로 사용)
 */
import axios from "axios";

// ─── SSR baseURL 설정 ────────────────────────────────────────────────────────
// import.meta.server: Nuxt/Vite 빌드 시 서버 번들에서 true, 클라이언트 번들에서 false

const axiosSsr = axios.create({
  baseURL: import.meta.server
    ? `http://localhost:${process.env.PORT || process.env.NITRO_PORT || 3000}`
    : undefined,
});

// ─── 요청 인터셉터 ───────────────────────────────────────────────────────────

// 2026-09-13(요청사항: "full url로 표시해줘") — config.url만 찍으면 상대경로만 보여서
// baseURL(SSR일 때 자기 자신 localhost:PORT)을 직접 붙여 실제 호출 URL을 남긴다.
function fullUrl(config: { baseURL?: string; url?: string }): string {
  const path = config.url ?? "";
  if (/^https?:\/\//.test(path)) return path;
  return `${config.baseURL ?? ""}${path.startsWith("/") ? path : `/${path}`}`;
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
