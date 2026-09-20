import type { CmChattMsgType } from "~/types/cm/cmChattMsgType";

/** 채팅 위젯 화면용 메시지 — 서버 필드 + 낙관적 UI 로컬 플래그(서버 응답엔 없음) */
export interface CmChattMsgViewType extends CmChattMsgType {
  _pending?: boolean;
  _error?: boolean;
}
