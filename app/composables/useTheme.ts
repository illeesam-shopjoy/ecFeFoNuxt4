/**
 * useTheme — 라이트/다크 테마 전환 (2026-09-20, 요청사항: 상단정보에 "테마" 추가).
 * html 요소에 `theme-dark` 클래스를 토글하고(스타일은 assets/theme-dark.css), 선택값을 localStorage("theme")에 저장한다.
 * 저장값 복원은 plugins/theme.client.ts 가 앱 시작 시 1회 수행한다.
 */
export function useTheme() {
  const dark = useState<boolean>("theme-dark", () => false);

  function apply() {
    if (import.meta.client) document.documentElement.classList.toggle("theme-dark", dark.value);
  }
  function restore() {
    try {
      dark.value = localStorage.getItem("theme") === "dark";
    } catch {
      dark.value = false;
    }
    apply();
  }
  function toggle() {
    dark.value = !dark.value;
    try {
      localStorage.setItem("theme", dark.value ? "dark" : "light");
    } catch {
      /* 저장 실패해도 현재 화면 전환은 유지 */
    }
    apply();
  }

  return { dark, restore, toggle };
}
