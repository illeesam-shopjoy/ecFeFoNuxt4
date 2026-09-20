import type { SyAttachChangeType } from "~/types/sy/syAttachChangeType";

/** 문의(고객센터) 접수 요청 — ecBeBo CmContactSubmitDto.Request. */
export interface CmContactSubmitType {
  inquiryType?: string;
  name: string;
  email: string;
  tel?: string;
  orderNo?: string;
  message: string; // 문의 내용(HTML) — 서버 최대 4000자
  blogAuthor?: string;
  attachFiles?: SyAttachChangeType[]; // 이번에 올린 파일은 rowStatus 'I'
}
