/** 알림창(useAlert/AlertModal) 종류 — 아이콘·색상을 정한다 */
export type CoAlertVariantType = "info" | "success" | "warning" | "error";

/** 알림창/확인창 본문 아래에 보여줄 "라벨: 값" 한 줄 */
export interface CoAlertDetailType {
  label: string;
  value: string;
}

export interface CoAlertOptionsType {
  title?: string;
  message: string;
  confirmText?: string;
  /** 아이콘·색상. 생략하면 문구로 추정한다(오류/실패 → error, 완료/성공 → success, 그 외 info) */
  variant?: CoAlertVariantType;
  /** 메시지 아래에 보여줄 "라벨: 값" 목록(예: 연동 키 정보) */
  details?: CoAlertDetailType[];
}
