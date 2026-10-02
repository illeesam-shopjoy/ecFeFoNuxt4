/**
 * useDmTown — danmoo1(당근 스타일) 내 동네·동네 범위 상태. 위치 인증은 없고 사용자가 고른 값을 localStorage(dm.neighborhood / dm.range)에 둔다 (2026-10-02).
 * 공통 composables 폴더에 있지만 danmoo1 상수만 참조한다 — 다른 모듈은 쓰지 않으므로 그쪽 번들에 들어가지 않는다.
 */
import { DM_DEFAULT_NEIGHBORHOOD, DM_NEIGHBORHOOD_KEY, DM_RANGE_KEY, DM_RANGE_OPTIONS } from "~/conts/tenant/danmoo1";

export function useDmTown() {
  const town = useState<string>("dm-town", () => DM_DEFAULT_NEIGHBORHOOD);
  const range = useState<string>("dm-range", () => DM_RANGE_OPTIONS[1]!.value);
  const loaded = useState<boolean>("dm-town-loaded", () => false);
  if (import.meta.client && !loaded.value) {
    try {
      town.value = localStorage.getItem(DM_NEIGHBORHOOD_KEY) || DM_DEFAULT_NEIGHBORHOOD;
      range.value = localStorage.getItem(DM_RANGE_KEY) || range.value;
    } catch {
      town.value = DM_DEFAULT_NEIGHBORHOOD;
    }
    loaded.value = true;
  }
  function setTown(name: string) {
    town.value = name;
    try { localStorage.setItem(DM_NEIGHBORHOOD_KEY, name); } catch { /* 저장 실패해도 화면은 바뀐다 */ }
  }
  function setRange(v: string) {
    range.value = v;
    try { localStorage.setItem(DM_RANGE_KEY, v); } catch { /* 무시 */ }
  }
  return { town, setTown, range, setRange };
}

/** localStorage 문자열 배열 읽기/쓰기(최근 검색어·최근 본 상품·키워드 알림·관심 알바 등) */
export function readLocalList(key: string, max = 20): string[] {
  if (!import.meta.client) return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.map(String).slice(0, max) : [];
  } catch {
    return [];
  }
}
export function writeLocalList(key: string, list: string[]) {
  if (!import.meta.client) return;
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* 무시 */ }
}
/** 목록 맨 앞에 넣기(중복 제거, 최대 개수 유지) */
export function pushLocalList(key: string, value: string, max = 20): string[] {
  const next = [value, ...readLocalList(key, max).filter((v) => v !== value)].slice(0, max);
  writeLocalList(key, next);
  return next;
}
/** 있으면 빼고 없으면 넣기(관심 토글) — 결과 목록 반환 */
export function toggleLocalList(key: string, value: string, max = 50): string[] {
  const cur = readLocalList(key, max);
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [value, ...cur].slice(0, max);
  writeLocalList(key, next);
  return next;
}
