/** 알람(발송 정의). 필드명은 ecBeBo(JPA) SyAlarmDto.Item(sy_alarm) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyAlarmType {
  alarmId: string; // 알림ID (YYMMDDhhmmss+rand4)
  alarmTitle?: string; // 알림제목
  alarmTypeCd?: string; // 알림유형 — ALARM_TYPE_CD {ORDER:주문, DELIVERY:배송, CLAIM:클레임, MARKETING:마케팅,…
  channelCd?: string; // 발송채널 — ALARM_CHANNEL {EMAIL:이메일, SMS:SMS, KAKAO:알림톡, PUSH:푸시, SYSTEM:시…
  targetTypeCd?: string; // 대상유형 — ALARM_TARGET_TYPE {MEMBER:회원, VENDOR:업체, ADMIN:관리자, ALL:전체}
  targetId?: string; // 대상ID (회원ID 또는 등급코드)
  templateId?: string; // 템플릿ID
  alarmMsg?: string; // 발송내용
  alarmSendDate?: string; // 발송예정일시
  alarmStatusCd?: string; // 발송상태 — ALARM_STATUS {PENDING:대기, SENT:발송완료, FAILED:실패, CANCELLED:취소}
  alarmStatusCdNm?: string; // 발송상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  alarmSendCount?: number; // 발송성공수
  alarmFailCount?: number; // 발송실패수
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  pathId?: string; // 점(.) 구분 표시경로 (트리 빌드용)
  alarmTypeCdNm?: string; // 알림유형 코드 라벨
  channelCdNm?: string; // 발송채널 코드 라벨
  targetTypeCdNm?: string; // 대상유형 코드 라벨
}
