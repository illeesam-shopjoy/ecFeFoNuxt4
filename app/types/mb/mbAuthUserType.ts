/** 로그인한 FO 회원의 세션 정보(useAuthStore.user, localStorage auth_user) */
export interface MbAuthUserType {
  memberId: string;
  userNm: string;
  userEmail: string; // = mb_member.login_id (FO는 로그인ID가 곧 이메일)
  userPhone?: string;
  siteId?: string;
}
