/** 로그인한 FO 회원의 세션 정보(useAuthStore.user, localStorage auth_user) */
export interface MbAuthUserType {
  memberId: string;
  userNm: string;
  userEmail: string; // = mb_member.login_id (FO는 로그인ID가 곧 이메일)
  userPhone?: string;
  siteId?: string;
  loginSns?: string; // 소셜로 로그인했다면 그 제공자(KAKAO/NAVER/GOOGLE) — 이름 옆 아이콘 표시용. 이메일 로그인이면 없음
  /** 2026-09-29(셀러 Phase 1) — MD(운영담당자) 여부 Y/N. 상품평/Q&A 답변·숨김 버튼 노출 판단에 사용 */
  mdYn?: string;
  /** 2026-09-29(셀러 Phase 1) — 이 회원이 ACTIVE로 소속된 판매자ID(sl_seller.seller_id) 목록 */
  sellerIds?: string[];
}
