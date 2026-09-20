/** 이벤트 목록 카드 1건(화면용 요약 — PmEventType 에서 가공). */
export interface PmEventCardType {
  eventId: string;
  title: string;
  eventTypeCd: string;
  eventStatusCd: string;
  startDate: string;
  endDate: string;
  imgUrl: string;
}

/** 이벤트 상세(화면용 — PmEventType + benefits/eventItems 에서 가공). */
export interface PmEventDetailType {
  eventId: string;
  title: string;
  eventTypeCd: string;
  eventStatusCd: string;
  desc: string;
  content: string;
  startDate: string;
  endDate: string;
  benefits: { label: string; value: string; desc: string }[];
  eventItems: { id: string; targetType: string; targetId: string }[];
}
