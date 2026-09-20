/**
 * svcHttp.ts — svc 가 쓰는 얇은 HTTP 헬퍼(CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * axiosCsr 는 ecBeBo envelope 을 벗겨 response.data 가 곧 실데이터이므로, 여기서 한 번 더 `.data` 를 꺼내 Promise<실데이터> 로 돌려준다 —
 * svc 함수는 async/await 없이 `csrGet<T>(url, cfg)` 한 줄이면 된다. 로그인 필요 API 는 cfg 에 authCfg() 를 넘긴다.
 */
import type { AxiosRequestConfig } from "axios";
import { axiosCsr } from "~/utils/axiosCsr";
import { useAuthHeaders } from "~/composables/useAuthHeaders";
import { cleanParams } from "~/utils/svcInput";
import type { CoBasePageType } from "~/types/co/coBasePageType";
import type { MyListParams } from "~/types/fo/foMyType";

/** 로그인 토큰 헤더 + 그 외 axios 옵션 (공개 API 에 만료 토큰이 붙어 401 나는 것을 막으려고 인증이 필요한 호출만 명시한다) */
export const authCfg = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({ ...config, headers: useAuthHeaders() });

/** 경로 조각(ID)을 URL 에 안전하게 붙인다 */
export const idPath = (base: string, id: string, tail = ""): string => `${base}/${encodeURIComponent(id)}${tail}`;

export const csrGet = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => axiosCsr.get<T>(url, config).then((r) => r.data);
/** 배열 응답 — 서버가 null 을 주면 빈 배열 */
export const csrList = <T>(url: string, config?: AxiosRequestConfig): Promise<T[]> => csrGet<T[] | null>(url, config).then((d) => d ?? []);
export const csrPost = <T = void>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => axiosCsr.post<T>(url, body, config).then((r) => r.data);
export const csrPut = <T = void>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => axiosCsr.put<T>(url, body, config).then((r) => r.data);
export const csrPatch = <T = void>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> => axiosCsr.patch<T>(url, body, config).then((r) => r.data);
export const csrDelete = <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> => axiosCsr.delete<T>(url, config).then((r) => r.data);

/** 마이페이지 목록 API 공통 형태 — `${base}/list`(전체) + `${base}/page`(서버 페이징, 기본 1페이지 10건). T 는 그 화면이 받는 행 타입 */
export const myListApi = <T>(base: string) => ({
  getList: (params: MyListParams = {}): Promise<T[]> => csrList<T>(`${base}/list`, authCfg({ params: cleanParams(params) })),
  getPage: (params: MyListParams): Promise<CoBasePageType<T>> => csrGet<CoBasePageType<T>>(`${base}/page`, authCfg({ params: { pageNo: 1, pageSize: 10, ...cleanParams(params) } })),
});
