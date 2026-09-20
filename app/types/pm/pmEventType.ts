/** 프로모션 이벤트. 필드명은 ecBeBo(JPA) PmEventDto.Item(pm_event) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface PmEventType {
  eventId: string; // 이벤트ID (YYMMDDhhmmss+rand4)
  eventNm?: string; // 이벤트명
  eventTypeCd?: string; // 이벤트유형 — EVENT_TYPE_CD {DISCOUNT:할인 이벤트, GIFT:증정 이벤트, CACHE:적립 이벤트, ADU…
  eventTypeCdNm?: string; // 이벤트유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  imgUrl?: string; // 배너이미지URL
  eventTitle?: string; // 이벤트 제목
  eventContent?: string; // 이벤트 상세내용
  startDate?: string; // 이벤트 시작일
  endDate?: string; // 이벤트 종료일
  noticeStart?: string; // 예고 시작일
  noticeEnd?: string; // 예고 종료일
  eventStatusCd?: string; // 상태 — EVENT_STATUS_CD {PENDING:대기, ACTIVE:진행중, ENDED:종료, INACTIVE:비활성}
  eventStatusCdNm?: string; // 상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  eventStatusCdBefore?: string; // 변경 전 이벤트상태
  targetTypeCd?: string; // 대상유형 — EVENT_TARGET {ALL:전체, NEW_MEMBER:신규회원, VIP:VIP회원}
  targetTypeCdNm?: string; // 대상유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  sortOrd?: number; // 정렬순서
  viewCnt?: number; // 조회수
  useYn?: string; // 사용여부 Y/N
  eventDesc?: string; // 이벤트설명
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
