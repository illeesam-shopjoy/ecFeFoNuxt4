/**
 * useMyList — 마이페이지 목록 화면(pages/my/*.vue) 공통 조회 상태/동작 (2026-09-19).
 * 등록기간(프리셋) + 서버 페이징 + 로딩/오류/펼침 상태를 한 곳에서 관리한다. 화면마다 다른 것은 loader(어떤 API 를 부르는가)와
 * extra(탭별 추가 필터)뿐이다. 로그인 확인은 ensureLogin() (각 화면 initPage 첫 단계), 401 이 오면 로그아웃 처리 후 /login 으로 보낸다.
 * 반환값은 reactive 객체라 템플릿/프레임(components/my/MyPageFrame.vue)에서 .value 없이 바로 쓴다.
 */
import { reactive } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import type { MyListParams, MyRow } from "~/types/foMyType";

export const MY_PRESETS = [
  { months: 1, label: "1달" },
  { months: 3, label: "3달" },
  { months: 6, label: "6달" },
  { months: 12, label: "1년" },
];

/** 마이페이지 탭 (MyPageFrame 의 탭 바 + 라우트 /my/{key}) */
export const MY_TABS = [
  { key: "order", label: "주문", icon: "📦" },
  { key: "claim", label: "취소/반품/교환", icon: "↩️" },
  { key: "coupon", label: "쿠폰", icon: "🎟️" },
  { key: "cache", label: "캐쉬", icon: "💰" },
  { key: "contact", label: "문의", icon: "📩" },
  { key: "chatt", label: "채팅", icon: "💬" },
] as const;
export type MyTabKey = (typeof MY_TABS)[number]["key"];

/** 백엔드 어댑터 공통 (ecFeBo foMyStore._adapt* 와 동일 규칙) */
export const ymd = (v: unknown) => (v ? String(v).slice(0, 10) : "");
/** 한글 코드명이 있으면 그것을, 없으면 코드→한글 매핑, 그것도 없으면 원문 */
export const kor = (nm: unknown, cd: unknown, map: Record<string, string>) => (nm && /[가-힣]/.test(String(nm)) ? String(nm) : map[String(cd ?? "").toUpperCase()] || String(nm || cd || ""));

/** 코드그룹 목록 → { 코드값(대문자) → 라벨 } (kor() 의 매핑 인자용) */
export const codeMap = (list: { codeValue: string; codeLabel: string }[]) => Object.fromEntries(list.map((c) => [String(c.codeValue).toUpperCase(), c.codeLabel]));

export interface MyListLoadResult {
  rows: MyRow[];
  total: number;
  totalPage: number;
}

export interface UseMyListOptions {
  /** 백엔드 기간검색 기준 컬럼 (order_date | request_date | reg_date …) */
  dateType: string;
  /** 서버 페이징 조회 — 화면이 어떤 svc 를 부를지 결정. rows 는 화면용으로 어댑트해서 돌려준다(computed 없이 조회 시점에 1회 변환) */
  loader: (params: MyListParams) => Promise<MyListLoadResult>;
  /** 탭별 추가 필터(상태/유형 등). 값이 비어 있으면 서버로 보내지 않는다 */
  extra?: () => Partial<MyListParams>;
  /** 조회 성공 후 부가 작업(예: 유형별 건수 배지). 실패해도 화면은 계속 동작해야 하므로 예외를 던지지 말 것 */
  afterLoad?: (params: MyListParams) => void;
  defaultPageSize?: number;
}

