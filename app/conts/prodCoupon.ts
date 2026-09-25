/** 상품쿠폰(상품 교환권) 화면 상수 — 상태 표시/공유 주소 */
import type { PmProdCouponStatusCd } from "~/types/pm/pmProdCouponType";

export const PROD_COUPON_STATUS: Record<PmProdCouponStatusCd, { label: string; cls: string; hint: string }> = {
  PENDING_PAY: { label: "결제 대기", cls: "bg-[#fef3c7] text-[#92400e]", hint: "결제가 완료되면 사용할 수 있습니다." },
  ACTIVE: { label: "사용 가능", cls: "bg-[#dcfce7] text-[#15803d]", hint: "" },
  USED: { label: "사용 완료", cls: "bg-[#e5e7eb] text-[#4b5563]", hint: "이미 교환(주문)된 쿠폰입니다." },
  EXPIRED: { label: "기간 만료", cls: "bg-[#fee2e2] text-[#b91c1c]", hint: "유효기간이 지났습니다." },
  CANCELLED: { label: "취소됨", cls: "bg-[#fee2e2] text-[#b91c1c]", hint: "결제 취소 등으로 취소된 쿠폰입니다." },
};

/** 받는 사람에게 전달하는 선물 링크 */
export const giftLink = (code: string): string => `${window.location.origin}/gift/${encodeURIComponent(code)}`;

/** "2026-09-26T10:00:00" → "2026-09-26" */
export const ymd = (iso?: string | null): string => (iso ? String(iso).slice(0, 10) : "");
