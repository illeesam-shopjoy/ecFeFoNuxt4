import type { AxiosError } from "axios";

/** ecBeBo 응답 envelope { ok, status, data, message } */
export interface CoBeEnvelopeType {
  ok?: boolean;
  status?: number;
  data?: unknown;
  message?: string;
}

/** 소비처가 읽는 오류 모양(statusCode / statusMessage / data.message)을 덧붙인 axios 오류 */
export interface CoBeErrorType extends AxiosError {
  statusCode?: number;
  statusMessage?: string;
  data?: { message?: string; statusMessage?: string };
}
