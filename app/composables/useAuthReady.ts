/**
 * useAuthReady — 앱이 처음 뜰 때 로그인 상태 복원(app.vue onMounted → authStore.loadStAuthInfo)이 끝나길 기다린다 (2026-10-02).
 * 화면의 onMounted 는 app.vue 의 onMounted 보다 먼저 실행되므로, 새로고침/첫 진입 직후 `authStore.isStLoggedIn` 을 바로 읽으면
 * 아직 false 다(danmoo1 관심목록·채팅 목록이 "없음"으로 보였던 원인). 로그인 여부로 분기하는 화면은 initPage 첫 줄에서 `await useAuthReady()`.
 * SPA 이동으로 들어온 화면에서는 이미 복원돼 있어 즉시 돌아온다. 복원이 끝나지 않아도 timeoutMs 뒤에는 돌아온다(화면이 멈추지 않게).
 */
import { useAuthStore } from "~/store/useAuthStore";

export function useAuthReady(timeoutMs = 3000): Promise<void> {
  const authStore = useAuthStore();
  if (authStore.initialized || !import.meta.client) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      stop();
      clearTimeout(timer);
      resolve();
    };
    const stop = watch(() => authStore.initialized, (v) => { if (v) done(); });
    const timer = setTimeout(done, timeoutMs);
  });
}
