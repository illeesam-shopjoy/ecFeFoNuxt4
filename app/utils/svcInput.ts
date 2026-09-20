/**
 * svcInput.ts — svc 공통 입력 헬퍼. svc 는 HTTP 호출만 하고, 입력 검증/조건 정리는 여기와 map*.ts 에 둔다.
 */

/** 백엔드 호출 전 검증 실패를 소비처(e.data.message / e.statusMessage / e.response.data.message)가 읽는 모양으로 던진다. */
export function badRequest(message: string): never {
  const body = { message, statusMessage: message };
  throw Object.assign(new Error(message), { statusCode: 400, statusMessage: message, data: body, response: { data: body } });
}

/** 비어 있는(undefined/빈 문자열) 조회 조건을 걷어낸다. */
export const cleanParams = (p: object): Record<string, unknown> => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== ""));

/** 문자열이 비어 있으면 검증 오류. 통과하면 trim 값 반환. */
export function requireText(value: unknown, message: string): string {
  const v = String(value ?? "").trim();
  if (!v) badRequest(message);
  return v;
}
