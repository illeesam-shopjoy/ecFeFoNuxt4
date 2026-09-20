/** 비밀번호 규칙 — 8자 이상 + 대문자·소문자·숫자·특수문자. 화면의 체크 표시(PasswordRules)와 제출 검증이 같은 규칙을 쓴다. */
export interface PasswordRuleItem {
  key: "len" | "upper" | "lower" | "digit" | "special";
  label: string;
  ok: boolean;
}

export function checkPassword(pw: string): PasswordRuleItem[] {
  const s = pw ?? "";
  return [
    { key: "len", label: "8자 이상", ok: s.length >= 8 },
    { key: "upper", label: "대문자", ok: /[A-Z]/.test(s) },
    { key: "lower", label: "소문자", ok: /[a-z]/.test(s) },
    { key: "digit", label: "숫자", ok: /[0-9]/.test(s) },
    { key: "special", label: "특수문자", ok: /[^A-Za-z0-9\s]/.test(s) },
  ];
}

export const isPasswordValid = (pw: string): boolean => checkPassword(pw).every((r) => r.ok);

/** 제출 시 보여줄 안내 문구 */
export const PASSWORD_RULE_MESSAGE = "비밀번호는 8자 이상이며 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.";
