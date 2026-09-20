/** 회원 소셜 연동. 필드명은 ecBeBo(JPA) MbMemberSnsDto.Item(mb_member_sns) 기준 — 소셜 사용자ID(snsUserId)는 화면에 내려오지 않는다. */
export interface MbMemberSnsType {
  memberSnsId: string; // SNS연동ID
  memberId?: string; // 회원ID
  snsChannelCd: string; // SNS채널코드 — SNS_CHANNEL_CD {KAKAO, NAVER, GOOGLE}
  snsChannelCdNm?: string; // SNS채널 코드 라벨
  regDate?: string; // 연동일시
}
