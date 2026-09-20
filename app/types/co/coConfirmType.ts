/** 확인창(useConfirm/ConfirmModal) 종류 — default: 물음표(테마색), danger: 경고 삼각형(빨강, 삭제 등) */
export type CoConfirmVariantType = "default" | "danger";

export interface CoConfirmOptionsType {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: CoConfirmVariantType;
}
