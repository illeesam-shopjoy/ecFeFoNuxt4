/**
 * htmlSafe.ts — 에디터(HtmlEditor)로 쓴 HTML 본문을 화면에 그리기 위한 도우미.
 * 리뷰/Q&A 는 누구나 쓸 수 있어(API 로 임의 HTML 도 보낼 수 있음) 그릴 때 항상 정화한다.
 */

/** 스크립트/이벤트 속성/javascript: 를 제거한 HTML. 브라우저(DOMParser)에서만 동작 — 서버 렌더에서는 빈 문자열 */
export function sanitizeHtml(html: string): string {
  if (!import.meta.client || !html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,iframe,object,embed,style,link,meta,form").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name) || (/^(href|src|xlink:href)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) el.removeAttribute(a.name);
    }
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer nofollow");
    }
  });
  return doc.body.innerHTML;
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** HTML → 보이는 글자만(태그 제거·공백 정리). 제목 자동 생성/길이 검사용 */
export function htmlToText(html: string | null | undefined): string {
  return (html ?? "")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** 글자도 이미지도 없는 빈 본문인가 */
export const isEmptyHtml = (html: string | null | undefined): boolean => !htmlToText(html) && !/<img\b/i.test(html ?? "");

/** 화면용: 예전 일반 텍스트(줄바꿈만 있는 글)는 줄바꿈을 살려 그대로, HTML 이면 정화해서 */
export function toSafeHtml(content: string | null | undefined): string {
  const c = content ?? "";
  if (!/[<>]/.test(c)) return escapeHtml(c).replace(/\n/g, "<br>");
  return sanitizeHtml(c);
}
