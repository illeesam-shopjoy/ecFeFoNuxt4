/**
 * myPageSvc.ts — FO 마이페이지(주문/클레임/쿠폰/캐쉬/문의/채팅) · 알림 · 프로필/비밀번호 API 호출 객체.
 * 2026-09-19(요청사항: "주문/취소반품교환/쿠폰/캐쉬/문의/채팅 + 최상단 알림 + 프로필 수정 + 비밀번호 변경") — ecFeBo foMyStore/CoNotiBell/foAppHeader 이식.
 * 전부 로그인 필요 — useAuthHeaders() 로 Bearer 토큰을 붙여 BFF(server/api/fo/my/**, server/api/fo/ec/my/**)를 호출한다.
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";

/** ecBeBo 페이지 응답 공통 형태(BFF 가 그대로 통과) */
export interface MyPageResult<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}
export type MyKind = "order" | "claim" | "coupon" | "inquiry" | "chat";

/** 목록 공통 조회 조건 — 기간(등록일) + 종류별 상태 필터 */
export interface MyListParams {
  pageNo: number;
  pageSize: number;
  dateRangeType?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  orderStatusCd?: string;
  claimStatusCd?: string;
  claimTypeCd?: string;
  couponStatusCd?: string;
  status?: string;
  cacheTypeCd?: string;
}

/** 서버가 내려주는 원본 행 — 화면(pages/my/[tab].vue)에서 종류별로 필요한 필드만 꺼내 쓴다 */
export type MyRow = Record<string, any>;

export interface MyCashResult {
  balance: number;
  history: MyPageResult<MyRow>;
}

export interface MyNotiItem {
  notiId: string;
  notiTypeCd?: string;
  notiTitle?: string;
  notiContent?: string;
  linkPage?: string;
  refId?: string;
  readYn?: string;
  regDate?: string;
}

export interface MyProfile {
  memberId: string;
  loginId: string;
  memberNm: string;
  memberEmail: string;
  memberPhone: string;
  memberGender: string;
  birthDate: string;
  memberZipCode: string;
  memberAddr: string;
  memberAddrDetail: string;
}

const h = () => ({ headers: useAuthHeaders() });
const clean = (p: MyListParams) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

export const myPageSvc = {
  /** GET /api/fo/my/{order|claim|coupon|inquiry|chat}/page — 서버 페이징 목록 */
  getPage: (kind: MyKind, params: MyListParams) => $fetch<MyPageResult<MyRow>>(`/api/fo/my/${kind}/page`, { ...h(), query: clean(params) }),

  /** GET /api/fo/my/cash/page — 캐쉬 잔액 + 이력(서버 페이징) */
  getCash: (params: MyListParams) => $fetch<MyCashResult>("/api/fo/my/cash/page", { ...h(), query: clean(params) }),

  // ── 알림 ──
  getNotis: (limit = 30) => $fetch<MyNotiItem[]>("/api/fo/my/noti", { ...h(), query: { limit } }),
  getUnreadCount: () => $fetch<number>("/api/fo/my/noti/unread-count", h()),
  markRead: (id: string, readYn: "Y" | "N" = "Y") => $fetch(`/api/fo/my/noti/${encodeURIComponent(id)}/read`, { ...h(), method: "PATCH", body: { readYn } }),
  markAllRead: () => $fetch<number>("/api/fo/my/noti/read-all", { ...h(), method: "POST" }),

  // ── 프로필 / 비밀번호 ──
  getProfile: () => $fetch<MyProfile>("/api/fo/ec/my/info", h()),
  updateProfile: (body: Partial<MyProfile>) => $fetch<{ memberNm: string; memberPhone: string }>("/api/fo/ec/my/info", { ...h(), method: "PUT", body }),
  changePassword: (currentPassword: string, newPassword: string) =>
    $fetch<{ ok: boolean }>("/api/fo/ec/my/password", { ...h(), method: "POST", body: { currentPassword, newPassword } }),
};
