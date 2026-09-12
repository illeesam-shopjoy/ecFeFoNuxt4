/**
 * useAuthHeaders — 로그인한 FO 회원의 Bearer 토큰을 $fetch/axios 헤더 형태로 반환.
 * 2026-09-12 추가: 리뷰/공지 CRUD를 ecBeBo의 FO 전용 엔드포인트(FoPdReviewController 등,
 * FO_ONLY 인가)로 연결하면서, 그동안 인증 헤더 없이 $fetch만 호출하던 컴포넌트들이 전부
 * 401을 받게 된 걸 발견 — 이 컴포저블로 통일해서 빠짐없이 붙인다.
 * 토큰이 없으면 빈 객체를 반환(서버가 401로 응답 — 비로그인 사용자에게 자연스러운 동작).
 */
import { useAuthStore } from "~/store/useAuthStore";

export function useAuthHeaders(): Record<string, string> {
  const token = useAuthStore().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
