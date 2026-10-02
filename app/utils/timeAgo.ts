/**
 * timeAgo.ts — "3분 전 / 2시간 전 / 어제 / 3일 전 / 2026.09.01" 식 상대 시각 표시 (공통 유틸, 2026-10-02).
 * 서버가 주는 날짜 문자열(ISO 또는 "yyyy-MM-dd HH:mm:ss")을 그대로 받는다. 파싱이 안 되면 빈 문자열.
 */
export function timeAgo(value: string | Date | null | undefined, now: Date = new Date()): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const sec = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  if (day < 7) return `${day}일 전`;
  if (day < 30) return `${Math.floor(day / 7)}주 전`;
  if (day < 365) return `${Math.floor(day / 30)}달 전`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** 원화 표시 — 0/없음은 "나눔"(당근식) 또는 지정 문구 */
export function formatWon(value: number | null | undefined, zeroLabel = "나눔"): string {
  const n = Number(value ?? 0);
  if (!n) return zeroLabel;
  return `${n.toLocaleString("ko-KR")}원`;
}
