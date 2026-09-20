/** 알림(회원 알림함). 필드명은 ecBeBo(JPA) SyNotiDto.Item(sy_noti) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyNotiType {
  notiId: string;
  recvTypeCd?: string;
  recvTypeCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  recvId?: string;
  recvNm?: string;
  notiTypeCd?: string;
  notiTypeCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  channelCd?: string;
  channelCdNm?: string; // 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  notiTitle?: string;
  notiContent?: string;
  linkPage?: string;
  refId?: string;
  readYn?: string;
  readDate?: string;
  regDate?: string;
  updDate?: string;
}
