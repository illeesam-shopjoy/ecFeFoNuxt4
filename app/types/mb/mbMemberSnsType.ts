/** 회원 소셜 연동. 필드명은 ecBeBo(JPA) MbMemberSnsDto.Item(mb_member_sns) 기준 — 소셜 사용자ID(snsUserId)는 화면에 내려오지 않는다. */
export interface MbMemberSnsType {
  memberSnsId: string; // SNS연동ID
  memberId?: string; // 회원ID
  snsChannelCd: string; // SNS채널코드 — SNS_CHANNEL_CD {KAKAO, NAVER, GOOGLE}
  snsChannelCdNm?: string; // SNS채널 코드 라벨
  regDate?: string; // 연동일시
  linkYn?: string; // 연동여부 Y/N (FO 목록은 Y 만 내려옴)
  unlinkDate?: string; // 연동 해제일시
  snsAuthDate?: string; // SNS 인증일시 — 마지막으로 SNS 인증(로그인/연동)에 성공한 시각
  snsEmail?: string; // SNS 이메일
  snsNickNm?: string; // SNS 닉네임(alias)
  snsName?: string; // SNS 이름
  snsGender?: string; // SNS 성별 M/F
  snsAgeRange?: string; // SNS 연령대 (예: 20~29)
  snsBirthYear?: string; // SNS 출생연도 YYYY
  snsBirthDay?: string; // SNS 생일 MMDD
  snsPhoneNo?: string; // SNS 휴대폰
  snsProfileImgUrl?: string; // SNS 프로필 이미지 URL
  snsScope?: string; // SNS 가 제공한 항목 목록(콤마 구분: email,nickname,...)
  snsAppNm?: string; // 인증에 쓴 SNS 앱 이름
  // snsCi(CI)·snsUserId·snsClientKey 는 서버가 FO 응답에서 제거한다
}
