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
  regDate?: string; // 등록일시 (reg_date)
  updDate?: string;
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