/** useMyList() 반환 상태 (순환 추론을 피하려고 명시) */
export interface MyListState {
  dateStart: string;
  dateEnd: string;
  preset: number;
  pageNo: number;
  pageSize: number;
  pageTotalPage: number;
  total: number;
  rows: MyRow[];
  loading: boolean;
  errorMsg: string;
  openId: string | null;
  /** 페이지 버튼 번호(현재 페이지 중심 5개) */
  pageNumbers: () => number[];
  load: () => Promise<void>;
  search: () => Promise<void>;
  resetSearch: () => Promise<void>;
  applyPreset: () => Promise<void>;
  goPage: (n: number) => Promise<void> | undefined;
  changePageSize: () => Promise<void>;
  toggle: (id: string) => void;
  ensureLogin: () => Promise<boolean>;
}

const fmtYmd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function rangeOf(months: number) {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return { start: fmtYmd(start), end: fmtYmd(end) };
}

export function useMyList(opts: UseMyListOptions): MyListState {
  const authStore = useAuthStore();
  const router = useRouter();
  const init = rangeOf(6);
  let seq = 0; // 늦게 도착한 이전 응답이 최신 결과를 덮어쓰지 않게 하는 요청 순번

  const my: MyListState = reactive({
    dateStart: init.start,
    dateEnd: init.end,
    preset: 6,
    pageNo: 1,
    pageSize: opts.defaultPageSize ?? 50,
    pageTotalPage: 1,
    total: 0,
    rows: [] as MyRow[],
    loading: false,
    errorMsg: "",
    openId: null as string | null,
    pageNumbers,
    load,
    search,
    resetSearch,
    applyPreset,
    goPage,
    changePageSize,
    toggle,
    ensureLogin,
  });

  async function load(): Promise<void> {
    const mySeq = ++seq;
    my.loading = true;
    my.errorMsg = "";
    my.openId = null;
    const params: MyListParams = {
      pageNo: my.pageNo,
      pageSize: my.pageSize,
      dateRangeType: opts.dateType,
      dateRangeStart: my.dateStart,
      dateRangeEnd: my.dateEnd,
      ...(opts.extra?.() ?? {}),
    };
    try {
      const r = await opts.loader(params);
      if (mySeq !== seq) return;
      my.rows = r.rows;
      my.total = r.total;
      my.pageTotalPage = r.totalPage || 1;
      opts.afterLoad?.(params);
    } catch (e) {
      if (mySeq !== seq) return;
      my.rows = [];
      my.total = 0;
      my.pageTotalPage = 1;
      const st = (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status;
      if (st === 401) {
        authStore.setStLogout();
        await navigateTo("/login");
        return;
      }
      my.errorMsg = "목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
    } finally {
      if (mySeq === seq) my.loading = false;
    }
  }

  function pageNumbers(): number[] {
    const t = my.pageTotalPage;
    const s = Math.max(1, Math.min(my.pageNo - 2, t - 4));
    return Array.from({ length: Math.min(t, s + 4) - s + 1 }, (_, i) => s + i);
  }

  function search(): Promise<void> {
    my.pageNo = 1;
    return load();
  }
  function resetSearch(): Promise<void> {
    const r = rangeOf(6);
    my.dateStart = r.start;
    my.dateEnd = r.end;
    my.preset = 6;
    return search();
  }
  function applyPreset(): Promise<void> {
    const r = rangeOf(my.preset);
    my.dateStart = r.start;
    my.dateEnd = r.end;
    return search();
  }
  function goPage(n: number) {
    if (n < 1 || n > my.pageTotalPage || n === my.pageNo) return;
    my.pageNo = n;
    return load();
  }
  function changePageSize(): Promise<void> {
    my.pageNo = 1;
    return load();
  }
  function toggle(id: string) {
    my.openId = my.openId === id ? null : id;
  }

  /** 로그인 확인 — 비로그인이면 /login 으로 보내고 false. 각 화면의 initPage 가 첫 단계로 호출한다 */
  async function ensureLogin(): Promise<boolean> {
    authStore.loadStToken(); // app.vue 의 토큰 복원보다 페이지 마운트가 먼저일 수 있어 여기서도 복원
    if (authStore.token) return true;
    await router.replace("/login");
    return false;
  }

  return my;
}

