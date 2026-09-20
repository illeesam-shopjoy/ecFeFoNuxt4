/** 첨부 변경 요청 — 저장 요청(attachFiles)에 실어 보낸다. 이번에 올린 파일은 'I'(연계), 수정 화면에서 지운 기존 파일은 'D'(연계 해제). */
export interface SyAttachChangeType {
  attachId: string; // sy_attach.attach_id
  rowStatus: "I" | "D";
}
