import type { MyListParams } from "~/types/fo/foMyType";

/** loader 가 돌려주는 한 페이지 — 화면용으로 어댑트한 행 + 전체 건수/페이지 수 */
export interface FoMyListLoadResultType<T> {
  rows: T[];
  total: number;
  totalPage: number;
}

/** useMyList() 옵션 */
export interface FoMyListOptionsType<T> {
  /** 백엔드 기간검색 기준 컬럼 (order_date | request_date | reg_date …) */
  dateType: string;
  /** 서버 페이징 조회 — 화면이 어떤 svc 를 부를지 결정. rows 는 화면용으로 어댑트해서 돌려준다(computed 없이 조회 시점에 1회 변환) */
  loader: (params: MyListParams) => Promise<FoMyListLoadResultType<T>>;
  /** 탭별 추가 필터(상태/유형 등). 값이 비어 있으면 서버로 보내지 않는다 */
  extra?: () => Partial<MyListParams>;
  /** 조회 성공 후 부가 작업(예: 유형별 건수 배지). 실패해도 화면은 계속 동작해야 하므로 예외를 던지지 말 것 */
  afterLoad?: (params: MyListParams) => void;
  defaultPageSize?: number;
}

/** useMyList() 반환 상태 (순환 추론을 피하려고 명시) */
export interface FoMyListStateType<T> {
  dateStart: string;
  dateEnd: string;
  preset: number;
  pageNo: number;
  pageSize: number;
  pageTotalPage: number;
  total: number;
  rows: T[];
  loading: boolean;
  errorMsg: string;
  openId: string | null;
  load: () => Promise<void>;
  search: () => Promise<void>;
  resetSearch: () => Promise<void>;
  applyPreset: () => Promise<void>;
  goPage: (n: number) => Promise<void> | undefined;
  changePageSize: () => Promise<void>;
  toggle: (id: string) => void;
  ensureLogin: () => Promise<boolean>;
}
