/** 저장된 테마(라이트/다크)를 앱 시작 시 복원 — composables/useTheme.ts */
export default defineNuxtPlugin(() => {
  useTheme().restore();
});
