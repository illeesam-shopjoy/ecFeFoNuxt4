/** 로그인 후 돌아갈 화면 — 로그인/소셜 로그인(전체 이동)을 거쳐도 유지되도록 sessionStorage 에 잠시 저장한다. 같은 사이트 안의 경로만 허용. */
const KEY = "login_return";
const safe = (p: string | null | undefined): string => (p && p.startsWith("/") && !p.startsWith("//") ? p : "");

export function setLoginReturn(path: string): void {
  try {
    const v = safe(path);
    if (v) sessionStorage.setItem(KEY, v);
  } catch {
    /* 무시 */
  }
}

/** 저장된 경로를 꺼내 지우고 돌려준다(없으면 "/") */
export function consumeLoginReturn(): string {
  try {
    const v = safe(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
    return v || "/";
  } catch {
    return "/";
  }
}
