/**
 * foMyType.ts — FO 마이페이지(주문/클레임/쿠폰/캐쉬/문의/채팅/알림) 목록 조회 조건 (2026-09-19).
 * app/svc/fo/my/*Svc.ts 와 화면(pages/my/*.vue)이 공유한다. 응답 행 타입은 테이블 기준 타입을 그대로 쓴다
 * (주문 OdOrderType · 클레임 OdClaimType · 쿠폰 PmCouponType · 캐시 PmCacheType · 문의 SyContactType · 채팅 CmChattType · 알림 SyNotiType).
 */

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
