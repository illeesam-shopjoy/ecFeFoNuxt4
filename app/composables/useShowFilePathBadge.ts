/**
 * currentFilePath 배지 표시 여부 토글 (local 전용).
 * 드롭다운 등에서 토글로 제어하고, 페이지/컴포넌트 배지는 이 값을 참조합니다.
 */
const KEY = "showFilePathBadge";

export function useShowFilePathBadge() {
  // 2026-09-13 요청사항: "우측란 나오는거 기본적으로 안나오게 해줘" — 기본값 false.
  // 헤더 로그인 옆 햄버거(far fa-bars) → ExtraInfo의 "경로 표시" 체크박스로 필요할 때 켤 수 있음.
  const show = useState<boolean>(KEY, () => false);
  return {
    showFilePathBadge: show,
    toggleShowFilePathBadge: () => {
      show.value = !show.value;
    },
  };
}
