/** 알림(회원 알림함). 필드명은 ecBeBo(JPA) SyNotiDto.Item(sy_noti) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyNotiType {
  notiId: string;
  recvTypeCd?: string;
  recvId?: string;
  recvNm?: string;
  notiTypeCd?: string;
  channelCd?: string;
  notiTitle?: string;
  notiContent?: string;
  linkPage?: string;
  refId?: string;
  readYn?: string;
  readDate?: string;
  regDate?: string;
  updDate?: string;
}
