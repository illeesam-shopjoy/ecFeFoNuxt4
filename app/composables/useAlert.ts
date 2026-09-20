import type { CoAlertDetailType, CoAlertOptionsType, CoAlertVariantType } from "~/types/co/coAlertType";

let alertResolve: (() => void) | null = null;

/** 문구로 알림 종류를 추정한다 — 기존 openAlert("문구") 호출부도 아이콘/색상이 붙도록 */
export function guessAlertVariant(message: string): CoAlertVariantType {
  if (/실패|오류|에러|불가|잘못|없습니다|찾을 수 없|초과|만료|거부/.test(message)) return "error";
  if (/완료|성공|되었습니다|저장되었|등록되었|삭제되었/.test(message)) return "success";
  if (/확인해|필요|선택해|입력해|주의/.test(message)) return "warning";
  return "info";
}

export function useAlert() {
  const state = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: CoAlertVariantType;
    details: CoAlertDetailType[];
  }>("alert-dialog-state", () => ({
    open: false,
    title: "알림",
    message: "",
    confirmText: "확인",
    variant: "info",
    details: [],
  }));

  function openAlert(messageOrOptions: string | CoAlertOptionsType): Promise<void> {
    const options = typeof messageOrOptions === "string" ? { message: messageOrOptions } : messageOrOptions;
    state.value = {
      open: true,
      title: options.title ?? "알림",
      message: options.message,
      confirmText: options.confirmText ?? "확인",
      variant: options.variant ?? guessAlertVariant(options.message),
      details: options.details ?? [],
    };
    return new Promise<void>((resolve) => {
      alertResolve = resolve;
    });
  }

  function handleClose() {
    state.value = { ...state.value, open: false };
    alertResolve?.();
    alertResolve = null;
  }

  return { state, openAlert, handleClose };
}
