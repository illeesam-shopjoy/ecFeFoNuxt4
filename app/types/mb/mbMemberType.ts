import type { MbMemberAddrType } from "~/types/mb/mbMemberAddrType";

/** 회원. 필드명은 ecBeBo(JPA) MbMemberDto.Item(mb_member) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface MbMemberType {
  memberId: string; // 회원ID (YYMMDDhhmmss+rand4)
  loginId: string; // 이메일 (로그인 ID)
  memberNm?: string; // 회원명
  memberEmail?: string; // 회원 이메일 (수신용, 로그인ID와 별개)
  memberPhone?: string; // 연락처
  memberGender?: string; // 성별 M/F
  birthDate?: string; // 생년월일
  gradeCd?: string; // 등급 — MEMBER_GRADE
  gradeCdNm?: string; // 등급 코드 라벨
  memberStatusCd?: string; // 상태 — MEMBER_STATUS_CD
  memberStatusCdNm?: string; // 상태 코드 라벨
  joinDate?: string; // 가입일
  lastLogin?: string; // 최근 로그인
  orderCount?: number; // 주문 건수
  totalPurchaseAmt?: number; // 누적 구매금액
  cacheBalanceAmt?: number; // 적립금 잔액
  memberZipCode?: string; // 우편번호
  memberAddr?: string; // 주소
  memberAddrDetail?: string; // 상세주소
  memberMemo?: string; // 메모
  siteId?: string; // 사이트ID
  addrs?: MbMemberAddrType[]; // 배송지 목록
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  regDate?: string; // 등록일
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
