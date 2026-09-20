/**
 * foMyType.ts — FO 마이페이지(주문/클레임/쿠폰/캐쉬/문의/채팅/알림) API 공통 타입 (2026-09-19).
 * app/svc/fo/my/*Svc.ts 가 공유한다. 행(row) 데이터는 ecBeBo DTO 원본 필드를 그대로 통과시키므로 MyRow 로 느슨하게 둔다 —
 * 화면(pages/my/*.vue)이 종류별로 필요한 필드만 꺼내 쓴다.
 */

/** ecBeBo 페이지 응답 공통 형태(BFF 가 그대로 통과) */
export interface MyPageResult<T> {
  pageList: T[];
  pageTotalCount: number;
  pageTotalPage: number;
  pageNo: number;
  pageSize: number;
}

/** 목록 공통 조회 조건 — 기간(등록일 등) + 종류별 상태 필터. 값이 비어 있으면 서버로 보내지 않는다 */
export interface MyListParams {
  pageNo?: number;
  pageSize?: number;
  dateRangeType?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  orderStatusCd?: string;
  orderStatusCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  claimStatusCd?: string;
  claimStatusCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  claimTypeCd?: string;
  claimTypeCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  couponStatusCd?: string;
  couponStatusCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  status?: string;
  cacheTypeCd?: string;
  cacheTypeCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  sort?: string;
}

/** 서버가 내려주는 원본 행 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MyRow = Record<string, any>;

/** 캐쉬: 잔액 + 이력(서버 페이징) */
export interface MyCashResult {
  balance: number;
  history: MyPageResult<MyRow>;
}

/** 알림 1건 (ecBeBo SyNotiDto.Item 중 화면이 쓰는 필드) */
export interface MyNotiItem {
  notiId: string;
  notiTypeCd?: string;
  notiTypeCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  notiTitle?: string;
  notiContent?: string;
  linkPage?: string;
  refId?: string;
  readYn?: string;
  regDate?: string;
}

/** 문의 등록 본문 (ecBeBo CmContactSubmitDto.Request) */
export interface MyInquirySubmit {
  inquiryType?: string;
  name: string;
  email: string;
  tel?: string;
  orderNo?: string;
  message: string;
}

/** 회원 프로필 (ecBeBo MbMemberDto.Item 중 수정 화면이 쓰는 필드) */
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
